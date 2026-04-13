const request = require('supertest');
const { app } = require('../server');
const db = require('./setup');
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const jwt = require('jsonwebtoken');

let adminToken;
let userToken;
let admin;
let user;

beforeAll(async () => {
  await db.connect();
  
  // Create an admin user
  admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
  });

  // Create a customer user
  user = await User.create({
    name: 'Player User',
    email: 'player@test.com',
    password: 'password123',
    role: 'customer'
  });

  process.env.JWT_SECRET = 'testsecret';
  process.env.JWT_EXPIRE = '30d';

  adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
});

afterAll(async () => {
  await db.closeDatabase();
});

describe('Tournament API', () => {
  beforeEach(async () => {
    await Tournament.deleteMany({});
  });

  describe('POST /api/tournaments', () => {
    it('should allow admin to create a tournament', async () => {
      const tournamentData = {
        name: 'Summer Futsal Cup',
        sportType: 'futsal',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        entryFee: 500,
        registrationDeadline: new Date(),
        maxTeams: 8,
        description: 'Biggest tournament of the year'
      };

      const res = await request(app)
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tournamentData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(tournamentData.name);
    });

    it('should refuse tournament creation for non-admins', async () => {
      const res = await request(app)
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('GET /api/tournaments', () => {
    it('should list all tournaments', async () => {
      await Tournament.create({
        name: 'Futsal League 1',
        sportType: 'futsal',
        startDate: new Date(),
        endDate: new Date(),
        registrationDeadline: new Date(),
        maxTeams: 10,
        description: 'Test Description',
        createdBy: admin._id
      });

      const res = await request(app).get('/api/tournaments');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBe(1);
    });
  });
});
