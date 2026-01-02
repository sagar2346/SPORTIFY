const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['customer', 'venue_owner', 'admin'],
    default: 'customer',
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  // For venue owners
  isApproved: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'modified', 'blocked'],
    default: 'pending',
  },
  // For customers
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
    },
  ],
  // Contacts / Friends
  contacts: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  notifications: [
    {
      type: {
        type: String,
        enum: ['booking', 'payment', 'review', 'system', 'message_reply'],
      },
      message: String,
      read: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // KYC verification
  kycStatus: {
    type: String,
    enum: ['not_verified', 'pending', 'verified', 'rejected'],
    default: 'not_verified',
  },
  kycDocumentFront: {
    type: String,
    default: '',
  },
  kycDocumentBack: {
    type: String,
    default: '',
  },
  kycPassportPhoto: {
    type: String,
    default: '',
  },
  kycRejectionReason: {
    type: String,
    default: '',
  },
  kycSubmittedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

