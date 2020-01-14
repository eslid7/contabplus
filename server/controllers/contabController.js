'use strict'
const accountingCatalogModel = require('../models/accountingCatalog')
const businessModel = require('../models/business')
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

    let accNivels = new Array();
    accNivels = {
        accName1:req.body.accName1,
        accNivel1: req.body.accNivel1,
        accName2:req.body.accName2,
        accNivel2: req.body.accNivel2,
        accName3:req.body.accName3,
        accNivel3: req.body.accNivel3,
        accName4:req.body.accName4,
        accNivel4: req.body.accNivel4,
        accName5:req.body.accName5,
        accNivel5: req.body.accNivel5,
        accName6:req.body.accName6,
        accNivel6: req.body.accNivel6,
        accName7:req.body.accName7,
        accNivel7: req.body.accNivel7,
        accName8:req.body.accName8,
        accNivel8: req.body.accNivel8,
        accName9:req.body.accName9,
        accNivel9: req.body.accNivel9,
        accName10:req.body.accName10,
        accNivel10: req.body.accNivel10,
        accName11:req.body.accName11,
        accNivel11: req.body.accNivel11,
        accName12:req.body.accName12,
        accNivel12: req.body.accNivel12        
    };

    const dataToSave = new accountingCatalogModel({
        accName: req.body.accName,
        accIsGlobal: req.body.accIsGlobal,
        accCode: req.body.accCode,
        accQuantityNivels: req.body.accQuantityNivels,
        accNivels: JSON.stringify(accNivels).toString(),
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

function viewDefineCatalog(req, res){
    if(global.User == undefined){
       res.redirect('/contab/sign');
    }
    else{
        return res.render('defineCatalog' ,{
                userData:global.User[0],
                active : 2,
                titlePage : 'Definir catálogo contable'
            })
           
    }
    
}

function viewBusiness(req, res){
    if(global.User == undefined){
       res.redirect('/contab/sign');
    }
    else{
        return res.render('business' ,{
                userData:global.User[0],
                active : 1,
                titlePage : 'Empresas'
            })
           
    }
    
}

function business(req, res){
    businessModel.findAll().then( business => {
        return res.status(200).json({rows: business, total:business.length});
    })
} 

function saveBusiness(req, res){
    const dataToSave = new businessModel({
        busName: req.body.busName,
        useIdFk: global.User[0].useId,
        busStatus: 1,
        busEmail: req.body.busEmail,
        busPhone: req.body.busPhone,
        createdAt: moment(new Date()).format('YYYY-MM-DD'),
        updateAt: moment(new Date()).format('YYYY-MM-DD')
      });
      //se devuelve el usuaurio
      return dataToSave.save().then(function (businessSaved) {
        res.status(200).json({ message: "Se ha creado con exito" });
      })

}
module.exports = {
    viewAccountingCatalog,
    accountingCatalog,
    saveAccountingCatalog,
    viewDefineCatalog,
    viewBusiness,
    business,
    saveBusiness
}