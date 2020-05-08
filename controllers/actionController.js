const Teams = require('../database/models/Teams')
const Users = require('../database/models/Users')

//CREATES AN ACTION ITEM
// module.exports.save = (req, res) => {

// }

//ACTION ITEM DETAILS
module.exports.details = (req, res) => {
    Teams.findOne({ actionitems: { $elemMatch: { _id: req.params.id } } }, (err, team) => {

        var action = team.actionitems.find(a => a._id == req.params.id)
        if (err || !action) {
            console.log(err)
            res.redirect('/')
        } else {
            res.render('action_details', { action: action, members: team.members, errors: req.flash('registrationErrors') })
        }
    }).populate('members').populate('actionitems.owner').populate('actionitems.retrospective')
}

//EDIT ACTION ITEM
module.exports.edit = (req, res) => {
    if (!req.body.text) {
        req.flash('registrationErrors', 'Please provide a text')
        return res.redirect('/action/details/' + req.params.id)

    }

    Teams.findOneAndUpdate({ actionitems: { $elemMatch: { _id: req.params.id } } },
        {
            $set:
            {
                'actionitems.$.text': req.body.text,
                'actionitems.$.status': req.body.status,
                'actionitems.$.owner': req.body.owner,
            }
        },
        { new: true }, (err, result) => {
            if (err) {
                req.flash('registrationErrors', Object.keys(err.errors).map(key => err.errors[key].message))
                res.redirect('action/details/' + req.params.id)
                console.log(err)
            } else {
                res.redirect('/teams/details/' + result._id)
                console.log(result)
            }
        })
}

//COMPLETE AN ACTION ITEM
module.exports.complete = (req, res) => {
    Teams.findOneAndUpdate({ actionitems: { $elemMatch: { _id: req.params.id } } }, { $set: { 'actionitems.$.status': 'DONE' } }, { new: true }, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/teams/details/' + result._id)
            console.log(result)
        }
    })
}

//CANCEL AN ACTION ITEM
module.exports.cancel = (req, res) => {
    Teams.findOneAndUpdate({ actionitems: { $elemMatch: { _id: req.params.id } } }, { $set: { 'actionitems.$.status': 'CANCELLED' } }, { new: true }, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/teams/details/' + result._id)
            console.log(result)
        }
    })
}

//REOPEN ACTION ITEM
module.exports.open = (req, res) => {
    Teams.findOneAndUpdate({ actionitems: { $elemMatch: { _id: req.params.id } } }, { $set: { 'actionitems.$.status': 'OPEN' } }, { new: true }, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/teams/details/' + result._id)
            console.log(result)
        }
    })
}