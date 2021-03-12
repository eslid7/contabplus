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
  let orderBy =[['updatedAt','DESC']]  

  changeTypesModel.hasOne(businessModel,{foreignKey:'busId',sourceKey: 'busIdFk'});
  changeTypesModel.hasOne(moneyTypesModel,{foreignKey:'monId',sourceKey: 'monId'});

  if(typeof(req.query.search) !== "undefined" && req.query.search !== ''){  
    let likeData =  [{'$moneyType.monName$': {[sequelize.Op.like]: `%${req.query.search}%`}},{'chaSaleValue': {[sequelize.Op.like]: `%${req.query.search}%`}},{'$business.busName$': {[sequelize.Op.like]: `%${req.query.search}%`}}]  
    
    changeTypesModel.findAll({where:{ 'busIdFk': req.params.busId , 'useIdFK': token.useId,
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
    changeTypesModel.findAll({where:{'busIdFk': req.params.busId,'useIdFK': token.useId },
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

  // debo validar que no exista uno para ese dia
  const tempDate =req.body.chaDate.split('/')
  const dateToServer = new Date(`${tempDate[2]}/${tempDate[1]}/${tempDate[0]}`)
  
  if(req.body.chaId > 0){
    changeTypesModel.update({            
        useIdFk: token.useId,  
        chaDate : dateToServer,      
        chaSaleValue: req.body.chaSaleValue.replace(/,/g,''),
        chaPurchaseValue: req.body.chaPurchaseValue.replace(/,/g,''),
        chaSaleValuationValue: req.body.chaSaleValuationValue.replace(/,/g,''),
        chaPurchaseValuationValue: req.body.chaPurchaseValuationValue.replace(/,/g,''),
        updatedAt: moment(new Date()).format('YYYY-MM-DD')
    }, {where : {'chaId' :req.body.chaId}}).then(function () {
      return  res.status(200).json({ message: "Se ha actualizado con exito" });
    })
  }
  else{
    const dataToSave = new changeTypesModel({
        monId: req.body.monId,
        useIdFk: token.useId,
        busIdFk: req.body.busId,
        chaDate : dateToServer,
        chaSaleValue: req.body.chaSaleValue.replace(/,/g,''),
        chaPurchaseValue: req.body.chaPurchaseValue.replace(/,/g,''),
        chaSaleValuationValue: req.body.chaSaleValuationValue.replace(/,/g,''),
        chaPurchaseValuationValue: req.body.chaPurchaseValuationValue.replace(/,/g,''),
        createdAt: moment(new Date()).format('YYYY-MM-DD'),
        updatedAt: moment(new Date()).format('YYYY-MM-DD')
    });

    return dataToSave.save().then(function () {
        res.status(200).json({ message: "Se ha creado con exito" });
    })
  }
}

function getTCBussines(req, res){
  businessModel.findOne({where:{'busId': req.params.busId}}).then( business => {
    if(business.busMoney ==req.params.monId){
      return res.status(200).json({tcAmount: 0});
    } else {
      let orderBy =[['updatedAt','DESC']]
      const tempDate =req.body.aasDateSeat.split('/')
      const dateToServer =`${tempDate[2]}-${tempDate[1]}-${tempDate[0]}`
      changeTypesModel.findAll({where:{'monId' : req.params.monId, 'chaDate' : dateToServer }, order :orderBy}).then( tcForDay =>{        
        if(tcForDay[0]){
          return res.status(200).json({tcAmount: tcForDay[0].dataValues.chaSaleValue });
        } else {
          //buscar otras fechas que sean menores
          changeTypesModel.findAll({where:{'monId' : req.params.monId, 'chaDate' : {[sequelize.Op.lt]: dateToServer}  }, order :orderBy}).then( tcForOtherDay =>{
            if(tcForOtherDay[0]){
              return res.status(200).json({tcAmount: tcForOtherDay[0].dataValues.chaSaleValue });  
            } else {
              return res.status(400).json({ message: 'Para esta moneda no hay un tipo de cambio disponible.' });   
            }
          })
        }
        
      })
    }
  })
}

module.exports = {
    viewChangeTypes,
    getListChangeTypes,
    saveChangeTypes,
    getTCBussines,
}