'use strict'


const businessModel = require('../models/business')
const usersModel = require('../models/users')
const businessUsersPermitModel = require('../models/businessUsersPermit')
const accountingCatalogModel = require('../models/accountingCatalog')


const moment = require('moment')


function viewAsignPermit(req, res){
    if(global.User == undefined){
        res.redirect('/contab/sign');
    }
    else{   
        if (global.User.length==0) {
            throw ('El usuario que intenta buscar no existe.')
        }
        else{
            businessModel.findAll({where:{'useIdFK': global.User[0].useId}}).then( business => {
                usersModel.findAll().then(function (usersData){
                    return res.render('viewAssigPermit' ,{
                    userData:global.User[0],
                    active : -1,
                    titlePage : 'Administrar Usuarios',
                    business : business,
                    users : usersData,
                    })
                })        
            })    
        }   
    }
}

function saveAsignPermit(req, res){    
    const dataToSave = new businessUsersPermitModel({
        accIdFk: req.body.accId,
        useIdFkOwner: global.User[0].useId,
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
    }).then( businessUsersPermit => { 
        return res.status(200).json({rows: businessUsersPermit, total:businessUsersPermit.length});
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