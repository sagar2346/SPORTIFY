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

        await Venue.insertMany(venues);
        console.log('Seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
};

seedVenues();
