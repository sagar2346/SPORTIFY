require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

console.log('Testing email configuration...');
console.log(`User: ${process.env.EMAIL_USER}`);
// Mask password for security in logs
const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/./g, '*') : 'undefined';
console.log(`Pass: ${pass} (length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0})`);

transporter.verify(function (error, success) {
    if (error) {
        console.error('Configuration Error:', error);
    } else {
        console.log('Server is ready to take our messages');

        // Try sending a test email
        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from Debug Script',
            text: 'If you see this, your email configuration is working!',
        }).then(info => {
            console.log('Test email sent:', info.messageId);
        }).catch(err => {
            console.error('Send Error:', err);
        });
    }
});
