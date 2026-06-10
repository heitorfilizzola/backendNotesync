const sequelize = require('../config/db');
const Usuario = require('./Usuario');

const models = {
  Usuario,
};

models.sequelize = sequelize;

module.exports = models;
