async function testAdminSignup() {
    console.log('Testing Admin Signup without secret...');
    try {
        const res1 = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Admin',
                email: 'testadmin22@sportify.com',
                password: 'password123',
                role: 'admin'
            })
        });
        const data1 = await res1.json();
        if (res1.status === 403) {
            console.log('✅ PASS: Admin creation blocked without valid secret');
        } else {
            console.log(`❌ FAIL: Unexpected status: ${res1.status}`, data1);
        }
    } catch (error) {
        console.log(`❌ FAIL: Unexpected error: ${error.message}`);
    }

    console.log('Testing Admin Signup with valid secret...');
    try {
        const res2 = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Admin',
                email: `testadmin_${Date.now()}@sportify.com`,
                password: 'password123',
                role: 'admin',
                adminSecret: 'SPORTIFY_ADMIN_SECRET'
            })
        });
        const data2 = await res2.json();
        if (res2.status === 201) {
            console.log('✅ PASS: Admin created successfully with proper secret');
        } else {
            console.log(`❌ FAIL: Admin not created as expected. Status: ${res2.status}`, data2);
        }
    } catch (error) {
        console.log(`❌ FAIL: Admin creation failed with valid secret: ${error.message}`);
    }
}

testAdminSignup();
