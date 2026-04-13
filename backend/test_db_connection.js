const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const testConnection = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sport-booking';
        console.log(`Testing connection to: ${uri}`);

        await mongoose.connect(uri);
        console.log('Successfully connected to MongoDB!');

        // Check if we can reach the specific database
        console.log(`Connected to database: ${mongoose.connection.name}`);

        await mongoose.connection.close();
        console.log('Connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Connection test failed:');
        console.error(error.message);
        process.exit(1);
    }
};

testConnection();
