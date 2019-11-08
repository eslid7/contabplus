const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const config = require('../config/env')

const basename = path.basename(__filename)
const db = {}

const sequelize = new Sequelize(config.database, config.user, config.password, {
	host: config.host,
	dialect: 'mysql',
});  


fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    )
  })
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file))
     console.log(model);
    console.log(model.name);
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

async function authenticate() {
  try {
    await sequelize.authenticate()

    return { dbInitialized: true }
  } catch (error) {
    console.log(error);
    return { dbInitialized: false, error }
  }
}

module.exports = { ...db, authenticate }
