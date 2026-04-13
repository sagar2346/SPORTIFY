const request = require('supertest');
const { app } = require('../server');
const db = require('./setup');
const User = require('../models/User');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'testsecret';
process.env.JWT_EXPIRE = '30d';

let token;
let user;

beforeAll(async () => {
  await db.connect();
  
  user = await User.create({
    name: 'Chatter',
    email: 'chatter@test.com',
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

describe('Messages API', () => {
  beforeEach(async () => {
    await Message.deleteMany({});
  });

  describe('POST /api/messages', () => {
    it('should send a message to admin', async () => {
      const msgData = {
        subject: 'Inquiry',
        message: 'Hello, I have a question about venue booking.'
      };

      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token}`)
        .send(msgData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.subject).toBe(msgData.subject);
      
      const msg = await Message.findOne({ subject: 'Inquiry' });
      expect(msg).toBeTruthy();
      expect(msg.user.toString()).toBe(user._id.toString());
    });

    it('should fail if message is missing', async () => {
      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({ subject: 'Inquiry' });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/messages/my', () => {
    it('should return user specific messages', async () => {
      await Message.create({
        user: user._id,
        name: user.name,
        email: user.email,
        subject: 'My Question',
        message: 'This is my question'
      });

      const res = await request(app)
        .get('/api/messages/my')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].subject).toBe('My Question');
    });
  });
});
