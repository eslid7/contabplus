const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class business extends Model {}
business.init({
  busId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},//
  contry:{type: Sequelize.STRING, allowNull: false},////*/
  province:{type: Sequelize.STRING, allowNull: false},  ////*/
  canton:{type: Sequelize.STRING, allowNull: false},////*/
  district:{type: Sequelize.STRING, allowNull: false},////*/
  address:{type: Sequelize.STRING,allowNull: false},//120 caracteres maximos//*/
  taxID: {type: Sequelize.INTEGER,allowNull: false},//
  idType:{type: Sequelize.INTEGER, allowNull: true},//Tipo de identificador diferencia con 1/0//*/
  busName: {type:  Sequelize.STRING, allowNull: false},//*/
  busJuriricalId: {type:  Sequelize.STRING, allowNull: false},//*/
  busNameFantasy: {type:  Sequelize.STRING, allowNull: false},//*/
  busMoney: {type:  Sequelize.INTEGER, allowNull: false},//*/
  useIdFk: {type:  Sequelize.INTEGER, allowNull: false},//*/
  postalMail: {type: Sequelize.INTEGER, allowNull: false},////*/
  busStatus: {type:  Sequelize.INTEGER, allowNull: false},//*/
  busEmail: {type: Sequelize.STRING, allowNull: false},//*/
  busPhone : {type:  Sequelize.STRING, allowNull: false},////*/
  webSite: {type: Sequelize.STRING, allowNull: false},////*/
  createdAt: {type: Sequelize.TIME, allowNull: true},
  updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
sequelize,
modelName: 'business',
tableName: 'business'
});
business.removeAttribute('id');
module.exports = business;




