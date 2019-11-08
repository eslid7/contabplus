
const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class users extends Model {}
users.init({
    useId: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    useName: {type:  Sequelize.STRING, allowNull: false},
    useLogin: {type:  Sequelize.STRING, allowNull: false},
    usePassword: {type:  Sequelize.STRING, allowNull: false},
    useStatus: {type: Sequelize.INTEGER, allowNull: false},
    usePhone : {type:  Sequelize.STRING, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'users'
});

module.exports = users;

//// Posible 

// module.exports = (sequelize, DataTypes) => {
// 	 const users = sequelize.define(
//     'users',
//     {
//      	useId: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
// 	    useName: {type:  DataTypes.STRING, allowNull: false},
// 	    useLogin: {type:  DataTypes.STRING, allowNull: false},
// 	    usePassword: {type:  DataTypes.STRING, allowNull: false},
// 	    useStatus: {type: DataTypes.INTEGER, allowNull: false},
//       createdAt: {type: DataTypes.TIME, allowNull: true},
//       updatedAt: {type: DataTypes.TIME, allowNull: true}
//     },
//     {
//       tableName: 'users'
//     }
//   )

//   // WorkspaceUser.associate = models => {
//   //   WorkspaceUser.belongsTo(models.Workspace, { foreignKey: 'workspaceId' })
//   //   WorkspaceUser.belongsTo(models.User, { foreignKey: 'userId' })
//   //   WorkspaceUser.belongsTo(models.Rol, { foreignKey: 'rolId' })
//   // }

//   // WorkspaceUser.removeAttribute('id')
//   return users;
// }