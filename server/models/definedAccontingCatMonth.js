const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class definedAccCatMonth extends Model {}
definedAccCatMonth.init({
    accIdFk: {type:  Sequelize.INTEGER, allowNull: false},
    useIdFk: {type:  Sequelize.INTEGER, allowNull: false},
    busIdFk: {type:  Sequelize.INTEGER, allowNull: false},
    month: {type:  Sequelize.INTEGER, allowNull: false},
    year: {type:  Sequelize.INTEGER, allowNull: false},        
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'definedAccCatMonth',
  tableName: 'definedAccCatMonth'
});
definedAccCatMonth.removeAttribute('id');
module.exports = definedAccCatMonth;