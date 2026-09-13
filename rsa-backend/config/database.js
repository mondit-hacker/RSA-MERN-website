'use strict';
const mongoose = require('mongoose');
const logger   = require('../utils/logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rsa_academy';
const OPTIONS = { maxPoolSize: 10, serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000, family: 4 };

let retries = 0;
const MAX_RETRIES = 5;

async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGODB_URI, OPTIONS);
    retries = 0;
    logger.info(`MongoDB connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (err) {
    retries += 1;
    logger.error(`MongoDB connection failed (attempt ${retries}/${MAX_RETRIES}): ${err.message}`);
    if (retries < MAX_RETRIES) {
      const delay = Math.min(1000 * 2 ** retries, 30000);
      logger.info(`Retrying in ${delay / 1000}s...`);
      setTimeout(connectDB, delay);
    } else {
      logger.error('Max retries reached. Exiting.');
      if (process.env.NODE_ENV !== 'test') process.exit(1);
      throw new Error('MongoDB connection failed in tests');
    }
  }
}

mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
mongoose.connection.on('reconnected',  () => logger.info('MongoDB reconnected'));
mongoose.connection.on('error',        (e) => logger.error(`MongoDB error: ${e.message}`));

function gracefulShutdown(signal) {
  return async () => {
    logger.info(`${signal} received. Closing MongoDB...`);
    await mongoose.connection.close();
    process.exit(0);
  };
}
process.on('SIGINT',  gracefulShutdown('SIGINT'));
process.on('SIGTERM', gracefulShutdown('SIGTERM'));

module.exports = connectDB;
