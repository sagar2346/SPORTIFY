const request = require('supertest');
const { app } = require('../server');
const db = require('./setup');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const jwt = require('jsonwebtoken');

let token;
let owner;

beforeAll(async () => {
  await db.connect();
  
  owner = await User.create({
    name: 'Venue Owner',
    email: 'owner@test.com',
    password: 'password123',
    role: 'venue_owner'
  });

  token = jwt.sign({ id: owner._id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });
});

afterAll(async () => {
  await db.closeDatabase();
});

describe('Inventory API', () => {
  beforeEach(async () => {
    await Inventory.deleteMany({});
  });

  describe('POST /api/inventory', () => {
    it('should allow venue owner to add inventory item', async () => {
      const itemData = {
        name: 'Football - Size 5',
        sport: 'Football',
        quantity: 10,
        condition: 'New'
      };

      const res = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${token}`)
        .send(itemData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(itemData.name);
    });
  });

  describe('GET /api/inventory', () => {
    it('should list inventory items for the owner', async () => {
      await Inventory.create({
        owner: owner._id,
        name: 'Badminton Racket',
        sport: 'Badminton',
        quantity: 5,
        condition: 'Good'
      });

      const res = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBe(1);
    });
  });
});
