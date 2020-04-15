const mongoose = require('mongoose');
const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: String,

    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    }],

    retrospectives: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Retrospectives'
    }],

    //log Information
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    createdDate: Date,
    
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedDate: Date,

})

const Teams = mongoose.model('Teams', TeamSchema)

module.exports = Teams
