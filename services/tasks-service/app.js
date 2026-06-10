const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const logger = require('./utils/logger');

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Métricas básicas
let requestCount = 0;
let errorCount = 0;
const startTime = Date.now();
let totalResponseTime = 0;

// Middleware de métricas
app.use((req, res, next) => {
  const start = Date.now();
  requestCount++;
  
  logger.info('Request received', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });

  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    totalResponseTime += duration;
    
    if (res.statusCode >= 400) {
      errorCount++;
      logger.error('Request failed', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: duration
      });
    } else {
      logger.info('Request completed', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: duration
      });
    }
    return originalSend.call(this, data);
  };
  next();
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    service: "Tasks Service",
    message: "Servico de tarefas funcionando",
    timestamp: new Date().toISOString()
  });
});

// Health check com verificação de banco
app.get('/health', async (req, res) => {
  try {
    const sequelize = require('./config/db');
    await sequelize.authenticate();
    
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    res.json({ 
      status: "OK",
      service: "tasks-service",
      database: "connected",
      uptime: uptime,
      requests: requestCount,
      errors: errorCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({ 
      status: "ERROR",
      service: "tasks-service",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Métricas endpoint
app.get('/metrics', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const avgResponseTime = requestCount > 0 ? (totalResponseTime / requestCount).toFixed(2) : 0;
  
  res.json({
    service: "tasks-service",
    uptime: uptime,
    requests: requestCount,
    errors: errorCount,
    errorRate: requestCount > 0 ? ((errorCount / requestCount) * 100).toFixed(2) : 0,
    avgResponseTime: parseFloat(avgResponseTime),
    timestamp: new Date().toISOString()
  });
});

module.exports = app;

