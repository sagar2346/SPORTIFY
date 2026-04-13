const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env to get DB connection string if needed, or assume local
dotenv.config({ path: path.join(__dirname, '.env') });

const Team = require('./models/Team');

async function findBlockedTeams() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sportify');
        const teams = await Team.find({ isBlocked: true });
        console.log('---BLOCKED TEAMS START---');
        console.log(JSON.stringify(teams.map(t => ({ id: t._id, name: t.name, fine: t.fineAmount }))));
        console.log('---BLOCKED TEAMS END---');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

findBlockedTeams();
