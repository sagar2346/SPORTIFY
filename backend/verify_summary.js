const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Footage = require('./models/Footage');
const { generateSummary } = require('./utils/gemini');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sport-booking');
        console.log('Connected to DB');

        const footage = await Footage.findOne({});
        if (!footage) {
            console.log('No footage found in DB to test.');
            return;
        }

        console.log(`Testing summary for: ${footage.title}`);
        console.log('Generating AI Summary...');

        const summary = await generateSummary(footage.title, footage.analysisText, footage.description);

        console.log('\nAI Summary Output:');
        console.log('------------------');
        console.log(summary);
        console.log('------------------');

        if (summary && !summary.includes('Failed to generate tactical summary')) {
            console.log('\nSUCCESS: AI Summary generated correctly with gemini-1.5-flash.');
        } else {
            console.log('\nFAILURE: AI Summary failed. Check API key and model availability.');
        }

    } catch (err) {
        console.error('Verification Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

verify();
