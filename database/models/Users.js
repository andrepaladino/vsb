const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please provide your first name']
    },
    lastName: {
        type: String,
        required: [true, 'Please provide your last name']
    },
    username: {
        type: String,
        required: [true, 'Please provide your username'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide your password'],
    },
    image: {
        type: String,
        default: '/images/icons8-usuario.png'
    }
})


UserSchema.pre('save', function (next) {
    var user = this
    console.log('Encrypting password')
    console.log(user)

    // only hash the password if it has been modified (or is new)
    console.log(user.isModified('password'))
    if (!user.isModified('password')){
        return next()
    } else{
        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            console.log('Gen Salt')
            if (err) return next(err)
    
            // hash the password along with our new salt
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
    
                // override the cleartext password with the hashed one
                user.password = hash
                next()
            })
        })
    }
})


UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err)
        cb(null, isMatch)
    })
}

module.exports = mongoose.model('User', UserSchema)
