const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sport-booking';
        await mongoose.connect(connString);
        console.log('DB Connected');

        // Check if user exists
        const email = 'xyz@gmail.com';
        const exists = await User.findOne({ email });

        if (exists) {
            console.log('User already exists. Updating password...');
            exists.password = 'admin123';
            exists.role = 'admin';
            exists.isApproved = true;
            exists.status = 'approved';
            await exists.save();
            console.log('Admin updated: xyz@gmail.com / admin123');
        } else {
            await User.create({
                name: 'Debug Admin',
                email: email,
                password: 'password123',
                role: 'admin',
                isApproved: true,
                status: 'approved'
            });
            console.log('Admin created: debug_admin@example.com / password123');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

createAdmin();
