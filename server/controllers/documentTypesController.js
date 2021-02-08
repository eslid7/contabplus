'use strict'

const documentTypesModel = require('../models/documentTypes')
const businessModel = require('../models/business');
const definedAccCatMonthModel = require('../models/definedAccontingCatMonth');
const usersController = require('../controllers/usersController')
const moment = require('moment');
const sequelize = require('sequelize');
const jwt = require('jwt-simple');

function viewTypesDocuments(req, res){
  if(usersController.controlAccess(req.headers.cookie)){
    res.redirect('/contab/sign');
  }
  else{
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    businessModel.findAll({where:{'useIdFK': token.useId}}).then( business => {
      return res.render('viewTypesDocuments' ,{
        active : 3,
        userData: token,
        titlePage : 'Tipo de Documentos',
        processes : token.processes,
        menu : token.menu,  
        business: business
      })
    })   
  }   
}

function getListTypesDocuments(req,res){
  let data = req.headers.cookie.split("=");
  const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
  let orderBy =[['docCode','ASC']]  
  if(typeof(req.query.sort) !== "undefined" && req.query.sort !== 'accName'){
      orderBy =[[`business`,`accName`,`${req.query.order}`]]
  }
  documentTypesModel.hasOne(businessModel,{foreignKey:'busId',sourceKey: 'busIdFk'});
  if(typeof(req.query.search) !== "undefined" && req.query.search !== ''){  
    let likeData =  [{'docCode': {[sequelize.Op.like]: `%${req.query.search}%`}},{'docName': {[sequelize.Op.like]: `%${req.query.search}%`}},{'$business.busName$': {[sequelize.Op.like]: `%${req.query.search}%`}}]  
    documentTypesModel.findAll({where:{'useIdFK': token.useId,
        [sequelize.Op.or]: likeData
        },
        include: [{  
            model: businessModel,
            required: true,
        }] 
        , order: orderBy    
    }).then( documentTypesCatalog =>{        
        return res.status(200).json({rows: documentTypesCatalog, total:documentTypesCatalog.length});
    })
  }
  else{
    documentTypesModel.findAll({where:{'useIdFK': token.useId },
        include: [{  
            model: businessModel,
            required: true,
        }] 
        , order: orderBy    
    }).then( documentTypesCatalog =>{        
        return res.status(200).json({rows: documentTypesCatalog, total:documentTypesCatalog.length});
    })
  }
}

function saveDocumentType(req, res){
  let data = req.headers.cookie.split("=");
  const token =  jwt.decode(data[1],'b33dd00.@','HS512') 

  if(req.body.docId > 0){
    documentTypesModel.update({                            
        docCode: req.body.docCode,
        docName: req.body.docName.toUpperCase(),
        updateAt: moment(new Date()).format('YYYY-MM-DD')
    }, {where : {'docId' :req.body.docId}}).then(function () {
      return  res.status(200).json({ message: "Se ha actualizado con exito" });
    })
  }
  else{
    const dataToSave = new documentTypesModel({
        busIdFk: req.body.busId,
        useIdFk: token.useId,
        docCode: req.body.docCode,
        docName: req.body.docName.toUpperCase(),
        createdAt: moment(new Date()).format('YYYY-MM-DD'),
        updateAt: moment(new Date()).format('YYYY-MM-DD')
    });

    return dataToSave.save().then(function () {
        res.status(200).json({ message: "Se ha creado con exito" });
    })
  }
}
function getListTypesDocumentsByBussines(req,res){
  // que la validacion de si hay o no este el catalogo para ese periodo este en el form
  //definedAccCatMonthModel.findOne({where: {'busIdFk': req.params.id, 'month': Number(req.query.month) ,'year': req.query.year}}).then( documentTypesCatalog =>{        
    // if(documentTypesCatalog){  
      documentTypesModel.findAll({where:{'busIdFk': req.params.id }}).then( documentTypesCatalog =>{        
        return res.status(200).json({documentTypesCatalog: documentTypesCatalog});
      })
    // }
    // else{
    //   return res.status(200).json({documentTypesCatalog: null});
    // }
  //})
}
module.exports = {
  viewTypesDocuments,
  getListTypesDocuments,
  saveDocumentType,
  getListTypesDocumentsByBussines
}