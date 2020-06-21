'use strict'

const userModel = require('../models/users')
const menuModel = require('../models/menu')
const rolesProcessesModel = require('../models/rolesProcesses')
const usersRolesModel = require('../models/usersRoles')
const rolesModel = require('../models/roles')

const processesModel = require('../models/processes')
const jwt = require('jwt-simple');
const moment = require('moment')
const crypto = require('crypto')
const tools = require('../config/utils/tools')
const MailServices = require('../config/utils/mailServices')
const mailTemplates = require('../config/utils/emailTemplates')
const fs = require('fs')
const path = require('path');


async function getUsers(req, res) {

  userModel.hasOne(usersRolesModel,{foreignKey:'useIdFk', sourceKey: 'useId'});
  usersRolesModel.hasOne(rolesModel,{foreignKey:'rolId', sourceKey: 'rolIdFK'});
  userModel.findAll({ attributes:['useName','useLogin','usePhone','useId','useStatus'],
    include : [{  attributes:['useIdFk'],
        model: usersRolesModel, 
        required: false,        
        include : [{  attributes:['rolId','rolName'],
          model: rolesModel,
          required: false
      }] 
    }]
  })
  .then(users => {
 

    // console.log(users)
    res.status(200).json({rows:users, total:users.length});
  })
  .catch(err => {
    console.log(err)
    res.status(400).json({message: err});
    
  })
}

function deteleUsers (req, res) {
   userModel.deleteMany({},function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(200);
    });
}

function signup (req, res) {

   // se busca primero para ver si no existe
  return userModel.findAll({where: {'useLogin':req.body.email}}).then(function (userData) {
    if (userData.length>0) {
      console.log('coseguido: usuarui' );
      return res.status(400).json({ message: "El usuario que intenta registrar ya existe.", userData :userData});
    }
    else{
      console.log('guardando: ' + req.body.email);
      const dataToSave = new userModel({
        useLogin: req.body.email,
        useName: req.body.name,
        usePhone: req.body.phone,
        usePassword: encrypt(req.body.password),
        useStatus: 3,
        createdAt: moment(new Date()).format('YYYY-MM-DD'),
        updateAt: moment(new Date()).format('YYYY-MM-DD')
      });
      //se devuelve el usuaurio
      return dataToSave.save().then(function (userSaved) {

        var linkCode = new Date().getTime();
        MailServices.sendMail( {
          subject: "Confirmación de Correo Electrónico",
          to: userSaved.useLogin,
          isText: false,
          msn: mailTemplates.accountConfirmation({
            name: userSaved.useName,
            lastName: "",
            encryptData: tools.encryptData(userSaved.useLogin, 'aes256', "b33dd00", "el link de confirmación de correo.")
          })
        }, function (resp) {
          res.status(200).json({
            message: "Se ha enviado un correo."
          })
        });
        return userSaved
      })
    }
  }).catch(function (err) {
    // en caso de error se devuelve el error
    res.status(400).json({
      message: "Error al crear el usuario."
    })
    console.log('error: ' + err);
    return err
  })

}

function encrypt(password) {
  const shasum = crypto.createHash('sha256')
  shasum.update(password)
  return shasum.digest('hex')
}

function validateAccount(req, res) {

  if (!req.params.token) {
    return res.render('accountConfirmation', {
      isValid: false,
      type: 1
    });
  }

  const dataDecrypted = tools.decryptData(req.params.token, "aes256", "b33dd00", "el link de reinicio de contraseña"),
    // dataToArray = dataDecrypted.split('_'),
    // linkCode = dataToArray[0] || "",
    userID = dataDecrypted;

  userModel.findAll({where: {'useLogin':userID}}).then(function (userData) {
    if (userData.length==0) {
      throw ({
        type: 1
      })
    } else if (userData.useStatus === 1) {
      throw ({
        type: 3
      })
    }
    return userData
  }).then(function (userData) {
    return userModel.update({useStatus :1}, {where : {'useLogin':userID}}).then(function (userUpdated) {
      return userUpdated;
    })
  }).then(function (userData) {
    return res.render('accountConfirmation', {
      isValid: true
    });
  }).catch(function (err) {
    // en caso de error se devuelve el error
    console.log('ERROR: ' + err.type)
    return res.render('accountConfirmation', {
      isValid: false,
      type: err.type
    });
  })
}

function resendMail(req, res) {
  // se busca primero para ver si no existe
  return userModel.findById(req.body.id).then(function (userData) {
    if (!userData) {
      throw ('El usuario que intenta buscar no existe.')
    }
    return userData
  }).then(function (userData) {
    var linkCode = new Date().getTime();
    MailServices.sendMail( {
      subject: "Confirmación de Correo Electrónico",
      to: userData.email,
      isText: false,
      msn: mailTemplates.accountConfirmation({
        name: userData.name,
        lastName: userData.lastName,
        encryptData: tools.encryptData(`${linkCode}_${userData._id}`, 'aes256', "b33dd00", "el link de confirmación de correo.")
      })
    }, function (resp) {
      if (resp.code === 200) {
        res.status(200).json({ message: "Se envió un email al correo indicado, favor verificarlo para continuar!" });
      } else {
        res.status(500).json({ message: "No se pudo enviar el email, favor verificar el email si es el correcto!" });
      }
    });
  }).catch(function (err) {
    // en caso de error se devuelve el error
    console.log('ERROR: ' + err)
    res.status(500).json({
      error: err
    })
  })
}

function createAccount(req, res){
  return res.render('createAccount')
}

function index(req, res){
  return res.render('index')
}

function sign(req, res){
  return res.render('sign')
}


// async function loadFile (req,res){
//     const storage = multer.diskStorage({
//       destination: 'server/public/filesUpload/',
//       filename(req, file, cb) {
//         cb(null, file.originalname)
//       },
//     });
//     const upload = pify(multer({ storage }).single('newFile'))
//     const appDir = path.dirname(require.main.filename);

//     await upload(req, res)

//   var newpath = appDir+'/server/public/filesUpload/'+req.file.originalname
//   xmlReader.readXML(fs.readFileSync(newpath), function(err, data) {
//       if (err) {
//         console.error("erro3 ",err);
//         res.status(500).json({
//         error: err
//       })
//       }
//       console.log("lllegegee1111");
//       //tengo que serialzarlo y procesarlo.
//       var newJson = JSON.parse(parser.toJson(data.content));
//       if(newJson.FacturaElectronica){
//         console.log("to json -> %s", newJson.FacturaElectronica.NumeroConsecutivo);
//         var response = billController.newBill(newJson.FacturaElectronica, sess.user_id,req, res);
//       }
//       else if(newJson.TiqueteElectronico){
//         console.log("to json -> %s", newJson.TiqueteElectronico.NumeroConsecutivo);
//         var response = billController.newBill(newJson.TiqueteElectronico, sess.user_id,req, res);
//       }
      
      
//   });
// }

function logout(req,res){
  global.User ='undefined';
  res.redirect('/contab/index');
}

function accountData(req, res){
  if(req.headers.cookie==undefined){
    throw ('El usuario que intenta buscar no existe.')
  }
  else{
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    res.send(token);
  }
}

function login (req, res) {
  return userModel.findAll({where:{'useLogin': req.body.email, usePassword: encrypt(req.body.password)}}).then(function (userData) {
    if (userData.length> 0) {
      if(userData[0].useStatus==3){
        return res.status(400).json({ message: "El usuario no ha validado la cuenta." });
      }
      else if(userData[0].useStatus==2){
        return res.status(400).json({ message: "El usuario ha sido inactivado." });
      }
      else{                   
          menuModel.hasMany(processesModel,{foreignKey:'menIdFk'});
          processesModel.hasMany(rolesProcessesModel,{foreignKey:'proIdFk'});
          rolesProcessesModel.hasMany(usersRolesModel,{foreignKey:'rolIdFk', sourceKey: 'rolIdFk'});

          menuModel.findAll({attributes: ['menId', 'menName','menIco'],
              include: [{
                model: processesModel,
                required: true,
                include : [{  
                  model: rolesProcessesModel,
                  required: true,
                  include : [{  
                    model: usersRolesModel,                  
                    required: true,
                    where : {'useIdFk':userData[0].useId}
                  }]
                }]
              }]                    
          }).then(menu => {            
            processesModel.findAll({attributes:['proId','proName','proUrl', 'menIdFk'],raw: true,
              include : [{  
                model: rolesProcessesModel,
                required: true,
                include : [{  
                  model: usersRolesModel,                  
                  required: true,
                  where : {'useIdFk':userData[0].useId}
                }]
              }]
          }).then(processes=>{
              let newArrayProcess = new Array();
              for(let a=0; a<processes.length; a++){
                newArrayProcess.push({
                  proId: processes[a].proId,
                  proName: processes[a].proName,
                  menIdFk: processes[a].menIdFk,
                  proUrl: processes[a].proUrl
                })
              }
              let newArrayMenu = new Array();
              for(let a=0; a<menu.length; a++){
                newArrayMenu.push({
                  menId: menu[a].menId,
                  menIco: menu[a].menIco,
                  menName: menu[a].menName
                })
              }                            
              const dataToken = { processes:newArrayProcess,useId:userData[0].useId, useName:userData[0].useName,menu:newArrayMenu}
              const token =  jwt.encode(dataToken,'b33dd00.@','HS256') 
              return res.status(200).json({token});              
            })
          });
          
      }
    }
    else{
      return res.status(400).json({ message: "El usuario o contraseña invalida." });
    }
  });
}

function home(req, res){
  if(controlAccess(req.headers.cookie)){
    res.redirect('/contab/sign');
  }
  else{
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    userModel.findAll({where:{'useId':token.useId}}).then(function (userData) {
      if (userData.length==0) {
        throw ('El usuario que intenta buscar no existe.')
      }
      else{
        return res.render('home' ,{
          userData: userData[0],
          active : 0,
          processes : token.processes,
          menu : token.menu                              
        });         
      }
    });
  }
}

function profile(req, res){
  if(controlAccess(req.headers.cookie)){
    res.redirect('/contab/sign');
  }
  else{
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    userModel.findAll({where:{'useId':token.useId}}).then(function (userData) {
      return res.render('profile' ,{
                            userData: userData[0],
                            active : -1,
                            titlePage : 'Mi cuenta',
                            processes : token.processes,
                            menu : token.menu  
      })
    })
     
  }
  
}


function viewUsers(req, res){
  if(controlAccess(req.headers.cookie)){
    res.redirect('/contab/sign');
  }
  else{
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    rolesModel.findAll().then(function (rolesData) {
      userModel.findAll().then(function (usersData){
        return res.render('viewUsers' ,{
          userData: token,
          active : -1,
          titlePage : 'Administrar Usuarios',
          roles : rolesData,
          users : usersData,
          processes : token.processes,
          menu : token.menu  
        })
      })        
    })    
  }   
  
  
}

function saveRol(req, res){
  if(req.body.userId){
    usersRolesModel.update({rolIdFk :req.body.roles}, {where : {'useIdFK' :req.body.userId}}).then(function (userUpdated) {
      return  res.status(200).json({ message: "Se ha actualizado con exito" , userUpdated: userUpdated});
    })
  }
  else{
    const dataToSave = new usersRolesModel({
      useIdFk: req.body.users,
      rolIdFK: req.body.roles,
      createdAt: moment(new Date()).format('YYYY-MM-DD'),
      updateAt: moment(new Date()).format('YYYY-MM-DD')
    });

    dataToSave.save().then(function (rolSave) {
      return  res.status(200).json({ message: "Se ha actualizado con exito" , rolSave: rolSave});
    })
  }

}

function changeStatus(req, res){
  if(controlAccess(req.headers.cookie)){
    res.redirect('/contab/sign');
  }
  else{
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    let useStatus = 1
    if(req.query.status ==1){
      useStatus = 2
    }
    userModel.update({useStatus :useStatus}, {where :{'useId':req.query.useId}}).then(function(){
      return  res.status(200).json({ message: "Se ha actualizado con exito" });
    })
  }
}

function controlAccess(dataCookie){
  let ingresa = true
  if(dataCookie==undefined){
    ingresa = false
  }
  else if(!dataCookie.search("userData")){
    ingresa = false
  }

  return ingresa
}

module.exports = {
  login,
  signup,
  // updateUser,
  validateAccount,
  resendMail,
  createAccount,
  getUsers,
  deteleUsers,
  index,
  sign,
  logout,
  accountData,
  home,
  profile,
  viewUsers,
  saveRol,
  changeStatus,
  controlAccess
}