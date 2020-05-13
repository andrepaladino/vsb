const Users = require('../database/models/Users')
const bcrypt = require('bcrypt')

//LOAD INDEX PAGE
module.exports.index = (req, res) => {
    res.redirect('/teams')
}

//LOAD LOGIN PAGE
module.exports.login = (req, res) => {
    res.render('login', { pageTitle: 'Login', errors: req.flash('registrationErrors') })
}

//SUBMIT LOGIN
module.exports.loginUser = (req, res) => {

    if(!req.body.email || !req.body.password){
        req.flash('registrationErrors', 'Please, provide Email and Password')
        res.redirect('/login')
    }else{
        Users.findOne({ email: req.body.email }, (err, user) => {
    
            if (user) {
                bcrypt.compare(req.body.password, user.password, (err, same) => {
                    if (same) {
                        req.session.user = user
                        console.log(req.session)
                        return res.redirect('/')
                    }
                    else {
                        req.flash('registrationErrors', 'Email or Password invalid')
                        return res.redirect('/login')
                    }
                })
            }
            else {
                console.log(err)
                req.flash('registrationErrors', 'Email or Password invalid')
                res.redirect('/login')
            }
        })
    }
}

//LOAD REGISTER PAGE
module.exports.register = (req, res) => {
    res.render('register', { pageTitle: 'Register', errors: req.flash('error_messages'), data: req.flash('data')[0] })
}

//SUBMIT REGISTRATION
module.exports.registerUser = (req, res) => {
    var firstNameModified = (req.body.firstName.charAt(0).toUpperCase() + req.body.firstName.slice(1)).trim();
    var lastNameModified = (req.body.lastName.charAt(0).toUpperCase() + req.body.lastName.slice(1)).trim();

    if(req.body.password && req.body.confirmpassword){
        if(req.body.password != req.body.confirmpassword){
            console.log('Passwords dont match')
            req.flash('error_messages', 'Passwords dont match')
            req.flash('data', req.body)
            return res.redirect('/register')

        }
    }

    Users.create({
        firstName: firstNameModified,
        lastName: lastNameModified,
        username: req.body.username.trim(),
        email: req.body.email,
        password: req.body.password
    }, (err, result) => {
        if (err) {
            req.flash('error_messages', Object.keys(err.errors).map(key => err.errors[key].message))
            req.flash('data', req.body)
            return res.redirect('/register')
        }
        else {
            res.redirect('/teams')
        }
    })
}

module.exports.details = (req, res) => {
    Users.findById((req.params.id), (err, user) => {
        if (err)
            console.log(err)
        else
            res.render('user_details', { userDetails: user, passErrors: req.flash('error_messages_password'), errors: req.flash('error_messages')})
    })
}

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

    console.log(req.body.password)

    Users.findByIdAndUpdate((req.params.id),
        {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            image: currentImageName,
            username: req.body.username,
        }, { new: true, runValidators: true }, (err, user) => {

            if (err){
                req.flash('error_messages', Object.keys(err.errors).map(key => err.errors[key].message))
                console.log(err)
                return res.redirect('/user/details/' + req.params.id)

            }
            else{
                req.session.user.firstName = user.firstName
                req.session.user.lastName = user.lastName
                req.session.user.username = user.username
                console.log(req.session)
                return res.redirect('/user/details/' + user._id)
            }
        })


}

module.exports.updatePassword = (req, res) => {

    if(req.body.password.length > 0 && req.body.confirmpassword.length > 0){
        if(req.body.password != req.body.confirmpassword){
            console.log('Passwords dont match')
            req.flash('error_messages_password', 'Passwords dont match')
            return res.redirect('/user/details/' + req.params.id)
        }
    }

    if(req.body.password.length <= 0 || req.body.password.length <= 0 ){
        req.flash('error_messages_password', 'Please provide a password')
        return res.redirect('/user/details/' + req.params.id)
    }

    Users.findById(req.params.id, (err, user) => {
        user.password = req.body.password

        user.save({}, (err, result) => {
            if(err)
                console.log(err)

            req.session.user.password = result.password
            res.redirect('/user/details/' + user._id)
        })
    })
}