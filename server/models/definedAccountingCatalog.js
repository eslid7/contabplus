const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class definedAccountingCatalog extends Model {}
definedAccountingCatalog.init({
    accIdFk: {type:  Sequelize.INTEGER, allowNull: false},
    useIdFk: {type:  Sequelize.INTEGER, allowNull: false},
    busIdFk: {type:  Sequelize.INTEGER, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'definedAccountingCatalog',
  tableName: 'definedAccountingCatalog'
});
definedAccountingCatalog.removeAttribute('id');
module.exports = definedAccountingCatalog;