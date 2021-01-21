'use strict'

const accountingAccountModel = require('../models/accountingAccount')
const businessModel = require('../models/business')
const moneyTypesModel = require('../models/moneyTypes')
const documentTypesModel = require('../models/documentTypes')
const accountingAccountSeatModel = require('../models/accountingAccountSeat')
const accountingAccountSeatDetailModel = require('../models/accountingAccountSeatDetail')
const businessAccountingCModel = require('../models/businessAccountingC')
const usersController = require('../controllers/usersController')
const moment = require('moment');
const sequelize = require('sequelize');
const sequelizeConnect = require('../config/env/connection')
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

async function saveHeatSeat(req, res){
  let data = req.headers.cookie.split("=");
  
  if(usersController.controlAccess(req.headers.cookie)){
    res.redirect('/contab/sign');
  }
  else{
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    //validar que no exista ya un asiento
    const seatData = await accountingAccountSeatModel.findOne({where: { 'aasMonth': req.body.aasMonth, 'aasYear': req.body.aasYear, 'busIdFk': req.body.busId, 'aasNumberSeat': req.body.aasNumberSeat}})
    console.log(seatData);
    if(seatData !==undefined && seatData != null && req.body.aasId != seatData.aasId){
      accountingAccountSeatDetailModel.findAll({
        where : {'aasIdFk' : seatData.aasId },
        attributes: ['aasIdFk', [sequelize.fn('sum', sequelize.col('aasdDebit')), 'totalAasdDebit'], [sequelize.fn('sum', sequelize.col('aasdCredit')), 'totalAasdCredit']],
        group : ['aasIdFk']
      }).then(function(result){
        return res.status(400).json({ message: "El número de documento ya existe en el periodo seleccionado.", seatData: seatData, result :result});
      })    
    }
    else{
      let aasIsPreSeat = 0
      if(req.body.aasPreSeat !='' && req.body.aasPreSeat){
        req.body.aasNumberSeat = req.body.aasPreSeat
        aasIsPreSeat = 1
      }
      const tempDate =req.body.aasDateSeat.split('/')
      const dateSeatToServer = new Date(`${tempDate[2]}/${tempDate[1]}/${tempDate[0]}`)

      if(req.body.aasId > 0){    
        accountingAccountSeatModel.update({  
            aasMonth: req.body.aasMonth,
            aasYear: req.body.aasYear,          
            accIdFk: req.body.accId,
            busIdFk: req.body.busId,        
            useIdFk: token.useId,        
            aasDateSeat: dateSeatToServer,
            aasNumberSeat: req.body.aasNumberSeat,
            aasIsPreSeat: aasIsPreSeat,
            aasNameSeat: req.body.aasNameSeat,
            updateAt: moment(new Date()).format('YYYY-MM-DD')
        }, {where : {'aasId' : req.body.aasId}}).then(function () {
          return  res.status(200).json({ message: "Se ha actualizado con exito", aasId: req.body.aasId });
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
      aasdChangeValue: req.body.aasdChangeValue.replace(/,/g,''),
      aasdDebit: req.body.aasdDebit.replace(/,/g,''), 
      aasdCredit: req.body.aasdCredit.replace(/,/g,''),
      updateAt: moment(new Date()).format('YYYY-MM-DD')
    }, {where : {'aasdId' : req.body.aasdId}}).then(function () {

      accountingAccountSeatDetailModel.findAll({
        where : {'aasIdFk' : req.params.id },
        attributes: ['aasIdFk', [sequelize.fn('sum', sequelize.col('aasdDebit')), 'totalAasdDebit'], [sequelize.fn('sum', sequelize.col('aasdCredit')), 'totalAasdCredit']],
        group : ['aasIdFk']
      }).then(function(result){
        return  res.status(200).json({ message: "Se ha actualizado con exito", result :result });
      })  
    })
  }
  else{   

    const dataToSave = new accountingAccountSeatDetailModel({
      aasIdFk: req.params.id,
      docIdFk: req.body.docId,
      aacIdFk: req.body.aacId,
      monIdFk: req.body.monId,
      aasdNumberDoc: req.body.aasdNumberDoc,
      aasdDescription: req.body.aasdDescription,
      aasdChangeValue: req.body.aasdChangeValue.replace(/,/g,''),
      aasdDebit: req.body.aasdDebit.replace(/,/g,''), 
      aasdCredit: req.body.aasdCredit.replace(/,/g,''),
      createdAt: moment(new Date()).format('YYYY-MM-DD'),
      updateAt: moment(new Date()).format('YYYY-MM-DD')
    });

    return dataToSave.save().then(function (accountingASD) {
      accountingAccountSeatDetailModel.findAll({
        where : {'aasIdFk' : req.params.id },
        attributes: ['aasIdFk', [sequelize.fn('sum', sequelize.col('aasdDebit')), 'totalAasdDebit'], [sequelize.fn('sum', sequelize.col('aasdCredit')), 'totalAasdCredit']],
        group : ['aasIdFk']
      }).then(function(result){
        return  res.status(200).json({ message: "Se ha actualizado con exito", result :result });
      })  
    })
  }
}

function deleteSeatDetail(req, res){
  accountingAccountSeatDetailModel.destroy({where: {'aasdId': req.params.id}}).then(function(){
    accountingAccountSeatDetailModel.findAll({
      where : {'aasIdFk' : req.query.aasId },
      attributes: ['aasIdFk', [sequelize.fn('sum', sequelize.col('aasdDebit')), 'totalAasdDebit'], [sequelize.fn('sum', sequelize.col('aasdCredit')), 'totalAasdCredit']],
      group : ['aasIdFk']
    }).then(function(result){
      return  res.status(200).json({ message: "Se ha actualizado con exito", result :result });
    })
  })
}

async function deleteSeat(req, res){
  // eliminar el detalle y luego el enabezado
  // recordarme reversarlo si ya esta aplicado
  const dataSeat = await accountingAccountSeatModel.findOne({where: {'aasId': req.params.id}})
  if (dataSeat.aasdStatus == 1){
    reverSeat(req.params.id)
  }
  accountingAccountSeatDetailModel.destroy({where: {'aasIdFk': req.params.id}}).then(function(){
    accountingAccountSeatModel.destroy({where: {'aasId': req.params.id}}).then(function(){
      return  res.status(200).json({ message: "Se ha eliminado con exito"});
    })
  })
}

async function applySeat(req, res){
  // si esta en cero no se puede aplicar y debe estar balanceado
  // si esta en estado 1 y se modifico tomar en cuenta el recalculo y afectacion
  accountingAccountSeatDetailModel.hasOne(accountingAccountModel,{foreignKey:'aacId',sourceKey: 'aacIdFk'});
  
  const totals = await accountingAccountSeatDetailModel.findAll({
    where : {'aasIdFk' : req.params.id },
    attributes: ['aasIdFk', [sequelize.fn('sum', sequelize.col('aasdDebit')), 'totalAasdDebit'], [sequelize.fn('sum', sequelize.col('aasdCredit')), 'totalAasdCredit']],
    group : ['aasIdFk']
  })

  if(totals[0] === undefined || totals[0].dataValues.totalAasdDebit != totals[0].dataValues.totalAasdCredit || totals[0].dataValues.totalAasdDebit <= 0  || totals[0].dataValues.totalAasdCredit <= 0 ){
    return  res.status(400).json({ message: "El asiento no esta balanceado y debe ser distinto de cero"});
  }
  else{
    const transaction = await sequelizeConnect.transaction()
    try{
      const seatData = await accountingAccountSeatModel.findOne({where: { 'aasId': req.params.id }})
      //nuevo desde cero transacciones
      let errors =''
      console.log(seatData.aasdStatus)
      if(seatData.aasdStatus ==0){
        const accountingAccountSeatDetail = await accountingAccountSeatDetailModel.findAll({ where : {'aasIdFk' : req.params.id },
          include:[{  
              model: accountingAccountModel,
              required: true,
          }]
        })
        for(let i=0; i< accountingAccountSeatDetail.length; i++){
          // queda pendiente si trabaje en un mes cerrado.... recalcular los cierres
          //averiguo si hay un balance inical
          const balance = await businessAccountingCModel.findOne({where:{aacIdFk :accountingAccountSeatDetail[i].aacIdFk,busIdFk :seatData.busIdFk}})
            if(balance === null){
              const newBalance = accountingAccountSeatDetail[i].aasdCredit - accountingAccountSeatDetail[i].aasdDebit
              const dataToSave = new businessAccountingCModel({            
                balance: newBalance,
                aacIdFk :accountingAccountSeatDetail[i].aacIdFk,
                busIdFk : seatData.busIdFk,
                createdAt: moment(new Date()).format('YYYY-MM-DD'),
                updateAt: moment(new Date()).format('YYYY-MM-DD')
              })
              const saveData = await dataToSave.save()
            }
            else{
              //actualizo el saldo
              const newBalance = balance.balance + accountingAccountSeatDetail[i].aasdCredit - accountingAccountSeatDetail[i].aasdDebit
              businessAccountingCModel.update({            
                  balance: newBalance,
                  updateAt: moment(new Date()).format('YYYY-MM-DD')
              }, { where:{ aacIdFk :accountingAccountSeatDetail[i].aacIdFk,busIdFk :seatData.busIdFk}})
            }              
        }
        //actualizo el estado y los totales
        accountingAccountSeatModel.update({            
          aasdStatus: 1,
          aasdDebitTotal :totals[0].dataValues.totalAasdDebit,
          aasdCreditTotal : totals[0].dataValues.totalAasdCredit,
          updateAt: moment(new Date()).format('YYYY-MM-DD')
        }, { where:{ 'aasId': req.params.id}})
        
        // if(errors!=''){
        //   await transaction.rollback()
        //   return  res.status(400).json({ message: errors});
        // }
        // else{
          await transaction.commit()
          return  res.status(200).json({ message: "El asiento se aplico correctamente"});
        // } 
    
      } else if(seatData.aasdStatus ==1){
        return  res.status(400).json({ message: "El asiento tiene un estado en el cual no se puede modificar."});
      }
    } catch (error) {
      await transaction.rollback()
      console.log(error)
      return  res.status(400).json({ message: error.message});
    }  
  }
}

async function reverSeat(idSeat){
  const seatData = await accountingAccountSeatModel.findOne({where: { 'aasId': idSeat}})
  const accountingAccountSeatDetail = await accountingAccountSeatDetailModel.findAll({ where : {'aasIdFk' : idSeat }})
  for(let i=0; i< accountingAccountSeatDetail.length; i++){
    console.log(accountingAccountSeatDetail[i].aacIdFk)
    //averiguo si hay un balance inical
    const balance = await businessAccountingCModel.findOne({where:{aacIdFk :accountingAccountSeatDetail[i].aacIdFk,busIdFk : seatData.busIdFk}})
      if(balance === null){
        errors += "La cuenta "+accountingAccountSeatDetail[i].accountingAccount.aacCode+" no tiene un saldo inical.\n"
      }
      else{
        //actualizo el saldo
        const newBalance = balance.balance - accountingAccountSeatDetail[i].aasdCredit + accountingAccountSeatDetail[i].aasdDebit
        businessAccountingCModel.update({            
            balance: newBalance,
            updateAt: moment(new Date()).format('YYYY-MM-DD')
        }, { where:{ aacIdFk :accountingAccountSeatDetail[i].aacIdFk,busIdFk :seatData.busIdFk}})
      }           
  }
}

async function reverSeatService(req, res){
  accountingAccountSeatModel.update({            
    aasdStatus: 0,
    updateAt: moment(new Date()).format('YYYY-MM-DD')
  }, { where:{ 'aasId': req.params.id}})
  reverSeat(req.params.id)
  return  res.status(200).json({ message: "El asiento se reverso correctamente"});
}

module.exports = {
    viewSeat,
    getListSeats,
    saveHeatSeat,
    saveDetailSeat,
    deleteSeatDetail,
    deleteSeat,
    applySeat,
    reverSeat,
    reverSeatService
}