const Teams = require('../database/models/Teams')
const Users = require('../database/models/Users')
const RetroTemplates = require('../templates/templates_list')

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
    return res.render('team_create', { pageTitle: 'Create Team', errors: req.flash('registrationErrors')})
}

//CREATE NEW TEAM
module.exports.save = (req, res) => {
    var saveFileName = ''
    if (typeof req.file === 'undefined') {
        saveFileName = 'team_default.png'
    } else {
        saveFileName = req.file.filename
    }
    Teams.create({
        name: req.body.name.trim(),
        description: req.body.description.trim(),
        image: '/images/' + saveFileName,
        leader: req.session.user._id,
        members: [req.session.user._id],
        createdBy: req.session.user._id,
        createdDate: Date.now(),
        updatedBy: req.session.user._id,
        updatedDate: Date.now()
    }, (err, result) => {
        if (err){
            req.flash('registrationErrors', Object.keys(err.errors).map(key => err.errors[key].message))
            console.log(err)
            res.redirect('/teams/create')

        }
        else{
            res.redirect('/teams')
        }
    })
    console.log(req.file)
}

//GET TEAM DETAILS
module.exports.details = (req, res) => {
    Teams.findById((req.params.id), (err, team) => {
        if (err)
            console.log(err)
        else
            res.render('team_details', { team: team, templates: RetroTemplates.loadTemplates, errors: req.flash('registrationErrors') })
    }).populate('leader').populate('members').populate('createdBy').populate('updatedBy').populate('retrospectives').populate('actionitems.owner').populate('actionitems.retrospective')
}

//UPDATE TEAM
module.exports.update = (req, res) => {

    console.log(req.file)
    try {
        var currentImageName = '/images/' + req.file.filename
        console.log(req.file.filename)
    } catch (ex) {
        console.log(req.body.currentImage)
        var currentImageName = req.body.currentImage
        console.log(ex)
        console.log('file name is: ' + req.body.currentImage)
    }

    Teams.findById((req.params.id), (err, team) => {
        team.updateOne({
            name: req.body.name,
            description: req.body.description,
            image: currentImageName,
            updatedBy: req.session.user._id,
            updatedDate: Date.now()
        }, { runValidators: true }, (err, result) => {
            if (err){
                req.flash('registrationErrors', Object.keys(err.errors).map(key => err.errors[key].message))
                console.log(err)
                res.redirect('/teams/details/' + team._id)
            }
            else{
                res.redirect('/teams/details/' + team._id)
            }
        })

    })
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
                        if (err){
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