const User = require('./models/User');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'backend/.env' });

async function createUnverifiedUser() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sportify';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB:', mongoUri);

        const email = 'unverified_test@example.com';
        let user = await User.findOne({ email });

        if (user) {
            await User.deleteOne({ email });
            console.log('Existing test user deleted');
        }

        user = await User.create({
            name: 'Unverified Test',
            email: email,
            password: 'password123',
            role: 'customer',
            kycStatus: 'not_verified'
        });

        console.log('Unverified test user created successfully');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createUnverifiedUser();
