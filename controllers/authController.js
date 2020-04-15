const Users = require('../database/models/Users')

module.exports.auth = (req, res, next) => {
    if(!req.session.user){
        return res.redirect('/login')
    }
    Users.findById(req.session.user._id, (err, user) => {
        if (err || !user) {
            console.log(err)
            console.log(user)
            return res.redirect('/login')
        }
        next()
    })
}

module.exports.redirectIfAuth = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/')
    }
    next()
}

module.exports.logout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}