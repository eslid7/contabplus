'use strict'

const LocalStrategy = require('passport-local').Strategy
const userModel = require('../../models/users')
const userController = require('../../controllers/usersController')

module.exports = new LocalStrategy(
  {
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'useLogin',
    passwordField: 'usePassword',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  },
  (req, email, password, done) => {
    // callback with email and password

    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists

    userModel.findOne({ username: useLogin }, (err, userData) => {
      // if there are any errors, return the error before anything else
      if (err) {
        console.log('1')
        return done(err)
      }

      // if no user is found, return the message
      if (!userData) {
        console.log('2')
        return done(null, false, 'No user found.')
      }

      // if the user is found but the password is wrong
      //   if (!userData.validPassword(password)) {
      //     console.log('3')
      //     return done(
      //       null,
      //       false,
      //       req.flash('loginMessage', 'Oops! Wrong password.')
      //     ) // create the loginMessage and save it to session as flashdata
      //   }

      // all is well, return successful user
      return userController
        .login(userData)
        .then(user => done(null, user))
        .catch(errs => done(errs))
    })
  }
)
