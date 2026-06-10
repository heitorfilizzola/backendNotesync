const { z } = require("zod");

const registerSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
});

const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "O email é obrigatório"),
  senha: z.string().min(1, "A senha é obrigatória")
});

module.exports = {
  registerSchema,
  loginSchema
};
