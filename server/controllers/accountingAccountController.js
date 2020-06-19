const businessModel = require('../models/business')
const usersModel = require('../models/users')
const accountingAccountModel = require('../models/accountingAccount')
const moment = require('moment')
const sequelize = require('sequelize');
const jwt = require('jwt-simple');
const pify = require('pify');
const path = require('path');
const multer = require('multer');
const excelToJson = require('convert-excel-to-json');
const fs = require('fs');

function viewMantenanceAcco(req, res){
    
    if(req.headers.cookie==undefined){
        res.redirect('/contab/sign');
    }
    else{
        let data = req.headers.cookie.split("=");
        const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
        businessModel.findAll({where:{'useIdFK': token.useId}}).then( business => {
            usersModel.findAll().then(function (usersData){
                return res.render('viewMantenanceAcco' ,{
                    userData: token,
                    active : -1,
                    titlePage : 'Mant de cuentas contables',
                    business : business,
                    users : usersData,
                    processes : token.processes,
                    menu : token.menu
                })
            })        
        })    
          
    }
}

function saveAccountingAccount(req, res){
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512')
    //primero si el nivel es mayor a 1 validar que exista el nivel anterior
    let aacCode = req.body.aacCode
    let aacCodeToSave = req.body.aacCodeToSave
    
    //buscar el nivel se debe borrar +1 para buscar el nivel anterior
    accountingAccountModel.findOne({where: {'accIdFk': req.body.accId, 'aacCode': req.body.aacNivelBefore}}).then( accountingAccountRaiz => { 
        if(accountingAccountRaiz || req.body.aacNivelBefore == ''){
            //verificar que no exista
            accountingAccountModel.findOne({where: {'accIdFk': req.body.accId, 'aacCode': aacCodeToSave}}).then( accountingAccountExist => { 
                if(accountingAccountExist){
                    return res.status(400).json({ message: `No se puede crear, la cuenta  ${aacCodeToSave} ya existe.` });
                }
                else{
                    const dataToSave = new accountingAccountModel({
                        accIdFk: req.body.accId,
                        busIdFk: req.body.busId,
                        useIdFk: token.useId,        
                        aacCode: aacCodeToSave,
                        aacName: req.body.aacName,
                        aacType: req.body.aacType,
                        aacTypeBalance: req.body.aacTypeBalance,
                        aacFuncionality: req.body.aacFuncionality,
                        aacObservations: req.body.aacObservations,
                        aacStatus: 1,
                        aacMoney: req.body.aacMoney,        
                        createdAt: moment(new Date()).format('YYYY-MM-DD'),
                        updateAt: moment(new Date()).format('YYYY-MM-DD')
                    });
                    dataToSave.save().then(function () {
                        return res.status(200).json({ message: "Se ha creado con exito." });
                    })
                }
            })    
        }
        else{
            return res.status(400).json({ message: `No se puede crear, porque no se ha registrado la cuenta padre ${req.body.aacNivelBefore}` });
        }
    })

}

function getAccountingAccount(req, res){
    let likeData = []
    let offsetData =0
    let limitData =10
    
    if(typeof(req.query.offset) !== "undefined" && req.query.offset !== ''){
        offsetData = req.query.offset
    }
    if(typeof(req.query.limit) !== "undefined" && req.query.limit !== ''){
        limitData = req.query.limit
    }
    if(typeof(req.query.search) !== "undefined" && req.query.search !== ''){
        likeData=[{'aacName': {[sequelize.Op.like]: `%${req.query.search}%`}}, {'aacCode': {[sequelize.Op.like]: `%${req.query.search}%`}}]
    }


    if(typeof(req.query.search) !== "undefined" && req.query.search !== ''){
        accountingAccountModel.findAll({where: {'accIdFk': req.params.id,[sequelize.Op.or]: likeData}}).then( accountingAccountTotal => { 
            accountingAccountModel.findAll({where: {'accIdFk': req.params.id,
                [sequelize.Op.or]: likeData
            },
            offset: (offsetData*1),
            limit : (limitData*1), order :[['aacCode','ASC']]}).then( accountingAccount => { 
                return res.status(200).json({rows: accountingAccount, total:accountingAccountTotal.length});
            })
        })

    }
    else{
        accountingAccountModel.findAll({where: {'accIdFk': req.params.id}}).then( accountingAccountTotal => { 
            accountingAccountModel.findAll({where: {'accIdFk': req.params.id},  offset: (offsetData*1),limit : (limitData*1) , order :[['aacCode','ASC']]}).then( accountingAccount => { 
                return res.status(200).json({rows: accountingAccount, total:accountingAccountTotal.length});
            })
        })
    }


}
function getAccountingAccountSearch(req, res){
    accountingAccountModel.findOne({where: {'accIdFk': req.params.id,'aacCode': req.query.aacCode}}).then( accountingAccount => { 
        // necesito si es un nivel 2 devolver el data de nivel 1
        if(req.query.levelToSave!= undefined&& req.query.levelToSave>1){
            accountingAccountModel.findOne({attributes:['aacType'],where: {'accIdFk': req.params.id,'aacCode': req.query.aacNivelFirst}}).then( accountingAccountRaiz => { 
                return res.status(200).json({accountingAccount, accountingAccountRaiz});
            })
        }
        else{
            return res.status(200).json({accountingAccount, accountingAccountRaiz: null});
        }
        
    })
}

async function loadFile (req,res){
    var d = new Date();
    console.log(d.getTime())
    newFileName= d.getTime()
    try {
        const storage = multer.diskStorage({
            destination: 'server/public/filesUpload/',
            filename(req, file, cb) {
              cb(null, newFileName+file.originalname)
            },
        });
        const upload = pify(multer({ storage }).single('newFile'))
        const appDir = path.dirname(require.main.filename);
    
        await upload(req, res)
    
        console.log("result2")
        var newpath = appDir+'/server/public/filesUpload/'+newFileName+req.file.originalname
        console.log(newpath)
        const result = excelToJson({
            source: fs.readFileSync(newpath)  
        });
        console.log("result2")
        console.log(result)
        for(a=1; a<result.Hoja1.length; a++){
            console.log(result.Hoja1[a].A) // codigo cuenta 1 validar que no existe, 2 validar que tenga papa si es el caso
            console.log(result.Hoja1[a].B) //nombre
        }
    
    
        return res.status(200).json({ message: "Se ha procesado con exito." });
    } catch (error) {
        return res.status(200).json({ message: error.message });
    }
 

}


module.exports = {
    viewMantenanceAcco,
    saveAccountingAccount,
    getAccountingAccount,
    getAccountingAccountSearch,
    loadFile,
}