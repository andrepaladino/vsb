const mongoose = require('mongoose');

const RetroSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Retrospective title is mandatory']
    },

    facilitator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },

    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    }],

    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    }],

    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teams',
        required : true
    },

    inputs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inputs'
    }],

    status:{
        type: String,
        enum: ['NEW','INPROGRESS','REVIEW', 'COMPLETED'],
        default: 'NEW'
    },

    retroTemplate: {
    },

    actionitems: [{
        text:{
            type: String
        },

        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

    }],

    seconds:{
        type: Number,
        default: 900
    },

    count:{
        type: Number,
        default: 0
    },

    createdDate: Date,

})

const Retros = mongoose.model('Retrospectives', RetroSchema)

module.exports = Retros
