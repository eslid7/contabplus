'use strict'

const accountingAccountModel = require('../models/accountingAccount')
const businessModel = require('../models/business')
const moneyTypesModel = require('../models/moneyTypes')
const documentTypesModel = require('../models/documentTypes')
const accountingAccountSeatModel = require('../models/accountingAccountSeat')
const accountingAccountSeatDetailModel = require('../models/accountingAccountSeatDetail')
const businessAccountingCModel = require('../models/businessAccountingC')
const balanceSheetModel = require('../models/balanceSheet')
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
                active : 3,
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
  accountingAccountSeatDetailModel.hasOne(accountingAccountSeatModel,{foreignKey:'aasId',sourceKey: 'aasIdFk'});
  let orderBy =[['bshYear','DESC'],['bshMonth','ASC']]
  
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
          },{
            model: accountingAccountSeatModel,
            required: true,
          }
        ]
        })
        let bshPreviousBalance = 0
        let bshFinalBalance = 0
        let credits = 0
        let debits = 0
        let toMonth = 0
        let month = 0 
        let year = 0
        for(let i=0; i< accountingAccountSeatDetail.length; i++){
          // queda pendiente si trabaje en un mes cerrado.... recalcular los cierres
          //busco si ya existe algo previo
          const balanceExist = await balanceSheetModel.findOne({where: {'busIdFk': seatData.busIdFk,'bshMonth': accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasMonth,'bshYear':accountingAccountSeatDetail[0].dataValues.accountingAccountSeat.aasYear, 'aacIdFk':accountingAccountSeatDetail[i].aacIdFk }})
          if(balanceExist === null){
            //sino existe debo buscar el anterior que existe orde by desc
            const balancePreviusExist = await balanceSheetModel.findAll({where: {'busIdFk': seatData.busIdFk,'aacIdFk':accountingAccountSeatDetail[i].dataValues.aacIdFk },order: orderBy})
            if(balancePreviusExist.length > 0){
              let maxLenth = balancePreviusExist.length - 1
                  // solo tengo que calcular el mes 6 - 3
                  let negative = false;
                  if(balancePreviusExist[maxLenth].bshYear == accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasYear){
                    toMonth = accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasMonth - balancePreviusExist[maxLenth].bshMonth
                    month = balancePreviusExist[maxLenth].bshMonth +1
                    year = balancePreviusExist[maxLenth].bshYear
                    if(toMonth < 0){
                      toMonth = accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasMonth - balancePreviusExist[0].bshMonth
                      if(toMonth < 0){
                        toMonth = toMonth * -1;
                        negative =true;
                        month =accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasMonth
                      }
                    }                                      
                  } else if (balancePreviusExist[maxLenth].bshYear < accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasYear){
                    if(balancePreviusExist[maxLenth].bshMonth != 12){
                      month = balancePreviusExist[maxLenth].bshMonth + 1
                      year = balancePreviusExist[maxLenth].bshYear
                    } else {
                      month = 1
                      year = balancePreviusExist[maxLenth].bshYear +1
                    }                                        
                    toMonth = diffInMonths(new Date(accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasYear, accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasMonth, 1), new Date(balancePreviusExist[maxLenth].bshYear, balancePreviusExist[maxLenth].bshMonth, 1));
                  } else {
                    negative = true
                    month = accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasMonth
                    year = accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasYear
                    toMonth = diffInMonths(new Date(accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasYear, accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasMonth, 1), new Date(balancePreviusExist[0].bshYear, balancePreviusExist[0].bshMonth, 1));
                  }

                  for(let a=0; a<toMonth; a++ ){
                    // si es negativo lo algo al inicio                    
                    if(negative){
                      if(month ==  accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasMonth){
                        bshPreviousBalance =  0
                        bshFinalBalance = accountingAccountSeatDetail[i].dataValues.aasdCredit - accountingAccountSeatDetail[i].dataValues.aasdDebit                      
                        debits = accountingAccountSeatDetail[i].dataValues.aasdDebit
                        credits = accountingAccountSeatDetail[i].dataValues.aasdCredit
                      } else {
                        bshPreviousBalance = accountingAccountSeatDetail[i].dataValues.aasdCredit - accountingAccountSeatDetail[i].dataValues.aasdDebit
                        bshFinalBalance = accountingAccountSeatDetail[i].dataValues.aasdCredit - accountingAccountSeatDetail[i].dataValues.aasdDebit
                        credits = 0
                        debits = 0                        
                      }
                      
                      const dataToSave = new balanceSheetModel({
                          busIdFk: seatData.busIdFk,
                          aacIdFk: accountingAccountSeatDetail[i].dataValues.aacIdFk,
                          bshMonth: month,
                          bshYear: year,
                          bshPreviousBalance: bshPreviousBalance,
                          bshDebits: debits,
                          bshCredits: credits,
                          bshFinalBalance: bshFinalBalance,                     
                          createdAt: moment(new Date()).format('YYYY-MM-DD'),
                          updateAt: moment(new Date()).format('YYYY-MM-DD')
                      }) 
                      const saveData = await dataToSave.save()
                      // si es el final recalculo el resto de meses
                      if(month ==  accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasMonth){
                        let newBshFinalBalance =0;
                        for(let c=0; c< balancePreviusExist.length; c++){
                          if(c==0){
                            newBshFinalBalance = bshFinalBalance - balancePreviusExist[c].bshDebits +  balancePreviusExist[c].bshCredits
                            balanceSheetModel.update({    
                                bshPreviousBalance : bshFinalBalance,        
                                bshFinalBalance: newBshFinalBalance,     
                                updateAt: moment(new Date()).format('YYYY-MM-DD')
                            }, { where:{ bshId :balancePreviusExist[c].bshId}})
                          } else {
                            bshPreviousBalance = newBshFinalBalance
                            newBshFinalBalance = bshPreviousBalance - balancePreviusExist[c].bshDebits +  balancePreviusExist[c].bshCredits
                            balanceSheetModel.update({    
                                bshPreviousBalance : bshPreviousBalance,        
                                bshFinalBalance: newBshFinalBalance,     
                                updateAt: moment(new Date()).format('YYYY-MM-DD')
                            }, { where:{ bshId :balancePreviusExist[c].bshId}})
                          }
                        }
                      }

                    } else{

                      if(month ==  accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasMonth){
                        bshPreviousBalance =  balancePreviusExist[maxLenth].bshFinalBalance
                        bshFinalBalance =  balancePreviusExist[maxLenth].bshFinalBalance - accountingAccountSeatDetail[i].aasdDebit + accountingAccountSeatDetail[i].aasdCredit                       
                        credits = accountingAccountSeatDetail[i].aasdCredit
                        debits = accountingAccountSeatDetail[i].aasdDebit
                      } else {
                        bshPreviousBalance = balancePreviusExist[maxLenth].bshFinalBalance
                        bshFinalBalance = balancePreviusExist[maxLenth].bshFinalBalance
                        credits = 0
                        debits = 0                        
                      }
                      
                      const dataToSave = new balanceSheetModel({
                          busIdFk: seatData.busIdFk,
                          aacIdFk: accountingAccountSeatDetail[i].aacIdFk,
                          bshMonth: month,
                          bshYear: year,
                          bshPreviousBalance: bshPreviousBalance,
                          bshDebits: debits,
                          bshCredits: credits,
                          bshFinalBalance: bshFinalBalance,                     
                          createdAt: moment(new Date()).format('YYYY-MM-DD'),
                          updateAt: moment(new Date()).format('YYYY-MM-DD')
                      })
                      const saveData = await dataToSave.save()                                                                 
                    }
                    if(month== 12){
                      month = 1
                      year = year +1
                    } else{
                      month = month + 1
                    }
                  } 
            } else{
              // guardo es el inicial
              bshFinalBalance = accountingAccountSeatDetail[i].aasdCredit - accountingAccountSeatDetail[i].aasdDebit                       
              const dataToSave = new balanceSheetModel({
                  busIdFk: seatData.busIdFk,
                  aacIdFk: accountingAccountSeatDetail[i].aacIdFk,
                  bshMonth: accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasMonth,
                  bshYear: accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasYear,
                  bshPreviousBalance: 0,
                  bshDebits: accountingAccountSeatDetail[i].aasdDebit,
                  bshCredits: accountingAccountSeatDetail[i].aasdCredit,
                  bshFinalBalance: bshFinalBalance,                     
                  createdAt: moment(new Date()).format('YYYY-MM-DD'),
                  updateAt: moment(new Date()).format('YYYY-MM-DD')
              }) 
              const saveData = await dataToSave.save()
            }

          } else {
            // update y recalcular todo a futuro
            credits = accountingAccountSeatDetail[i].aasdCredit +  balanceExist.bshCredits
            debits = accountingAccountSeatDetail[i].aasdDebit +  balanceExist.bshDebits 
            bshFinalBalance = balanceExist.bshPreviousBalance + credits - debits
             
            balanceSheetModel.update({            
                bshDebits: debits,
                bshCredits: credits,
                bshFinalBalance: bshFinalBalance,     
                updateAt: moment(new Date()).format('YYYY-MM-DD')
            }, { where:{ bshId :balanceExist.bshId}})
            let likeData =  [{'bshMonth': {[sequelize.Op.gt]: `${accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasMonth}`}},{'bshYear': {[sequelize.Op.gt]: `${accountingAccountSeatDetail[i].dataValues.accountingAccountSeat.aasYear}`}}]  
            const balanceFutureExist = await balanceSheetModel.findAll({where: {'busIdFk': seatData.busIdFk,'aacIdFk':accountingAccountSeatDetail[i].dataValues.aacIdFk , [sequelize.Op.or]: likeData },order: orderBy})
            
            let newBshFinalBalance =0;
            for(let c=0; c< balanceFutureExist.length; c++){
              if(c==0){
                newBshFinalBalance = bshFinalBalance - balanceFutureExist[c].bshDebits +  balanceFutureExist[c].bshCredits
                balanceSheetModel.update({    
                    bshPreviousBalance : bshFinalBalance,        
                    bshFinalBalance: newBshFinalBalance,     
                    updateAt: moment(new Date()).format('YYYY-MM-DD')
                }, { where:{ bshId :balanceFutureExist[c].bshId}})
              } else {
                bshPreviousBalance = newBshFinalBalance
                newBshFinalBalance = bshPreviousBalance - balanceFutureExist[c].bshDebits +  balanceFutureExist[c].bshCredits
                balanceSheetModel.update({    
                    bshPreviousBalance : bshPreviousBalance,        
                    bshFinalBalance: newBshFinalBalance,     
                    updateAt: moment(new Date()).format('YYYY-MM-DD')
                }, { where:{ bshId :balanceFutureExist[c].bshId}})
              }
            }
          }
          ////////////////////////////////////////////
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
  let orderBy =[['bshYear','DESC'],['bshMonth','ASC']]

  for(let i=0; i<accountingAccountSeatDetail.length; i++){
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
        //reversar historicos
        let likeData =  [{'bshMonth': {[sequelize.Op.gte]: `${seatData.aasMonth}`}},{'bshYear': {[sequelize.Op.gt]: `${seatData.aasYear}`}}]  
        const balanceFutureExist = await balanceSheetModel.findAll({where: {'busIdFk': seatData.busIdFk,'aacIdFk':accountingAccountSeatDetail[i].dataValues.aacIdFk , [sequelize.Op.or]: likeData },order: orderBy})
        let newBshPreviousBalance =0;   
        let newBshFinalBalance =0;
        let credits = 0
        let debits = 0
        for(let c=0; c< balanceFutureExist.length; c++){
          if(c==0){
            credits = balanceFutureExist[c].bshCredits - accountingAccountSeatDetail[i].aasdCredit
            debits = balanceFutureExist[c].bshDebits - accountingAccountSeatDetail[i].aasdDebit
            newBshFinalBalance =  balanceFutureExist[c].bshPreviousBalance + credits - debits
            balanceSheetModel.update({    
                bshPreviousBalance : balanceFutureExist[c].bshPreviousBalance,    
                bshCredits: debits,
                bshCredits: credits,
                bshFinalBalance: newBshFinalBalance,     
                updateAt: moment(new Date()).format('YYYY-MM-DD')
            }, { where:{ bshId :balanceFutureExist[c].bshId}})
          } else {
            newBshPreviousBalance = newBshFinalBalance
            newBshFinalBalance = newBshPreviousBalance + balanceFutureExist[c].bshCredits - balanceFutureExist[c].bshDebits
            balanceSheetModel.update({    
                bshPreviousBalance : newBshPreviousBalance,        
                bshFinalBalance: newBshFinalBalance,     
                updateAt: moment(new Date()).format('YYYY-MM-DD')
            }, { where:{ bshId :balanceFutureExist[c].bshId}})
          }
        }
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

function viewReportSeats(req, res){
  if(usersController.controlAccess(req.headers.cookie)){
    res.redirect('/contab/sign');
  }
  else{
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    businessModel.findAll({where:{'useIdFK': token.useId}}).then( business => {
        moneyTypesModel.findAll({where:{'useIdFK': token.useId}}).then( moneyTypess => {
            return res.render('viewReportSeats' ,{
                active : 4,
                userData: token,
                titlePage : 'Consulta de Registro Asientos',
                processes : token.processes,
                menu : token.menu,  
                business: business,
                moneyTypess: moneyTypess
            })
        })
    })   
  }   
}


async function getReportSeats(req, res){
  let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    let orderBy =[['createdAt','DESC']]  

    if(typeof(req.query.search) !== "undefined" && req.query.search !== ''){  
      let likeData =  [{'aasNumberSeat': {[sequelize.Op.like]: `%${req.query.search}%`}},{'aasNameSeat': {[sequelize.Op.like]: `%${req.query.search}%`}}]  
      
      accountingAccountSeatModel.findAll({where:{'busIdFk': req.params.busId, 'aasMonth': req.params.month, 'aasYear': req.params.year, [sequelize.Op.or]: likeData},
        order: orderBy    
        }).then( accountingAccountSeatList =>{        
        return res.status(200).json({rows: accountingAccountSeatList, total:accountingAccountSeatList.length});
    })
    }
    else{
      accountingAccountSeatModel.findAll({where:{ 'busIdFk': req.params.busId, 'aasMonth': req.params.month, 'aasYear': req.params.year } , order: orderBy    
      }).then( accountingAccountSeatList =>{        
          return res.status(200).json({rows: accountingAccountSeatList, total:accountingAccountSeatList.length});
      })
    }
}

function diffInMonths (end, start) {
  var timeDiff = Math.abs(end.getTime() - start.getTime());
  return Math.round(timeDiff / (2e3 * 3600 * 365.25));
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
    reverSeatService,
    viewReportSeats,
    getReportSeats
}