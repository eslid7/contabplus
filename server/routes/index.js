'use strict'

const express = require('express')
const authRoutes = require('./auth.route')
const contabRoutes = require('./contabRoutes')
const userController = require('../controllers/usersController')

const router = express.Router()
router.route('/').get(userController.index);

router.use('/auth', authRoutes)
router.use('/contab', contabRoutes)


module.exports = router