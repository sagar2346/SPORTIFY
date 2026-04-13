const mongoose = require('mongoose');
const User = require('./models/User');

async function syncPoints() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sport-booking');
    const user = await User.findOneAndUpdate(
      { email: 'dahalsagar398@gmail.com' },
      { $set: { loyaltyPoints: 20.00 } },
      { new: true }
    );
    if (user) {
      console.log(`Successfully updated points for ${user.name}: ${user.loyaltyPoints}`);
    } else {
      console.log('User not found');
    }
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

syncPoints();
