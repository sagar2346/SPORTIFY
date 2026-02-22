const axios = require('axios');

const run = async () => {
    try {
        // 1. Login as Admin
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'debug_admin@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Admin Logged In');

        // 2. Reply to Message
        // ID from previous step: 694115b89492b2264d340f03
        // If the ID changes, I might need to fetch it dynamically or just hardcode if I'm fast.
        // Let's create a NEW message here just to be safe? 
        // No, I'll fetch messages and reply to the last one from 'notify_test@example.com'

        const msgsRes = await axios.get('http://localhost:5001/api/messages', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const targetMsg = msgsRes.data.find(m => m.email === 'notify_test@example.com' && !m.reply);

        if (!targetMsg) {
            console.log('No unreplied message found for notify_test@example.com');
            return;
        }

        console.log(`Replying to message: ${targetMsg._id}`);

        await axios.post(`http://localhost:5001/api/messages/${targetMsg._id}/reply`, {
            reply: 'This is a test reply with notification.'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Reply Sent');

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
};

run();
