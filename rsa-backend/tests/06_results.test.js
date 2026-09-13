'use strict';
const request = require('supertest');
const app     = require('../server');
const h       = require('./helpers');

const SUBJECTS = [
  { name:'English', maxMarks:100, obtained:75 },
  { name:'Mathematics', maxMarks:100, obtained:80 },
  { name:'Science', maxMarks:100, obtained:70 },
];

const EXAM_TYPES = ['class-test','1st-term','2nd-term','3rd-term','exam'];

describe('━━━ RESULTS TESTS ━━━', () => {
  let adminToken, teacherToken, studentId;

  beforeEach(async () => {
    adminToken   = await h.getAdminToken();
    const { token } = await h.getTeacherToken(adminToken);
    teacherToken = token;
    const s = await h.createStudent(adminToken);
    studentId = s?._id;
  });

  describe('Create Result', () => {
    it('admin creates a result', async () => {
      const res = await request(app).post('/api/results')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ student: studentId, examName:'Class Test 1', examType:'class-test',
                grade:'5', section:'A', academicYear:'2026-27', subjects: SUBJECTS });
      expect(res.status).toBe(201);
      expect(res.body.data.result).toHaveProperty('percentage');
      expect(res.body.data.result.percentage).toBe(75);
      expect(res.body.data.result.result).toBe('pass');
    });

    it('teacher creates a result', async () => {
      const res = await request(app).post('/api/results')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ student: studentId, examName:'Unit Test', examType:'class-test',
                grade:'5', section:'A', academicYear:'2026-27', subjects: SUBJECTS });
      expect([200,201]).toContain(res.status);
    });

    it('correctly calculates fail', async () => {
      const failSubs = [
        { name:'English',     maxMarks:100, obtained:20 },
        { name:'Mathematics', maxMarks:100, obtained:15 },
      ];
      const res = await request(app).post('/api/results')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ student: studentId, examName:'Failed Test', examType:'class-test',
                grade:'5', academicYear:'2026-27', subjects: failSubs });
      expect(res.status).toBe(201);
      expect(res.body.data.result.result).toBe('fail');
      expect(res.body.data.result.percentage).toBe(17.5);
    });

    EXAM_TYPES.forEach(type => {
      it(`accepts exam type: ${type}`, async () => {
        const res = await request(app).post('/api/results')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ student: studentId, examName:`${type} test`, examType: type,
                  grade:'5', academicYear:'2026-27', subjects: SUBJECTS });
        expect(res.status).toBe(201);
        expect(res.body.data.result.examType).toBe(type);
      });
    });

    it('rejects invalid exam type', async () => {
      const res = await request(app).post('/api/results')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ student: studentId, examName:'Bad Type', examType:'half-yearly',
                grade:'5', academicYear:'2026-27', subjects: SUBJECTS });
      expect([400,422]).toContain(res.status);
    });

    it('rejects missing student', async () => {
      const res = await request(app).post('/api/results')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ examName:'Test', examType:'class-test', grade:'5', academicYear:'2026-27', subjects: SUBJECTS });
      expect(res.status).toBe(400);
    });

    it('rejects missing subjects', async () => {
      const res = await request(app).post('/api/results')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ student: studentId, examName:'Test', examType:'class-test', grade:'5', academicYear:'2026-27', subjects:[] });
      expect(res.status).toBe(400);
    });

    it('adds extra subject beyond defaults', async () => {
      const withExtra = [...SUBJECTS, { name:'Drawing', maxMarks:50, obtained:45 }];
      const res = await request(app).post('/api/results')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ student: studentId, examName:'Full Test', examType:'exam',
                grade:'5', academicYear:'2026-27', subjects: withExtra });
      expect(res.status).toBe(201);
      expect(res.body.data.result.subjects.length).toBe(4);
    });

    it('blocks student from creating results', async () => {
      const { token } = await h.registerAndLogin({ firstName:'S', lastName:'T', email:'s@rsa.com', password:'Stu@1234' });
      const res = await request(app).post('/api/results')
        .set('Authorization', `Bearer ${token}`)
        .send({ student: studentId, examName:'Test', examType:'class-test', grade:'5', academicYear:'2026-27', subjects: SUBJECTS });
      expect(res.status).toBe(403);
    });
  });

  describe('Get / List Results', () => {
    let resultId;
    beforeEach(async () => {
      const res = await request(app).post('/api/results')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ student: studentId, examName:'List Test', examType:'1st-term',
                grade:'5', section:'A', academicYear:'2026-27', subjects: SUBJECTS });
      resultId = res.body.data?.result?._id;
    });

    it('lists results', async () => {
      const res = await request(app).get('/api/results').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.results.length).toBeGreaterThan(0);
    });

    it('gets student results by studentId', async () => {
      const res = await request(app).get(`/api/results/student/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.results.length).toBeGreaterThan(0);
    });

    it('returns students list for dropdown', async () => {
      const res = await request(app).get('/api/results/students-list')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.students)).toBe(true);
    });

    it('filters by grade', async () => {
      const res = await request(app).get('/api/results?grade=5').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.data.results.forEach(r => expect(r.grade).toBe('5'));
    });

    it('filters by exam type', async () => {
      const res = await request(app).get('/api/results?examType=1st-term').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.data.results.forEach(r => expect(r.examType).toBe('1st-term'));
    });
  });

  describe('Update Result', () => {
    let resultId;
    beforeEach(async () => {
      const res = await request(app).post('/api/results')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ student: studentId, examName:'Edit Test', examType:'2nd-term',
                grade:'5', academicYear:'2026-27', subjects: SUBJECTS });
      resultId = res.body.data?.result?._id;
    });

    it('updates exam name', async () => {
      const res = await request(app).patch(`/api/results/${resultId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ examName:'Updated Name' });
      expect(res.status).toBe(200);
      expect(res.body.data.result.examName).toBe('Updated Name');
    });

    it('updates subjects and recalculates percentage', async () => {
      const newSubs = [{ name:'English', maxMarks:100, obtained:90 },{ name:'Maths', maxMarks:100, obtained:95 }];
      const res = await request(app).patch(`/api/results/${resultId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ subjects: newSubs });
      expect(res.status).toBe(200);
      expect(res.body.data.result.percentage).toBe(92.5);
      expect(res.body.data.result.result).toBe('pass');
    });

    it('updates exam type', async () => {
      const res = await request(app).patch(`/api/results/${resultId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ examType:'3rd-term' });
      expect(res.status).toBe(200);
      expect(res.body.data.result.examType).toBe('3rd-term');
    });

    it('returns 404 for non-existent result', async () => {
      const res = await request(app).patch('/api/results/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ examName:'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('Delete Result', () => {
    let resultId;
    beforeEach(async () => {
      const res = await request(app).post('/api/results')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ student: studentId, examName:'Delete Test', examType:'exam',
                grade:'5', academicYear:'2026-27', subjects: SUBJECTS });
      resultId = res.body.data?.result?._id;
    });

    it('admin can delete result', async () => {
      const res = await request(app).delete(`/api/results/${resultId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect([200,204]).toContain(res.status);
    });

    it('result is gone after delete', async () => {
      await request(app).delete(`/api/results/${resultId}`).set('Authorization', `Bearer ${adminToken}`);
      const res = await request(app).get(`/api/results/student/${studentId}`).set('Authorization', `Bearer ${adminToken}`);
      const found = res.body.data?.results?.find(r => r._id === resultId);
      expect(found).toBeUndefined();
    });
  });
});
