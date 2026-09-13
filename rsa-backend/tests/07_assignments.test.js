'use strict';
const request = require('supertest');
const app     = require('../server');
const h       = require('./helpers');

describe('━━━ CLASS ASSIGNMENTS ━━━', () => {
  let adminToken, hrToken, teacherDoc;

  beforeEach(async () => {
    adminToken = await h.getAdminToken();
    hrToken    = await h.getHRToken();
    // Create teacher via HR
    const res = await request(app).post('/api/hr/teachers')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({ firstName:'Assign', lastName:'Teacher', email:'assign.t@rsa.com', campus:'hcpur', designation:'Class Teacher' });
    teacherDoc = res.body.data?.teacher;
  });

  describe('Assign Teacher', () => {
    it('admin can assign teacher', async () => {
      const res = await request(app).post('/api/assignments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ teacherId: teacherDoc._id, grade:'5', section:'A', subject:'Mathematics', campus:'hcpur' });
      expect(res.status).toBe(201);
      expect(res.body.data.assignment).toHaveProperty('_id');
      expect(res.body.data.assignment.subject).toBe('Mathematics');
    });

    it('HR can assign teacher', async () => {
      const res = await request(app).post('/api/assignments')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ teacherId: teacherDoc._id, grade:'5', section:'B', subject:'Science', campus:'hcpur' });
      expect(res.status).toBe(201);
    });

    it('accepts Teacher._id directly', async () => {
      const res = await request(app).post('/api/assignments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ teacherId: teacherDoc._id, grade:'6', section:'A', subject:'English', campus:'hcpur' });
      expect(res.status).toBe(201);
    });

    it('rejects duplicate assignment', async () => {
      await request(app).post('/api/assignments').set('Authorization', `Bearer ${adminToken}`)
        .send({ teacherId: teacherDoc._id, grade:'5', section:'A', subject:'Hindi', campus:'hcpur' });
      const res = await request(app).post('/api/assignments').set('Authorization', `Bearer ${adminToken}`)
        .send({ teacherId: teacherDoc._id, grade:'5', section:'A', subject:'Hindi', campus:'hcpur' });
      expect(res.status).toBe(409);
    });

    it('allows same teacher, different subject', async () => {
      await request(app).post('/api/assignments').set('Authorization', `Bearer ${adminToken}`)
        .send({ teacherId: teacherDoc._id, grade:'5', section:'A', subject:'English', campus:'hcpur' });
      const res = await request(app).post('/api/assignments').set('Authorization', `Bearer ${adminToken}`)
        .send({ teacherId: teacherDoc._id, grade:'5', section:'A', subject:'Science', campus:'hcpur' });
      expect(res.status).toBe(201);
    });

    it('rejects missing teacherId', async () => {
      const res = await request(app).post('/api/assignments').set('Authorization', `Bearer ${adminToken}`)
        .send({ grade:'5', subject:'Maths', campus:'hcpur' });
      expect(res.status).toBe(400);
    });

    it('rejects missing grade', async () => {
      const res = await request(app).post('/api/assignments').set('Authorization', `Bearer ${adminToken}`)
        .send({ teacherId: teacherDoc._id, subject:'Maths', campus:'hcpur' });
      expect(res.status).toBe(400);
    });

    it('rejects invalid teacher ID', async () => {
      const res = await request(app).post('/api/assignments').set('Authorization', `Bearer ${adminToken}`)
        .send({ teacherId:'507f1f77bcf86cd799439011', grade:'5', subject:'Maths', campus:'hcpur' });
      expect(res.status).toBe(404);
    });

    it('blocks student from assigning teachers', async () => {
      const { token } = await h.registerAndLogin({ firstName:'S', lastName:'T', email:'stu2@rsa.com', password:'Stu@1234' });
      const res = await request(app).post('/api/assignments').set('Authorization', `Bearer ${token}`)
        .send({ teacherId: teacherDoc._id, grade:'5', subject:'Maths', campus:'hcpur' });
      expect(res.status).toBe(403);
    });
  });

  describe('List / View Assignments', () => {
    beforeEach(async () => {
      await request(app).post('/api/assignments').set('Authorization', `Bearer ${adminToken}`)
        .send({ teacherId: teacherDoc._id, grade:'5', section:'A', subject:'Computer', campus:'hcpur' });
    });

    it('lists all active assignments', async () => {
      const res = await request(app).get('/api/assignments').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.assignments.length).toBeGreaterThan(0);
    });

    it('returns by-class grouped view', async () => {
      const res = await request(app).get('/api/assignments/by-class').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(typeof res.body.data.grouped).toBe('object');
    });

    it('returns teacher students', async () => {
      await h.createStudent(adminToken, { grade:'5', section:'A', campus:'hcpur', firstName:'AS', lastName:'T', email:'as@t.com' });
      const res = await request(app).get(`/api/assignments/teacher/${teacherDoc._id}/students`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.students)).toBe(true);
    });
  });

  describe('Remove Assignment', () => {
    it('removes an assignment', async () => {
      const create = await request(app).post('/api/assignments').set('Authorization', `Bearer ${adminToken}`)
        .send({ teacherId: teacherDoc._id, grade:'7', section:'A', subject:'Drawing', campus:'hcpur' });
      const aid = create.body.data?.assignment?._id;
      const res = await request(app).delete(`/api/assignments/${aid}`).set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('re-activates removed assignment on re-assign', async () => {
      const create = await request(app).post('/api/assignments').set('Authorization', `Bearer ${adminToken}`)
        .send({ teacherId: teacherDoc._id, grade:'8', section:'A', subject:'Hindi', campus:'hcpur' });
      const aid = create.body.data?.assignment?._id;
      await request(app).delete(`/api/assignments/${aid}`).set('Authorization', `Bearer ${adminToken}`);
      // Assign again - should reactivate
      const res = await request(app).post('/api/assignments').set('Authorization', `Bearer ${adminToken}`)
        .send({ teacherId: teacherDoc._id, grade:'8', section:'A', subject:'Hindi', campus:'hcpur' });
      expect([200,201]).toContain(res.status);
    });
  });
});
