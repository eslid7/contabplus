'use strict'

const userModel = require('../models/users')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const crypto = require('crypto')
const tools = require('../config/utils/tools')
const MailServices = require('../config/utils/mailServices')
const mailTemplates = require('../config/utils/emailTemplates')
const fs = require('fs')
const path = require('path');

var sess;

function updateUser(req, res) {
  console.log('here')
  userModel.update(
    { _id: "59cebae00016b06026ce9eb4" },
    { $set: {
      token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5Y2ViYWUwMDAxNmIwNjAyNmNlOWViNCJ9.ZJVI_d4c4gC4JTd-Teiswx--4sWAa-TjYTwMKxwdM7Y"
    }}
  );
}

async function getUser(req, res) {

  // const userModel=await UserModel.findOne({
  //     where: {
  //       'useLogin':'eslid1@gmial.com'
  //     }
  //   });
  // console.log(userModel);

  // body...

    // userModel.find(({ attributes: ['useId', 'useName', 'useLogin', 'usePassword'] },function (err, users) {
    //     res.send(users);
    // });

  // userModel.findAll().then(users => {
  //     console.log(users);
  //   res.status(200).json({users});
  // });

  userModel.findAll()
  .then(users => {
    console.log(users)
    res.status(200).json({users});
  })
  .catch(err => {
    console.log(err)
    res.status(400).json({message: err});
    
  })
}


function login (req, res) {
  return userModel.findAll({'useLogin': req.body.email, usePassword: encrypt(req.body.password)}).then(function (userData) {
    if (userData.length> 0) {
      if(userData[0].useStatus==3){
        return res.status(400).json({ message: "El usuario no ha validado la cuenta." });
      }
      else if(userData[0].useStatus==2){
        return res.status(400).json({ message: "El usuario ha sido inactivado." });
      }
      else{
          global.User = userData;
          console.log(userData[0].useStatus);                   
          res.status(200).json({userData})
      }
    }
    else{
      return res.status(400).json({ message: "El usuario o contraseña invalida." });
    }
  });
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
  if (typeof sess !== 'undefined' && sess.email!=''){
    sess.email = '';
  }
  req.logout()
    res.redirect('/contab/index');
}


function viewAccount(req, res){
  if (typeof sess !== 'undefined' && sess.email!=''){
    return res.render('account')
  }
  else{
    res.redirect('/contab/index');
  }
}

function accountData(req, res){
  userModel.findById(global.User.useId).then(function (userData) {
    if (!userData) {
      throw ('El usuario que intenta buscar no existe.')
    }
    res.send(userData);
  });
}

function home(req, res){
  console.log(global.User)

  if(global.User == undefined){
     res.redirect('/contab/index');
  }
  else{
    userModel.findAll({'useId':global.User.useId}).then(function (userData) {
      if (userData.length==0) {
        throw ('El usuario que intenta buscar no existe.')
      }
      else{

        //Debo hacer una funcion que devuelva el menu

        return res.render('home' ,{
                            userData:userData[0]
                          })
      }   
    });
  }
  
}

module.exports = {
  login,
  signup,
  updateUser,
  validateAccount,
  resendMail,
  createAccount,
  getUser,
  deteleUsers,
  index,
  sign,
  logout,
  accountData,
  home
}