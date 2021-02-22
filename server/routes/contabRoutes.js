'use strict'
const express = require('express')

const appContabController = require('../controllers/contabController');
const userController = require('../controllers/usersController')
const assignCatalogController = require('../controllers/assignCatalogController')
const assignPermitCatalogController = require('../controllers/assignPermitCatalogController')
const accountingAccountController = require('../controllers/accountingAccountController');
const documentTypesController = require('../controllers/documentTypesController');
const moneyTypesController = require('../controllers/moneyTypesController');
const viewChangeTypesController = require('../controllers/viewChangeTypesController');
const seatController = require('../controllers/seatController');
const balanceSheetController = require('../controllers/balanceSheetController');
const reportsController = require('../controllers/reportsController');

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
router.route('/getCatalogByPeriodo/:id').get(assignCatalogController.getCatalogByPeriodo);
router.route('/getOneCatalog/:busId').get(assignCatalogController.getOneCatalog);

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
router.route('/deleteAccount/:id').post(accountingAccountController.deleteAccount);
router.route('/viewActiInacAcco').get(accountingAccountController.viewActiInacAcco);
router.route('/loadFileActiveInactive/:id').post(accountingAccountController.loadFileActiveInactive);

//viewTypesDocuments
router.route('/viewTypesDocuments').get(documentTypesController.viewTypesDocuments);
router.route('/getListTypesDocuments').get(documentTypesController.getListTypesDocuments);
router.route('/saveDocumentType').post(documentTypesController.saveDocumentType);
router.route('/getListTypesDocumentsByBussines/:id').get(documentTypesController.getListTypesDocumentsByBussines);

//viewMoneyTypes
router.route('/viewMoneyTypes').get(moneyTypesController.viewMoneyTypes);
router.route('/getListMoneyTypes').get(moneyTypesController.getListMoneyTypes);
router.route('/saveMoneyTypes').post(moneyTypesController.saveMoneyTypes);
router.route('/getListMoneyTypesByBussines/:id').get(moneyTypesController.getListMoneyTypesByBussines);

//viewChangeTypes
router.route('/viewChangeTypes').get(viewChangeTypesController.viewChangeTypes);
router.route('/getListChangeTypes').get(viewChangeTypesController.getListChangeTypes);
router.route('/saveChangeTypes').post(viewChangeTypesController.saveChangeTypes);

//viewSeat
router.route('/viewSeat').get(seatController.viewSeat);
router.route('/getListSeats/:id').get(seatController.getListSeats);
router.route('/saveHeatSeat').post(seatController.saveHeatSeat);
router.route('/saveDetailSeat/:id').post(seatController.saveDetailSeat);
router.route('/deleteSeatDetail/:id').delete(seatController.deleteSeatDetail);
router.route('/applySeat/:id').post(seatController.applySeat);
router.route('/deleteSeat/:id').delete(seatController.deleteSeat);
router.route('/reverSeatService/:id').post(seatController.reverSeatService);

//view Close balance
router.route('/viewBalanceSheet').get(balanceSheetController.viewBalanceSheet);
router.route('/balanceSheet').post(balanceSheetController.balanceSheet);
router.route('/getListBalanceSheet/:busId').get(balanceSheetController.getListBalanceSheet);


//view balance reportes
router.route('/viewReportSeats/').get(seatController.viewReportSeats);
router.route('/getReportSeats/:busId/:month/:year').get(seatController.getReportSeats);

router.route('/viewMovementebyAccount').get(reportsController.viewMovementebyAccount);
router.route('/viewBalanceVerify').get(reportsController.viewBalanceVerify);
router.route('/getReportMovementebyAccount/:busId').get(reportsController.getReportMovementebyAccount);
router.route('/getReportBalance/:busId').get(reportsController.getReportBalance);

module.exports = router;