const Users = require('../database/models/Users')
const bcrypt = require('bcrypt')

//LOAD INDEX PAGE
module.exports.index = (req, res) => {
    res.render('index', { title: 'Express' })
}

//LOAD LOGIN PAGE
module.exports.login = (req, res) => {
    res.render('login', { pageTitle: 'Login' })
}

//SUBMIT LOGIN
module.exports.loginUser = (req, res) => {

    Users.findOne({ email: req.body.email }, (err, user) => {

        if (user) {
            bcrypt.compare(req.body.password, user.password, (err, same) => {
                if (same) {
                    req.session.user = user
                    console.log(req.session)
                    return res.redirect('/')
                }
                else {
                    return res.redirect('/login')
                }
            })
        }
        else {
            res.redirect('/login')
        }
    })
}

//LOAD REGISTER PAGE
module.exports.register = (req, res) => {
    console.log(req.flash('data'))
    res.render('register', { pageTitle: 'Register', errors: req.flash('registrationErrors'), data: req.flash('data') })
}

//SUBMIT REGISTRATION
module.exports.registerUser = (req, res) => {
    var firstNameModified = (req.body.firstName.charAt(0).toUpperCase() + req.body.firstName.slice(1)).trim();
    var lastNameModified = (req.body.lastName.charAt(0).toUpperCase() + req.body.lastName.slice(1)).trim();

    Users.create({
        firstName: firstNameModified,
        lastName: lastNameModified,
        username: req.body.username.trim(),
        email: req.body.email,
        password: req.body.password
    }, (err, result) => {
        if (err) {
            req.flash('registrationErrors', Object.keys(err.errors).map(key => err.errors[key].message))
            req.flash('data', req.body.firstname)
            return res.redirect('/register')
        }
        else {
            res.redirect('/teams')
        }
    })
}