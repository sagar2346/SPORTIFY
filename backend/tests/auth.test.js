const request = require('supertest');
const { app, server } = require('../server');
const db = require('./setup');
const User = require('../models/User');

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.closeDatabase();
});

describe('Auth API', () => {
  beforeEach(async () => {
    await db.clearDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test UI User',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.name).toBe(userData.name);
    });

    it('should fail if email is invalid', async () => {
      const userData = {
        name: 'Test UI User',
        email: 'invalid-email',
        password: 'password123',
        role: 'customer'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Pre-register a user for login tests
      await User.create({
        name: 'Login Tester',
        email: 'login@test.com',
        password: 'password123', // Note: controller should handle hashing during creation or use pre-save hook
        role: 'customer'
      });
    });

    it('should login an existing user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
    });
  });
});
