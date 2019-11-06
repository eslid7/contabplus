'use strict'

const express = require('express')
const authRoutes = require('./auth.route')
const contabRoutes = require('./contabRoutes')

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/contab', contabRoutes)

module.exports = router