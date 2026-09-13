'use strict';
const { verifyAccessToken } = require('../utils/tokenUtils');
const User        = require('../models/User');
const SecurityLog = require('../models/SecurityLog');
const AppError    = require('../utils/AppError');
const catchAsync  = require('../utils/catchAsync');
const logger      = require('../utils/logger');

async function logSec(event, req, details='', severity='medium') {
  try { await SecurityLog.create({ event, ip: req.ip, userAgent: req.get('user-agent'), details, severity }); }
  catch(e) { logger.error(`Security log failed: ${e.message}`); }
}

const authenticate = catchAsync(async (req, res, next) => {
  let token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) token = auth.slice(7);
  else if (req.cookies && req.cookies.accessToken) token = req.cookies.accessToken;

  if (!token) { await logSec('INVALID_TOKEN', req, 'No token'); return next(new AppError('Authentication required.', 401)); }

  let decoded;
  try { decoded = verifyAccessToken(token); }
  catch(err) {
    const event = err.name === 'TokenExpiredError' ? 'EXPIRED_TOKEN' : 'INVALID_TOKEN';
    await logSec(event, req, err.message);
    return next(new AppError(err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid token. Please log in again.', 401));
  }

  const user = await User.findById(decoded.id).select('+passwordChangedAt');
  if (!user || !user.isActive || user.isDeleted) return next(new AppError('Account not found or deactivated.', 401));
  if (user.isLocked && user.lockUntil > Date.now()) return next(new AppError('Account is temporarily locked.', 403));
  if (user.changedPasswordAfter(decoded.iat)) {
    await logSec('INVALID_TOKEN', req, 'Token used after password change', 'high');
    return next(new AppError('Password was recently changed. Please log in again.', 401));
  }

  req.user = user; req.userRole = user.role;
  next();
});

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Not authenticated.', 401));
    if (!roles.includes(req.user.role)) {
      logSec('UNAUTHORIZED_ACCESS', req, `Role '${req.user.role}' denied for [${roles.join(',')}]`, 'high').catch(()=>{});
      return next(new AppError(`Access denied. Requires role: ${roles.join(' or ')}.`, 403));
    }
    next();
  };
}

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) token = auth.slice(7);
    else if (req.cookies && req.cookies.accessToken) token = req.cookies.accessToken;
    if (token) {
      const decoded = verifyAccessToken(token);
      const user    = await User.findById(decoded.id);
      if (user && user.isActive && !user.isDeleted) req.user = user;
    }
  } catch(_) {}
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
