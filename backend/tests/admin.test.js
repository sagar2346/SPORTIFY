const request = require('supertest');
const { app } = require('../server');
const db = require('./setup');
const User = require('../models/User');
const Venue = require('../models/Venue');
const jwt = require('jsonwebtoken');

let adminToken;
let admin;

beforeAll(async () => {
  await db.connect();
  
  admin = await User.create({
    name: 'Master Admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
  });

  adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });
});

afterAll(async () => {
  await db.closeDatabase();
});

describe('Admin API', () => {
  describe('GET /api/admin/dashboard', () => {
    it('should allow admin to access dashboard stats', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/admin/kyc/:userId/status', () => {
    it('should update user KYC status', async () => {
      const targetUser = await User.create({
        name: 'Target User',
        email: 'target@test.com',
        password: 'password123',
        kycStatus: 'pending'
      });

      const res = await request(app)
        .put(`/api/admin/kyc/${targetUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'verified' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      
      const updatedUser = await User.findById(targetUser._id);
      expect(updatedUser.kycStatus).toBe('verified');
    });
  });

  describe('PUT /api/admin/approve-venue/:venueId', () => {
    it('should approve a pending venue', async () => {
      const venue = await Venue.create({
        name: 'Pending Court',
        description: 'New court',
        owner: admin._id,
        sportTypes: ['tennis'],
        location: { address: 'A', city: 'C', state: 'S', country: 'N' },
        capacity: 2,
        basePrice: 500,
        isApproved: false
      });

      const res = await request(app)
        .put(`/api/admin/approve-venue/${venue._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      
      const updatedVenue = await Venue.findById(venue._id);
      expect(updatedVenue.isApproved).toBe(true);
    });
  });
});
