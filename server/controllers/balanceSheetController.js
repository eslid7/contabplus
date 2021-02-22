'use strict'

const businessModel = require('../models/business')
const moneyTypesModel = require('../models/moneyTypes')
const balanceSheetCloseModel = require('../models/balanceSheetClose')
const balanceSheetModel = require('../models/balanceSheet')
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
                active : 3,
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
        let orderBy =[['bscId','DESC']] 
        const balancePrevious = await balanceSheetCloseModel.findOne({where: {'busIdFk':req.body.busId} , order: orderBy})
        console.log(balancePrevious)
        // puedo crearlo pero debo validar que no exista nada previo.
        if(balancePrevious== null){
            //buscar que no hayan movimientos previos            
            const movements = await balanceSheetModel.findOne({where:{'busIdFk':req.body.busId,'bshMonth': {[sequelize.Op.lt]: `${req.body.bscMonth}`},'bshYear': {[sequelize.Op.lte]: `${req.body.bscYear}`} }});

            if(movements == null){
                const movementsHaveToClose = await balanceSheetModel.findOne({where:{'busIdFk':req.body.busId,'bshMonth': req.body.bscMonth,'bshYear': req.body.bscYear}});
                // tiene que haber al menos un movimiento.
                if(movementsHaveToClose!=null){
                    const dataToSave = new balanceSheetCloseModel({
                        busIdFk: req.body.busId,                    
                        bscMonth: req.body.bscMonth,
                        bscYear: req.body.bscYear,                    
                        createdAt: moment(new Date()).format('YYYY-MM-DD'),
                        updateAt: moment(new Date()).format('YYYY-MM-DD')
                    })
                    const saveData = await dataToSave.save()
                } else {
                    throw new Error("No hay movimientos para este periodo.")
                }

            } else {
                throw new Error(`Este periodo no se permite realizar el cierre, dado que existen movimentos para el mes ${movements.dataValues.bshMonth} y año ${movements.dataValues.bshYear} `)
            }
        } else {

            if(balancePrevious.dataValues.bscMonth<12){
                const nexClose = balancePrevious.dataValues.bscMonth + 1
                if(nexClose !== parseInt(req.body.bscMonth) && req.body.bscYear !== balancePrevious.dataValues.bscYear){
                    throw new Error(`Este periodo no se permite realizar el cierre, el próximo por hacer es para el mes ${nexClose} y año ${balancePrevious.dataValues.bscYear} `)
                }
            } else {
                const nextYear = balancePrevious.dataValues.bscYear + 1
                if('01' !== req.body.bscMonth && req.body.bscYear !== nextYear){
                    throw new Error(`Este periodo no se permite realizar el cierre, el próximo por hacer es para el mes 1 y año ${nextYear} `)
                }
            }
            const dataToSave = new balanceSheetCloseModel({
                busIdFk: req.body.busId,                    
                bscMonth: req.body.bscMonth,
                bscYear: req.body.bscYear,                    
                createdAt: moment(new Date()).format('YYYY-MM-DD'),
                updateAt: moment(new Date()).format('YYYY-MM-DD')
            })
            const saveData = await dataToSave.save()
        }
        await transaction.commit()
        return   res.status(200).json({ message: "Se ha realizado el cierre correctamente." });
    } catch (error) {
        await transaction.rollback()
        console.log(error)
        return  res.status(400).json({ message: error.message});
    }

}

function getListBalanceSheet(req,res){
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    let orderBy =[['createdAt','DESC']]  
    console.log(req.params.busId)
    if(typeof(req.query.search) !== "undefined" && req.query.search !== ''){  
        let likeData =  [{'bscMonth': {[sequelize.Op.like]: `%${req.query.search}%`}},{'bscYear': {[sequelize.Op.like]: `%${req.query.search}%`}}]  
        balanceSheetCloseModel.findAll({where:{'busIdFk': req.params.busId, [sequelize.Op.or]: likeData } 
        }).then( balanceSheetList =>{        
            return res.status(200).json({rows: balanceSheetList, total:balanceSheetList.length});
        })
    }
    else{
        balanceSheetCloseModel.findAll({where:{ 'busIdFk': req.params.busId } , orderBy : orderBy
        }).then( balanceSheetList =>{        
          return res.status(200).json({rows: balanceSheetList, total:balanceSheetList.length});
        })
    }
}

async function exitsBalanceSheetClose(busId, bscMonth, bscYear){
    const balanceCloseExist = await balanceSheetCloseModel.findOne({where: {'busIdFk': busId, 'bscMonth' : bscMonth,'bscYear' :bscYear} })
    if(balanceCloseExist== null){
        return false
    } else {
        return true
    }
}

module.exports = {
    viewBalanceSheet,
    balanceSheet,
    getListBalanceSheet,
    exitsBalanceSheetClose
}