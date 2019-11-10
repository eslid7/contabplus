
const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class usersRoles extends Model {}
usersRoles.init({
    useIdFk: {type: Sequelize.INTEGER, allowNull: false},
    rolIdFK: {type: Sequelize.INTEGER, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'usersRoles',
  tableName: 'usersRoles'
});
usersRoles.removeAttribute('id');

module.exports = usersRoles;