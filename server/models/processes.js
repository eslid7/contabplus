const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class processes extends Model {}
processes.init({
    proId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    proName: {type:  Sequelize.STRING, allowNull: false},
    proUrl: {type:  Sequelize.STRING, allowNull: false},
    menIdFk: {type:  Sequelize.STRING, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'processes',
  tableName: 'processes'
});

processes.removeAttribute('id');
module.exports = processes;