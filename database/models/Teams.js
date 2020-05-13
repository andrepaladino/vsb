const mongoose = require('mongoose');
const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Team name is mandatory']
    },
    description: {
        type: String,
        required: [true, 'Team description is mandatory']
    },
    image: String,

    leader: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    }],

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    }],

    retrospectives: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Retrospectives'
    }],

    actionitems: [{
        text:{
            type: String,
            required: [true, 'Please provide a text']
        },

        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please select a owner']
        },

        status:{
            type: String,
            enum: ['OPEN','DONE','CANCELLED'],
            default: 'OPEN',
            required: [true, 'Please select status']
        },

        retrospective: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Retrospectives'
        }

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
