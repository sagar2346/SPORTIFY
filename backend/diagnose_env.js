const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
console.log('--- Checking .env Syntax ---');

try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    let userFound = false;
    let passFound = false;

    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        if (trimmed.includes('EMAIL_USER') || trimmed.includes('EMAIL_PASS')) {
            console.log(`\nLine ${idx + 1}: ${trimmed}`);

            // Check for spaces around equals
            if (trimmed.match(/EMAIL_\w+\s+=/) || trimmed.match(/=\s+/)) {
                console.log('ERROR: Found spaces around the "=" sign. Remove them!');
            }

            const parts = trimmed.split('=');
            if (parts.length > 2) {
                console.log('ERROR: Multiple "=" signs found. Make sure only one exists.');
            }

            const key = parts[0].trim();
            let val = parts.slice(1).join('=').trim();

            // Check for quotes
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                console.log('WARNING: Value is wrapped in quotes. Nodemailer usually handles this, but try removing them if it fails.');
                val = val.slice(1, -1);
            }

            // Check for semicolon at end
            if (val.endsWith(';')) {
                console.log('ERROR: Value ends with a semicolon (;). Remove it!');
            }

            if (key === 'EMAIL_USER') {
                userFound = true;
                if (!val.includes('@')) console.log('ERROR: Email does not contain "@".');
            }

            if (key === 'EMAIL_PASS') {
                passFound = true;
                if (val.length < 16) {
                    console.log(`WARNING: Password is only ${val.length} chars. App Passwords are usually 16 chars.`);
                }
                if (val.includes(' ')) {
                    console.log('INFO: Password contains spaces. This is usually fine, but if it fails, try removing them.');
                }
            }
        }
    });

    if (!userFound) console.log('ERROR: EMAIL_USER variable not found!');
    if (!passFound) console.log('ERROR: EMAIL_PASS variable not found!');

} catch (e) {
    console.error('Error:', e.message);
}
console.log('\n--- check complete ---');
