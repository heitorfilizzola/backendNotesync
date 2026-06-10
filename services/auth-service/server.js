const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const app = require('./app');
const sequelize = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Conectar ao banco com retry
    let retries = 5;
    while (retries > 0) {
      try {
        await sequelize.authenticate();
        console.log('✅ [Auth Service] Conectado ao banco de dados!');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        console.log(`⚠️  [Auth Service] Tentando reconectar ao banco... (${5 - retries}/5)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    // Sincronizar modelos (usar force: false para não recriar tabelas existentes)
    const { Usuario } = require('./models');
    
    // Sincronizar sem alterar estrutura existente (mais rápido)
    // alter: false evita verificações pesadas de estrutura
    await sequelize.sync({ alter: false, force: false });
    console.log('📦 [Auth Service] Tabelas sincronizadas!');
    
    // Registrar rotas
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/auth', authRoutes);
    
    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Rota não encontrada', service: 'auth-service' });
    });
    
    // Error handler
    app.use((err, req, res, next) => {
      logger.error('❌ [Auth Service] Erro:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
      });
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        service: 'auth-service',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 [Auth Service] Servidor rodando na porta ${PORT}`);
      console.log(`📍 [Auth Service] Health check: http://localhost:${PORT}/health`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 [Auth Service] SIGTERM recebido, encerrando graciosamente...');
      await sequelize.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ [Auth Service] Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

