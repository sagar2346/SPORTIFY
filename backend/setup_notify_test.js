const mongoose = require('mongoose');
const User = require('./models/User');
const Message = require('./models/Message');
const dotenv = require('dotenv');

dotenv.config();

const runTest = async () => {
    try {
        const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sport-booking';
        await mongoose.connect(connString);
        console.log('✅ DB Connected');

        // 1. Create/Update Test Customer
        const email = 'notify_test@example.com';
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: 'Notify Test',
                email: email,
                password: 'password123',
                role: 'customer'
            });
            console.log('✅ Customer created: notify_test@example.com');
        } else {
            user.password = 'password123';
            await user.save();
            console.log('✅ Customer updated: notify_test@example.com');
        }

        // 2. Clear previous messages from this user
        await Message.deleteMany({ email: email });
        console.log('✅ Cleared old messages');

        // 3. Create a new message
        const message = await Message.create({
            user: user._id,
            name: user.name,
            email: user.email,
            subject: 'Notification Test',
            message: 'Waiting for reply...'
        });
        console.log('✅ Message created');

        // 4. Simulate Admin Reply (Invoking the logic directly to verify model update)
        // Note: In real app, we hit the API. Here we can simulate the DB update part to check schema
        // OR better: use axios to hit the API?
        // Let's just create the message here and let the agent use the BROWSER or another tool to reply?
        // The plan says "Reply as admin". I can do that via `test_reply_api.js`.

        console.log(`Message ID: ${message._id}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

runTest();
