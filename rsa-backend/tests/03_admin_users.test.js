'use strict';
const request = require('supertest');
const app     = require('../server');
const h       = require('./helpers');

describe('━━━ ADMIN: USERS ━━━', () => {
  let adminToken;
  beforeEach(async () => { adminToken = await h.getAdminToken(); });

  describe('Create User', () => {
    it('creates a teacher account', async () => {
      const res = await request(app).post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'Ravi', lastName:'Kumar', email:'ravi@rsa.com', role:'teacher', campus:'hcpur' });
      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('teacher');
    });

    it('creates HR account', async () => {
      const res = await request(app).post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'HR', lastName:'Staff', email:'hr@rsa.com', role:'hr', campus:'hcpur' });
      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('hr');
    });

    it('creates manager account', async () => {
      const res = await request(app).post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'Mgr', lastName:'Test', email:'mgr@rsa.com', role:'manager', campus:'both' });
      expect(res.status).toBe(201);
    });

    it('creates developer account', async () => {
      const res = await request(app).post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'Dev', lastName:'Test', email:'dev@rsa.com', role:'developer', campus:'both' });
      expect(res.status).toBe(201);
    });

    it('auto-generates password when blank', async () => {
      const res = await request(app).post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'Auto', lastName:'Pass', email:'autop@rsa.com', role:'teacher', campus:'hcpur' });
      expect(res.body.data).toHaveProperty('password');
      expect(res.body.data.password.length).toBeGreaterThan(6);
    });

    it('uses manual password', async () => {
      const res = await request(app).post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'Manual', lastName:'Pass', email:'manual@rsa.com', role:'teacher', campus:'hcpur', password:'Manual@1234' });
      expect(res.status).toBe(201);
      const lr = await request(app).post('/api/auth/login').send({ email:'manual@rsa.com', password:'Manual@1234' });
      expect(lr.status).toBe(200);
    });

    it('rejects duplicate email', async () => {
      await request(app).post('/api/admin/users').set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'A', lastName:'B', email:'dup@rsa.com', role:'teacher', campus:'hcpur' });
      const res = await request(app).post('/api/admin/users').set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'C', lastName:'D', email:'dup@rsa.com', role:'hr', campus:'hcpur' });
      expect(res.status).toBe(409);
    });

    it('rejects invalid role', async () => {
      const res = await request(app).post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'X', lastName:'Y', email:'x@rsa.com', role:'superuser', campus:'hcpur' });
      expect([400,422]).toContain(res.status);
    });

    it('blocks non-admin from creating users', async () => {
      const hrTok = await h.getHRToken();
      const res = await request(app).post('/api/admin/users')
        .set('Authorization', `Bearer ${hrTok}`)
        .send({ firstName:'X', lastName:'Y', email:'x@rsa.com', role:'teacher', campus:'hcpur' });
      expect(res.status).toBe(403);
    });
  });

  describe('List / Reset / Unlock Users', () => {
    let userId;
    beforeEach(async () => {
      const res = await request(app).post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'List', lastName:'User', email:'list@rsa.com', role:'teacher', campus:'hcpur' });
      userId = res.body.data?.user?._id;
    });

    it('lists users', async () => {
      const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });

    it('filters users by role', async () => {
      const res = await request(app).get('/api/admin/users?role=teacher').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.data.users.forEach(u => expect(u.role).toBe('teacher'));
    });

    it('resets password', async () => {
      const res = await request(app).patch(`/api/admin/users/${userId}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ password:'NewPass@1234' });
      expect(res.status).toBe(200);
      const lr = await request(app).post('/api/auth/login').send({ email:'list@rsa.com', password:'NewPass@1234' });
      expect(lr.status).toBe(200);
    });

    it('deactivates user', async () => {
      const res = await request(app).patch(`/api/admin/users/${userId}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200,204]).toContain(res.status);
    });

    it('activates user', async () => {
      const res = await request(app).patch(`/api/admin/users/${userId}/activate`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200,204]).toContain(res.status);
    });
  });
});
