
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function verifyDelete() {
    try {
        console.log('1. Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@sportbooking.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('   Admin logged in. Token obtained.');

        console.log('2. Registering a dummy user to delete...');
        const userEmail = `delete_test_${Date.now()}@test.com`;
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Delete Tester',
            email: userEmail,
            password: 'password123',
            role: 'customer'
        });
        const userId = regRes.data.user._id;
        console.log(`   Dummy user created. ID: ${userId}`);

        console.log('3. Deleting the user via Admin API...');
        try {
            const deleteRes = await axios.delete(`${API_URL}/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (deleteRes.data.success) {
                console.log('   Delete API reported success.');
            } else {
                console.error('   Delete API reported failure:', deleteRes.data);
            }
        } catch (delErr) {
            console.error('   Delete API threw error:', delErr.response?.data || delErr.message);
        }

        console.log('4. Verifying user is gone...');
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email: userEmail,
                password: 'password123'
            });
            console.error('   FAILED: User still exists (login succeeded).');
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 404 || err.response.data.message.includes('Invalid credentials'))) {
                console.log('   SUCCESS: User cannot login (likely deleted).');
            } else {
                console.log('   Verification login failed with expected error:', err.response?.status, err.message);
            }
        }

    } catch (error) {
        console.error('ERROR during verification:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

verifyDelete();
