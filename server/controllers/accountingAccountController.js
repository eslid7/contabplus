const businessModel = require('../models/business')
const usersModel = require('../models/users')
const accountingAccountModel = require('../models/accountingAccount')
const accountingCatalogModel = require('../models/accountingCatalog');
const moment = require('moment')
const sequelize = require('sequelize');
const jwt = require('jwt-simple');
const pify = require('pify');
const path = require('path');
const multer = require('multer');
const excelToJson = require('convert-excel-to-json');
const fs = require('fs');
const usersController = require('../controllers/usersController')

function viewMantenanceAcco(req, res){
    if(usersController.controlAccess(req.headers.cookie)){
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

async function saveAccountingAccount(req, res){
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512')
    //primero si el nivel es mayor a 1 validar que exista el nivel anterior
    let aacCode = req.body.aacCode
    let aacCodeToSave = req.body.aacCodeToSave
    console.log('req.body.aacId', req.body.aacId)
    if(req.body.aacId!= undefined && req.body.aacId!=""){
        //validar que la cuenta no exista        
        const accountingAccountExist = await accountingAccountModel.findOne({where: {'accIdFk': req.body.accId, 'aacCode': aacCodeToSave}}) 
        if(accountingAccountExist && accountingAccountExist.aacId != req.body.aacId){
            return res.status(400).json({ message: `No se puede guardar, la cuenta  ${aacCodeToSave} ya existe.` });
        }
        else{
            const accountingAccountRaiz = await accountingAccountModel.findOne({where: {'accIdFk': req.body.accId, 'aacCode': req.body.aacNivelBefore}}) 
            if(accountingAccountRaiz || req.body.aacNivelBefore == ''){
                accountingAccountModel.update({            
                        useIdFk: token.useId,        
                        aacCode: aacCodeToSave, //??? realizar las validaciones
                        aacName: req.body.aacName,
                        aacType: req.body.aacType,
                        aacTypeBalance: req.body.aacTypeBalance,
                        aacFuncionality: req.body.aacFuncionality,
                        aacObservations: req.body.aacObservations,
                        aacStatus: 1, /// agregar el status al body
                        aacMoney: req.body.aacMoney,        
                        updateAt: moment(new Date()).format('YYYY-MM-DD')
                    }, {where : {'aacId' :req.body.aacId}}).then(function () {
                    return  res.status(200).json({ message: "Se ha actualizado con exito" });
                })
            }
            else{
                return res.status(400).json({ message: `No se puede crear, porque no se ha registrado la cuenta padre ${req.body.aacNivelBefore}` });
            }
        } 
    }
    else{
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
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512')

    try {
        let haveGeneralError= false
        let errorText =''
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
        // busco el catalogo
        const accountCatalog = await accountingCatalogModel.findOne({where: {'accId': req.params.id}}) 

        const jsonData = JSON.parse(accountCatalog.accNivels)

        let nivel2= jsonData.accNivel1*1+jsonData.accNivel2*1
        let nivel3= nivel2+jsonData.accNivel3*1
        let nivel4= nivel3+jsonData.accNivel4*1
        let nivel5= nivel4+jsonData.accNivel5*1
        let nivel6= nivel5+jsonData.accNivel6*1
        let nivel7= nivel6+jsonData.accNivel7*1
        let nivel8= nivel7+jsonData.accNivel8*1
        let nivel9= nivel8+jsonData.accNivel9*1
        let nivel10= nivel9+jsonData.accNivel10*1
        let nivel11= nivel10+jsonData.accNivel11*1
        let nivel12= nivel11+jsonData.accNivel12*1
            
        // console.log(jsonData)
        for(a=1; a<result.Hoja1.length; a++){
            let haveError= false
            linea = a+1
            console.log(result.Hoja1[a].A) //  2 validar que tenga papa si es el caso 
            if(result.Hoja1[a].A== undefined){
                haveError= true
                errorText =errorText +'El código de la cuenta en la linea '+linea+' es requerido <br> '
            }
            //validar el tamaño de la cuenta con respecto al nivel
            // buscar que nivel y si el nivel es padre 
            let newDataWithMask=''
            let levelToSave = 0
            let aacNivelFirst=''
            let aacNivelBefore =''
            let dataMask= result.Hoja1[a].A
            dataMask = dataMask.replace(accountCatalog.accSeparator,'','all');
            for(var c=0;  c<dataMask.length; c++){	
                if(accountCatalog.accNivel1==c||nivel2==c||nivel3==c||nivel4==c||nivel5==c||nivel6==c||nivel7==c||nivel8==c||nivel9==c||nivel10==c||nivel11==c||nivel12==c){
                    aacNivelBefore= newDataWithMask
                    if(accountCatalog.accNivel1==c){
                        aacNivelFirst= newDataWithMask
                    }
                    levelToSave = levelToSave+1
                    
                    if(dataMask.charAt(c+1)!=accountCatalog.accSeparator){
                        // error no contiene los separadores
                        newDataWithMask =newDataWithMask+accountCatalog.accSeparator
                    }
                    else{
                        //
                        console.log('si tiene separador')
                    }
                }	            															
                newDataWithMask = newDataWithMask+dataMask.charAt(c)		
            }
            console.log('newDataWithMask',newDataWithMask)
            if(
                (levelToSave == 1 && jsonData.accNivel1!=dataMask.length) 
                || (levelToSave == 2 && nivel2!=dataMask.length)|| (levelToSave == 3 && nivel3!=dataMask.length)|| (levelToSave == 4 && nivel4!=dataMask.length)
                || (levelToSave == 5 && nivel5!=dataMask.length)|| (levelToSave == 6 && nivel6!=dataMask.length)|| (levelToSave == 7 && nivel7!=dataMask.length)
                || (levelToSave == 8 && nivel8!=dataMask.length)|| (levelToSave == 9 && nivel9!=dataMask.length)|| (levelToSave == 10 && nivel10!=dataMask.length)
                || (levelToSave == 11 && nivel11!=dataMask.length)|| (levelToSave == 12 && nivel12!=dataMask.length)
                ){
                console.log('dataMask.length',dataMask.length)
                console.log('nivel3',nivel3)
                
                haveError= true
                errorText =errorText +'El tamaño del código de la cuenta en la linea '+linea+' no tiene la longitud requerida <br> '
            }
            console.log('arriba',result.Hoja1[a].A)
            console.log('aarriba',a)
            ///codigo cuenta 1 validar que no existe,
            const  accountingAccount = await accountingAccountModel.findOne({where: {'accIdFk':req.params.id,'aacCode': result.Hoja1[a].A}})                          
            if(accountingAccount!=undefined){
                haveError= true
                errorText =errorText +'El código de la cuenta '+result.Hoja1[a].A+' en la linea '+linea+' ya existe <br> '
            }

            // verificar la cuenta padre
            if(levelToSave>1){
                console.log("aacNivelBefore",aacNivelBefore)
                const accountingAccountRaiz = await accountingAccountModel.findOne({where: {'accIdFk': req.params.id,'aacCode': aacNivelBefore}})
                console.log('accountingAccountRaiz', accountingAccountRaiz)
                if(accountingAccountRaiz.length==0){
                    haveError= true
                    errorText =errorText +'El código de la cuenta '+result.Hoja1[a].A+' en la linea '+linea+', la cuenta raiz no existe <br> '
                }
            }

            console.log('a',a)
            console.log(result.Hoja1[a].B) //nombre
            if(result.Hoja1[a].B== undefined){
                haveError= true
                errorText =errorText +'El nombre de la cuenta en la linea '+linea+' es requerido <br> '
            }
            console.log(result.Hoja1[a].C) // Tipo de cuenta
            if(result.Hoja1[a].C== undefined){
                haveError= true
                errorText =errorText +'El tipo de la cuenta en la linea '+linea+' es requerido <br> '
            }
            if(result.Hoja1[a].C!= 1&&result.Hoja1[a].C!= 2&&result.Hoja1[a].C!= 3&&result.Hoja1[a].C!= 4&&result.Hoja1[a].C!= 5&&result.Hoja1[a].C!= 6 && result.Hoja1[a].C!= 7){
                haveError= true
                errorText =errorText +'El valor del tipo de la cuenta en la linea '+linea+' es invalido <br> '
            }
            // 1=Activo
            // 2=Pasivo
            // 3=Patrimonio
            // 4=Ingresos
            // 5=Costos Ventas 
            // 6=Gastos
            // 7=Gastos Produccion
            console.log(result.Hoja1[a].D) // Tipo de saldo 1=Deudor 2= Acreedor
            if(result.Hoja1[a].D== undefined){
                haveError= true
                errorText =errorText +'El tipo de saldo de la cuenta en la linea '+linea+' es requerido <br> '
            }
            if(result.Hoja1[a].D!= 1&&result.Hoja1[a].D!= 2){
                haveError= true
                errorText =errorText +'El valor tipo de saldo de la cuenta en la linea '+linea+' es invalido <br> '
            }
            console.log(result.Hoja1[a].E) // Moneda 1= Colon 2= Dolar
            if(result.Hoja1[a].E== undefined){
                haveError= true
                errorText =errorText +'El tipo de moneda de la cuenta en la linea '+linea+' es requerido <br> '
            }
            if(result.Hoja1[a].E!= 1&&result.Hoja1[a].E!= 2){
                haveError= true                
                errorText =errorText +'El valor tipo de moneda de la cuenta en la linea '+linea+' es invalido <br> '
            }
            let aacFuncionality =''
            if(result.Hoja1[a].F != undefined){
                aacFuncionality=result.Hoja1[a].F
            }
            let aacObservations =''
            if(result.Hoja1[a].G != undefined){
                aacObservations=result.Hoja1[a].G
            }
            if(!haveError){
                const dataToSave = new accountingAccountModel({
                    accIdFk: req.params.id,
                    busIdFk: req.query.busId,
                    useIdFk: token.useId,        
                    aacCode: result.Hoja1[a].A,
                    aacName: result.Hoja1[a].B,
                    aacType: result.Hoja1[a].C,
                    aacTypeBalance: result.Hoja1[a].D,
                    aacFuncionality: aacFuncionality,
                    aacObservations: aacObservations,
                    aacStatus: 1,
                    aacMoney: result.Hoja1[a].E,        
                    createdAt: moment(new Date()).format('YYYY-MM-DD'),
                    updateAt: moment(new Date()).format('YYYY-MM-DD')
                });
                dataToSave.save().then(function (error) {
                    if(error){
                        haveError= true                
                        errorText =errorText +'Error al guardar la linea '+linea+' razon'+error.message+' <br> '
                    }
                    
                })
            }
            else{
                haveGeneralError = true
            }
        }

        if(haveGeneralError){
            return res.status(400).json({ message: errorText });   
        }
        else{
            return res.status(200).json({ message: "Se ha procesado con exito." });
        }
        
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
 

}

function activeInactiveAccount(req, res){
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512')

    accountingAccountModel.update({            
            useIdFk: token.useId,        
            aacStatus: req.query.status,    
            updateAt: moment(new Date()).format('YYYY-MM-DD')
        }, {where : {'aacId' :req.params.id}}).then(function () {
        return  res.status(200).json({ message: "Se ha actualizado con exito" });
    })
}



module.exports = {
    viewMantenanceAcco,
    saveAccountingAccount,
    getAccountingAccount,
    getAccountingAccountSearch,
    loadFile,
    activeInactiveAccount,
}