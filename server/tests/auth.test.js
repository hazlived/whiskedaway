const request = require('supertest');
const mongoose = require('mongoose');
const express = require('cors');
const expressApp = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Session = require('../models/Session');
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const errorHandler = require('../middleware/errorHandler');

const app = expressApp();
app.use(expressApp.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use(errorHandler);

describe('WhiskedAway Auth & Security Integration Test Suite', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/whiskedaway_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await User.deleteMany({ emailNormalized: { $regex: /test/i } });
    await Session.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({ emailNormalized: { $regex: /test/i } });
    await Session.deleteMany({});
  });

  test('1. Valid registration succeeds and excludes sensitive hashes', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'test_chef',
        email: 'chef_test@example.com',
        password: 'SuperSecurePassword123!',
        displayName: 'Chef Test'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.username).toBe('test_chef');
    expect(res.body.data.passwordHash).toBeUndefined();
    expect(res.body.data.emailVerificationTokenHash).toBeUndefined();

    // Verify DB record
    const userInDb = await User.findOne({ usernameNormalized: 'test_chef' }).select('+passwordHash');
    expect(userInDb).not.toBeNull();
    expect(userInDb.passwordHash).not.toBe('SuperSecurePassword123!');
  });

  test('2. Case-insensitive duplicate username is rejected with 409 Conflict', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'test_gourmet',
        email: 'test_gourmet1@example.com',
        password: 'SuperSecurePassword123!'
      });

    const dupRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'Test_Gourmet', // Different casing
        email: 'test_gourmet2@example.com',
        password: 'SuperSecurePassword123!'
      });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error.code).toBe('USERNAME_TAKEN');
  });

  test('3. Case-insensitive duplicate email is rejected with 409 Conflict', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'test_baker1',
        email: 'baker_test@example.com',
        password: 'SuperSecurePassword123!'
      });

    const dupRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'test_baker2',
        email: 'Baker_Test@Example.com', // Different casing
        password: 'SuperSecurePassword123!'
      });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error.code).toBe('EMAIL_TAKEN');
  });

  test('4. Reserved usernames are rejected', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'admin',
        email: 'test_admin@example.com',
        password: 'SuperSecurePassword123!'
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_USERNAME');
  });

  test('5. Valid login succeeds and invalid password returns generic 401 error', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'test_login_user',
        email: 'test_login@example.com',
        password: 'SuperSecurePassword123!'
      });

    // Valid login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        loginInput: 'test_login_user',
        password: 'SuperSecurePassword123!'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);

    // Invalid password
    const failRes = await request(app)
      .post('/api/auth/login')
      .send({
        loginInput: 'test_login_user',
        password: 'WrongPassword123!'
      });

    expect(failRes.status).toBe(401);
    expect(failRes.body.error.message).toBe('Invalid email/username or password.');
  });

  test('6. Profile update prevents mass assignment of forbidden fields', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'test_profile_user',
        email: 'test_profile@example.com',
        password: 'SuperSecurePassword123!'
      });

    const cookie = regRes.headers['set-cookie'];

    const updateRes = await request(app)
      .patch('/api/users/me')
      .set('Cookie', cookie)
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({
        displayName: 'Updated Name',
        role: 'admin' // Attempted mass assignment attack
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.displayName).toBe('Updated Name');
    expect(updateRes.body.data.role).toBe('user'); // Must remain 'user'
  });
});
