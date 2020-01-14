'use strict'
const express = require('express')

const appContabController = require('../controllers/contabController');
const userController = require('../controllers/usersController')
const router = express.Router()

router.route('/users').get(userController.getUsers);
router.route('/viewUsers').get(userController.viewUsers);


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
router.route('/viewDefineCatalog').get(appContabController.viewDefineCatalog);
router.route('/viewBusiness').get(appContabController.viewBusiness);
router.route('/business').get(appContabController.business);
router.route('/saveBusiness').post(appContabController.saveBusiness);
module.exports = router;