const Sequelize = require('sequelize');
const sequelize = require('../config/env/connection')


const Model = Sequelize.Model;
class business extends Model {}
businessUsers.init({
    busIdFk: {type: Sequelize.INTEGER, allowNull: false},
    useIdFk: {type:  Sequelize.INTEGER, allowNull: false},
    createdAt: {type: Sequelize.TIME, allowNull: true},
    updatedAt: {type: Sequelize.TIME, allowNull: true}
}, {
  sequelize,
  modelName: 'businessUsers'
});
businessUsers.removeAttribute('id');
module.exports = businessUsers;