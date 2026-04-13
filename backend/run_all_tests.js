const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const tests = [
    { name: 'Environment Check', script: 'check_env.js', type: 'core' },
    { name: 'Environment Format', script: 'check_env_format.js', type: 'core' },
    { name: 'System Diagnostics', script: 'diagnose_env.js', type: 'core' },
    { name: 'DB Connection', script: 'test_db_connection.js', type: 'core' },
    { name: 'Email Settings', script: 'test_email_debug.js', type: 'core' },
    { name: 'AI API Diagnostics', script: 'diagnose_gemini.js', type: 'core' },
    { name: 'Database Seeding', script: 'seed_venues.js', type: 'data' },
    { name: 'Admin Setup', script: 'create_admin.js', type: 'data' },
    { name: 'Admin Registration API', script: 'test_admin_signup.js', type: 'api', needsServer: true },
    { name: 'Test User Setup', script: 'setup_test_user.js', type: 'data' },
    { name: 'Login API', script: 'test_login_api.js', type: 'api', needsServer: true },
    { name: 'Auth Flow Cycle', script: 'test_auth_flow.js', type: 'core' },
    { name: 'KYC Enforcement', script: 'test_kyc_enforcement.js', type: 'core' },
    { name: 'Venue Slots Logic', script: 'check_slots.js', type: 'logic' },
    { name: 'Notification Setup', script: 'setup_notify_test.js', type: 'data' },
    { name: 'Notification API', script: 'verify_notification_api.js', type: 'api', needsServer: true },
    { name: 'AI Summary Generation', script: 'verify_summary.js', type: 'logic' },
    { name: 'Payment Integration', script: 'esewa_test_api.js', type: 'server', isPersistent: true },
    { name: 'New Features Verification', script: 'test_new_features.js', type: 'logic' }
];

async function isServerRunning(port) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}/api/health`, (res) => {
            resolve(true); // Any response means it's running
        });
        req.on('error', () => resolve(false));
        req.setTimeout(500, () => {
            req.destroy();
            resolve(false);
        });
    });
}

console.log('==================================================');
console.log('   SPORTIFY - COMPREHENSIVE TEST SUITE (19 TESTS)');
console.log('==================================================\n');

async function runTests() {
    let passedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    const serverUp = await isServerRunning(5001);
    if (!serverUp) {
        console.warn('⚠️  Warning: Backend server (port 5001) is not running.');
        console.warn('   API-based tests will be skipped automatically.\n');
    }

    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const scriptPath = path.join(__dirname, test.script);
        const indexStr = `[${i + 1}/19]`;
        
        console.log(`${indexStr} Testing: ${test.name}...`);

        if (!fs.existsSync(scriptPath)) {
            console.error(`  ❌ Error: Script ${test.script} not found!\n`);
            failedCount++;
            continue;
        }

        if (test.isPersistent) {
            console.log(`  ⏩ SKIPPED: ${test.name} is a persistent server. Run manually with "node backend/${test.script}".\n`);
            skippedCount++;
            continue;
        }

        if (test.needsServer && !serverUp) {
            console.log(`  ⏩ SKIPPED: Requires running server (port 5001).\n`);
            skippedCount++;
            continue;
        }

        const result = spawnSync('node', [test.script], { 
            cwd: __dirname,
            stdio: 'inherit',
            env: { ...process.env, NODE_ENV: 'test' }
        });

        if (result.status === 0) {
            console.log(`  ✅ PASSED\n`);
            passedCount++;
        } else {
            console.error(`  ❌ FAILED (Exit Code: ${result.status})\n`);
            failedCount++;
        }
    }

    console.log('==================================================');
    console.log('                TEST SUMMARY');
    console.log('==================================================');
    console.log(`Total 19 Tests:`);
    console.log(`- Passed:  ${passedCount}`);
    console.log(`- Failed:  ${failedCount}`);
    console.log(`- Skipped: ${skippedCount}`);
    console.log('==================================================\n');

    if (failedCount > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests();
