const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('--- .env Analysis ---');

    const lines = content.split('\n');
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        // Check if line has a key=value pair
        if (!trimmed.includes('=')) {
            console.log(`⚠️  Line ${index + 1} seems malformed (no '=' found): "${trimmed}"`);
        } else {
            const parts = trimmed.split('=');
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim();

            console.log(`Line ${index + 1}: Key="${key}" ValueLength=${val.length}`);

            if (key === 'EMAIL_USER' && !val.includes('@')) {
                console.log('   ⚠️  EMAIL_USER does not contain "@" symbol.');
            }
            if (key === 'EMAIL_PASS' && val.length < 10) {
                console.log('   ⚠️  EMAIL_PASS looks too short for an App Password.');
            }
        }
    });
    console.log('--- End Analysis ---');

} catch (e) {
    console.error('Error reading .env:', e.message);
}
