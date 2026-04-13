const mongoose = require('mongoose');
const Venue = require('./models/Venue');
const Booking = require('./models/Booking');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const venue = await Venue.findOne({ name: /ARNOLD/i });
        if (!venue) {
            console.log('Arnold venue not found');
            process.exit(0);
        }

        const stats = await Venue.aggregate([
            { $match: { _id: venue._id } },
            {
                $lookup: {
                    from: 'bookings',
                    localField: '_id',
                    foreignField: 'venue',
                    as: 'venueBookings'
                }
            },
            {
                $addFields: {
                    totalBookings: { $size: '$venueBookings' }
                }
            }
        ]);

        console.log(`TEST SUCCESS: Venue: ${stats[0].name}, Price: ${stats[0].basePrice}, Bookings: ${stats[0].totalBookings}`);
        process.exit(0);
    } catch (e) {
        console.error('TEST FAILED:', e.message);
        process.exit(1);
    }
};

run();
