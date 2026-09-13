'use strict';
const rateLimit = require('express-rate-limit');
const logger    = require('../utils/logger');

const WINDOW   = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const MAX      = parseInt(process.env.RATE_LIMIT_MAX       || '100',    10);
const AUTH_MAX = parseInt(process.env.AUTH_RATE_LIMIT_MAX  || '10',     10);

const handler = (req, res) => {
  logger.security('Rate limit exceeded', { ip: req.ip, path: req.originalUrl });
  res.status(429).json({ success: false, message: 'Too many requests. Please try again shortly.' });
};
const opts = { legacyHeaders: false, standardHeaders: true, handler };

const apiLimiter      = rateLimit({ windowMs: WINDOW, max: MAX,    ...opts });
const authLimiter     = rateLimit({ windowMs: WINDOW, max: AUTH_MAX, skipSuccessfulRequests: true, ...opts });
const uploadLimiter   = rateLimit({ windowMs: WINDOW, max: 20,     ...opts });
const enquiryLimiter  = rateLimit({ windowMs: 3600000, max: 5,     ...opts });

module.exports = { apiLimiter, authLimiter, uploadLimiter, enquiryLimiter };
