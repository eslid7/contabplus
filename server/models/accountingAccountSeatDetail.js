const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class accountingAccountSeatDetail extends Model {}
accountingAccountSeatDetail.init({
    aasdId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},    
    aasIdFk: {type:  Sequelize.INTEGER, allowNull: false}, 
    aacIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    docIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    monIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    aasdNumberDoc: {type: Sequelize.STRING, allowNull: false},
    aasdDescription: {type: Sequelize.STRING, allowNull: false},
    aasdChangeValue: {type: Sequelize.DECIMAL, allowNull: false},
    aasdDebit: {type: Sequelize.DECIMAL, allowNull: false},
    aasdCredit: {type: Sequelize.DECIMAL, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'accountingAccountSeatDetail',
  tableName: 'accountingAccountSeatDetail'
});


accountingAccountSeatDetail.removeAttribute('id');

module.exports = accountingAccountSeatDetail;