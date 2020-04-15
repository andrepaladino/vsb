const mongoose = require('mongoose');

const RetroSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    participants: [{
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

    actionitems: [{
        text:{
            type: String
        },

        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        status:{
            type: String,
            enum: ['NEW','COMPLETED','CANCELLED'],
            default: 'NEW'
        }

    }],

    status:{
        type: String,
        enum: ['NEW','INPROGRESS','REVIEW', 'COMPLETED'],
        default: 'NEW'
    },

    retroTemplate: {
    },

    createdDate: Date,


})

const Retros = mongoose.model('Retrospectives', RetroSchema)

module.exports = Retros
