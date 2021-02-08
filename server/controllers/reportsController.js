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
const { serializeUser } = require('passport')

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
    let search = false
    if(typeof(req.query.month) !== "undefined" && req.query.month !== ''){
        searchData.aasMonth = req.query.month
        search =true
    }
    if(typeof(req.query.year) !== "undefined" && req.query.year !== ''){
        searchData.aasYear = req.query.year
        search =true
    }
    if(typeof(req.query.aasNumberSeat) !== "undefined" && req.query.aasNumberSeat !== ''){
        searchData.aasNumberSeat = req.query.aasNumberSeat
        search =true
    }
    if(typeof(req.query.aasNameSeat) !== "undefined" && req.query.aasNameSeat !== ''){
        searchData.aasNameSeat = req.query.aasNameSeat
        search =true
    }

    if(search){                
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
            },{  
                model: accountingAccountModel,
                required: true,
        }],
        offset: (offsetData*1),
        limit : (limitData*1), 
        order: orderBy    
      }).then( accountingAccountSeatDetailList =>{ 
        accountingAccountSeatDetailModel.findAll({include: [{  
            model: accountingAccountSeatModel,
            required: true,
            where: searchData
        }]}).then(accountingAccountSeatDetailModelTotal=>{
            return res.status(200).json({rows: accountingAccountSeatDetailList, total:accountingAccountSeatDetailModelTotal.length});
        })              
    })
    }
    else{
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
            },{  
                model: accountingAccountModel,
                required: true,
        }],
            offset: (offsetData*1),
            limit : (limitData*1), 
            order: orderBy    
        }).then( accountingAccountSeatDetailList =>{ 
            accountingAccountSeatDetailModel.findAll({where:{'$accountingAccountSeat.busIdFk$': req.params.busId },include:[{  
                model: accountingAccountSeatModel,
                required: true,
            }]}).then(accountingAccountSeatDetailModelTotal=>{
                return res.status(200).json({rows: accountingAccountSeatDetailList, total:accountingAccountSeatDetailModelTotal.length});
            })       
        })
    }
}

module.exports = {
    viewMovementebyAccount,
    viewBalanceVerify,
    getReportMovementebyAccount
}