const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, 'backend', '.env');
console.log('Checking path:', envPath);
console.log('File exists:', fs.existsSync(envPath));

const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error('Error loading .env:', result.error);
} else {
    console.log('Successfully loaded .env');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    if (process.env.JWT_SECRET) {
        console.log('JWT_SECRET length:', process.env.JWT_SECRET.length);
    }
}
