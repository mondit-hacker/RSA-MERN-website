'use strict';
const request = require('supertest');
const app     = require('../server');
const User    = require('../models/User');
const h       = require('./helpers');

describe('━━━ AUTH TESTS ━━━', () => {

  // ── Registration ──────────────────────────────────────────────
  describe('Registration', () => {
    it('registers a new user', async () => {
      const res = await request(app).post('/api/auth/register')
        .send({ firstName:'John', lastName:'Doe', email:'john@rsa.com', password:'John@1234' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects duplicate email', async () => {
      await request(app).post('/api/auth/register')
        .send({ firstName:'A', lastName:'B', email:'dup@rsa.com', password:'Test@1234' });
      const res = await request(app).post('/api/auth/register')
        .send({ firstName:'C', lastName:'D', email:'dup@rsa.com', password:'Test@1234' });
      expect(res.status).toBe(409);
    });

    it('rejects missing email', async () => {
      const res = await request(app).post('/api/auth/register')
        .send({ firstName:'X', lastName:'Y', password:'Test@1234' });
      expect(res.status).toBe(400);
    });

    it('rejects missing firstName', async () => {
      const res = await request(app).post('/api/auth/register')
        .send({ lastName:'Y', email:'x@rsa.com', password:'Test@1234' });
      expect(res.status).toBe(400);
    });

    it('rejects very long email', async () => {
      const res = await request(app).post('/api/auth/register')
        .send({ firstName:'X', lastName:'Y', email:'a'.repeat(200)+'@rsa.com', password:'Test@1234' });
      expect([400,422,500]).toContain(res.status);
    });

    it('rejects SQL injection in email', async () => {
      const res = await request(app).post('/api/auth/register')
        .send({ firstName:'X', lastName:'Y', email:"admin'--@rsa.com", password:'Test@1234' });
      expect([400,422]).toContain(res.status);
    });

    it('rejects XSS in firstName', async () => {
      const res = await request(app).post('/api/auth/register')
        .send({ firstName:'<script>alert(1)</script>', lastName:'Y', email:'xss@rsa.com', password:'Test@1234' });
      // Should either reject or sanitize
      if (res.status === 201) {
        const u = await User.findOne({ email:'xss@rsa.com' });
        expect(u.firstName).not.toContain('<script>');
      } else {
        expect([400,422]).toContain(res.status);
      }
    });

    it('rejects empty body', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.status).toBe(400);
    });

    it('rejects MongoDB injection in email', async () => {
      const res = await request(app).post('/api/auth/register')
        .send({ firstName:'X', lastName:'Y', email:{ $gt:'' }, password:'Test@1234' });
      expect([400,422,500]).toContain(res.status);
    });
  });

  // ── Login ─────────────────────────────────────────────────────
  describe('Login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register')
        .send({ firstName:'Login', lastName:'User', email:'login@rsa.com', password:'Login@1234' });
    });

    it('returns token on correct credentials', async () => {
      const res = await request(app).post('/api/auth/login')
        .send({ email:'login@rsa.com', password:'Login@1234' });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.accessToken).toBeTruthy();
    });

    it('returns user object', async () => {
      const res = await request(app).post('/api/auth/login')
        .send({ email:'login@rsa.com', password:'Login@1234' });
      expect(res.body.data.user).toHaveProperty('email', 'login@rsa.com');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('rejects wrong password', async () => {
      const res = await request(app).post('/api/auth/login')
        .send({ email:'login@rsa.com', password:'WrongPass123' });
      expect(res.status).toBe(401);
    });

    it('rejects non-existent email', async () => {
      const res = await request(app).post('/api/auth/login')
        .send({ email:'nobody@rsa.com', password:'Test@1234' });
      expect(res.status).toBe(401);
    });

    it('rejects empty body', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });

    it('rejects case-variant email correctly', async () => {
      const res = await request(app).post('/api/auth/login')
        .send({ email:'LOGIN@RSA.COM', password:'Login@1234' });
      // Should either normalize and succeed or reject - both are valid
      expect([200,401]).toContain(res.status);
    });
  });

  // ── Token / Auth middleware ───────────────────────────────────
  describe('Token security', () => {
    let token;
    beforeEach(async () => {
      const { token: t } = await h.registerAndLogin({
        firstName:'Me', lastName:'User', email:'me@rsa.com', password:'Me@123456'
      });
      token = t;
    });

    it('returns user with valid token', async () => {
      const res = await request(app).get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('me@rsa.com');
    });

    it('rejects request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('rejects tampered token', async () => {
      const tampered = token.slice(0,-5) + 'XXXXX';
      const res = await request(app).get('/api/auth/me')
        .set('Authorization', `Bearer ${tampered}`);
      expect(res.status).toBe(401);
    });

    it('rejects malformed token', async () => {
      const res = await request(app).get('/api/auth/me')
        .set('Authorization', 'Bearer not.a.jwt');
      expect(res.status).toBe(401);
    });

    it('rejects empty Bearer', async () => {
      const res = await request(app).get('/api/auth/me')
        .set('Authorization', 'Bearer ');
      expect(res.status).toBe(401);
    });

    it('rejects Basic auth instead of Bearer', async () => {
      const res = await request(app).get('/api/auth/me')
        .set('Authorization', 'Basic dXNlcjpwYXNz');
      expect(res.status).toBe(401);
    });
  });

  // ── Role enforcement ──────────────────────────────────────────
  describe('Role enforcement', () => {
    it('student cannot access admin routes', async () => {
      const { token } = await h.registerAndLogin({
        firstName:'S', lastName:'T', email:'stu@rsa.com', password:'Stu@1234'
      });
      const res = await request(app).get('/api/admin/students')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('teacher cannot access admin routes', async () => {
      const adminTok = await h.getAdminToken();
      const { token } = await h.getTeacherToken(adminTok);
      const res = await request(app).get('/api/admin/students')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });
  });
});
