const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Venue = require('./models/Venue');
require('dotenv').config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find user CC
        let user = await User.findOne({ name: 'CC' });
        if (!user) {
            console.log('Creating user CC');
            user = await User.create({ name: 'CC', email: 'cc@test.com', password: 'password123' });
        }
        const initialPoints = user.loyaltyPoints || 0;
        console.log('Initial points for CC:', initialPoints);

        // Find or create a venue
        let venue = await Venue.findOne();
        if (!venue) {
           console.log('No venue found');
           return;
        }

        // Create a test booking
        const booking = await Booking.create({
            user: user._id,
            venue: venue._id,
            totalPrice: 1000,
            basePrice: 1000,
            bookingDate: new Date(),
            startTime: '10:00',
            endTime: '11:00',
            status: 'pending'
        });
        console.log('Booking created:', booking._id);

        // MANUALLY TRIGGER THE CONFIRM LOGIC
        // We'll mimic the controller logic
        const b = await Booking.findById(booking._id).populate('venue user');
        console.log('Populated booking user:', b.user ? b.user._id : 'null');
        
        const pointsAwarded = Math.round(b.totalPrice * 0.05 * 100) / 100;
        console.log('Points to award:', pointsAwarded);

        if (b.user && b.user._id) {
            const updateResult = await User.findByIdAndUpdate(b.user._id, {
                $inc: { loyaltyPoints: pointsAwarded }
            }, { new: true });
            console.log('Update result points:', updateResult.loyaltyPoints);
        } else {
            console.log('User or User._id missing in populated booking');
        }

        const finalUser = await User.findById(user._id);
        console.log('Final points for CC:', finalUser.loyaltyPoints);

        // Cleanup
        await Booking.findByIdAndDelete(booking._id);
        
        if (finalUser.loyaltyPoints > initialPoints) {
            console.log('LOGIC TEST PASSED');
        } else {
            console.log('LOGIC TEST FAILED');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Test error:', err);
        process.exit(1);
    }
};

runTest();
