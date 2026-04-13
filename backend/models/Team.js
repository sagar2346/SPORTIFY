const mongoose = require('mongoose');
const crypto = require('crypto');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a team name'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    sport: {
        type: String,
        required: [true, 'Please specify the sport'],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        role: {
            type: String,
            enum: ['leader', 'admin', 'member'],
            default: 'member'
        }
    }],
    inviteCode: {
        type: String,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    fineAmount: {
        type: Number,
        default: 0,
    },
    finePaymentStatus: {
        type: String,
        enum: ['unpaid', 'pending_verification', 'paid'],
        default: 'unpaid'
    },
    finePaymentMethod: {
        type: String,
        enum: ['esewa', 'bank_transfer', null],
        default: null
    }
});

// Generate invite code before saving
teamSchema.pre('save', function (next) {
    if (!this.inviteCode) {
        this.inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Team', teamSchema);
