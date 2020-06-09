const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class businessUsersPermit extends Model {}
businessUsersPermit.init({
    bupId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    busIdFk: {type: Sequelize.INTEGER, allowNull: false},
    useIdFk: {type:  Sequelize.INTEGER, allowNull: false},
    useIdFkOwner: {type:  Sequelize.INTEGER, allowNull: false},
    accIdFk: {type:  Sequelize.INTEGER, allowNull: false},
    permitId: {type:  Sequelize.INTEGER, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'businessUsersPermit',
  tableName: 'businessUsersPermit'
});
businessUsersPermit.removeAttribute('id');
module.exports = businessUsersPermit;