const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class rolesProcesses extends Model {}
rolesProcesses.init({
    rolIdFk: {type: Sequelize.INTEGER, allowNull: false},
    proIdFk: {type: Sequelize.INTEGER, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'rolesProcesses',
  tableName: 'rolesProcesses'
});

rolesProcesses.removeAttribute('id');

module.exports = rolesProcesses;