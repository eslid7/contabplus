const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')

const Model = Sequelize.Model;
class balanceSheet extends Model {}
balanceSheet.init({
    bshId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    busIdFk: {type: Sequelize.INTEGER, allowNull: false},
    aacIdFk: {type: Sequelize.INTEGER, allowNull: false},
    bshMonth: {type: Sequelize.INTEGER, allowNull: false},
    bshYear: {type: Sequelize.INTEGER, allowNull: false},
    bshPreviousBalance: {type: Sequelize.DECIMAL, allowNull: false},
    bshDebits: {type: Sequelize.DECIMAL, allowNull: false},
    bshCredits: {type: Sequelize.DECIMAL, allowNull: false},
    bshFinalBalance: {type: Sequelize.DECIMAL, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
sequelize,
modelName: 'balanceSheet',
tableName: 'balanceSheet'
});
balanceSheet.removeAttribute('id');
module.exports = balanceSheet;