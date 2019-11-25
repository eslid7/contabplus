'use strict'
const express = require('express')

const appContabController = require('../controllers/contabController');
const userController = require('../controllers/usersController')
const router = express.Router()

router.route('/user').get(userController.getUser);

router.route('/accountData').get(userController.accountData);
router.route('/account').get(userController.createAccount);
router.route('/index').get(userController.index);
router.route('/sign').get(userController.sign);
router.route('/delete').get(userController.deteleUsers);




router.route('/home').get(userController.home);
router.route('/profile').get(userController.profile);
router.route('/').get(userController.index);

// contabController
router.route('/viewAccountingCatalog').get(appContabController.viewAccountingCatalog);
router.route('/accountingCatalog').get(appContabController.accountingCatalog);
router.route('/accountingCatalog').post(appContabController.saveAccountingCatalog);


module.exports = router;