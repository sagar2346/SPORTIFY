const request = require('supertest');
const { app } = require('../server');
const db = require('./setup');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let token;
let user;

beforeAll(async () => {
  await db.connect();
  
  user = await User.create({
    name: 'KYC Candidate',
    email: 'kyc@test.com',
    password: 'password123',
    role: 'venue_owner'
  });

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });
});

afterAll(async () => {
  await db.closeDatabase();
});

describe('KYC API', () => {
  describe('GET /api/kyc/status', () => {
    it('should return the initial KYC status as not_submitted', async () => {
      const res = await request(app)
        .get('/api/kyc/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kycStatus).toBe('not_verified');
    });

    it('should return the updated status after manual update in DB', async () => {
      await User.findByIdAndUpdate(user._id, { kycStatus: 'pending' });
      
      const res = await request(app)
        .get('/api/kyc/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.kycStatus).toBe('pending');
    });
  });
});
