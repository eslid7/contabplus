const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class accountingCatalog extends Model {}
accountingCatalog.init({
    accId: {type: Sequelize.INTEGER, allowNull: false},
    accName: {type:  Sequelize.STRING, allowNull: false},
    accCode: {type: Sequelize.STRING, allowNull: false},
    accQuantityNivels: {type: Sequelize.INTEGER, allowNull: false},
    accNivels: {type: Sequelize.STRING, allowNull: false},
    accStatus: {type: Sequelize.INTEGER, allowNull: false},
    useIdFk: {type: Sequelize.INTEGER, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'accountingCatalog',
  tableName: 'accountingCatalog'
});


accountingCatalog.removeAttribute('id');

module.exports = accountingCatalog;