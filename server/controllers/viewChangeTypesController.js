'use strict'

const changeTypesModel = require('../models/changeTypes')
const businessModel = require('../models/business')
const moneyTypesModel = require('../models/moneyTypes')
const usersController = require('../controllers/usersController')
const moment = require('moment');
const sequelize = require('sequelize');
const jwt = require('jwt-simple');

function viewChangeTypes(req, res){
  if(usersController.controlAccess(req.headers.cookie)){
    res.redirect('/contab/sign');
  }
  else{
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    businessModel.findAll({where:{'useIdFK': token.useId}}).then( business => {
        moneyTypesModel.findAll({where:{'useIdFK': token.useId}}).then( moneyTypess => {
            return res.render('viewChangeTypes' ,{
                active : 1,
                userData: token,
                titlePage : 'Tipos de Cambio',
                processes : token.processes,
                menu : token.menu,  
                business: business,
                moneyTypess: moneyTypess
            })
        })
    })   
  }   
}

function getListChangeTypes(req,res){
  let data = req.headers.cookie.split("=");
  const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
  let orderBy =[['createdAt','DESC']]  

  changeTypesModel.hasOne(businessModel,{foreignKey:'busId',sourceKey: 'busIdFk'});
  changeTypesModel.hasOne(moneyTypesModel,{foreignKey:'monId',sourceKey: 'monId'});

  if(typeof(req.query.search) !== "undefined" && req.query.search !== ''){  
    let likeData =  [{'docCode': {[sequelize.Op.like]: `%${req.query.search}%`}},{'docName': {[sequelize.Op.like]: `%${req.query.search}%`}},{'$accountingCatalog.accName$': {[sequelize.Op.like]: `%${req.query.search}%`}}]  
    
    changeTypesModel.findAll({where:{'useIdFK': token.useId,
        [sequelize.Op.or]: likeData
        },
        include: [{  
            model: businessModel,
            required: true,
        },{  
            model: moneyTypesModel,
            required: true,
        }]  
        , order: orderBy    
    }).then( changeTypesModelCatalog =>{        
        return res.status(200).json({rows: changeTypesModelCatalog, total:changeTypesModelCatalog.length});
    })
  }
  else{
    changeTypesModel.findAll({where:{'useIdFK': token.useId },
        include: [{  
            model: businessModel,
            required: true,
        },{  
            model: moneyTypesModel,
            required: true,
        }] 
        , order: orderBy    
    }).then( changeTypesModelCatalog =>{        
        return res.status(200).json({rows: changeTypesModelCatalog, total:changeTypesModelCatalog.length});
    })
  }
}

function saveChangeTypes(req, res){
  let data = req.headers.cookie.split("=");
  const token =  jwt.decode(data[1],'b33dd00.@','HS512') 

  if(req.body.chaId > 0){
    changeTypesModel.update({            
        useIdFk: token.useId,        
        chaSaleValue: req.body.chaSaleValue.replace(',','.'),
        chaPurchaseValue: req.body.chaPurchaseValue.replace(',','.'),
        chaSaleValuationValue: req.body.chaSaleValuationValue.replace(',','.'),
        chaPurchaseValuationValue: req.body.chaPurchaseValuationValue.replace(',','.'),
        updateAt: moment(new Date()).format('YYYY-MM-DD')
    }, {where : {'chaId' :req.body.chaId}}).then(function () {
      return  res.status(200).json({ message: "Se ha actualizado con exito" });
    })
  }
  else{
    const dataToSave = new changeTypesModel({
        monId: req.body.monId,
        useIdFk: token.useId,
        busIdFk: req.body.busId,
        chaSaleValue: req.body.chaSaleValue.replace(',','.'),
        chaPurchaseValue: req.body.chaPurchaseValue.replace(',','.'),
        chaSaleValuationValue: req.body.chaSaleValuationValue.replace(',','.'),
        chaPurchaseValuationValue: req.body.chaPurchaseValuationValue.replace(',','.'),
        createdAt: moment(new Date()).format('YYYY-MM-DD'),
        updateAt: moment(new Date()).format('YYYY-MM-DD')
    });

    return dataToSave.save().then(function () {
        res.status(200).json({ message: "Se ha creado con exito" });
    })
  }
}

module.exports = {
    viewChangeTypes,
    getListChangeTypes,
    saveChangeTypes,
}