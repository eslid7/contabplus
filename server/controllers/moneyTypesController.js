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
  if(typeof(req.query.sort) !== "undefined" && req.query.sort !== 'busName'){
      orderBy =[[`business`,`busName`,`${req.query.order}`]]
  }
  moneyTypesModel.hasOne(businessModel,{foreignKey:'busId',sourceKey: 'busIdFk'});
  if(typeof(req.query.search) !== "undefined" && req.query.search !== ''){  
    let likeData =  [{'monCode': {[sequelize.Op.like]: `%${req.query.search}%`}},{'monName': {[sequelize.Op.like]: `%${req.query.search}%`}},{'$business.busName$': {[sequelize.Op.like]: `%${req.query.search}%`}}]  
    moneyTypesModel.findAll({where:{'useIdFK': token.useId,
        [sequelize.Op.or]: likeData
        },
        include: [{  
            model: businessModel,
            required: true,
        }] 
        , order: orderBy    
    }).then( moneyTypesCatalog =>{        
        return res.status(200).json({rows: moneyTypesCatalog, total:moneyTypesCatalog.length});
    })
  }
  else{
    moneyTypesModel.findAll({where:{'useIdFK': token.useId },
        include: [{  
            model: businessModel,
            required: true,
        }] 
        , order: orderBy    
    }).then( moneyTypesCatalog =>{        
        return res.status(200).json({rows: moneyTypesCatalog, total:moneyTypesCatalog.length});
    })
  }
}

function saveMoneyTypes(req, res){
  let data = req.headers.cookie.split("=");
  const token =  jwt.decode(data[1],'b33dd00.@','HS512') 

  if(req.body.docId > 0){
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
        busIdFk: req.body.busId,
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
module.exports = {
    viewMoneyTypes,
    getListMoneyTypes,
    saveMoneyTypes,
}