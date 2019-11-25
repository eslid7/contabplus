'use strict'
const accountingCatalogModel = require('../models/accountingCatalog')
const moment = require('moment');

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

function saveAccountingCatalog(req, res){
    //hacer las validaciones que el numero no exista
    // si ya existe el ID seria update por el momento save

    // ver como hago el armado de niveles...
    var accNivels ='';


    const dataToSave = new accountingCatalogModel({
        accName: req.body.accName,
        accIsGlobal: req.body.accIsGlobal,
        accCode: req.body.accCode,
        accQuantityNivels: req.body.accQuantityNivels,
        accNivels: accNivels,
        accStatus : 1,
        accSeparator : req.body.accSeparator,
        useIdFk : global.User[0].useId,
        createdAt: moment(new Date()).format('YYYY-MM-DD'),
        updateAt: moment(new Date()).format('YYYY-MM-DD')
      });
      //se devuelve el usuaurio
      return dataToSave.save().then(function (accountingCatalogSaved) {
        res.status(200).json({ message: "Se ha creado con exito" });
      })

}

module.exports = {
    viewAccountingCatalog,
    accountingCatalog,
    saveAccountingCatalog
}