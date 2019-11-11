'use strict'
const accountingCatalogModel = require('../models/accountingCatalog')

function viewAccountingCatalog(req, res){
    if(global.User == undefined){
       res.redirect('/contab/sign');
    }
    else{
        return res.render('accountingCatalog' ,{
                userData:global.User[0],
                active : 2,
                titlePage : 'Catálogo contable'
            })
           
    }
    
}

function accountingCatalog(req, res){
    accountingCatalogModel.findAll().then( accountingCatalog => {
        return res.status(200).json({rows: accountingCatalog, total:accountingCatalog.length});
    })
}  

module.exports = {
    viewAccountingCatalog,
    accountingCatalog
}