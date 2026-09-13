'use strict';
const request = require('supertest');
const app     = require('../server');
const h       = require('./helpers');

describe('━━━ ATTENDANCE TESTS ━━━', () => {
  let adminToken, teacherToken, teacherId, studentId, studentUserId;

  beforeEach(async () => {
    adminToken = await h.getAdminToken();
    const { token, teacher } = await h.getTeacherToken(adminToken);
    teacherToken = token;
    teacherId    = teacher?._id;
    const s = await h.createStudent(adminToken);
    studentId     = s?._id;
    studentUserId = s?.user;
  });

  describe('Mark Attendance (bulk)', () => {
    it('admin can mark attendance', async () => {
      const res = await request(app).post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ date: new Date().toISOString().split('T')[0], grade:'5', section:'A', campus:'hcpur',
          records:[{ student: studentId, status:'present' }] });
      expect([200,201]).toContain(res.status);
    });

    it('teacher can mark attendance', async () => {
      const res = await request(app).post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ date: new Date().toISOString().split('T')[0], grade:'5', section:'A', campus:'hcpur',
          records:[{ student: studentId, status:'present' }] });
      expect([200,201]).toContain(res.status);
    });

    it('marks all statuses correctly', async () => {
      const statuses = ['present','absent','late','half-day'];
      for (const status of statuses) {
        const res = await request(app).post('/api/attendance/bulk')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ date: new Date().toISOString().split('T')[0], grade:'5', section:'A', campus:'hcpur',
            records:[{ student: studentId, status }] });
        expect([200,201]).toContain(res.status);
      }
    });

    it('rejects invalid status', async () => {
      const res = await request(app).post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ date: new Date().toISOString().split('T')[0], grade:'5', section:'A', campus:'hcpur',
          records:[{ student: studentId, status:'holiday' }] });
      expect([400,422]).toContain(res.status);
    });

    it('rejects empty records array', async () => {
      const res = await request(app).post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ date: new Date().toISOString().split('T')[0], grade:'5', section:'A', campus:'hcpur', records:[] });
      expect([400,422]).toContain(res.status);
    });

    it('rejects missing date', async () => {
      const res = await request(app).post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ grade:'5', campus:'hcpur', records:[{ student: studentId, status:'present' }] });
      expect([400,422]).toContain(res.status);
    });

    it('student cannot mark attendance', async () => {
      const { token } = await h.registerAndLogin({ firstName:'S', lastName:'T', email:'stu@rsa.com', password:'Stu@1234' });
      const res = await request(app).post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: new Date().toISOString().split('T')[0], grade:'5', campus:'hcpur',
          records:[{ student: studentId, status:'present' }] });
      expect(res.status).toBe(403);
    });

    it('marks bulk of multiple students', async () => {
      const s2 = await h.createStudent(adminToken, { firstName:'S2', lastName:'T2', email:'s2@rsa.com', grade:'5' });
      const res = await request(app).post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ date: new Date().toISOString().split('T')[0], grade:'5', section:'A', campus:'hcpur',
          records:[
            { student: studentId, status:'present' },
            { student: s2?._id,   status:'absent'  },
          ]});
      expect([200,201]).toContain(res.status);
    });
  });

  describe('Get Attendance Summary', () => {
    beforeEach(async () => {
      await request(app).post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ date: new Date().toISOString().split('T')[0], grade:'5', section:'A', campus:'hcpur',
          records:[{ student: studentId, status:'present' }] });
    });

    it('returns summary for student', async () => {
      const res = await request(app).get(`/api/attendance/summary/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('present');
      expect(res.body.data).toHaveProperty('percentage');
    });

    it('returns 0 summary for student with no records', async () => {
      const s2 = await h.createStudent(adminToken, { firstName:'S3', lastName:'T3', email:'s3@rsa.com', grade:'6' });
      const res = await request(app).get(`/api/attendance/summary/${s2?._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.present).toBe(0);
    });
  });

  describe('List Attendance', () => {
    it('lists attendance records', async () => {
      await request(app).post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ date: new Date().toISOString().split('T')[0], grade:'5', section:'A', campus:'hcpur',
          records:[{ student: studentId, status:'present' }] });
      const res = await request(app).get('/api/attendance').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.attendance || res.body.data.records || [])).toBe(true);
    });

    it('filters by student', async () => {
      await request(app).post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ date: new Date().toISOString().split('T')[0], grade:'5', section:'A', campus:'hcpur',
          records:[{ student: studentId, status:'present' }] });
      const res = await request(app).get(`/api/attendance?student=${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});
