const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Booking = require('../models/Booking');

dotenv.config();

const syncPoints = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ role: 'customer' });
        console.log(`Syncing loyalty points for ${users.length} customers...`);

        for (const user of users) {
            // Find all paid/confirmed bookings for this user
            const bookings = await Booking.find({
                user: user._id,
                status: { $in: ['confirmed', 'completed'] },
                'payment.status': 'paid'
            });

            let totalPoints = 0;
            bookings.forEach(b => {
                const points = Math.round(b.totalPrice * 0.05 * 100) / 100;
                totalPoints += points;
            });

            console.log(`Updating user ${user.name} (${user.email}): Found ${bookings.length} paid bookings. Total Points: ${totalPoints.toFixed(2)}`);

            await User.findByIdAndUpdate(user._id, {
                $set: { loyaltyPoints: totalPoints }
            });
        }

        console.log('--- SYNC COMPLETE ---');
        process.exit(0);
    } catch (error) {
        console.error('SYNC FAILED:', error.message);
        process.exit(1);
    }
};

syncPoints();
