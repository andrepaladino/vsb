const mongoose = require('mongoose')

const InputSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    likes: [{
        type: String
    }],
    category: {
        type: String,
    },
    positionLeft: {},
    positionTop: {}
})

const Inputs = mongoose.model('Inputs', InputSchema)

module.exports = Inputs