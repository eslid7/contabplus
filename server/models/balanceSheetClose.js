const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')

const Model = Sequelize.Model;
class balanceSheetClose extends Model {}
balanceSheetClose.init({
    bscId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    busIdFk: {type: Sequelize.INTEGER, allowNull: false},
    bscMonth: {type: Sequelize.INTEGER, allowNull: false},
    bscYear: {type: Sequelize.INTEGER, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
sequelize,
modelName: 'balanceSheetClose',
tableName: 'balanceSheetClose'
});
balanceSheetClose.removeAttribute('id');
module.exports = balanceSheetClose;