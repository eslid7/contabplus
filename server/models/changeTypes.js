const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')

const Model = Sequelize.Model;
class changeTypes extends Model {}
changeTypes.init({
    chaId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    monId: {type:  Sequelize.INTEGER, allowNull: false},  
    busIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    useIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    chaDate: {type:  Sequelize.DATEONLY, allowNull: false},
    chaSaleValue: {type:  Sequelize.DECIMAL, allowNull: false},
    chaPurchaseValue: {type:  Sequelize.DECIMAL, allowNull: false},   
    chaSaleValuationValue: {type:  Sequelize.DECIMAL, allowNull: false},
    chaPurchaseValuationValue: {type:  Sequelize.DECIMAL, allowNull: false},    
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'changeTypes',
  tableName: 'changeTypes'
});
changeTypes.removeAttribute('id');

module.exports = changeTypes;