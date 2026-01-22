const mongoose = require('mongoose');
const Venue = require('./models/Venue');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const checkSlots = async () => {
    try {
        const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sport-booking';
        await mongoose.connect(connString);
        console.log(`Connected to: ${connString}`);
        const venue = await Venue.findById('69379e28500251a1faa2e571');
        if (venue) {
            console.log(`Checking Venue: ${venue.name} (${venue._id})`);
            console.log(`Time Slots Length: ${venue.timeSlots.length}`);
            console.log('Sample Slot 0:', venue.timeSlots[0]);
            console.log('All Slots Available?', venue.timeSlots.every(s => s.isAvailable));
            console.log('Blocked Dates:', venue.blockedDates);
        } else {
            console.log('No venue found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkSlots();
