'use strict'

const accountingAccountModel = require('../models/accountingAccount')
const businessModel = require('../models/business')
const moneyTypesModel = require('../models/moneyTypes')
const documentTypesModel = require('../models/documentTypes')
const accountingAccountSeatModel = require('../models/accountingAccountSeat')
const accountingAccountSeatDetailModel = require('../models/accountingAccountSeatDetail')
const balanceSheetCloseModel = require('../models/balanceSheetClose')
const userModel = require('../models/users')
const balanceSheetModel = require('../models/balanceSheet')
const usersController = require('../controllers/usersController')
const jwt = require('jwt-simple');
const sequelize = require('sequelize');

function viewMovementebyAccount(req, res){
  if(usersController.controlAccess(req.headers.cookie)){
    res.redirect('/contab/sign');
  }
  else{
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    businessModel.findAll({where:{'useIdFK': token.useId}}).then( business => {
        moneyTypesModel.findAll({where:{'useIdFK': token.useId}}).then( moneyTypess => {
            return res.render('viewMovementebyAccount' ,{
                active : 4,
                userData: token,
                titlePage : 'Movimiento por Cuenta',
                processes : token.processes,
                menu : token.menu,  
                business: business,
                moneyTypess: moneyTypess
            })
        })
    })   
  }   
}

function viewBalanceVerify(req, res){
    if(usersController.controlAccess(req.headers.cookie)){
      res.redirect('/contab/sign');
    }
    else{
      let data = req.headers.cookie.split("=");
      const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
      businessModel.findAll({where:{'useIdFK': token.useId}}).then( business => {
          moneyTypesModel.findAll({where:{'useIdFK': token.useId}}).then( moneyTypess => {
              return res.render('viewBalanceVerify' ,{
                  active : 4,
                  userData: token,
                  titlePage : 'Balance de Comprobación',
                  processes : token.processes,
                  menu : token.menu,  
                  business: business,
                  moneyTypess: moneyTypess
              })
          })
      })   
    }   
}

function getReportMovementebyAccount(req,res){
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    let orderBy =[['createdAt','DESC']] 
    let offsetData =0
    let limitData =10

    if(typeof(req.query.offset) !== "undefined" && req.query.offset !== ''){
        offsetData = req.query.offset
    }
    if(typeof(req.query.limit) !== "undefined" && req.query.limit !== ''){
        limitData = req.query.limit
    } 
    
    accountingAccountSeatDetailModel.hasOne(documentTypesModel,{foreignKey:'docId',sourceKey: 'docIdFk'});
    accountingAccountSeatDetailModel.hasOne(moneyTypesModel,{foreignKey:'monId',sourceKey: 'monIdFk'});
    accountingAccountSeatDetailModel.hasOne(accountingAccountModel,{foreignKey:'aacId',sourceKey: 'aacIdFk'});
    accountingAccountSeatDetailModel.hasOne(accountingAccountSeatModel,{foreignKey:'aasId',sourceKey: 'aasIdFk'});
    accountingAccountSeatModel.hasOne(userModel,{foreignKey:'useId',sourceKey: 'useIdFk'});

    let searchData = { busIdFk :req.params.busId }
    let accountingAccountModelData = {}
    let search = false
    let exportAll =false
    if(typeof(req.query.date_from) !== "undefined" && req.query.date_from !== ''){
        const tempDateFrom =req.query.date_from.split('/')
        const dateSeatToServerFrom = new Date(`${tempDateFrom[2]}-${tempDateFrom[1]}-${tempDateFrom[0]}`)
        const tempDateTo =req.query.date_to.split('/')
        const dateSeatToServerTo = new Date(`${tempDateTo[2]}-${tempDateTo[1]}-${tempDateTo[0]}`)
        searchData.createdAt = { [sequelize.Op.between] : [dateSeatToServerFrom, dateSeatToServerTo] }
        search =true
    }
    if(typeof(req.query.aasNumberSeat) !== "undefined" && req.query.aasNumberSeat !== ''){
        searchData.aasNumberSeat = {[sequelize.Op.like]: `%${req.query.aasNumberSeat}%`}
        search =true
    }
    if(typeof(req.query.aasNameSeat) !== "undefined" && req.query.aasNameSeat !== ''){
        searchData.aasNameSeat = {[sequelize.Op.like]: `%${req.query.aasNameSeat}%`}
        search =true
    }
    if(typeof(req.query.aacCode) !== "undefined" && req.query.aacCode !== ''){
        accountingAccountModelData = {
            model: accountingAccountModel,
            required: true,
            where : {'aacCode':{[sequelize.Op.like]: `${req.query.aacCode}%`}}
        }
    } else {
        accountingAccountModelData = {
            model: accountingAccountModel,
            required: true
        }
    }
    
    if(typeof(req.query.exportAll) !== "undefined" && req.query.exportAll !== ''){
        exportAll= true
    }

    if(search){  
        if(exportAll){
            accountingAccountSeatDetailModel.findAll({
                include:[{  
                        model: accountingAccountSeatModel,
                        required: true,
                        include : [{model: userModel,  required: true}],
                        where: searchData
                    },{  
                        model: documentTypesModel,
                        required: true,
                    },{  
                        model: moneyTypesModel,
                        required: true,
                    },accountingAccountModelData], 
                    order: orderBy    
                }).then( accountingAccountSeatDetailList =>{ 
                accountingAccountSeatDetailModel.findAll({include: [{  
                    model: accountingAccountSeatModel,
                    required: true,
                    where: searchData
                },accountingAccountModelData]}).then(accountingAccountSeatDetailModelTotal=>{
                    return res.status(200).json({rows: accountingAccountSeatDetailList, total:accountingAccountSeatDetailModelTotal.length});
                })  
            })
        } else {
            accountingAccountSeatDetailModel.findAll({
                include:[{  
                        model: accountingAccountSeatModel,
                        required: true,
                        include : [{model: userModel,  required: true}],
                        where: searchData
                    },{  
                        model: documentTypesModel,
                        required: true,
                    },{  
                        model: moneyTypesModel,
                        required: true,
                    },accountingAccountModelData],
                    offset: (offsetData*1),
                    limit : (limitData*1), 
                    order: orderBy    
                }).then( accountingAccountSeatDetailList =>{ 
                accountingAccountSeatDetailModel.findAll({include: [{  
                    model: accountingAccountSeatModel,
                    required: true,
                    where: searchData
                },accountingAccountModelData]}).then(accountingAccountSeatDetailModelTotal=>{
                    return res.status(200).json({rows: accountingAccountSeatDetailList, total:accountingAccountSeatDetailModelTotal.length});
                })  
            })
        }         
    
    }
    else{
        if(exportAll){
            accountingAccountSeatDetailModel.findAll({where:{'$accountingAccountSeat.busIdFk$': req.params.busId },
            include: [{  
                    model: accountingAccountSeatModel,
                    required: true,
                    include : [{model: userModel,  required: true}]
                },{  
                    model: documentTypesModel,
                    required: true,
                },{  
                    model: moneyTypesModel,
                    required: true,
                },accountingAccountModelData],
                order: orderBy    
                }).then( accountingAccountSeatDetailList =>{ 
                    accountingAccountSeatDetailModel.findAll({where:{'$accountingAccountSeat.busIdFk$': req.params.busId },include:[{  
                        model: accountingAccountSeatModel,
                        required: true,
                    },accountingAccountModelData]}).then(accountingAccountSeatDetailModelTotal=>{
                        return res.status(200).json({rows: accountingAccountSeatDetailList, total:accountingAccountSeatDetailModelTotal.length});
                     })       
                })
        } else {
            accountingAccountSeatDetailModel.findAll({where:{'$accountingAccountSeat.busIdFk$': req.params.busId },
            include: [{  
                    model: accountingAccountSeatModel,
                    required: true,
                    include : [{model: userModel,  required: true}]
                },{  
                    model: documentTypesModel,
                    required: true,
                },{  
                    model: moneyTypesModel,
                    required: true,
                },accountingAccountModelData],
                offset: (offsetData*1),
                limit : (limitData*1), 
                order: orderBy    
            }).then( accountingAccountSeatDetailList =>{ 
                accountingAccountSeatDetailModel.findAll({where:{'$accountingAccountSeat.busIdFk$': req.params.busId },include:[{  
                    model: accountingAccountSeatModel,
                    required: true,
                },accountingAccountModelData]}).then(accountingAccountSeatDetailModelTotal=>{
                    return res.status(200).json({rows: accountingAccountSeatDetailList, total:accountingAccountSeatDetailModelTotal.length});
                })       
            })
        }
    }
}


async function getReportBalance(req,res){
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
   // let orderBy =[['createdAt','DESC']] 
    let offsetData =0
    let limitData =10

    if(typeof(req.query.offset) !== "undefined" && req.query.offset !== ''){
        offsetData = req.query.offset
    }
    if(typeof(req.query.limit) !== "undefined" && req.query.limit !== ''){
        limitData = req.query.limit
    } 
    // si no esta definido mes - periodo hay que agrupar

    // balanceSheetModel.hasOne(accountingAccountModel,{foreignKey:'aacId',sourceKey: 'aacIdFk'});
    // balanceSheetModel.findAll({where:{busIdFk : req.params.busId},
    //     attributes: ['aacIdFk', [sequelize.fn('sum', sequelize.col('bshPreviousBalance')), 'bshPreviousBalance'], [sequelize.fn('sum', sequelize.col('bshDebits')), 'bshDebits'], [sequelize.fn('sum', sequelize.col('bshCredits')), 'bshCredits']],
    //     group : ['aacIdFk'],
    //     include : [{  
    //         model: accountingAccountModel,
    //         required: true,
    //     }],
    //     offset: (offsetData*1),
    //     limit : (limitData*1)   
    // }).then(balanceSheetList=>{
    //     balanceSheetModel.findAll({where:{busIdFk : req.params.busId},
    //         attributes: ['aacIdFk'],
    //         group : ['aacIdFk'],
    //         include : [{  
    //             model: accountingAccountModel,
    //             required: true,
    //     }]}).then(balanceSheetTotal =>{
    //         return res.status(200).json({rows: balanceSheetList, total:balanceSheetTotal.length});
    //     })
    // })

    balanceSheetModel.hasOne(accountingAccountModel,{foreignKey:'aacId',sourceKey: 'aacIdFk'});
    const dataReport = await balanceSheetModel.findAll({where:{busIdFk : req.params.busId},
        attributes: ['aacIdFk', [sequelize.fn('sum', sequelize.col('bshPreviousBalance')), 'bshPreviousBalance'], [sequelize.fn('sum', sequelize.col('bshDebits')), 'bshDebits'], [sequelize.fn('sum', sequelize.col('bshCredits')), 'bshCredits']],
        group : ['aacIdFk'],
        include : [{  
            model: accountingAccountModel,
            required: true,
        }], 
    })
    let arrayMinData = new Array();
    for(let i=0; i< dataReport.length; i++){
        const dataReportMin = await balanceSheetModel.findOne({where:{busIdFk : req.params.busId, aacIdFk : dataReport[i].aacIdFk},
            attributes: ['aacIdFk', 'bshPreviousBalance', [sequelize.fn('min', sequelize.col('updatedAt')), 'updatedAt']],
            group : ['aacIdFk','bshPreviousBalance'],
        })
        arrayMinData.push({
            aacIdFk: dataReportMin.aacIdFk,
            bshPreviousBalance: dataReportMin.bshPreviousBalance
        })
    }
    console.log(arrayMinData);
    return res.status(200).json({dataReport, arrayMinData: arrayMinData});

}

module.exports = {
    viewMovementebyAccount,
    viewBalanceVerify,
    getReportMovementebyAccount,
    getReportBalance
}