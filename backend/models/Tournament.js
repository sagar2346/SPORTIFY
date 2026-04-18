const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a tournament name'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    sportType: {
        type: String,
        enum: [
            'football',
            'basketball',
            'tennis',
            'badminton',
            'swimming',
            'volleyball',
            'cricket',
            'gym',
            'futsal',
            'table_tennis',
            'other',
        ],
        required: [true, 'Please specify the sport type'],
    },
    startDate: {
        type: Date,
        required: [true, 'Please add a start date'],
    },
    endDate: {
        type: Date,
        required: [true, 'Please add an end date'],
    },
    registrationDeadline: {
        type: Date,
        required: [true, 'Please add a registration deadline'],
    },
    maxTeams: {
        type: Number,
        required: [true, 'Please add maximum number of teams'],
    },
    entryFee: {
        type: Number,
        default: 0,
    },
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue',
    },
    location: {
        address: String,
        city: String,
    },
    status: {
        type: String,
        enum: ['open', 'ongoing', 'completed', 'cancelled'],
        default: 'open',
    },
    image: {
        type: String,
        default: '',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Tournament', TournamentSchema);
