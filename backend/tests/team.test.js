const request = require('supertest');
const { app } = require('../server');
const db = require('./setup');
const User = require('../models/User');
const Team = require('../models/Team');
const jwt = require('jsonwebtoken');

let token;
let user;

beforeAll(async () => {
  await db.connect();
  
  user = await User.create({
    name: 'Team Captain',
    email: 'captain@test.com',
    password: 'password123',
    role: 'customer'
  });

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });
});

afterAll(async () => {
  await db.closeDatabase();
});

describe('Team API', () => {
  beforeEach(async () => {
    await Team.deleteMany({});
  });

  describe('POST /api/teams', () => {
    it('should create a new team successfully', async () => {
      const teamData = {
        name: 'The Warriors',
        description: 'Elite futsal team',
        sport: 'futsal'
      };

      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${token}`)
        .send(teamData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(teamData.name);
      
      const team = await Team.findOne({ name: 'The Warriors' });
      expect(team).toBeTruthy();
      expect(team.createdBy.toString()).toBe(user._id.toString());
    });
  });

  describe('POST /api/teams/join', () => {
    it('should allow joining a team via invite code', async () => {
      const team = await Team.create({
        name: 'Open Team',
        createdBy: user._id,
        inviteCode: 'JOIN123',
        members: [{ user: user._id, role: 'leader' }],
        sport: 'futsal'
      });

      const newUser = await User.create({
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123'
      });

      const newToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d'
      });

      const res = await request(app)
        .post('/api/teams/join')
        .set('Authorization', `Bearer ${newToken}`)
        .send({ inviteCode: 'JOIN123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });
});
