const businessModel = require('../models/business')
const usersModel = require('../models/users')
const businessUsersPermitModel = require('../models/businessUsersPermit')
const accountingCatalogModel = require('../models/accountingCatalog')
const accountingAccountModel = require('../models/accountingCatalog')
const moment = require('moment')

function viewMantenanceAcco(req, res){
    if(global.User == undefined){
        res.redirect('/contab/sign');
    }
    else{   
        if (global.User.length==0) {
            throw ('El usuario que intenta buscar no existe.')
        }
        else{
            businessModel.findAll({where:{'useIdFK': global.User[0].useId}}).then( business => {
                usersModel.findAll().then(function (usersData){
                    return res.render('viewMantenanceAcco' ,{
                    userData:global.User[0],
                    active : -1,
                    titlePage : 'Mant de cuentas contables',
                    business : business,
                    users : usersData,
                    })
                })        
            })    
        }   
    }
}

function saveAccountingAccount(req, res){

}


module.exports = {
    viewMantenanceAcco,
    saveAccountingAccount,
}