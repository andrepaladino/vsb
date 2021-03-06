const Teams = require('../database/models/Teams')
const Users = require('../database/models/Users')
const RetroTemplates = require('../templates/templates_list')
const cloudinary = require('cloudinary')

//GET LIST OF TEAMS
module.exports.list = (req, res) => {
    Teams.find({ members: req.session.user._id }, (err, result) => {
        if (err)
            console.log(err)
        else
            return res.render('team_list', { list: result })
    })

}

//LOAD CREATE PAGE
module.exports.create = (req, res) => {
    return res.render('team_create', { pageTitle: 'Create Team', errors: req.flash('registrationErrors') })
}

//CREATE NEW TEAM
module.exports.save = (req, res) => {
    var saveFileName = ''
    if (typeof req.file === 'undefined') {
        saveFileName = '/images/team_default.png'
    } else {
        cloudinary.v2.uploader.upload(req.file.path, { folder: process.env.ENVIRONMENT + '/TEAM' }, (err, result) => {
            if(err){
                console.log(err)
            }else{
                saveFileName = result.secure_url
            }
        })
    }

    Teams.create({
        name: req.body.name.trim(),
        description: req.body.description.trim(),
        image: saveFileName,
        leader: [req.session.user._id],
        members: [req.session.user._id],
        createdBy: req.session.user._id,
        createdDate: Date.now(),
        updatedBy: req.session.user._id,
        updatedDate: Date.now()
    }, (err, result) => {
        if (err) {
            req.flash('registrationErrors', Object.keys(err.errors).map(key => err.errors[key].message))
            console.log(err)
            res.redirect('/teams/create')

        }
        else {
            res.redirect('/teams')
        }
    })

}

//GET TEAM DETAILS
module.exports.details = (req, res) => {
    Teams.findById((req.params.id), (err, team) => {
        if (!(team.members.filter(m => m._id == req.session.user._id).length > 0)) {
            return res.redirect('/teams')
        }
        if (err)
            console.log(err)
        else
            res.render('team_details', { team: team, templates: RetroTemplates.loadTemplates, errors: req.flash('registrationErrors') })
    }).populate('members').populate('createdBy').populate('updatedBy').populate('retrospectives').populate('actionitems.owner').populate('actionitems.retrospective')
}

//UPDATE TEAM
module.exports.update = (req, res) => {
    try {
        cloudinary.v2.uploader.upload(req.file.path, { folder: process.env.ENVIRONMENT + '/TEAM' }, (err, result) => {
            console.log(result.secure_url)
            Teams.findById((req.params.id), (err, team) => {
                if (!(team.leader.filter(l => l._id == req.session.user._id).length > 0)) {
                    console.log('UPDATE/this is not a leader')
                    req.flash('registrationErrors', 'Only a team leader can update team details.')
                    return res.redirect('/teams/details/' + team._id)
                }
                team.updateOne({
                    name: req.body.name,
                    description: req.body.description,
                    image: result.secure_url,
                    updatedBy: req.session.user._id,
                    updatedDate: Date.now()
                }, { runValidators: true }, (err, result) => {
                    if (err) {
                        req.flash('registrationErrors', Object.keys(err.errors).map(key => err.errors[key].message))
                        console.log(err)
                        res.redirect('/teams/details/' + team._id)
                    }
                    else {
                        res.redirect('/teams/details/' + team._id)
                    }
                })

            })
        })
    } catch (ex) {
        Teams.findById((req.params.id), (err, team) => {
            if (!(team.leader.filter(l => l._id == req.session.user._id).length > 0)) {
                console.log('UPDATE/this is not a leader')
                req.flash('registrationErrors', 'Only a team leader can update team details.')
                return res.redirect('/teams/details/' + team._id)
            }
            team.updateOne({
                name: req.body.name,
                description: req.body.description,
                updatedBy: req.session.user._id,
                updatedDate: Date.now()
            }, { runValidators: true }, (err, result) => {
                if (err) {
                    req.flash('registrationErrors', Object.keys(err.errors).map(key => err.errors[key].message))
                    console.log(err)
                    res.redirect('/teams/details/' + team._id)
                }
                else {
                    res.redirect('/teams/details/' + team._id)
                }
            })

        })
    }
}

//ADD TEAM MEMBER
module.exports.addMember = (req, res) => {
    Users.findOne({ email: req.body.memberEmail }, (err, user) => {
        if (err || !user) {
            req.flash('registrationErrors', 'Please, include a user email')
            return res.redirect('/teams/details/' + req.params.id)
        } else {
            Teams.findById((req.params.id), (err, team) => {

                if (team.members.includes(user._id)) {
                    return res.redirect('/teams/details/' + req.params.id)
                } else {
                    team.updateOne({ $push: { members: user } }, { runValidators: true }, (err, result) => {
                        if (err) {
                            req.flash('registrationErrors', 'An error occurred. Please, try again')
                            console.log(err)
                        }
                        else
                            res.redirect('/teams/details/' + req.params.id)
                    })
                }
            })
        }
    })
}
//REMOVE TEAM MEMBER
module.exports.removeMember = (req, res) => {
    console.log(req.body.memberId)
    Users.findOne({ _id: req.body.memberId }, (err, user) => {
        console.log(req.params.id)

        if (err || !user) {
            return res.redirect('/teams/details/' + req.params.id)
        } else {
            Teams.findById((req.params.id), (err, team) => {
                team.updateOne({ $pull: { members: user._id } }, (err, result) => {
                    if (err)
                        console.log(err)
                    else
                        return res.redirect('/teams/details/' + req.params.id)
                })
            })
        }
    })
}

//ADD OR REMOVE TEAM LEADER
module.exports.changeLeader = (req, res) => {

    Teams.findById(req.params.teamid, (err, team) => {
        if (err) {
            console.log(err)
            return res.redirect('/teams/details/' + team._id)
        }

        if (team.leader.filter(l => l._id == req.session.user._id).length > 0) { //CHECK IF REQUEST USER IS A LEADER
            console.log('This is a leader')
            if (!team.leader.includes(req.params.userid)) { //IF NEW LEADER IS NOT LEADER
                team.updateOne({ $push: { leader: req.params.userid } }, (err, result) => { //ADD LEADER
                    if (err)
                        console.log(err)
                    return res.redirect('/teams/details/' + team._id)
                })
            } else if (team.leader.length > 1) { //IF USER IS ALREADY A LEADER, BUT TEAM HAS TO HAVE AT LEAST ONE LEADER
                team.updateOne({ $pull: { leader: req.params.userid } }, (err, result) => { //REMOVE USER LEADERSHIP
                    if (err)
                        console.log(err)
                    return res.redirect('/teams/details/' + team._id)
                })
            }
        } else {
            console.log('Not a leader')
            return res.redirect('/teams/details/' + team._id)

        }
    })
}

//DELETE TEAM
module.exports.delete = (req, res) => {
    console.log(req.params.id)
    Teams.deleteOne({ _id: req.params.id }, (err, result) => {
        if (err)
            console.log(err)
        else
            res.json(result)
    })
}