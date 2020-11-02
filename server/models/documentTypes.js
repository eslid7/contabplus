const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class documentTypes extends Model {}
documentTypes.init({
    docId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    busIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    useIdFk: {type:  Sequelize.INTEGER, allowNull: false},  
    docCode: {type:  Sequelize.INTEGER, allowNull: false},
    docName: {type:  Sequelize.STRING, allowNull: false},    
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'documentTypes',
  tableName: 'documentTypes'
});
documentTypes.removeAttribute('id');

module.exports = documentTypes;