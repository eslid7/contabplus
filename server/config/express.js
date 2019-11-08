'use strict'

const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')
const config = require('./env')
const mysql = require('mysql')
const passport = require('passport')
const passportStatregy = require('./strategies/passport')
const passportConfig = require('./passport')
const routes = require('../routes')
// const { authenticate } = require('../models/dataBD')


module.exports.initPassport = function initPassport(app) {
  app.use(
    session({
      secret: 'b33d00',
      resave: false,
      saveUninitialized: false,
    })
  )
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use('passport-local', passportStatregy)
  passport.serializeUser(passportConfig.serializeUser)
  passport.deserializeUser(passportConfig.deserializeUser)
}

module.exports.initRoutes = function initRoutes(app) {
  app.use('/', routes)
}

// module.exports.initDB = async function initDB(app) {
//    const { dbInitialized, error: errDb } = await authenticate()
//    if (!dbInitialized) {
//      databaseConnectionFailedLog(errDb)
//      process.exit(1)
//    }
//    else{
//     console.log('ingresado a dataBD')
//    }
// }

module.exports.initMiddlewares = function initMiddlewares(app) {
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(
    bodyParser.urlencoded({
       limit: '50mb',
       extended: true,
       parameterLimit: 50000,
    })
  )
}

module.exports.initViewsEngine = function initViewsEngine(app) {
  app.set('view engine', 'ejs')
  app.set('views', './server/views')
  app.use('/static',express.static('./server/public'))
}

module.exports.init = () => {
  const app = express()
  this.initMiddlewares(app)
  // this.initDB(app)
  this.initPassport(app)
  this.initRoutes(app)
  this.initViewsEngine(app)
  app
    .listen(config.port, () => {
      console.log(
        'App listening on port %s, in environment %s!',
        config.port,
        process.env.NODE_ENV || 'develop'
      )
      console.log('**********************')
      console.log('contab-server online')
      console.log('**********************')
    })
    .on('error', err => {
      console.error(err)
    })
  return app
}
