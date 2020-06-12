const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class accountingAccount extends Model {}
accountingAccount.init({
    aacId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    accIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    busIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    useIdFk: {type: Sequelize.INTEGER, allowNull: false},
    aacCode: {type:  Sequelize.STRING, allowNull: false},
    aacName: {type:  Sequelize.STRING, allowNull: false},    
    aacType: {type: Sequelize.INTEGER, allowNull: false},
    aacTypeBalance: {type: Sequelize.INTEGER, allowNull: false},
    aacFuncionality: {type: Sequelize.STRING, allowNull: false},
    aacObservations: {type: Sequelize.STRING, allowNull: false},
    aacStatus: {type: Sequelize.INTEGER, allowNull: false},
    aacNivelss: {type: Sequelize.STRING, allowNull: false},
    aacMoney: {type: Sequelize.INTEGER, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'accountingAccount',
  tableName: 'accountingAccount'
});


accountingAccount.removeAttribute('id');

module.exports = accountingAccount;