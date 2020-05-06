const Teams = require('../database/models/Teams')
const Users = require('../database/models/Users')

//CREATES AN ACTION ITEM
// module.exports.save = (req, res) => {

// }

//COMPLETE AN ACTION ITEM
module.exports.complete = (req, res) => {
    Teams.findOneAndUpdate({ actionitems: { $elemMatch: { _id: req.params.id } } }, { $set: { 'actionitems.$.status': 'COMPLETED' } }, { new: true }, (err, result) => {
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
    Teams.findOneAndUpdate({ actionitems: { $elemMatch: { _id: req.params.id } } }, { $set: { 'actionitems.$.status': 'NEW' } }, { new: true }, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/teams/details/' + result._id)
            console.log(result)
        }
    })
}