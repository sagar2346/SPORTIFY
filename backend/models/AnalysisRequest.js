const mongoose = require('mongoose');

const AnalysisRequestSchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.ObjectId,
        ref: 'Team',
        required: true,
    },
    requestedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please add a title for the request'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description of the desired analysis'],
    },
    status: {
        type: String,
        enum: ['pending', 'fulfilled', 'rejected'],
        default: 'pending',
    },
    footage: {
        type: mongoose.Schema.ObjectId,
        ref: 'Footage',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('AnalysisRequest', AnalysisRequestSchema);
