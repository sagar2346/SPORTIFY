const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const listUsers = async () => {
    try {
        const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sport-booking';
        console.log(`Connecting to ${connString}...`);
        await mongoose.connect(connString);
        console.log('DB Connected');

        const users = await User.find({}).select('name email role status isApproved createdAt');

        console.log(`\nFound ${users.length} Users in Database:`);
        console.log('--------------------------------------------------');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} [Status: ${user.status}, Approved: ${user.isApproved}]`);
        });
        console.log('--------------------------------------------------\n');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

listUsers();
