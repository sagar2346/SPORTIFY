const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createDummyUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Delete existing if any
        await User.deleteOne({ email: 'todelete@example.com' });

        const user = await User.create({
            name: 'Delete Me',
            email: 'todelete@example.com',
            password: 'password123',
            role: 'customer'
        });

        console.log(`User created: ${user.email} (${user._id})`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createDummyUser();
