const mongoose = require('mongoose');

function arrayLimit(val) {
  return val.length <= 10;
}

const TimeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

const PricingRuleSchema = new mongoose.Schema({
  dayType: {
    type: String,
    enum: ['weekday', 'weekend', 'holiday'],
    required: true,
  },
  timeType: {
    type: String,
    enum: ['peak', 'off-peak'],
    required: true,
  },
  multiplier: {
    type: Number,
    default: 1.0,
  },
});

const VenueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a venue name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sportTypes: {
    type: [{
      type: String,
      enum: [
        'football',
        'basketball',
        'tennis',
        'badminton',
        'swimming',
        'volleyball',
        'cricket',
        'gym',
        'futsal',
        'table_tennis',
        'other',
      ]
    }],
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']
  },
  images: [
    {
      type: String,
    },
  ],
  location: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
    },
    country: {
      type: String,
      required: true,
    },
    coordinates: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
  },
  facilities: [
    {
      type: String,
    },
  ],
  capacity: {
    type: Number,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  pricingRules: [PricingRuleSchema],
  operatingHours: {
    monday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    tuesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    wednesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    thursday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    friday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    saturday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    sunday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
  },
  timeSlots: [TimeSlotSchema],
  blockedDates: [
    {
      date: Date,
      reason: String,
    },
  ],
  rating: {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for search
VenueSchema.index({ name: 'text', description: 'text', 'location.city': 'text' });
VenueSchema.index({ sportTypes: 1 });
VenueSchema.index({ 'location.city': 1 });
VenueSchema.index({ rating: -1 });

// Reverse populate with virtuals
VenueSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'venue',
  justOne: false
});

// Create model with virtuals enabled
const Venue = mongoose.model('Venue', VenueSchema);

// Enable virtuals in toJSON/toObject
VenueSchema.set('toJSON', { virtuals: true });
VenueSchema.set('toObject', { virtuals: true });

module.exports = Venue;

