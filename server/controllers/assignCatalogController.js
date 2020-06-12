'use strict'
const accountingCatalogModel = require('../models/accountingCatalog');
const businessModel = require('../models/business');
const definedAccCatMonthModel = require('../models/definedAccontingCatMonth');
const definedAccountingCatalogModel = require('../models/definedAccountingCatalog');
const sequelize = require('sequelize');
const moment = require('moment');


function viewAsignCatalog(req, res){
    if(global.User == undefined){
       res.redirect('/contab/sign');
    }
    else{
        businessModel.findAll({where:{'useIdFK': global.User[0].useId}}).then( business => {            
            return res.render('asignCatalog' ,{
                userData:global.User[0],
                active : 1,
                titlePage : 'Asignar catálogo contable',
                business: business
            })
        })           
    }    
}

function getCatalog(req, res){
    definedAccountingCatalogModel.findAll({where: {'useIdFK': global.User[0].useId, 'busIdFk': req.params.id}, attributes: [sequelize.fn('max', sequelize.col('updatedAt')),'accIdFk'], group : ['accIdFk'] }).then( definedCatalog => { 
        if(definedCatalog[0]){
            accountingCatalogModel.findOne({where: {'accId': definedCatalog[0].accIdFk}}).then( accountCatalog => {       
                return   res.status(200).json({ accountCatalog: accountCatalog });
            })
        }
        else{
            return   res.status(400).json({ message: "No se a definido el catálogo para esta empresa." });
        }        
    })

}

function getCatalogs(req, res){
    definedAccountingCatalogModel.findAll({where: {'useIdFK': global.User[0].useId, 'busIdFk': req.params.id}, attributes: [sequelize.fn('max', sequelize.col('updatedAt')),'accIdFk'], group : ['accIdFk'] }).then( definedCatalog => { 
        if(definedCatalog[0]){
            const definedCatalogs = definedCatalog.map(
                definedCatalog => definedCatalog.dataValues.accIdFk
            )
            accountingCatalogModel.findAll({where: {'accId': {[sequelize.Op.in]: definedCatalogs }}}).then( accountCatalog => {       
                return   res.status(200).json({ accountCatalog: accountCatalog });
            })
        }
        else{
            return   res.status(400).json({ message: "No se a definido el catálogo para esta empresa." });
        }        
    })

}

function listHistory(req, res){
    definedAccCatMonthModel.hasOne(accountingCatalogModel,{foreignKey:'accId',sourceKey: 'accIdFk'});
    definedAccCatMonthModel.findAll({where: {'busIdFk': req.params.id},
        include: [{
            model: accountingCatalogModel,
            require : true
        }]
    }).then( definedAccCatMonth => { 
        return res.status(200).json({rows: definedAccCatMonth, total:definedAccCatMonth.length});
    })
}

function saveAsignCatalog(req, res){ 
    const dataToSave = new definedAccCatMonthModel({
        accIdFk: req.body.accId,
        useIdFk: global.User[0].useId,
        busIdFk: req.body.busId,
        month: req.body.month,
        year: req.body.year,
        createdAt: moment(new Date()).format('YYYY-MM-DD'),
        updateAt: moment(new Date()).format('YYYY-MM-DD')
    });
    dataToSave.save().then(function () {
        return res.status(200).json({ message: "Se ha creado con exito" });
    })
}

module.exports = {
    viewAsignCatalog,
    getCatalog,
    listHistory,
    saveAsignCatalog,
    getCatalogs,
}