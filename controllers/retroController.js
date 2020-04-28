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
    var errors = []

    if (req.body.selectedTemplate != 0) {
        var template = RetroTemplates.loadTemplates.templates.find(o => o.number == req.body.selectedTemplate);

        console.log(template)
        Retros.create({
            team: req.body.teamID,
            name: req.body.retrospective.trim(),
            retroTemplate: template,
            createdDate: Date.now()

        }, (err, newRetro) => {
            if (err) {
                req.flash('registrationErrors', Object.keys(err.errors).map(key => err.errors[key].message))
                console.log(err)
                return res.redirect('/teams/details/' + req.body.teamID)
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
    } else {
        errors.push('Select a retrospective template')
        req.flash('registrationErrors', errors)
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
    }).populate('members').populate('retrospectives').populate('actionitems.owner').populate('actionitems.retrospective')
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

module.exports.completeRetrospective = (req, res) => {
    console.log('Complete')
    Retros.findById(req.params.id, (err, retro) => {
        retro.updateOne({ $set: { status: 'COMPLETED' } }, (err, result) => {
            if (err) {
                console.log(err)
            }
            else {

                Teams.findOne({ 'retrospectives': retro._id }, (err, team) => {
                    var openActionItems = team.actionitems.filter(a => a.status == 'NEW')
                    retro.updateOne({ actionitems: openActionItems }, (err, result) => {
                        if (err) {
                            console.log(err)
                            res.redirect('/retro/complete/' + retro._id)
                        }else{
                            console.log(result)
                            res.redirect('/retro/complete/' + retro._id)
                        }
                    })
                })

            }
        })
    })
}

module.exports.completedRetro = (req, res) => {
    console.log('Complete')
    Retros.findById(req.params.id, (err, retro) => {
        // console.log(retro)
        // res.render('retrospective_completed.jade', { retro: retro })
    }).populate('attendees').populate('inputs').populate('inputs').exec(function (err, retro) {
        Inputs.populate(retro.inputs, { path: 'user' }, (err, result) => {
            if (err)
                console.log(err)
            //console.log(team.retrospectives.actionitems)
            res.render('retrospective_completed', { retro: retro})

        })
    })
}