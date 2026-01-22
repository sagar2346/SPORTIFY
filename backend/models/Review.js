const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  images: [
    {
      type: String,
    },
  ],
  helpful: {
    count: {
      type: Number,
      default: 0,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// One review per booking
ReviewSchema.index({ booking: 1 }, { unique: true });
ReviewSchema.index({ venue: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);

