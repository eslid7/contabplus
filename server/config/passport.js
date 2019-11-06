'use strict'

module.exports.serializeUser = (user, done) => {
  done(null, user)
}

module.exports.deserializeUser = (user, done) => {
  // TODO: buscar el cliente y devolverlo
  done(null, user)
}
