'use strict';
const request = require('supertest');
const app     = require('../server');
const h       = require('./helpers');

describe('━━━ HR PANEL TESTS ━━━', () => {
  let hrToken, adminToken;
  beforeEach(async () => {
    adminToken = await h.getAdminToken();
    hrToken    = await h.getHRToken();
  });

  describe('Faculty Management', () => {
    it('HR can create teacher', async () => {
      const res = await request(app).post('/api/hr/teachers')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'Sita', lastName:'Sharma', email:'sita@rsa.com', campus:'hcpur', designation:'Science Teacher', subjects:'Science,Mathematics', grades:'6,7' });
      expect(res.status).toBe(201);
      expect(res.body.data.teacher).toHaveProperty('employeeId');
      expect(res.body.data).toHaveProperty('password');
    });

    it('Admin can create teacher via HR route', async () => {
      const res = await request(app).post('/api/hr/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'Admin', lastName:'Created', email:'admincreated@rsa.com', campus:'hcpur' });
      expect(res.status).toBe(201);
    });

    it('auto-generates employeeId with TEA- prefix', async () => {
      const res = await request(app).post('/api/hr/teachers')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'Auto', lastName:'ID', email:'autoid@rsa.com', campus:'hcpur' });
      expect(res.body.data.teacher.employeeId).toMatch(/^TEA-/);
    });

    it('teacher can login after creation', async () => {
      const res = await request(app).post('/api/hr/teachers')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'Login', lastName:'Test', email:'logintest@rsa.com', campus:'hcpur', password:'Teacher@1234' });
      expect(res.status).toBe(201);
      const lr = await request(app).post('/api/auth/login').send({ email:'logintest@rsa.com', password:'Teacher@1234' });
      expect(lr.status).toBe(200);
      expect(lr.body.data.user.role).toBe('teacher');
    });

    it('lists teachers', async () => {
      await request(app).post('/api/hr/teachers').set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'T1', lastName:'Test', email:'t1@rsa.com', campus:'hcpur' });
      const res = await request(app).get('/api/hr/teachers').set('Authorization', `Bearer ${hrToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.teachers.length).toBeGreaterThan(0);
    });

    it('updates teacher designation', async () => {
      const c = await request(app).post('/api/hr/teachers').set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'Upd', lastName:'T', email:'updt@rsa.com', campus:'hcpur' });
      const tid = c.body.data.teacher._id;
      const res = await request(app).patch(`/api/hr/teachers/${tid}`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ designation:'Head of Science' });
      expect(res.status).toBe(200);
      expect(res.body.data.teacher.designation).toBe('Head of Science');
    });

    it('soft-deletes teacher', async () => {
      const c = await request(app).post('/api/hr/teachers').set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'Del', lastName:'T', email:'delt@rsa.com', campus:'hcpur' });
      const tid = c.body.data.teacher._id;
      const res = await request(app).delete(`/api/hr/teachers/${tid}`).set('Authorization', `Bearer ${hrToken}`);
      expect(res.status).toBe(200);
      // Teacher can no longer login
      const lr = await request(app).post('/api/auth/login').send({ email:'delt@rsa.com', password:c.body.data.password });
      expect([401,403]).toContain(lr.status);
    });

    it('rejects duplicate teacher email', async () => {
      await request(app).post('/api/hr/teachers').set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'A', lastName:'B', email:'dupteach@rsa.com', campus:'hcpur' });
      const res = await request(app).post('/api/hr/teachers').set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'C', lastName:'D', email:'dupteach@rsa.com', campus:'kashimpur' });
      expect(res.status).toBe(409);
    });

    it('filters teachers by campus', async () => {
      await request(app).post('/api/hr/teachers').set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'HCP', lastName:'T', email:'hcpt@rsa.com', campus:'hcpur' });
      await request(app).post('/api/hr/teachers').set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'KSP', lastName:'T', email:'kspt@rsa.com', campus:'kashimpur' });
      const res = await request(app).get('/api/hr/teachers?campus=hcpur').set('Authorization', `Bearer ${hrToken}`);
      expect(res.status).toBe(200);
      res.body.data.teachers.forEach(t => expect(t.campus).toBe('hcpur'));
    });

    it('blocks student from accessing HR routes', async () => {
      const { token } = await h.registerAndLogin({ firstName:'S', lastName:'T', email:'stu@t.com', password:'Stu@1234' });
      const res = await request(app).get('/api/hr/teachers').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('HR cannot create admin via staff route', async () => {
      const res = await request(app).post('/api/hr/staff')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'X', lastName:'Y', email:'x@rsa.com', role:'admin', campus:'both' });
      expect(res.status).toBe(403);
    });

    it('HR cannot create developer', async () => {
      const res = await request(app).post('/api/hr/staff')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'X', lastName:'Y', email:'dev@rsa.com', role:'developer', campus:'both' });
      expect(res.status).toBe(403);
    });
  });

  describe('Staff Management', () => {
    it('creates HR staff member', async () => {
      const res = await request(app).post('/api/hr/staff')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'HR2', lastName:'Staff', email:'hr2@rsa.com', role:'hr', campus:'both' });
      expect(res.status).toBe(201);
      expect(res.body.data.staff.role).toBe('hr');
    });

    it('creates manager', async () => {
      const res = await request(app).post('/api/hr/staff')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'Mgr', lastName:'Test', email:'mgr@rsa.com', role:'manager', campus:'both' });
      expect(res.status).toBe(201);
    });

    it('lists staff', async () => {
      await request(app).post('/api/hr/staff').set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'S1', lastName:'T', email:'s1@rsa.com', role:'hr', campus:'both' });
      const res = await request(app).get('/api/hr/staff').set('Authorization', `Bearer ${hrToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.staff.length).toBeGreaterThan(0);
    });
  });

  describe('Students (read-only for HR)', () => {
    it('HR can view students', async () => {
      await h.createStudent(adminToken);
      const res = await request(app).get('/api/hr/students').set('Authorization', `Bearer ${hrToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.students)).toBe(true);
    });

    it('HR cannot admit students', async () => {
      const res = await request(app).post('/api/admin/students')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ firstName:'X', lastName:'Y', email:'x@rsa.com', grade:'5', programme:'eChamps', campus:'hcpur', academicYear:'2026-27' });
      expect(res.status).toBe(403);
    });
  });
});
