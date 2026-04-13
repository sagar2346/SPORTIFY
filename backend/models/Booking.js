const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
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
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  numberOfPlayers: {
    type: Number,
    default: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  discount: {
    code: String,
    amount: {
      type: Number,
      default: 0,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'verification_pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'esewa', 'bank_transfer', 'wallet'],
    },
    transactionId: String,
    paidAt: Date,
  },
  ticket: {
    qrCode: String,
    pdfUrl: String,
  },
  cancellation: {
    requestedAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'rejected'],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isReviewed: {
    type: Boolean,
    default: false,
  },
});

// Prevent double booking
BookingSchema.index({ venue: 1, bookingDate: 1, startTime: 1, endTime: 1 });
BookingSchema.index({ user: 1, bookingDate: -1 });

module.exports = mongoose.model('Booking', BookingSchema);

