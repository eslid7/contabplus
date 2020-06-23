'use strict'
const express = require('express')

const appContabController = require('../controllers/contabController');
const userController = require('../controllers/usersController')
const assignCatalogController = require('../controllers/assignCatalogController')
const assignPermitCatalogController = require('../controllers/assignPermitCatalogController')
const accountingAccountController = require('../controllers/accountingAccountController')

const router = express.Router()

router.route('/users').get(userController.getUsers);
router.route('/viewUsers').get(userController.viewUsers);


router.route('/accountData').get(userController.accountData);
router.route('/account').get(userController.createAccount);
router.route('/index').get(userController.index);
router.route('/sign').get(userController.sign);
router.route('/delete').get(userController.deteleUsers);

router.route('/users/changeStatus').post(userController.changeStatus)


router.route('/home').get(userController.home);
router.route('/profile').get(userController.profile);
router.route('/updateUser').post(userController.updateUser)
router.route('/updatePassoword').post(userController.updatePassoword)
router.route('/').get(userController.index);

// contabController
router.route('/viewAccountingCatalog').get(appContabController.viewAccountingCatalog);
router.route('/accountingCatalog').get(appContabController.accountingCatalog);
router.route('/accountingCatalog').post(appContabController.saveAccountingCatalog);
router.route('/viewDefineCatalog').get(appContabController.viewDefineCatalog);
router.route('/viewBusiness').get(appContabController.viewBusiness);
router.route('/business').get(appContabController.business);
router.route('/saveBusiness').post(appContabController.saveBusiness);

router.route('/definedAccountingCatalog').get(appContabController.definedAccountingCatalog);
router.route('/definedAccountingCatalog').post(appContabController.saveDefinedAccountingCatalog);
router.route('/accountingCatalog/:id').get(appContabController.accountingCatalog);
router.route('/saveRol').post(userController.saveRol);

//assignCatalogController
router.route('/viewAsignCatalog').get(assignCatalogController.viewAsignCatalog);
router.route('/getCatalog/:id').get(assignCatalogController.getCatalog);
// una empresa puede tener N catalogos
router.route('/getCatalogs/:id').get(assignCatalogController.getCatalogs);

router.route('/listHistory/:id').get(assignCatalogController.listHistory);
router.route('/saveAsignCatalog').post(assignCatalogController.saveAsignCatalog);

//viewAsignPermit
router.route('/viewAsignPermit').get(assignPermitCatalogController.viewAsignPermit);
router.route('/saveAsignPermit').post(assignPermitCatalogController.saveAsignPermit);
router.route('/assignHistory/:id').get(assignPermitCatalogController.assignHistory);
router.route('/deleteAssignHistory/:id').post(assignPermitCatalogController.deleteAssignHistory);

//accountingAccount
router.route('/viewMantenanceAcco').get(accountingAccountController.viewMantenanceAcco);
router.route('/saveAccountingAccount').post(accountingAccountController.saveAccountingAccount);
router.route('/getAccountingAccount/:id').get(accountingAccountController.getAccountingAccount);
router.route('/getAccountingAccountSearch/:id').get(accountingAccountController.getAccountingAccountSearch);
router.route('/loadFile/:id').post(accountingAccountController.loadFile);
router.route('/activeInactiveAccount/:id').post(accountingAccountController.activeInactiveAccount);



module.exports = router;