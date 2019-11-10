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
users.removeAttribute('id');
module.exports = users;