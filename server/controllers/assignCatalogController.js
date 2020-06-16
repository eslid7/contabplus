'use strict'
const accountingCatalogModel = require('../models/accountingCatalog');
const businessModel = require('../models/business');
const definedAccCatMonthModel = require('../models/definedAccontingCatMonth');
const definedAccountingCatalogModel = require('../models/definedAccountingCatalog');
const sequelize = require('sequelize');
const moment = require('moment');
const jwt = require('jwt-simple');


function viewAsignCatalog(req, res){
    if(req.headers.cookie==undefined){
        res.redirect('/contab/sign');
    }
    else{
        let data = req.headers.cookie.split("=");
        const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
        businessModel.findAll({where:{'useIdFK': token.useId}}).then( business => {            
            return res.render('asignCatalog' ,{
                userData: token,
                active : 1,
                titlePage : 'Asignar catálogo contable',
                business: business,
                processes : token.processes,
                menu : token.menu   
            })
        })           
    }    
}

function getCatalog(req, res){
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    definedAccountingCatalogModel.findAll({where: {'useIdFK': token.useId, 'busIdFk': req.params.id}, attributes: [sequelize.fn('max', sequelize.col('updatedAt')),'accIdFk'], group : ['accIdFk'] }).then( definedCatalog => { 
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
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    definedAccountingCatalogModel.findAll({where: {'useIdFK': token.useId, 'busIdFk': req.params.id}, attributes: [sequelize.fn('max', sequelize.col('updatedAt')),'accIdFk'], group : ['accIdFk'] }).then( definedCatalog => { 
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
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    //validacion si ya existe o que no se puede brincar
    definedAccCatMonthModel.findAll({where:{accIdFk: req.body.accId, busIdFk: req.body.busId, month: req.body.month,year: req.body.year}}).then(definedAccCatMonth=>{
        if(definedAccCatMonth.length > 0){
            return res.status(400).json({ message: "Para este periodo ya esta asignado un catálogo contable." });
        }
        else{   
            definedAccCatMonthModel.findOne({
                    where:{  accIdFk: req.body.accId,  busIdFk: req.body.busId}, 
                    order : [['updatedAt','DESC']]
                }).then(definedAccCatMonthMax=>{
                    if(definedAccCatMonthMax){  
                        console.log(definedAccCatMonthMax.month)                     
                        if(definedAccCatMonthMax.month == 12){
                            let newYear = definedAccCatMonthMax.year +1
                            if(1 != req.body.month || newYear != req.body.year){
                                return res.status(400).json({ message: "No se puede agregar este periodo porque no es el siguiente por agregar." });
                            }
                        }
                        else{
                            let newMonth = definedAccCatMonthMax.month +1
                            if(newMonth != req.body.month || definedAccCatMonthMax.year != req.body.year){
                                return res.status(400).json({ message: "No se puede agregar este periodo porque no es el siguiente por agregar." });
                            }
                        }
                    }
                    const dataToSave = new definedAccCatMonthModel({
                        accIdFk: req.body.accId,
                        useIdFk: token.useId,
                        busIdFk: req.body.busId,
                        month: req.body.month,
                        year: req.body.year,
                        createdAt: moment(new Date()).format('YYYY-MM-DD'),
                        updateAt: moment(new Date()).format('YYYY-MM-DD')
                    });
                    dataToSave.save().then(function () {
                        return res.status(200).json({ message: "Se ha creado con exito" });
                    })
            })
            
        }
    })

}

module.exports = {
    viewAsignCatalog,
    getCatalog,
    listHistory,
    saveAsignCatalog,
    getCatalogs,
}