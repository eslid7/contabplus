'use strict'

const accountingAccountModel = require('../models/accountingAccount')
const businessModel = require('../models/business')
const moneyTypesModel = require('../models/moneyTypes')
const balanceSheetModel = require('../models/balanceSheet')
const accountingAccountSeatModel = require('../models/accountingAccountSeat')
const accountingAccountSeatDetailModel = require('../models/accountingAccountSeatDetail')
const usersController = require('../controllers/usersController')
const moment = require('moment');
const sequelize = require('sequelize');
const sequelizeConnect = require('../config/env/connection')
const jwt = require('jwt-simple');

function viewBalanceSheet(req, res){
  if(usersController.controlAccess(req.headers.cookie)){
    res.redirect('/contab/sign');
  }
  else{
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    businessModel.findAll({where:{'useIdFK': token.useId}}).then( business => {
        moneyTypesModel.findAll({where:{'useIdFK': token.useId}}).then( moneyTypess => {
            return res.render('viewBalanceSheet' ,{
                active : 4,
                userData: token,
                titlePage : 'Cierre contable',
                processes : token.processes,
                menu : token.menu,  
                business: business,
                moneyTypess: moneyTypess
            })
        })
    })   
  }   
}

async function balanceSheet(req, res){
    // validar que sea el cierre posterior.
    const transaction = await sequelizeConnect.transaction()
    try{
        const balancePrevious = await balanceSheetModel.findOne({where: {'busIdFk':req.body.busId}, attributes: [sequelize.fn('max', sequelize.col('createdAt')),'bshMonth', 'bshYear'], group : ['bshMonth', 'bshYear']})
        console.log(balancePrevious)
        accountingAccountSeatDetailModel.hasOne(accountingAccountSeatModel,{foreignKey:'aasId',sourceKey: 'aasIdFk'});
        // puedo crearlo pero debo validar que no exista nada previo.
        if(balancePrevious== null){
            //seleccionar todos los movimientos sumar y restar 
            const accountingAccounts = await accountingAccountSeatDetailModel.findAll({
                where : {'$accountingAccountSeat.aasMonth$' : req.body.bshMonth ,'$accountingAccountSeat.aasYear$' : req.body.bshYear, '$accountingAccountSeat.busIdFk$' : req.body.busId },
                attributes: ['aacIdFk', [sequelize.fn('sum', sequelize.col('aasdDebit')), 'totalAasdDebit'], [sequelize.fn('sum', sequelize.col('aasdCredit')), 'totalAasdCredit']],
                group : ['aacIdFk'],
                include:[{  
                    model: accountingAccountSeatModel,
                    required: true,
                   // attributes: ['aasMonth','aasYear']
                   attributes: []
                }]
            })
            for(let i=0; i< accountingAccounts.length; i++){
                let bshFinalBalance = accountingAccounts[i].dataValues.totalAasdCredit - accountingAccounts[i].dataValues.totalAasdDebit
                const dataToSave = new balanceSheetModel({
                    busIdFk: req.body.busId,
                    aacIdFk: accountingAccounts[i].dataValues.aacIdFk,
                    bshMonth: req.body.bshMonth,
                    bshYear: req.body.bshYear,
                    bshPreviousBalance: 0,
                    bshDebits: accountingAccounts[i].dataValues.totalAasdDebit,
                    bshCredits: accountingAccounts[i].dataValues.totalAasdCredit,
                    bshFinalBalance: bshFinalBalance,                     
                    createdAt: moment(new Date()).format('YYYY-MM-DD'),
                    updateAt: moment(new Date()).format('YYYY-MM-DD')
                })
                const saveData = await dataToSave.save()
            }

        } else {

            if(balancePrevious.dataValues.bshMonth<12){
                const nexClose = balancePrevious.dataValues.bshMonth + 1
                if(nexClose !== parseInt(req.body.bshMonth) && req.body.bshYear !== balancePrevious.dataValues.bshYear){
                    throw new Error(`Este periodo no se permite realizar el cierre, el próximo por hacer es para el mes ${nexClose} y año ${balancePrevious.dataValues.bshYear} `)
                }
            } else {
                const nextYear = balancePrevious.dataValues.bshYear + 1
                if('01' !== req.body.bshMonth && req.body.bshYear !== nextYear){
                    throw new Error(`Este periodo no se permite realizar el cierre, el próximo por hacer es para el mes 1 y año ${nextYear} `)
                }
            }
            const balanceSheet = await balanceSheetModel.findAll({where : {'bshMonth' : balancePrevious.dataValues.bshMonth, 'bshYear' : balancePrevious.dataValues.bshYear}})
            
            const accountingAccounts = await accountingAccountSeatDetailModel.findAll({
                where : {'$accountingAccountSeat.aasMonth$' : req.body.bshMonth ,'$accountingAccountSeat.aasYear$' : req.body.bshYear, '$accountingAccountSeat.busIdFk$' : req.body.busId },
                attributes: ['aacIdFk', [sequelize.fn('sum', sequelize.col('aasdDebit')), 'totalAasdDebit'], [sequelize.fn('sum', sequelize.col('aasdCredit')), 'totalAasdCredit']],
                group : ['aacIdFk'],
                include:[{  
                    model: accountingAccountSeatModel,
                    required: true,
                    attributes: []
                }]
            })
            let existPreviuos = false
            for(let i=0; i< accountingAccounts.length; i++){   
                existPreviuos = false             
                for(let a=0; a< balanceSheet.length; a++){
                    if(accountingAccounts[i].dataValues.aacIdFk == balanceSheet[a].dataValues.aacIdFk){
                        existPreviuos = true  
                        let newBshFinalBalance = balanceSheet[a].dataValues.bshFinalBalance - accountingAccounts[i].dataValues.totalAasdDebit + accountingAccounts[i].dataValues.totalAasdCredit
                        const dataToSave = new balanceSheetModel({
                            busIdFk: req.body.busId,
                            aacIdFk: accountingAccounts[i].dataValues.aacIdFk,
                            bshMonth: req.body.bshMonth,
                            bshYear: req.body.bshYear,
                            bshPreviousBalance: balanceSheet[a].dataValues.bshFinalBalance,
                            bshDebits: accountingAccounts[i].dataValues.totalAasdDebit,
                            bshCredits: accountingAccounts[i].dataValues.totalAasdCredit,
                            bshFinalBalance: newBshFinalBalance,                     
                            createdAt: moment(new Date()).format('YYYY-MM-DD'),
                            updateAt: moment(new Date()).format('YYYY-MM-DD')
                        })
                        const saveData = await dataToSave.save()
                    }
                }
                if(!existPreviuos){
                    let bshFinalBalance =  accountingAccounts[i].dataValues.totalAasdCredit - accountingAccounts[i].dataValues.totalAasdDebit
                    const dataToSave = new balanceSheetModel({
                        busIdFk: req.body.busId,
                        aacIdFk: accountingAccounts[i].dataValues.aacIdFk,
                        bshMonth: req.body.bshMonth,
                        bshYear: req.body.bshYear,
                        bshPreviousBalance: 0,
                        bshDebits: accountingAccounts[i].dataValues.totalAasdDebit,
                        bshCredits: accountingAccounts[i].dataValues.totalAasdCredit,
                        bshFinalBalance: bshFinalBalance,                     
                        createdAt: moment(new Date()).format('YYYY-MM-DD'),
                        updateAt: moment(new Date()).format('YYYY-MM-DD')
                    })
                    const saveData = await dataToSave.save()
                }
            }
            for(let a=0; a< balanceSheet.length; a++){
                existPreviuos = true
                for(let i=0; i< accountingAccounts.length; i++){  
                    if(accountingAccounts[i].dataValues.aacIdFk == balanceSheet[a].dataValues.aacIdFk){
                        existPreviuos = false
                    }
                }
                if(existPreviuos){                    
                    const dataToSave = new balanceSheetModel({
                        busIdFk: req.body.busId,
                        aacIdFk: balanceSheet[a].dataValues.aacIdFk,
                        bshMonth: req.body.bshMonth,
                        bshYear: req.body.bshYear,
                        bshPreviousBalance:  balanceSheet[a].dataValues.bshFinalBalance,
                        bshDebits: 0,
                        bshCredits: 0,
                        bshFinalBalance:  balanceSheet[a].dataValues.bshFinalBalance,                     
                        createdAt: moment(new Date()).format('YYYY-MM-DD'),
                        updateAt: moment(new Date()).format('YYYY-MM-DD')
                    })
                    const saveData = await dataToSave.save()
                }                
            }
        }
        await transaction.commit()
        return   res.status(200).json({ message: "Se ha realizado el cierre correctamente." });
        //'bshMonth':req.body.bshMonth, 'bshYear': req.body.bshYear 
    } catch (error) {
        await transaction.rollback()
        console.log(error)
        return  res.status(400).json({ message: error.message});
    }

}

module.exports = {
    viewBalanceSheet,
    balanceSheet,
}