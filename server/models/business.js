const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class business extends Model {}
business.init({
    busId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    busName: {type:  Sequelize.STRING, allowNull: false},
    useIdFk: {type:  Sequelize.INTEGER, allowNull: false},
    busStatus: {type:  Sequelize.INTEGER, allowNull: false},
    busEmail: {type: Sequelize.STRING, allowNull: false},
    busPhone : {type:  Sequelize.STRING, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'business',
  tableName: 'business'
});
business.removeAttribute('id');
module.exports = business;