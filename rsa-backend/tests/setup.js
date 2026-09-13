'use strict';
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI        = uri;
  process.env.JWT_ACCESS_SECRET  = 'test_access_secret_min_32_chars_here_x';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_min_32_chars_here_y';
  process.env.COOKIE_SECRET      = 'test_cookie_secret';
  process.env.NODE_ENV           = 'test';
  process.env.BCRYPT_SALT_ROUNDS = '4';
  process.env.FRONTEND_URL       = 'http://localhost:3000';
  process.env.MAX_LOGIN_ATTEMPTS = '5';
  process.env.LOCK_TIME_MINUTES  = '30';
  process.env.RATE_LIMIT_MAX     = '1000';
  process.env.AUTH_RATE_LIMIT_MAX= '100';
  await mongoose.connect(uri);
}, 30000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
}, 10000);

afterEach(async () => {
  const cols = mongoose.connection.collections;
  for (const k in cols) await cols[k].deleteMany({});
});
