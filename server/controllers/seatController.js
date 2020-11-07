'use strict'

const accountingAccountModel = require('../models/accountingAccount')
const businessModel = require('../models/business')
const moneyTypesModel = require('../models/moneyTypes')
const documentTypesModel = require('../models/documentTypes')
const accountingAccountSeatModel = require('../models/accountingAccountSeat')
const accountingAccountSeatDetailModel = require('../models/accountingAccountSeatDetail')
const usersController = require('../controllers/usersController')
const moment = require('moment');
const sequelize = require('sequelize');
const jwt = require('jwt-simple');
const {parseISO} = require('date-fns');


function viewSeat(req, res){
  if(usersController.controlAccess(req.headers.cookie)){
    res.redirect('/contab/sign');
  }
  else{
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    businessModel.findAll({where:{'useIdFK': token.useId}}).then( business => {
        moneyTypesModel.findAll({where:{'useIdFK': token.useId}}).then( moneyTypess => {
            return res.render('viewSeat' ,{
                active : 4,
                userData: token,
                titlePage : 'Registro Asientos',
                processes : token.processes,
                menu : token.menu,  
                business: business,
                moneyTypess: moneyTypess
            })
        })
    })   
  }   
}

function getListSeats(req,res){
  let data = req.headers.cookie.split("=");
  const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
  let orderBy =[['createdAt','DESC']]  

  accountingAccountSeatDetailModel.hasOne(documentTypesModel,{foreignKey:'docId',sourceKey: 'docIdFk'});
  accountingAccountSeatDetailModel.hasOne(moneyTypesModel,{foreignKey:'monId',sourceKey: 'monIdFk'});
  accountingAccountSeatDetailModel.hasOne(accountingAccountModel,{foreignKey:'aacId',sourceKey: 'aacIdFk'});

  if(typeof(req.query.search) !== "undefined" && req.query.search !== ''){  
    let likeData =  [{'docCode': {[sequelize.Op.like]: `%${req.query.search}%`}},{'docName': {[sequelize.Op.like]: `%${req.query.search}%`}},{'$accountingCatalog.accName$': {[sequelize.Op.like]: `%${req.query.search}%`}}]  
    
    accountingAccountSeatDetailModel.findAll({where:{'aasIdFk': req.params.id ,
        [sequelize.Op.or]: likeData
      },
      include:[{  
            model: documentTypesModel,
            required: true,
        },{  
            model: moneyTypesModel,
            required: true,
        },{  
          model: accountingAccountModel,
          required: true,
      }] 
      , order: orderBy    
    }).then( accountingAccountSeatDetailList =>{        
      return res.status(200).json({rows: accountingAccountSeatDetailList, total:accountingAccountSeatDetailList.length});
  })
  }
  else{
    accountingAccountSeatDetailModel.findAll({where:{'aasIdFk': req.params.id },
        include: [{  
            model: documentTypesModel,
            required: true,
        },{  
            model: moneyTypesModel,
            required: true,
        },{  
          model: accountingAccountModel,
          required: true,
      }] 
        , order: orderBy    
    }).then( accountingAccountSeatDetailList =>{        
        return res.status(200).json({rows: accountingAccountSeatDetailList, total:accountingAccountSeatDetailList.length});
    })
  }
}

function saveHeatSeat(req, res){
  let data = req.headers.cookie.split("=");
  const token =  jwt.decode(data[1],'b33dd00.@','HS512') 

  let aasIsPreSeat = 0
  if(req.body.aasPreSeat !=''){
    req.body.aasNumberSeat = req.body.aasPreSeat
    aasIsPreSeat = 1
  }
  const tempDate =req.body.aasDateSeat.split('/')
  const dateSeatToServer = new Date(`${tempDate[2]}/${tempDate[1]}/${tempDate[0]}`)

  if(req.body.aasId > 0){    
    accountingAccountSeatModel.update({            
        accIdFk: req.body.accId,
        busIdFk: req.body.busId,        
        useIdFk: token.useId,
        aasMonth: req.body.aasMonth,
        aasYear: req.body.aasYear,
        aasDateSeat: dateSeatToServer,
        aasNumberSeat: req.body.aasNumberSeat,
        aasIsPreSeat: aasIsPreSeat,
        aasNameSeat: req.body.aasNameSeat,
        updateAt: moment(new Date()).format('YYYY-MM-DD')
    }, {where : {'aasId' : req.body.aasId}}).then(function () {
      return  res.status(200).json({ message: "Se ha actualizado con exito" });
    })
  }
  else{  
    const dataToSave = new accountingAccountSeatModel({
        accIdFk: req.body.accId,
        busIdFk: req.body.busId,
        useIdFk: token.useId,
        aasMonth: req.body.aasMonth,
        aasdStatus: 0,
        aasYear: req.body.aasYear,
        aasDateSeat: dateSeatToServer,
        aasNumberSeat: req.body.aasNumberSeat,
        aasIsPreSeat: aasIsPreSeat,
        aasNameSeat: req.body.aasNameSeat,
        aasOrigin: 1,
        aasdDebitTotal: 0,
        aasdCreditTotal: 0,
        createdAt: moment(new Date()).format('YYYY-MM-DD'),
        updateAt: moment(new Date()).format('YYYY-MM-DD')
    });
    return dataToSave.save().then(function (accountingAS) {
        res.status(200).json({ message: "Se ha creado con exito" , aasId : accountingAS.aasId});
    })
  }
}

function saveDetailSeat(req, res){
  let data = req.headers.cookie.split("=");
  const token =  jwt.decode(data[1],'b33dd00.@','HS512') 

  if(req.body.aasdId > 0){    
    accountingAccountSeatDetailModel.update({     
      aasIdFk: req.params.id,       
      aacIdFk: req.body.aacId,
      docIdFk: req.body.docId,
      monIdFk: req.body.monId,
      aasdNumberDoc: req.body.aasdNumberDoc,
      aasdDescription: req.body.aasdDescription,
      aasdChangeValue: req.body.aasdChangeValue,
      aasdDebit: req.body.aasdDebit,
      aasdCredit: req.body.aasdCredit,
      updateAt: moment(new Date()).format('YYYY-MM-DD')
    }, {where : {'aasdId' : req.body.aasdId}}).then(function () {
      return  res.status(200).json({ message: "Se ha actualizado con exito" });
    })
  }
  else{   
    console.log(req.body.monId) 
    const dataToSave = new accountingAccountSeatDetailModel({
      aasIdFk: req.params.id,
      docIdFk: req.body.docId,
      aacIdFk: req.body.aacId,
      monIdFk: req.body.monId,
      aasdNumberDoc: req.body.aasdNumberDoc,
      aasdDescription: req.body.aasdDescription,
      aasdChangeValue: req.body.aasdChangeValue,
      aasdDebit: req.body.aasdDebit, 
      aasdCredit: req.body.aasdCredit,
      createdAt: moment(new Date()).format('YYYY-MM-DD'),
      updateAt: moment(new Date()).format('YYYY-MM-DD')
    });
    console.log(dataToSave)
    return dataToSave.save().then(function (accountingASD) {
        res.status(200).json({ message: "Se ha creado con exito" , aasdId : accountingASD.aasdId});
    })
  }
}



module.exports = {
    viewSeat,
    getListSeats,
    saveHeatSeat,
    saveDetailSeat,
}