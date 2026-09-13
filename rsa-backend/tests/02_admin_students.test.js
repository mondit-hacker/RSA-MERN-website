'use strict';
const request = require('supertest');
const app     = require('../server');
const h       = require('./helpers');

describe('━━━ ADMIN: STUDENTS ━━━', () => {
  let adminToken;
  beforeEach(async () => { adminToken = await h.getAdminToken(); });

  describe('Admit Student', () => {
    it('admits with all required fields', async () => {
      const res = await request(app).post('/api/admin/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'Rahul', lastName:'Das', email:'rahul@rsa.com',
                grade:'5', section:'A', programme:'eChamps', campus:'hcpur', academicYear:'2026-27' });
      expect(res.status).toBe(201);
      expect(res.body.data.student).toHaveProperty('admissionNo');
      expect(res.body.data.student.admissionNo).toMatch(/^RSA-\d{4}-\d{4}$/);
    });

    it('auto-generates password when blank', async () => {
      const res = await request(app).post('/api/admin/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'Auto', lastName:'Pass', email:'auto@rsa.com',
                grade:'3', programme:'eKidz', campus:'hcpur', academicYear:'2026-27' });
      expect(res.status).toBe(201);
      expect(res.body.data.password).toBeTruthy();
      expect(res.body.data.password.length).toBeGreaterThan(6);
    });

    it('uses provided password', async () => {
      const res = await request(app).post('/api/admin/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'Custom', lastName:'Pass', email:'custom@rsa.com',
                password:'Custom@1234', grade:'5', programme:'eChamps', campus:'hcpur', academicYear:'2026-27' });
      expect(res.status).toBe(201);
      const lr = await request(app).post('/api/auth/login')
        .send({ email:'custom@rsa.com', password:'Custom@1234' });
      expect(lr.status).toBe(200);
    });

    it('rejects duplicate email', async () => {
      await request(app).post('/api/admin/students').set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'A', lastName:'B', email:'dup@rsa.com', grade:'5', programme:'eChamps', campus:'hcpur', academicYear:'2026-27' });
      const res = await request(app).post('/api/admin/students').set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'C', lastName:'D', email:'dup@rsa.com', grade:'6', programme:'eChamps', campus:'hcpur', academicYear:'2026-27' });
      expect(res.status).toBe(409);
    });

    it('rejects missing email', async () => {
      const res = await request(app).post('/api/admin/students').set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'X', lastName:'Y', grade:'5', programme:'eChamps', campus:'hcpur', academicYear:'2026-27' });
      expect(res.status).toBe(400);
    });

    it('rejects missing grade', async () => {
      const res = await request(app).post('/api/admin/students').set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'X', lastName:'Y', email:'x@rsa.com', programme:'eChamps', campus:'hcpur', academicYear:'2026-27' });
      expect([400,422]).toContain(res.status);
    });

    it('rejects invalid campus', async () => {
      const res = await request(app).post('/api/admin/students').set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName:'X', lastName:'Y', email:'invalid@rsa.com', grade:'5', programme:'eChamps', campus:'invalid', academicYear:'2026-27' });
      expect([400,422]).toContain(res.status);
    });

    it('blocks non-admin from admitting', async () => {
      const { token } = await h.registerAndLogin({ firstName:'R', lastName:'U', email:'reg@rsa.com', password:'Reg@1234' });
      const res = await request(app).post('/api/admin/students').set('Authorization', `Bearer ${token}`)
        .send({ firstName:'X', lastName:'Y', email:'x@rsa.com', grade:'5', programme:'eChamps', campus:'hcpur', academicYear:'2026-27' });
      expect(res.status).toBe(403);
    });
  });

  describe('List Students', () => {
    beforeEach(async () => {
      for (let i=0; i<3; i++) {
        await request(app).post('/api/admin/students').set('Authorization', `Bearer ${adminToken}`)
          .send(h.makeStudentData(i));
      }
    });

    it('lists all students', async () => {
      const res = await request(app).get('/api/admin/students').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.students.length).toBeGreaterThanOrEqual(3);
    });

    it('filters by campus', async () => {
      const res = await request(app).get('/api/admin/students?campus=hcpur').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.data.students.forEach(s => expect(s.campus).toBe('hcpur'));
    });

    it('paginates correctly', async () => {
      const res = await request(app).get('/api/admin/students?limit=2&page=1').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.students.length).toBeLessThanOrEqual(2);
      expect(res.body.meta).toHaveProperty('total');
    });

    it('searches by name', async () => {
      const res = await request(app).get('/api/admin/students?search=Student0').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Update/Delete Student', () => {
    let studentId;
    beforeEach(async () => {
      const s = await h.createStudent(adminToken);
      studentId = s?._id;
    });

    it('soft-deletes student', async () => {
      const res = await request(app).delete(`/api/admin/students/${studentId}`).set('Authorization', `Bearer ${adminToken}`);
      expect([200,204]).toContain(res.status);
    });

    it('rejects invalid student ID format', async () => {
      const res = await request(app).delete('/api/admin/students/notanid').set('Authorization', `Bearer ${adminToken}`);
      expect([400,422,404]).toContain(res.status);
    });

    it('returns 404 for non-existent student', async () => {
      const res = await request(app).delete('/api/admin/students/507f1f77bcf86cd799439011').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });
});
