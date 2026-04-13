const mongoose = require('mongoose');
const uri = 'mongodb://127.0.0.1:27017/sport-booking';

async function run() {
    try {
        await mongoose.connect(uri);
        const User = mongoose.model('User', new mongoose.Schema({ name: String, email: String, role: String }));
        const Venue = mongoose.model('Venue', new mongoose.Schema({ name: String, owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }));

        const partners = await User.find({ role: 'venue_owner' });
        console.log(` Partners found: ${partners.length}`);
        for (const p of partners) {
            const venues = await Venue.find({ owner: p._id });
            console.log(`- ${p.name} <${p.email}> ID: ${p._id} | Venues: ${venues.length}`);
            venues.forEach(v => console.log(`  * ${v.name}`));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}
run();
