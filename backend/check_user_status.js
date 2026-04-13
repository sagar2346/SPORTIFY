const mongoose = require('mongoose');
const User = require('./models/User');
const Booking = require('./models/Booking');

async function checkUserAndBookings() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sport-booking');
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'dahalsagar398@gmail.com' });
    if (!user) {
      console.log('User not found');
      await mongoose.connection.close();
      return;
    }

    console.log('User ID:', user._id);
    console.log('User Name:', user.name);
    console.log('Loyalty Points:', user.loyaltyPoints);
    console.log('Wallet Balance:', user.walletBalance);

    const bookings = await Booking.find({ user: user._id });
    console.log('Number of Bookings:', bookings.length);

    bookings.forEach((b, i) => {
      console.log(`\nBooking ${i + 1}:`);
      console.log('ID:', b._id);
      console.log('Status:', b.status);
      console.log('Payment Status:', b.payment.status);
      console.log('Total Price:', b.totalPrice);
    });

    await mongoose.connection.close();
    console.log('\nConnection closed');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUserAndBookings();
