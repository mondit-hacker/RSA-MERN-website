'use strict';
const request = require('supertest');
const app     = require('../server');
const User    = require('../models/User');

const helpers = {
  async registerAndLogin(data) {
    await request(app).post('/api/auth/register').send(data);
    if (data.role && data.role !== 'student') {
      await User.findOneAndUpdate({ email: data.email }, {
        role: data.role, isEmailVerified: true, isActive: true
      });
    }
    const res = await request(app).post('/api/auth/login').send({
      email: data.email, password: data.password
    });
    return { token: res.body.data?.accessToken, user: res.body.data?.user, res };
  },

  async getAdminToken() {
    const { token } = await helpers.registerAndLogin({
      firstName:'Admin', lastName:'Test',
      email:'admin@test.com', password:'Admin@1234', role:'admin'
    });
    return token;
  },

  async getHRToken() {
    const { token } = await helpers.registerAndLogin({
      firstName:'HR', lastName:'Test',
      email:'hr@test.com', password:'HR@12345', role:'hr'
    });
    return token;
  },

  async getTeacherToken(adminToken) {
    const res = await request(app).post('/api/hr/teachers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName:'Teacher', lastName:'Test', email:'teacher@test.com',
              password:'Teacher@1234', campus:'hcpur', designation:'Class Teacher' });
    const lr = await request(app).post('/api/auth/login')
      .send({ email:'teacher@test.com', password:'Teacher@1234' });
    return { token: lr.body.data?.accessToken, teacher: res.body.data?.teacher };
  },

  async createStudent(adminToken, overrides={}) {
    const res = await request(app).post('/api/admin/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName:'Student', lastName:'Test', email:'student@test.com',
        grade:'5', section:'A', programme:'eChamps',
        campus:'hcpur', academicYear:'2026-27', ...overrides
      });
    return res.body.data?.student;
  },

  makeStudentData(n) {
    return {
      firstName:`Student${n}`, lastName:`Test${n}`, email:`student${n}@test.com`,
      grade: String((n%10)+1), section: ['A','B','C'][n%3],
      programme:'eChamps', campus: n%2===0?'hcpur':'kashimpur', academicYear:'2026-27'
    };
  }
};

module.exports = helpers;
