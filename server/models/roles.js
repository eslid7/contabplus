
const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class roles extends Model {}
roles.init({
    rolId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    rolName: {type:  Sequelize.STRING, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'roles',
  tableName: 'roles'
});


module.exports = roles;