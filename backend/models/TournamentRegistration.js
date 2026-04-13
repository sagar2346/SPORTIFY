const mongoose = require('mongoose');

const TournamentRegistrationSchema = new mongoose.Schema({
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true,
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: false,
    },
    registeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed',
    },
    registeredAt: {
        type: Date,
        default: Date.now,
    },
});

// Prevent same team from registering multiple times for same tournament
// and same user from registering multiple times for solo tournament
TournamentRegistrationSchema.index({ tournament: 1, team: 1 }, { 
    unique: true, 
    partialFilterExpression: { team: { $exists: true } } 
});
TournamentRegistrationSchema.index({ tournament: 1, registeredBy: 1 }, { 
    unique: true,
    partialFilterExpression: { team: { $exists: false } }
});

module.exports = mongoose.model('TournamentRegistration', TournamentRegistrationSchema);
