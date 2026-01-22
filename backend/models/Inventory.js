const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please add an item name'],
        trim: true,
    },
    sport: {
        type: String,
        required: [true, 'Please specify the sport'],
        enum: [
            'Football',
            'Basketball',
            'Tennis',
            'Badminton',
            'Swimming',
            'Volleyball',
            'Cricket',
            'Gym',
            'Futsal',
            'Table Tennis',
            'Other',
        ],
    },
    quantity: {
        type: Number,
        required: [true, 'Please add quantity'],
        min: 0,
    },
    condition: {
        type: String,
        required: true,
        enum: ['New', 'Excellent', 'Good', 'Fair', 'Poor'],
        default: 'New',
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Inventory', InventorySchema);
