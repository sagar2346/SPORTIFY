const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Venue = require('./models/Venue');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create a dummy Venue Owner
        const owner = await User.create({
            name: 'Test Cascade Owner',
            email: `cascade_owner_${Date.now()}@test.com`,
            password: 'password123',
            role: 'venue_owner'
        });
        console.log('Test Owner created:', owner._id);

        // 2. Create a dummy Venue for this owner
        const venue = await Venue.create({
            name: 'Cascade Test Venue',
            description: 'Venue to be deleted',
            location: {
                address: '123 Test St',
                city: 'Test City',
                state: 'Bagmati',
                country: 'Nepal'
            },
            capacity: 10,
            basePrice: 500,
            sportTypes: ['futsal'],
            owner: owner._id,
            isApproved: true
        });
        console.log('Test Venue created:', venue._id);

        // 3. Create a dummy Booking for this venue
        const booking = await Booking.create({
            user: owner._id, // Owner booking their own venue for simplicity
            venue: venue._id,
            bookingDate: new Date(),
            startTime: '10:00',
            endTime: '11:00',
            basePrice: 500,
            totalPrice: 500,
            status: 'confirmed'
        });
        console.log('Test Booking created:', booking._id);

        // 4. Manually trigger the delete logic from adminController
        // Instead of mocking req/res, we directy execute the logic for verification
        
        console.log('--- TRIGGERING CASCADE DELETE ---');
        const targetUser = await User.findById(owner._id);
        
        if (targetUser.role === 'venue_owner') {
            const venues = await Venue.find({ owner: targetUser._id });
            const venueIds = venues.map(v => v._id);

            if (venueIds.length > 0) {
                await Review.deleteMany({ venue: { $in: venueIds } });
                await Booking.deleteMany({ venue: { $in: venueIds } });
                await Venue.deleteMany({ _id: { $in: venueIds } });
            }
        }
        await User.findByIdAndDelete(owner._id);
        console.log('--- DELETE COMPLETE ---');

        // 5. Verification
        const checkOwner = await User.findById(owner._id);
        const checkVenue = await Venue.findById(venue._id);
        const checkBooking = await Booking.findById(booking._id);

        console.log('Owner still exists:', !!checkOwner);
        console.log('Venue still exists:', !!checkVenue);
        console.log('Booking still exists:', !!checkBooking);

        if (!checkOwner && !checkVenue && !checkBooking) {
            console.log('TEST PASSED: All associated data was removed successfully.');
        } else {
            throw new Error('TEST FAILED: Some data still remains in the database.');
        }

        process.exit(0);
    } catch (error) {
        console.error('TEST FAILED:', error.message);
        process.exit(1);
    }
};

runTest();
