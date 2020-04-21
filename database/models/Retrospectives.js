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
