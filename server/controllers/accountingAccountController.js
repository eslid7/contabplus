const businessModel = require('../models/business')
const usersModel = require('../models/users')
const deleteAccountingAccountModel = require('../models/deleteAccountingAccount');
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
                    active : 2,
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
            if(accountingAccountRaiz || req.body.aacNivelBefore == '' || req.body.levelToSave == 1){
                accountingAccountModel.update({            
                        useIdFk: token.useId,        
                        aacCode: aacCodeToSave, //??? realizar las validaciones
                        aacName: req.body.aacName.toUpperCase(),
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
            if(accountingAccountRaiz || req.body.aacNivelBefore == '' || req.body.levelToSave == 1){
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
                            aacName: req.body.aacName.toUpperCase(),
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

    let orderBy =[['aacCode','ASC']]
    if(typeof(req.query.sort) !== "undefined" && req.query.sort !== ''){
        orderBy =[[`${req.query.sort}`,`${req.query.order}`]]
    }
    
    if(typeof(req.query.offset) !== "undefined" && req.query.offset !== ''){
        offsetData = req.query.offset
    }
    if(typeof(req.query.limit) !== "undefined" && req.query.limit !== ''){
        limitData = req.query.limit
    }
    if(typeof(req.query.search) !== "undefined" && req.query.search !== ''){
        dataToSearch = req.query.search
        dataToSearch = dataToSearch.replace('*','')
        console.log(req.query.search.charAt(req.query.search.length))    
        if(req.query.search.charAt((req.query.search.length-1))=='*'){
            console.log(req.query.search.charAt(req.query.search.length))            
            likeData=[{'aacName': {[sequelize.Op.like]: `${dataToSearch}%`}}, {'aacCode': {[sequelize.Op.like]: `${dataToSearch}%`}}]
        }
        else if(req.query.search.charAt(0)=='*'){
            likeData=[{'aacName': {[sequelize.Op.like]: `%${dataToSearch}`}}, {'aacCode': {[sequelize.Op.like]: `%${dataToSearch}`}}]
        }
        else{
            likeData=[{'aacName': {[sequelize.Op.like]: `%${req.query.search}%`}}, {'aacCode': {[sequelize.Op.like]: `%${req.query.search}%`}}]
        }        
    }


    if(typeof(req.query.search) !== "undefined" && req.query.search !== ''){
        accountingAccountModel.findAll({where: {'accIdFk': req.params.id,[sequelize.Op.or]: likeData}}).then( accountingAccountTotal => { 
            accountingAccountModel.findAll({where: {'accIdFk': req.params.id,
                [sequelize.Op.or]: likeData
            },
            offset: (offsetData*1),
            limit : (limitData*1), order :orderBy}).then( accountingAccount => { 
                return res.status(200).json({rows: accountingAccount, total:accountingAccountTotal.length});
            })
        })

    }
    else{
        accountingAccountModel.findAll({where: {'accIdFk': req.params.id}}).then( accountingAccountTotal => { 
            accountingAccountModel.findAll({where: {'accIdFk': req.params.id},  offset: (offsetData*1),limit : (limitData*1) , order :orderBy}).then( accountingAccount => { 
                return res.status(200).json({rows: accountingAccount, total:accountingAccountTotal.length});
            })
        })
    }


}
async function getAccountingAccountSearch(req, res){
    const accountingAccount  = await accountingAccountModel.findOne({where: {'accIdFk': req.params.id,'aacCode': req.query.aacCode}})    
    // necesito si es un nivel 2 devolver el data de nivel 1
    if(req.query.levelToSave!= undefined&& req.query.levelToSave>1){
        const accountingAccountRaizPrevios = await accountingAccountModel.findOne({attributes:['aacType'], where: {'accIdFk': req.params.id, 'aacCode': req.query.aacNivelBefore}}) 
        accountingAccountModel.findOne({attributes:['aacType'],where: {'accIdFk': req.params.id,'aacCode': req.query.aacNivelFirst}}).then( accountingAccountRaiz => {                 
            return res.status(200).json({accountingAccount, accountingAccountRaiz, accountingAccountRaizPrevios});
        })
    }
    else{
        return res.status(200).json({accountingAccount, accountingAccountRaiz: null, accountingAccountRaizPrevios: null});
    }
        
}

async function loadFile (req,res){
    var d = new Date();
    newFileName= d.getTime()
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512')

    try {
        let haveGeneralError= false
        let haveExito = false
        let errorText =''
        let messageText = ''
        const storage = multer.diskStorage({
            destination: 'server/public/filesUpload/',
            filename(req, file, cb) {
              cb(null, newFileName+file.originalname)
            },
        });
        const upload = pify(multer({ storage }).single('newFile'))
        const appDir = path.dirname(require.main.filename);
    
        await upload(req, res)
    
        var newpath = appDir+'/server/public/filesUpload/'+newFileName+req.file.originalname
        const result = excelToJson({
            source: fs.readFileSync(newpath)  
        });

        if(result.Hoja1==undefined){
            haveGeneralError= true
            errorText =errorText +'El nombre de la hoja es distinto, debe llamarse Hoja1 <br> ' 
        }
        else{
                
            // busco el catalogo
            const accountCatalog = await accountingCatalogModel.findOne({where: {'accId': req.params.id}}) 

            const jsonData = JSON.parse(accountCatalog.accNivels)
            let nivel1= jsonData.accNivel1*1
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
                //console.log(result.Hoja1[a].A) //  2 validar que tenga papa si es el caso 
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
                //validar que el separador sea el indicado
                let haveSeparator = false
                if(dataMask.includes(accountCatalog.accSeparator) ){
                    haveSeparator= true
                }
                dataMask = dataMask.replace(new RegExp(accountCatalog.accSeparator, 'g'),'')                   
                // console.log('dataMask', dataMask)
                for(var c=0;  c<dataMask.length; c++){	
                    if(nivel1==(c+1)||nivel2==(c+1)||nivel3==(c+1)||nivel4==(c+1)||nivel5==(c+1)||nivel6==(c+1)||nivel7==(c+1)||nivel8==(c+1)||nivel9==(c+1)||nivel10==(c+1)||nivel11==(c+1)||nivel12==(c+1)){                    
                        newDataWithMask = newDataWithMask+dataMask.charAt(c)	
                        if(nivel1==(c+1)){
                            aacNivelFirst= newDataWithMask
                        }
                        levelToSave = levelToSave+1
                        if(c<(dataMask.length-1)){
                            aacNivelBefore= newDataWithMask
                            newDataWithMask =newDataWithMask+accountCatalog.accSeparator 
                        }                            
                    }
                    else{
                        newDataWithMask = newDataWithMask+dataMask.charAt(c)		
                    }	            															                                        
                }
                // console.log('newDataWithMask',newDataWithMask)
                // console.log('aacNivelBefore',aacNivelBefore)
                if(!haveSeparator && levelToSave >1){
                    haveError= true
                    errorText =errorText +'El separador del código de la cuenta en la linea '+linea+' no es el indicado a usar. <br> '
                } 
            
                if(
                    (levelToSave == 1 && jsonData.accNivel1!=dataMask.length) 
                    || (levelToSave == 2 && nivel2!=dataMask.length)|| (levelToSave == 3 && nivel3!=dataMask.length)|| (levelToSave == 4 && nivel4!=dataMask.length)
                    || (levelToSave == 5 && nivel5!=dataMask.length)|| (levelToSave == 6 && nivel6!=dataMask.length)|| (levelToSave == 7 && nivel7!=dataMask.length)
                    || (levelToSave == 8 && nivel8!=dataMask.length)|| (levelToSave == 9 && nivel9!=dataMask.length)|| (levelToSave == 10 && nivel10!=dataMask.length)
                    || (levelToSave == 11 && nivel11!=dataMask.length)|| (levelToSave == 12 && nivel12!=dataMask.length)
                    ){
                    console.log('dataMask.length',dataMask.length)
                    console.log('levelToSave',levelToSave)
                    
                    haveError= true
                    errorText =errorText +'El tamaño del código de la cuenta en la linea '+linea+' no tiene la longitud requerida <br> '
                }
                ///codigo cuenta 1 validar que no existe,
                const  accountingAccount = await accountingAccountModel.findOne({where: {'accIdFk':req.params.id,'aacCode': result.Hoja1[a].A}})                          
                if(accountingAccount!=undefined){
                    haveError= true
                    errorText =errorText +'El código de la cuenta '+result.Hoja1[a].A+' en la linea '+linea+' ya existe <br> '
                }

                // verificar la cuenta padre
                if(levelToSave>1){
                    // console.log("aacNivelBefore",aacNivelBefore)
                    let accountingAccountRaiz = await accountingAccountModel.findOne({where: {'accIdFk': req.params.id,'aacCode': aacNivelBefore}})
                    if(accountingAccountRaiz==undefined){
                        haveError= true
                        errorText =errorText +'El código de la cuenta '+result.Hoja1[a].A+' en la linea '+linea+', la cuenta raiz no existe <br> '
                    }
                }
                // console.log(result.Hoja1[a].B) //nombre
                if(result.Hoja1[a].B== undefined){
                    haveError= true
                    errorText =errorText +'El nombre de la cuenta en la linea '+linea+' es requerido <br> '
                }
                // console.log(result.Hoja1[a].C) // Tipo de cuenta
                if(result.Hoja1[a].C== undefined){
                    haveError= true
                    errorText =errorText +'El tipo de la cuenta en la linea '+linea+' es requerido <br> '
                }
                // valida que el tipo de cuenta no sea diferente                
                if(levelToSave>1){
                    let accountingAccountMother = await accountingAccountModel.findOne({where: {'accIdFk': req.params.id,'aacCode': aacNivelFirst}})
                    if(accountingAccountMother!=undefined && accountingAccountMother.aacType!=result.Hoja1[a].C){
                        haveError= true
                        errorText =errorText +'El tipo de cuenta en la linea '+linea+', la cuenta raiz tiene un tipo de cuenta distinto al ingresado, favor revisar. <br> '
                    }
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
                // console.log(result.Hoja1[a].D) // Tipo de saldo 1=Deudor 2= Acreedor
                if(result.Hoja1[a].D== undefined){
                    haveError= true
                    errorText =errorText +'El tipo de saldo de la cuenta en la linea '+linea+' es requerido <br> '
                }
                if(result.Hoja1[a].D!= 1&&result.Hoja1[a].D!= 2){
                    haveError= true
                    errorText =errorText +'El valor tipo de saldo de la cuenta en la linea '+linea+' es invalido <br> '
                }
                // console.log(result.Hoja1[a].E) // Moneda 1= Colon 2= Dolar
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

                    const letDataToSave = await dataToSave.save()                
                    if(letDataToSave!=undefined){
                        haveExito= true                
                        messageText =messageText +'La linea '+linea+' se guardo exitosamente. <br> '
                    }
                }
                else{
                    haveGeneralError = true
                }
            }
        }

        if(haveGeneralError){
            if(haveExito){
                errorText = errorText+messageText
            }
            return res.status(400).json({ message: errorText });   
        }
        else{
            return res.status(200).json({ message: messageText });
        }
        
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
 

}

async function activeInactiveAccount(req, res){
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512')
    // Buscar el catalogo
    const accountCatalog = await accountingCatalogModel.findOne({where: {'accId': req.params.id}}) 
    let accountRaiz =''
    let haveErrorRaizInative = false
    if(req.query.status==1 && accountCatalog.accSeparator){
        let dataArray = req.query.aacCode.split(accountCatalog.accSeparator)
        for(i=0; i<(dataArray.length-1); i++ ){
            if(i==0){
                accountRaiz = dataArray[i]
            }
            else{
                accountRaiz = accountRaiz+accountCatalog.accSeparator+dataArray[i]
            }
            console.log('accountRaiz', accountRaiz)
            let  accountingAccountRaiz = await accountingAccountModel.findOne({where: {'accIdFk':req.params.id,'aacCode': accountRaiz}})                          
            if(accountingAccountRaiz.aacStatus==0){
                haveErrorRaizInative= true   
                break                                             
            }
        }
        if(haveErrorRaizInative){
            errorText = 'La cuenta '+req.query.aacCode+' la raiz '+accountRaiz+' esta inactiva. Se debe activar la raíz. <br> '
            return  res.status(400).json({ message: errorText });
        }
    }
    if(!haveErrorRaizInative){
        accountingAccountModel.update({            
                useIdFk: token.useId,        
                aacStatus: req.query.status,    
                updateAt: moment(new Date()).format('YYYY-MM-DD')
            }, {where : {'accIdFk': req.params.id, 'aacCode': {[sequelize.Op.like]: `${req.query.aacCode}%`}}}).then(function () {
            return  res.status(200).json({ message: "Se ha actualizado con exito" });
        })
    }
}

function viewActiInacAcco(req, res){
    if(usersController.controlAccess(req.headers.cookie)){
        res.redirect('/contab/sign');
    }
    else{
        let data = req.headers.cookie.split("=");
        const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
        businessModel.findAll({where:{'useIdFK': token.useId}}).then( business => {
            usersModel.findAll().then(function (usersData){
                return res.render('viewActiInacAcco' ,{
                    userData: token,
                    active : 2,
                    titlePage : 'Activar o Inactivar cuentas',
                    business : business,
                    users : usersData,
                    processes : token.processes,
                    menu : token.menu
                })
            })        
        })    
          
    }
}

async function loadFileActiveInactive(req,res){
    var d = new Date();
    console.log(d.getTime())
    newFileName= d.getTime()
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512')

    try {
        let haveGeneralError= false
        let errorText =''
        let quantitiProcess =0
        const storage = multer.diskStorage({
            destination: 'server/public/filesUpload/',
            filename(req, file, cb) {
              cb(null, newFileName+file.originalname)
            },
        });
        const upload = pify(multer({ storage }).single('newFile'))
        const appDir = path.dirname(require.main.filename);
    
        await upload(req, res)
    
        var newpath = appDir+'/server/public/filesUpload/'+newFileName+req.file.originalname
        // console.log(newpath)
        const result = excelToJson({
            source: fs.readFileSync(newpath)  
        });

        if(result.Hoja1==undefined){
            haveGeneralError= true
            errorText =errorText +'El nombre de la hoja es distinto, debe llamarse Hoja1 <br> ' 
        }
        else{
            if(result.Hoja1.length==1){
                haveGeneralError= true
                errorText =errorText +'No hay datos por guardar <br> ' 
            }
            // Buscar el catalogo
            const accountCatalog = await accountingCatalogModel.findOne({where: {'accId': req.params.id}}) 

            for(a=1; a<result.Hoja1.length; a++){
                let haveError= false
                linea = a+1
                //console.log(result.Hoja1[a].A) //  2 validar que tenga papa si es el caso 
                if(result.Hoja1[a].A== undefined){
                    haveError= true
                    errorText =errorText +'El código de la cuenta en la linea '+linea+' es requerido <br> '
                }
                ///codigo cuenta 1 validar que no existe,
                const  accountingAccount = await accountingAccountModel.findOne({where: {'accIdFk':req.params.id,'aacCode': result.Hoja1[a].A}})                          
                if(accountingAccount==undefined){
                    haveError= true
                    errorText =errorText +'El código de la cuenta '+result.Hoja1[a].A+' en la linea '+linea+' no existe <br> '
                }
                // si se va activar debo revisar antes que no haya una madre inactiva
                // 001-002-002 no deben estar inactivar 001  y 001-002
                // hacer un split del caracter separador si aplica sino....

                if(req.query.aacStatus==1 && accountCatalog.accSeparator){
                    let dataArray = result.Hoja1[a].A.split(accountCatalog.accSeparator)
                    console.log(dataArray)
                    let accountRaiz =''
                    let haveErrorRaizInative = false
                    for(i=0; i<(dataArray.length-1); i++ ){
                        if(i==0){
                            accountRaiz = dataArray[i]
                        }
                        else{
                            accountRaiz = accountRaiz+accountCatalog.accSeparator+dataArray[i]
                        }
                        
                        let  accountingAccountRaiz = await accountingAccountModel.findOne({where: {'accIdFk':req.params.id,'aacCode': accountRaiz}})                          
                        if(accountingAccountRaiz.aacStatus==0){
                            haveErrorRaizInative= true   
                            break                                             
                        }
                    }
                    if(haveErrorRaizInative){
                        haveError= true
                        errorText =errorText +'La cuenta '+result.Hoja1[a].A+' en la linea '+linea+' la raiz esta inactiva. <br> '
                    }
                }
                if(!haveError){
                    accountingAccountModel.update({            
                            useIdFk: token.useId,        
                            aacStatus: req.query.aacStatus,    
                            updateAt: moment(new Date()).format('YYYY-MM-DD')
                        }, {where : {'aacCode': {[sequelize.Op.like]: `${result.Hoja1[a].A}%`}}}).then(function () {
                        quantitiProcess =quantitiProcess+1
                    })
                }
                else{
                    haveGeneralError = true 
                }
            }
        }
        
        if(haveGeneralError){
            return res.status(400).json({ message: errorText });   
        }
        else{
            return res.status(200).json({ message: "Se ha procesado con exito." });
        }
    }
    catch (error){
        return res.status(400).json({ message: error.message });
    }
}

async function deleteAccount(req,res){
    //validar que no tenga movimientos registrados///////
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    
    let  accountingAccount = await accountingAccountModel.findOne({where: {'aacId':req.params.id}})                          

    //validar que no tenga hijas
    let  accountingAccountOthers = await accountingAccountModel.findAll({where: {'accIdFk':accountingAccount.accIdFk,'aacCode': {[sequelize.Op.like]: `${accountingAccount.aacCode}%`}}})                          

    if(accountingAccountOthers.length>1){        
        errorText = 'La cuenta '+accountingAccount.aacCode+' tiene subcuentas asignadas, no se puede eliminar. <br> '
        return  res.status(400).json({ message: errorText });
    }
    else{
        
        const dataToSave = new deleteAccountingAccountModel({
            accIdFk: accountingAccount.accIdFk,
            busIdFk: accountingAccount.busIdFk,
            useIdFk: token.useId,        
            aacCode: accountingAccount.aacCode,
            aacName: accountingAccount.aacName,      
            createdAt: moment(new Date()).format('YYYY-MM-DD'),
            updateAt: moment(new Date()).format('YYYY-MM-DD')
        });
        dataToSave.save().then(function () {
            accountingAccountModel.destroy({where: {'aacId':req.params.id}}).then(function(){
                return res.status(200).json({ message: "Se ha eliminar con exito." });
            })
        })
    }        
}

module.exports = {
    viewMantenanceAcco,
    saveAccountingAccount,
    getAccountingAccount,
    getAccountingAccountSearch,
    loadFile,
    activeInactiveAccount,
    viewActiInacAcco,
    loadFileActiveInactive,
    deleteAccount,
}