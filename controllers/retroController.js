const Teams = require('../database/models/Teams')
const Retros = require('../database/models/Retrospectives')
const Inputs = require('../database/models/Inputs')
const Users = require('../database/models/Users')
const RetroTemplates = require('../templates/templates_list')




//LOAD CREATE PAGE
module.exports.create = (req, res) => {
    Retros.find({}, (err, retrosResult) => {
        return res.render('retro_create', { pageTitle: 'Create Retrospective', retros: result })
    })
}

//CREATE NEW RETROSPECTIVE
module.exports.save = (req, res) => {
    console.log('Team ID: ' + req.body.teamID)
    console.log(req.body.selectedTemplate)

    if(req.body.selectedTemplate != 0){
        var template = RetroTemplates.loadTemplates.templates.find(o => o.number == req.body.selectedTemplate);
    
        console.log(template)
        Retros.create({
            team: req.body.teamID,
            name: req.body.retrospective.trim(),
            retroTemplate: template,
            createdDate: Date.now()
    
        }, (err, newRetro) => {
            if (err) {
                console.log(err)
                return res.redirect('/teams')
            }
            else {
                Teams.findById((req.body.teamID), (err, team) => {
                    team.updateOne({ $push: { retrospectives: newRetro } }, (err, result) => {
                        if (err)
                            console.log(err)
                        else
                            res.redirect('/teams/details/' + team._id)
                    })
                })
            }
        })
    }else{
        res.redirect('/teams/details/' + req.body.teamID)
    }
    

}

module.exports.live = (req, res) => {
    Teams.findOne({ retrospectives: req.params.id }, (err, team) => {
        console.log('Team Retro: ')
        Retros.findById(req.params.id, (err, retro) => {
            if (err)
                console.log(err)
        }).populate('participants').populate('inputs').exec(function (err, retro) {
            Inputs.populate(retro.inputs, { path: 'user' }, (err, result) => {
                if (err)
                    console.log(err)
                //console.log(team.retrospectives.actionitems)
                res.render('retrospective', { retro: retro, team: team })

            })
        })
    }).populate('members').populate('retrospectives').populate('actionitems.owner')
}

module.exports.nextStep = (req, res) => {
    Retros.findById(req.params.id, (err, retro) => {
        if (retro.status == 'NEW') {
            retro.updateOne({ $set: { status: 'INPROGRESS' } }, (err, result) => {
                if (err)
                    console.log(err)
            })
        }
        else if (retro.status == 'INPROGRESS') {
            retro.updateOne({ $set: { status: 'REVIEW' } }, (err, result) => {
                if (err)
                    console.log(err)
            })
        }
        else if (retro.status == 'REVIEW') {
            retro.updateOne({ $set: { status: 'COMPLETED' } }, (err, result) => {
                if (err)
                    console.log(err)
            })
        }
        res.redirect('/retro/live/' + retro._id)

    })
}

module.exports.previousStep = (req, res) => {
    Retros.findById(req.params.id, (err, retro) => {
        if (retro.status == 'COMPLETED') {
            retro.updateOne({ $set: { status: 'REVIEW' } }, (err, result) => {
                if (err)
                    console.log(err)
            })
        }
        else if (retro.status == 'REVIEW') {
            retro.updateOne({ $set: { status: 'INPROGRESS' } }, (err, result) => {
                if (err)
                    console.log(err)
            })
        }
        else if (retro.status == 'INPROGRESS') {
            retro.updateOne({ $set: { status: 'NEW' } }, (err, result) => {
                if (err)
                    console.log(err)
            })
        }
        res.redirect('/retro/live/' + retro._id)
    })
}