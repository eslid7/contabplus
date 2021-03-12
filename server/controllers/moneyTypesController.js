'use strict'

const moneyTypesModel = require('../models/moneyTypes')
const businessModel = require('../models/business')
const usersController = require('../controllers/usersController')
const moment = require('moment');
const sequelize = require('sequelize');
const jwt = require('jwt-simple');

function viewMoneyTypes(req, res){
  if(usersController.controlAccess(req.headers.cookie)){
    res.redirect('/contab/sign');
  }
  else{
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    businessModel.findAll({where:{'useIdFK': token.useId}}).then( business => {
      return res.render('viewMoneyTypes' ,{
        active : 1,
        userData: token,
        titlePage : 'Monedas',
        processes : token.processes,
        menu : token.menu,  
        business: business
      })
    })   
  }   
}

function getListMoneyTypes(req,res){
  let data = req.headers.cookie.split("=");
  const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
  let orderBy =[['monCode','ASC']]  
  if(typeof(req.query.search) !== "undefined" && req.query.search !== ''){  
    let likeData =  [{'monCode': {[sequelize.Op.like]: `%${req.query.search}%`}},{'monName': {[sequelize.Op.like]: `%${req.query.search}%`}}]  
    moneyTypesModel.findAll({where:{
        [sequelize.Op.or]: likeData
        }, order: orderBy    
    }).then( moneyTypesCatalog =>{        
        return res.status(200).json({rows: moneyTypesCatalog, total:moneyTypesCatalog.length});
    })
  }
  else{
    moneyTypesModel.findAll({order: orderBy    
    }).then( moneyTypesCatalog =>{        
        return res.status(200).json({rows: moneyTypesCatalog, total:moneyTypesCatalog.length});
    })
  }
}

function saveMoneyTypes(req, res){
  let data = req.headers.cookie.split("=");
  const token =  jwt.decode(data[1],'b33dd00.@','HS512') 

  if(req.body.monId > 0){
    moneyTypesModel.update({            
        useIdFk: token.useId,        
        monCode: req.body.monCode,
        monName: req.body.monName.toUpperCase(),
        updateAt: moment(new Date()).format('YYYY-MM-DD')
    }, {where : {'monId' :req.body.monId}}).then(function () {
      return  res.status(200).json({ message: "Se ha actualizado con exito" });
    })
  }
  else{
    const dataToSave = new moneyTypesModel({
        useIdFk: token.useId,
        monCode: req.body.monCode,
        monName: req.body.monName.toUpperCase(),
        createdAt: moment(new Date()).format('YYYY-MM-DD'),
        updateAt: moment(new Date()).format('YYYY-MM-DD')
    });

    return dataToSave.save().then(function () {
        res.status(200).json({ message: "Se ha creado con exito" });
    })
  }
}


function getListMoneyTypesByBussines(req, res){
    moneyTypesModel.findAll().then( moneyTypesCatalog =>{        
      return res.status(200).json({rows: moneyTypesCatalog, total:moneyTypesCatalog.length});
    })
}

function getListMoneyTypesByBussinesForTC(req, res){
  businessModel.findOne({where:{'busId': req.params.busId}}).then( business => {
    moneyTypesModel.findAll({where:{'monId' : {[sequelize.Op.not]: business.busMoney}}}).then( moneyTypesCatalog =>{        
      return res.status(200).json({rows: moneyTypesCatalog, total:moneyTypesCatalog.length});
    })
  })
}

module.exports = {
    viewMoneyTypes,
    getListMoneyTypes,
    saveMoneyTypes,
    getListMoneyTypesByBussines,
    getListMoneyTypesByBussinesForTC
}