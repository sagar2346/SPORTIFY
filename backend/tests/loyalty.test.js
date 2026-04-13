const request = require('supertest');
const { app } = require('../server');
const db = require('./setup');
const User = require('../models/User');
const Venue = require('../models/Venue');
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');

// Mock utilities
jest.mock('../utils/email');
jest.mock('../utils/ticket', () => ({
  generateQRCode: jest.fn().mockResolvedValue('/mock/qr.png'),
  generateTicketPDF: jest.fn().mockResolvedValue('/mock/ticket.pdf')
}));

let adminToken;
let user;
let venue;

beforeAll(async () => {
  await db.connect();
  
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@loyalty.com',
    password: 'password123',
    role: 'admin'
  });

  user = await User.create({
    name: 'Loyal User',
    email: 'loyal@test.com',
    password: 'password123',
    role: 'customer'
  });

  adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });

  venue = await Venue.create({
    name: 'Loyalty Court',
    description: 'D',
    owner: admin._id,
    sportTypes: ['tennis'],
    location: { address: 'A', city: 'C', state: 'S', country: 'N' },
    capacity: 2,
    basePrice: 1000,
    isApproved: true
  });
});

afterAll(async () => {
  await db.closeDatabase();
});

describe('Loyalty System', () => {
  it('should award loyalty points after booking confirmation', async () => {
    // 1. Create a pending booking
    const booking = await Booking.create({
      user: user._id,
      venue: venue._id,
      bookingDate: new Date(),
      startTime: '10:00',
      endTime: '11:00',
      totalPrice: 1000,
      basePrice: 1000,
      status: 'pending'
    });

    // 2. Confirm the booking (via admin)
    const res = await request(app)
      .put(`/api/bookings/${booking._id}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    
    // 3. Check user loyalty points (5% of 1000 = 50)
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.loyaltyPoints).toBeGreaterThan(0);
    expect(updatedUser.loyaltyPoints).toBe(50);
  });
});
