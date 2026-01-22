const mongoose = require('mongoose');
const Venue = require('./models/Venue');
const User = require('./models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedVenues = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Ensure we have a venue owner
        let owner = await User.findOne({ email: 'owner@example.com' });
        if (!owner) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('owner123', salt);
            owner = await User.create({
                name: 'Sample Owner',
                email: 'owner@example.com',
                password: hashedPassword,
                role: 'venue_owner'
            });
            console.log('Created sample owner');
        }

        // 2. Clear existing venues (optional, but good for clean slate if needed)
        // await Venue.deleteMany({});

        // 3. Create Venues
        const venues = [
            {
                name: 'Kathmandu Football Arena',
                description: 'Premier football turf in the heart of Kathmandu.',
                owner: owner._id,
                sportType: 'football',
                location: {
                    address: 'Lazimpat Road',
                    city: 'Kathmandu',
                    state: 'Bagmati',
                    country: 'Nepal',
                    coordinates: {
                        latitude: 27.7172,
                        longitude: 85.3240
                    }
                },
                capacity: 22,
                basePrice: 1500,
                isApproved: true,
                isActive: true,
                images: [], // Add dummy image path if available or leave empty
                timeSlots: [
                    { startTime: '06:00', endTime: '07:00', isAvailable: true },
                    { startTime: '17:00', endTime: '18:00', isAvailable: true }
                ]
            },
            {
                name: 'Lalitpur Basketball Court',
                description: 'Professional hardwood court.',
                owner: owner._id,
                sportType: 'basketball', // Note: User might be looking at football page, let's make sure we match
                location: {
                    address: 'Jhamsikhel',
                    city: 'Lalitpur',
                    state: 'Bagmati',
                    country: 'Nepal',
                    coordinates: {
                        latitude: 27.6710,
                        longitude: 85.3070
                    }
                },
                capacity: 10,
                basePrice: 1000,
                isApproved: true,
                isActive: true
            },
            {
                name: 'City Futsal',
                description: '5A side futsal ground.',
                owner: owner._id,
                sportType: 'football', // Also football for testing
                location: {
                    address: 'Baneshwor',
                    city: 'Kathmandu',
                    state: 'Bagmati',
                    country: 'Nepal',
                    coordinates: {
                        latitude: 27.6915,
                        longitude: 85.3420
                    }
                },
                capacity: 14,
                basePrice: 1200,
                isApproved: true,
                isActive: true
            }
        ];

        await Venue.insertMany(venues);
        console.log('Seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
};

seedVenues();
