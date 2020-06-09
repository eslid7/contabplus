'use strict'

const express = require('express')
const passport = require('passport')

const userController = require('../controllers/usersController')
const authHelper = require('../config/utils/authHelpers')

const router = express.Router()

router.route('/signup').post(userController.signup)

router.route('/accountConfirmation/:token').get(userController.validateAccount)

router.route('/resendMail').post(userController.resendMail)

router.route('/login').post(userController.login)


router.route('/successRedirect').get((req, res) => {
  res.status(200).json({
    message: 'Autenticación correctamente.',
  })
})

router.route('/failureRedirect').get((req, res) => {
  res.status(400).json({
    error: 'Al intentar realizar la autenticación',
  })
})

router.route('/authenticated').get(authHelper.isAuth, (req, res) => {
  const { user } = req
  return res.status(200).json({
    authenticated: true,
    user,
  })
})

router.route('/logout').get(userController.logout)



module.exports = router
