const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class businessAccountingC extends Model {}
businessAccountingC.init({
    busIdFk: {type: Sequelize.INTEGER, allowNull: false},
    aacIdFk: {type: Sequelize.INTEGER, allowNull: false},
    balance: {type: Sequelize.DECIMAL, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
sequelize,
modelName: 'businessAccountingC',
tableName: 'businessAccountingC'
});
businessAccountingC.removeAttribute('id');
module.exports = businessAccountingC;
