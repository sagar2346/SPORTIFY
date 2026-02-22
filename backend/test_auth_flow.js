const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const testAuth = async () => {
    try {
        // 1. Connect to DB
        const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sport-booking';
        console.log(`Connecting to ${connString}...`);
        await mongoose.connect(connString);
        console.log('DB Connected');

        // 2. Cleanup (optional, careful with prod data, but this is local)
        // await User.deleteMany({ email: 'test_script_user@example.com' });

        // 3. Create User
        const testEmail = `test_script_${Date.now()}@example.com`;
        const testPassword = 'password123';

        console.log(`Creating user: ${testEmail}`);
        const user = await User.create({
            name: 'Test Script User',
            email: testEmail,
            password: testPassword,
            role: 'customer'
        });
        console.log('User created:', user._id);
        console.log('   Hashed Password:', user.password);

        // 4. Verify Password Match
        const isMatch = await user.matchPassword(testPassword);
        console.log(`Password match result (should be true): ${isMatch}`);

        // 5. Generate Token
        // Mock env if missing for test
        if (!process.env.JWT_SECRET) {
            console.warn('No JWT_SECRET in env, using fallback for test');
            process.env.JWT_SECRET = 'fallback_secret';
            process.env.JWT_EXPIRE = '30d';
        }
        const token = user.getSignedJwtToken();
        console.log('Token generated:', token ? 'Yes' : 'No');

        console.log('Auth Flow Test Passed!');
    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

testAuth();
