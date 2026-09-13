'use strict';
const AppError = require('../utils/AppError');
const logger   = require('../utils/logger');

function handleCastError(err)       { return new AppError(`Invalid value for '${err.path}': ${err.value}.`, 400); }
function handleDuplicateKey(err)    { const f = Object.keys(err.keyValue)[0]; return new AppError(`'${err.keyValue[f]}' already in use.`, 409); }
function handleValidation(err)      { const msgs = Object.values(err.errors).map(e=>e.message); return new AppError(`Validation failed: ${msgs.join('. ')}`, 400, msgs); }
function handleJWT()                { return new AppError('Invalid token. Please log in again.', 401); }
function handleJWTExpired()         { return new AppError('Session expired. Please log in again.', 401); }

module.exports = function errorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  let error = err;
  if (err.name==='CastError')        error = handleCastError(err);
  if (err.code===11000)              error = handleDuplicateKey(err);
  if (err.name==='ValidationError')  error = handleValidation(err);
  if (err.name==='JsonWebTokenError') error = handleJWT();
  if (err.name==='TokenExpiredError') error = handleJWTExpired();

  if (error.statusCode >= 500) logger.error(`[${error.statusCode}] ${req.method} ${req.originalUrl}`, { message: error.message, stack: error.stack, userId: req.user?req.user._id:'anon' });

  if (error.isOperational) {
    const body = { success: false, status: error.status, message: error.message };
    if (error.errors) body.errors = error.errors;
    return res.status(error.statusCode).json(body);
  }
  logger.error('UNEXPECTED ERROR:', { message: err.message, stack: err.stack });
  return res.status(500).json({ success: false, status: 'error', message: process.env.NODE_ENV==='production' ? 'Something went wrong. Please try again.' : err.message });
};
