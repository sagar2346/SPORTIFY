const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const Tournament = require('../models/Tournament');
const TournamentRegistration = require('../models/TournamentRegistration');
const Footage = require('../models/Footage');

dotenv.config();

const runCleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const venues = await Venue.find();
        console.log(`Checking ${venues.length} venues for orphaned status...`);

        let deletedCount = 0;

        for (const venue of venues) {
            const owner = await User.findById(venue.owner);
            
            if (!owner) {
                console.log(`[Cleanup] Found orphaned venue: ${venue.name} (ID: ${venue._id}). Owner (ID: ${venue.owner}) does not exist.`);

                // 1. Delete associated bookings
                const bookingsDeleted = await Booking.deleteMany({ venue: venue._id });
                console.log(`  - Deleted ${bookingsDeleted.deletedCount} associated bookings.`);

                // 2. Delete associated reviews
                const reviewsDeleted = await Review.deleteMany({ venue: venue._id });
                console.log(`  - Deleted ${reviewsDeleted.deletedCount} associated reviews.`);

                // 3. Delete associated tournaments and their registrations
                const tournaments = await Tournament.find({ venue: venue._id });
                const tournamentIds = tournaments.map(t => t._id);
                if (tournamentIds.length > 0) {
                    await TournamentRegistration.deleteMany({ tournament: { $in: tournamentIds } });
                    await Tournament.deleteMany({ _id: { $in: tournamentIds } });
                    console.log(`  - Deleted ${tournamentIds.length} tournaments and their registrations.`);
                }

                // 4. Delete associated footage
                const footageDeleted = await Footage.deleteMany({ venue: venue._id });
                console.log(`  - Deleted ${footageDeleted.deletedCount} footage records.`);

                // 5. Delete the venue itself
                await Venue.findByIdAndDelete(venue._id);
                console.log(`  - Deleted venue: ${venue.name}`);

                deletedCount++;
            }
        }

        console.log('--- CLEANUP COMPLETE ---');
        console.log(`Total Orphaned Venues Removed: ${deletedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('CLEANUP FAILED:', error.message);
        process.exit(1);
    }
};

runCleanup();
