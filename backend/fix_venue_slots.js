const mongoose = require('mongoose');
const Venue = require('./models/Venue');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fixSlots = async () => {
    try {
        const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sport-booking';
        await mongoose.connect(connString);
        console.log(`Connected to: ${connString}`);

        const venueId = '69379e28500251a1faa2e571';
        const venue = await Venue.findById(venueId);

        if (!venue) {
            console.log('Venue not found');
            process.exit(1);
        }

        console.log(`Initial Slots for ${venue.name}: ${venue.timeSlots.length}`);

        // Generate slots
        const defaultSlots = [];
        for (let i = 6; i < 22; i++) {
            const start = i < 10 ? `0${i}:00` : `${i}:00`;
            const end = i + 1 < 10 ? `0${i + 1}:00` : `${i + 1}:00`;
            defaultSlots.push({
                startTime: start,
                endTime: end,
                isAvailable: true,
            });
        }

        venue.timeSlots = defaultSlots;
        await venue.save();

        console.log(`Updated Slots for ${venue.name}: ${venue.timeSlots.length}`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixSlots();
