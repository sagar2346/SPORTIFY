require('dotenv').config();

const email = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

console.log('Checking for placeholders...');

if (email === 'your.email@gmail.com' || email.includes('your.email')) {
    console.log('ALERT: EMAIL_USER is still set to the placeholder "your.email@gmail.com"!');
    console.log('   Please open backend/.env and change it to YOUR actual Gmail address.');
} else {
    console.log(`EMAIL_USER looks like a real email: ${email}`);
}

if (pass === 'xxxx xxxx xxxx xxxx' || pass.includes('xxxx')) {
    console.log('ALERT: EMAIL_PASS is still set to the placeholder "xxxx xxxx xxxx xxxx"!');
    console.log('   Please open backend/.env and replace it with your generated App Password.');
} else {
    console.log('EMAIL_PASS has been changed from default.');
}
