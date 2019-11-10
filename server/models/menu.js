const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')

const Model = Sequelize.Model;
class menu extends Model {}
menu.init({
    menId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    menName: {type:  Sequelize.STRING, allowNull: false},
    menIco: {type:  Sequelize.STRING, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'menu',
  tableName: 'menu'
});

module.exports = menu;