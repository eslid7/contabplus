const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')

const Model = Sequelize.Model;
class moneyTypes extends Model {}
moneyTypes.init({
    monId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    busIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    useIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    monCode: {type:  Sequelize.INTEGER, allowNull: false},
    monName: {type:  Sequelize.STRING, allowNull: false},    
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'moneyTypes',
  tableName: 'moneyTypes'
});
moneyTypes.removeAttribute('id');

module.exports = moneyTypes;