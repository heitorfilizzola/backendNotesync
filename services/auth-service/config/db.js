const { Sequelize } = require("sequelize");
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '../../../.env') });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL não está definida nas variáveis de ambiente!");
  process.exit(1);
}

// Detectar se a DATABASE_URL requer SSL (Neon Database sempre requer)
const requiresSSL = process.env.DATABASE_URL && (
  process.env.DATABASE_URL.includes('sslmode=require') ||
  process.env.DATABASE_URL.includes('neon.tech') ||
  process.env.NODE_ENV === "production"
);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: requiresSSL ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  },
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  retry: {
    max: 3,
  },
});

module.exports = sequelize;

