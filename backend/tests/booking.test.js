const request = require('supertest');
const { app } = require('../server');
const db = require('./setup');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

let token;
let user;
let venue;

beforeAll(async () => {
  await db.connect();
  
  // Create a test user
  user = await User.create({
    name: 'Booking User',
    email: 'booking@test.com',
    password: 'password123',
    role: 'customer'
  });

  // Generate JWT token
  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });

  // Create a test venue
  venue = await Venue.create({
    name: 'Test Futsal',
    description: 'High quality futsal court',
    owner: user._id, // In real case, owner would be a partner
    sportTypes: ['futsal'],
    location: {
      address: '123 Sport St',
      city: 'Kathmandu',
      state: 'Bagmati',
      country: 'Nepal'
    },
    capacity: 10,
    basePrice: 1500,
    isApproved: true,
    isActive: true
  });
});

afterAll(async () => {
  await db.closeDatabase();
});

describe('Booking API', () => {
  beforeEach(async () => {
    await Booking.deleteMany({});
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        venueId: venue._id.toString(),
        bookingDate: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        sportType: 'futsal',
        totalPrice: 1500
      };

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.venue._id).toBe(venue._id.toString());
      
      const booking = await Booking.findOne({ venue: venue._id });
      expect(booking).toBeTruthy();
    });

    it('should fail if venueId is missing', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).not.toEqual(201);
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    let testBooking;

    beforeEach(async () => {
      testBooking = await Booking.create({
        user: user._id,
        venue: venue._id,
        bookingDate: new Date(),
        startTime: '14:00',
        endTime: '15:00',
        totalPrice: 1500,
        basePrice: 1500,
        status: 'pending'
      });
    });

    it('should cancel an existing booking', async () => {
      const res = await request(app)
        .put(`/api/bookings/${testBooking._id}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Changing plans' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      
      const canceledBooking = await Booking.findById(testBooking._id);
      expect(canceledBooking.status).toBe('cancelled');
    });
  });
});
