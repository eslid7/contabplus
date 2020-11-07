const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class accountingAccountSeat extends Model {}
accountingAccountSeat.init({
    aasId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},    
    accIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    busIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    aasdStatus : {type:  Sequelize.INTEGER, allowNull: false},  
    useIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    aasMonth: {type:  Sequelize.INTEGER, allowNull: false},  
    aasYear: {type:  Sequelize.INTEGER, allowNull: false},  
    aasDateSeat: {type:  Sequelize.DATE, allowNull: false},
    aasNumberSeat: {type: Sequelize.STRING, allowNull: false},
    aasIsPreSeat: {type: Sequelize.INTEGER, allowNull: false},
    aasNameSeat: {type: Sequelize.STRING, allowNull: false},
    aasOrigin: {type: Sequelize.INTEGER, allowNull: false},
    aasdDebitTotal: {type: Sequelize.DECIMAL, allowNull: false},
    aasdCreditTotal: {type: Sequelize.DECIMAL, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'accountingAccountSeat',
  tableName: 'accountingAccountSeat'
});


accountingAccountSeat.removeAttribute('id');

module.exports = accountingAccountSeat;