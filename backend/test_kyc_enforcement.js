const axios = require('axios');

async function testBookingBlocking() {
    console.log('--- Testing Booking Blocking for Unverified User ---');

    const API_URL = 'http://127.0.0.1:5001/api';

    try {
        // 1. Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'unverified_test@example.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('Logged in successfully');

        // 2. Try to book
        try {
            await axios.post(`${API_URL}/bookings`, {
                venueId: '67710b754848d56b00680cd7', // Use a real venue ID if possible, or any valid-looking ID
                bookingDate: '2026-01-10',
                startTime: '10:00',
                endTime: '11:00',
                numberOfPlayers: 2
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.error('FAILED: Booking should have been blocked');
        } catch (err) {
            if (err.response?.status === 403) {
                console.log('SUCCESS: Booking blocked with 403 as expected');
                console.log('Message:', err.response.data.message);
            } else {
                console.error('FAILED: Expected 403, got', err.response?.status || err.message);
                if (err.response?.data) console.log(err.response.data);
            }
        }
    } catch (err) {
        console.error('Test Setup Failed:', err.response?.data || err.message);
    }
}

testBookingBlocking();
