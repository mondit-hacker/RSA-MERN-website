'use strict';
const request = require('supertest');
const app     = require('../server');
const h       = require('./helpers');

describe('━━━ SECURITY TESTS ━━━', () => {

  describe('NoSQL Injection Prevention', () => {
    it('blocks $where injection in login', async () => {
      const res = await request(app).post('/api/auth/login')
        .send({ email: { $where:'sleep(1000)' }, password:'anything' });
      expect([400,401,422]).toContain(res.status);
    });

    it('blocks $gt injection in login', async () => {
      const res = await request(app).post('/api/auth/login')
        .send({ email: { $gt:'' }, password: { $gt:'' } });
      expect([400,401,422]).toContain(res.status);
    });

    it('blocks $ne injection', async () => {
      const res = await request(app).post('/api/auth/login')
        .send({ email: { $ne:null }, password: { $ne:null } });
      expect([400,401,422]).toContain(res.status);
    });
  });

  describe('XSS Prevention', () => {
    it('sanitizes script tags in registration', async () => {
      const res = await request(app).post('/api/auth/register')
        .send({ firstName:'<script>alert(1)</script>', lastName:'Test', email:'xss@rsa.com', password:'Test@1234' });
      if (res.status === 201) {
        const User = require('../models/User');
        const u = await User.findOne({ email:'xss@rsa.com' });
        expect(u?.firstName).not.toContain('<script>');
      } else {
        expect([400,422]).toContain(res.status);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('allows normal request throughput', async () => {
      const promises = Array(5).fill(null).map(() =>
        request(app).get('/health')
      );
      const results = await Promise.all(promises);
      const ok = results.filter(r => r.status === 200).length;
      expect(ok).toBeGreaterThan(0);
    });
  });

  describe('Authorization Boundaries', () => {
    let adminToken, hrToken, teacherToken, studentToken;

    beforeEach(async () => {
      adminToken = await h.getAdminToken();
      hrToken    = await h.getHRToken();
      const { token: tt } = await h.getTeacherToken(adminToken);
      teacherToken = tt;
      const { token: st } = await h.registerAndLogin({ firstName:'S', lastName:'T', email:'stu@sec.com', password:'Stu@1234' });
      studentToken = st;
    });

    const routes = [
      { method:'get',    path:'/api/admin/students',  allow:['admin'],            deny:['hr','teacher','student'] },
      { method:'get',    path:'/api/hr/teachers',     allow:['admin','hr'],        deny:['student'] },
      { method:'get',    path:'/api/results',         allow:['admin','teacher'],   deny:['student'] },
      { method:'get',    path:'/api/attendance',      allow:['admin','teacher'],   deny:['student'] },
      { method:'get',    path:'/api/assignments',     allow:['admin','hr'],        deny:['student'] },
    ];

    const tokenMap = { admin:'adminToken', hr:'hrToken', teacher:'teacherToken', student:'studentToken' };

    routes.forEach(({ method, path, deny }) => {
      deny.forEach(role => {
        it(`${role} cannot access ${method.toUpperCase()} ${path}`, async () => {
          const tok = eval(`${tokenMap[role]}`);
          const res = await request(app)[method](path).set('Authorization', `Bearer ${tok}`);
          expect([403,401]).toContain(res.status);
        });
      });
    });
  });

  describe('Input Validation', () => {
    let adminToken;
    beforeEach(async () => { adminToken = await h.getAdminToken(); });

    it('rejects oversized payload', async () => {
      const bigData = { firstName:'A'.repeat(10000), lastName:'B', email:'big@rsa.com', password:'Test@1234' };
      const res = await request(app).post('/api/auth/register').send(bigData);
      expect([400,413,422]).toContain(res.status);
    });

    it('handles null values gracefully', async () => {
      const res = await request(app).post('/api/auth/login').send({ email:null, password:null });
      expect([400,401,422]).toContain(res.status);
    });

    it('handles array instead of string for email', async () => {
      const res = await request(app).post('/api/auth/login').send({ email:['a@b.com','c@d.com'], password:'Test@1234' });
      expect([400,401,422]).toContain(res.status);
    });
  });
});

describe('━━━ STRESS TESTS ━━━', () => {
  let adminToken;
  beforeEach(async () => { adminToken = await h.getAdminToken(); });

  describe('Concurrent Requests', () => {
    it('handles 20 concurrent student admissions', async () => {
      const promises = Array(20).fill(null).map((_, i) =>
        request(app).post('/api/admin/students')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(h.makeStudentData(i + 100))
      );
      const results = await Promise.all(promises);
      const created = results.filter(r => r.status === 201).length;
      expect(created).toBeGreaterThanOrEqual(18); // allow for minor failures
    }, 30000);

    it('handles 20 concurrent logins', async () => {
      // Create 5 users first
      for (let i=0; i<5; i++) {
        await request(app).post('/api/auth/register')
          .send({ firstName:`CL${i}`, lastName:'User', email:`cl${i}@rsa.com`, password:'CL@12345' });
      }
      const promises = Array(20).fill(null).map((_, i) =>
        request(app).post('/api/auth/login')
          .send({ email:`cl${i%5}@rsa.com`, password:'CL@12345' })
      );
      const results = await Promise.all(promises);
      const ok = results.filter(r => r.status === 200).length;
      expect(ok).toBeGreaterThanOrEqual(18);
    }, 30000);

    it('handles 30 concurrent attendance marks', async () => {
      const students = [];
      for (let i=0; i<3; i++) {
        const s = await h.createStudent(adminToken, h.makeStudentData(i+200));
        if (s) students.push(s._id);
      }
      const promises = Array(30).fill(null).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return request(app).post('/api/attendance/bulk')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ date: d.toISOString().split('T')[0], grade:'1', section:'A', campus:'hcpur',
            records: students.map(sid => ({ student: sid, status: i%2===0?'present':'absent' })) });
      });
      const results = await Promise.all(promises);
      const ok = results.filter(r => [200,201].includes(r.status)).length;
      expect(ok).toBeGreaterThanOrEqual(25);
    }, 40000);
  });

  describe('Data Volume Tests', () => {
    it('paginates large student list correctly', async () => {
      const promises = Array(15).fill(null).map((_, i) =>
        request(app).post('/api/admin/students')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(h.makeStudentData(i + 300))
      );
      await Promise.all(promises);
      const p1 = await request(app).get('/api/admin/students?page=1&limit=5').set('Authorization', `Bearer ${adminToken}`);
      const p2 = await request(app).get('/api/admin/students?page=2&limit=5').set('Authorization', `Bearer ${adminToken}`);
      expect(p1.status).toBe(200);
      expect(p2.status).toBe(200);
      expect(p1.body.data.students.length).toBeLessThanOrEqual(5);
      // Pages should have different data
      if (p1.body.data.students.length > 0 && p2.body.data.students.length > 0) {
        expect(p1.body.data.students[0]._id).not.toBe(p2.body.data.students[0]._id);
      }
    }, 30000);

    it('handles result creation for 10 students', async () => {
      const students = [];
      for (let i=0; i<10; i++) {
        const s = await h.createStudent(adminToken, h.makeStudentData(i + 400));
        if (s) students.push(s);
      }
      const promises = students.map(s =>
        request(app).post('/api/results')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ student: s._id, examName:'Annual Exam', examType:'exam',
                  grade: s.grade, section: s.section, academicYear:'2026-27',
                  subjects:[{name:'English',maxMarks:100,obtained:Math.floor(Math.random()*100)},{name:'Math',maxMarks:100,obtained:Math.floor(Math.random()*100)}] })
      );
      const results = await Promise.all(promises);
      const ok = results.filter(r => r.status === 201).length;
      expect(ok).toBeGreaterThanOrEqual(9);
    }, 30000);
  });

  describe('Response Time', () => {
    it('health endpoint responds under 500ms', async () => {
      const start = Date.now();
      const res   = await request(app).get('/health');
      const ms    = Date.now() - start;
      expect(res.status).toBe(200);
      expect(ms).toBeLessThan(500);
    });

    it('login responds under 2000ms', async () => {
      await request(app).post('/api/auth/register')
        .send({ firstName:'Speed', lastName:'Test', email:'speed@rsa.com', password:'Speed@1234' });
      const start = Date.now();
      await request(app).post('/api/auth/login')
        .send({ email:'speed@rsa.com', password:'Speed@1234' });
      const ms = Date.now() - start;
      expect(ms).toBeLessThan(2000);
    });

    it('student list responds under 1000ms', async () => {
      const start = Date.now();
      const adminTok = await h.getAdminToken();
      await request(app).get('/api/admin/students').set('Authorization', `Bearer ${adminTok}`);
      const ms = Date.now() - start;
      expect(ms).toBeLessThan(1000);
    });
  });
});
