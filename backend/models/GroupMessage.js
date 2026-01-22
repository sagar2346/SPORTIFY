const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    senderName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'audio'],
        default: 'text',
    },
    content: {
        type: String, // Text message or blank if audio
    },
    audioUrl: {
        type: String, // URL to audio file
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('GroupMessage', groupMessageSchema);
