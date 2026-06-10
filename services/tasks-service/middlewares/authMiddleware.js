const jwt = require("jsonwebtoken");
const axios = require("axios");
const logger = require("../utils/logger");

// Função para validar token localmente ou via auth service
const validateToken = async (token) => {
  try {
    // Tentar validar localmente primeiro
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Se falhar, tentar validar via auth service
    if (process.env.AUTH_SERVICE_URL) {
      try {
        const response = await axios.post(
          `${process.env.AUTH_SERVICE_URL}/api/auth/verify`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          }
        );
        if (response.data.valid) {
          return response.data.user;
        }
      } catch (err) {
        logger.error("Erro ao validar token via auth service:", { error: err.message });
      }
    }
    throw error;
  }
};

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      error: "Acesso negado", 
      message: "Token não fornecido" 
    });
  }

  try {
    const decoded = await validateToken(token);
    req.usuario = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: "Token expirado", 
        message: "Faça login novamente" 
      });
    }
    return res.status(403).json({ 
      error: "Token inválido" 
    });
  }
};

module.exports = authenticateToken;

