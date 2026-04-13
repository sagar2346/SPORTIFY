const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Define schemas manually or import them (Importing from models)
const TournamentRegistration = require('./models/TournamentRegistration');
const Team = require('./models/Team');

const cleanup = async () => {
    try {
        const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sport-booking';
        console.log(`Connecting to ${connString}...`);
        await mongoose.connect(connString);
        console.log('DB Connected');

        const regs = await TournamentRegistration.find({});
        console.log(`Found ${regs.length} total registrations.`);

        let deletedCount = 0;
        for (const reg of regs) {
            const teamExists = await Team.exists({ _id: reg.team });
            if (!teamExists) {
                await TournamentRegistration.deleteOne({ _id: reg._id });
                deletedCount++;
                console.log(`[CLEANUP] Deleted Orphaned Registration: ${reg._id} (Team ID: ${reg.team})`);
            }
        }

        console.log(`\nCleanup complete. Deleted ${deletedCount} records.`);
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

cleanup();
