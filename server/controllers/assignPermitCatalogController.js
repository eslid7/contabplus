'use strict'


const businessModel = require('../models/business')
const usersModel = require('../models/users')
const businessUsersPermitModel = require('../models/businessUsersPermit')
const accountingCatalogModel = require('../models/accountingCatalog')
const jwt = require('jwt-simple');
const sequelize = require('sequelize');
const moment = require('moment')


function viewAsignPermit(req, res){
    if(req.headers.cookie==undefined){
        res.redirect('/contab/sign');
    }
    else{
        let data = req.headers.cookie.split("=");
        const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
        businessModel.findAll({where:{'useIdFK': token.useId}}).then( business => {
            usersModel.findAll().then(function (usersData){
                return res.render('viewAssigPermit' ,{
                    userData: token,
                    active : -1,
                    titlePage : 'Asignar permisos',
                    business : business,
                    users : usersData,
                    processes : token.processes,
                    menu : token.menu 
                })
            })        
        })    
          
    }
}

function saveAsignPermit(req, res){    
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    const dataToSave = new businessUsersPermitModel({
        accIdFk: req.body.accId,
        useIdFkOwner: token.useId,
        useIdFk: req.body.useId,
        busIdFk: req.body.busId,
        permitId: req.body.permitId,
        createdAt: moment(new Date()).format('YYYY-MM-DD'),
        updateAt: moment(new Date()).format('YYYY-MM-DD')
    });
    dataToSave.save().then(function () {
        return res.status(200).json({message: "Se ha creado con exito" });
    })
}

function assignHistory(req, res){
    let data = req.headers.cookie.split("=");
    const token =  jwt.decode(data[1],'b33dd00.@','HS512') 
    let likeData = []
    let offsetData =0
    let limitData =10
    if(typeof(req.query.offset) !== "undefined" && req.query.offset !== ''){
        offsetData = req.query.offset
    }
    if(typeof(req.query.limit) !== "undefined" && req.query.limit !== ''){
        limitData = req.query.limit
    }
    /// mis empresas?
    businessUsersPermitModel.hasOne(accountingCatalogModel,{foreignKey:'accId',sourceKey: 'accIdFk'});
    businessUsersPermitModel.hasOne(usersModel,{foreignKey:'useId',sourceKey: 'useIdFk'});
    businessUsersPermitModel.hasOne(businessModel,{foreignKey:'busId',sourceKey: 'busIdFk'});
    businessUsersPermitModel.findAll({where: {'busIdFk': req.params.id},
        include: [{
            model: accountingCatalogModel,
            require : true
        },
        {
            model: usersModel,
            require : true
        },
        {
            model: businessModel,
            require : true
        },
    ]
    }).then( businessUsersPermitAll => { 
        if(typeof(req.query.search) !== "undefined" && req.query.search !== ''){
            likeData=[{'$accountingCatalog.accName$': {[sequelize.Op.like]: `%${req.query.search}%`}}, {'$user.useName$': {[sequelize.Op.like]: `%${req.query.search}%`}}]
                businessUsersPermitModel.findAll({where: {'busIdFk': req.params.id, [sequelize.Op.or]: likeData},
                    include: [{
                        model: accountingCatalogModel,
                        require : true
                    },
                    {
                        model: usersModel,
                        require : true
                    },
                    {
                        model: businessModel,
                        require : true
                    },
                ],
                offset: (offsetData*1),
                limit : (limitData*1),
                }).then( businessUsersPermit => { 
                    return res.status(200).json({rows: businessUsersPermit, total:businessUsersPermitAll.length});
                })            
        }
        else{
            businessUsersPermitModel.findAll({where: {'busIdFk': req.params.id},
                include: [{
                    model: accountingCatalogModel,
                    require : true
                },
                {
                    model: usersModel,
                    require : true
                },
                {
                    model: businessModel,
                    require : true
                },
            ],
            offset: (offsetData*1),
            limit : (limitData*1),
            }).then( businessUsersPermit => { 
                return res.status(200).json({rows: businessUsersPermit, total:businessUsersPermitAll.length});
            })
        }  
    })     
   
    
}

function deleteAssignHistory(req, res){
    businessUsersPermitModel.destroy({where: {'bupId': req.params.id}}).then(function(){
        return res.status(200).json({message: 'Elminado exitosamente'});
    })
}

module.exports = {
    viewAsignPermit,
    saveAsignPermit,
    assignHistory,
    deleteAssignHistory,
}