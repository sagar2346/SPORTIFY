// Mock Gemini utility
jest.mock('../utils/gemini', () => ({
  generateGeneralChat: jest.fn().mockResolvedValue('Mocked AI Response'),
  generateVenueReviewSummary: jest.fn().mockResolvedValue('Mocked Summary')
}));

process.env.JWT_SECRET = 'testsecret';
process.env.JWT_EXPIRE = '30d';

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
    name: 'AI User',
    email: 'ai@test.com',
    password: 'password123',
    role: 'customer'
  });

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
});

afterAll(async () => {
  await db.closeDatabase();
});

describe('AI API', () => {
  describe('POST /api/ai/chat', () => {
    it('should return a mocked AI response', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'How do I login and book a venue?' });


      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.reply).toBe('Mocked AI Response');
    });
  });

  describe('GET /api/ai/recommend', () => {
    it('should return recommendations for protected user', async () => {
      const res = await request(app)
        .get('/api/ai/recommend')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
    });
  });
});
