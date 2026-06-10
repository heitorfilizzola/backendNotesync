const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const catchAsync = require("../middlewares/catchAsync");

const getUsuario = () => {
  return require("../models/Usuario");
};

module.exports = {
  register: catchAsync(async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    // Validação rápida de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    // Validação de senha mínima
    if (senha.length < 6) {
      return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
    }

    const Usuario = getUsuario();
    // Query otimizada: busca apenas o campo email (mais rápido)
    const usuarioExistente = await Usuario.findOne({ 
      where: { email },
      attributes: ['id', 'email'] // Buscar apenas campos necessários
    });
    if (usuarioExistente) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    // Otimizar bcrypt: usar 8 rounds ao invés de 10 (ainda seguro, mas mais rápido)
    const senhaHash = await bcrypt.hash(senha, 8);
    const role = email.endsWith("@admin.com") ? "admin" : "user";

    const novoUsuario = await Usuario.create({ nome, email, senha: senhaHash, role });

    const token = jwt.sign(
      { id: novoUsuario.id, role: novoUsuario.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const usuarioSemSenha = novoUsuario.toJSON();
    delete usuarioSemSenha.senha;

    res.status(201).json({ usuario: usuarioSemSenha, token });
  }),

  login: catchAsync(async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const Usuario = getUsuario();
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const usuarioSemSenha = usuario.toJSON();
    delete usuarioSemSenha.senha;

    res.json({ usuario: usuarioSemSenha, token });
  }),

  verifyToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        return res.status(401).json({ error: "Token não fornecido" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({ valid: true, user: decoded });
    } catch (error) {
      res.status(401).json({ valid: false, error: "Token inválido" });
    }
  },
};

