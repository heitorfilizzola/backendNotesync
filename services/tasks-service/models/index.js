const sequelize = require('../config/db');
const Tarefa = require('./Tarefa');

const models = {
  Tarefa,
};

models.sequelize = sequelize;

module.exports = models;
