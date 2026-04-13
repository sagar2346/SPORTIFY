const mongoose = require('mongoose');

const FootageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    videoUrl: {
        type: String,
        required: [true, 'Please add a video URL'],
    },
    analysisText: {
        type: String,
        required: [true, 'Please add analysis details for AI insights'],
    },
    uploadedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    team: {
        type: mongoose.Schema.ObjectId,
        ref: 'Team',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Footage', FootageSchema);
