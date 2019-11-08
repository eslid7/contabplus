const config = require('./index')
const Sequelize = require('sequelize');

const sequelize = new Sequelize(config.database, config.user, config.password, {
	host: config.host,
	dialect: 'mysql',
});  
sequelize.authenticate()
.then(() => {
	console.log('Conectado')  
})
.catch(err => {
	console.log('No se conecto')
});

module.exports = sequelize;