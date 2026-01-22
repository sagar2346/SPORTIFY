const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Venue = require('./models/Venue');

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create Referrer
        const referrer = await User.create({
            name: 'Referrer User',
            email: `referrer_${Date.now()}@test.com`,
            password: 'password123',
            role: 'customer'
        });
        console.log('Referrer created. Code:', referrer.referralCode);

        if (!referrer.referralCode || !referrer.referralCode.startsWith('SPORT-')) {
            throw new Error('Referral code generation failed');
        }

        // 2. Create Referred User
        const referred = await User.create({
            name: 'Referred User',
            email: `referred_${Date.now()}@test.com`,
            password: 'password123',
            role: 'customer',
            referredBy: referrer._id
        });
        console.log('Referred user created. ReferredBy:', referred.referredBy);

        if (referred.referredBy.toString() !== referrer._id.toString()) {
            throw new Error('Referral linking failed');
        }

        // 3. Simulate Booking and Loyalty Points
        const venue = await Venue.create({
            name: 'Test Venue',
            description: 'A professional sports venue for testing.',
            location: {
                address: '123 Sports Way',
                city: 'Kathmandu',
                state: 'Bagmati',
                country: 'Nepal'
            },
            capacity: 20,
            basePrice: 1000,
            sportTypes: ['futsal'],
            owner: referrer._id
        });

        const booking = await Booking.create({
            user: referred._id,
            venue: venue._id,
            bookingDate: new Date(),
            startTime: '10:00',
            endTime: '11:00',
            basePrice: 1000,
            totalPrice: 1000,
            status: 'pending'
        });

        console.log('Booking created. Status:', booking.status);

        // Simulate confirmation logic (from bookingController)
        booking.status = 'confirmed';
        booking.payment.status = 'paid';
        await booking.save();

        const pointsAwarded = Math.round(booking.totalPrice * 0.05);
        await User.findByIdAndUpdate(referred._id, {
            $inc: { loyaltyPoints: pointsAwarded }
        });

        const updatedUser = await User.findById(referred._id);
        console.log('Updated User Loyalty Points:', updatedUser.loyaltyPoints);

        if (updatedUser.loyaltyPoints !== 50) {
            throw new Error(`Points awarding failed. Expected 50, got ${updatedUser.loyaltyPoints}`);
        }

        console.log('TEST PASSED SUCCESSFULLY');

        // Cleanup
        await User.findByIdAndDelete(referrer._id);
        await User.findByIdAndDelete(referred._id);
        await Booking.findByIdAndDelete(booking._id);
        await Venue.findByIdAndDelete(venue._id);

        process.exit(0);
    } catch (error) {
        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach(key => {
                console.error(`Validation Error on ${key}: ${error.errors[key].message}`);
            });
        }
        console.error('TEST FAILED:', error);
        process.exit(1);
    }
};

runTest();
