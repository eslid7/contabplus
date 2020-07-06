const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class deleteAccountingAccount extends Model {}
deleteAccountingAccount.init({
    daaId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    accIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    busIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    useIdFk: {type: Sequelize.INTEGER, allowNull: false},
    aacCode: {type:  Sequelize.STRING, allowNull: false},
    aacName: {type:  Sequelize.STRING, allowNull: false},    
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'deleteAccountingAccount',
  tableName: 'deleteAccountingAccount'
});
deleteAccountingAccount.removeAttribute('id');

module.exports = deleteAccountingAccount;