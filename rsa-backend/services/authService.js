'use strict';
const crypto   = require('crypto');
const User     = require('../models/User');
const Session  = require('../models/Session');
const SecurityLog = require('../models/SecurityLog');
const { sendTokens, verifyRefreshToken, signAccessToken, signRefreshToken, clearTokens } = require('../utils/tokenUtils');
const { sendPasswordResetEmail, sendVerificationEmail, sendAccountLockedEmail } = require('../utils/emailUtils');
const AppError = require('../utils/AppError');
const logger   = require('../utils/logger');

const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

async function logSec(event, user, req, details='', severity='low') {
  try { await SecurityLog.create({ event, user: user?user._id:undefined, email: user?user.email:req.body.email, ip: req.ip, userAgent: req.get('user-agent'), details, severity }); }
  catch(e) { logger.error(`Security log: ${e.message}`); }
}

async function login(email, password, req, res) {
  const user = await User.findOne({ email: email.toLowerCase().trim(), isDeleted: false }).select('+password +loginAttempts +lockUntil +isLocked');
  const INVALID = 'Invalid email or password.';
  if (!user) { await logSec('LOGIN_FAILED', null, req, `No user: ${email}`, 'medium'); throw new AppError(INVALID, 401); }

  if (user.isLocked) {
    if (user.lockUntil > Date.now()) {
      const min = Math.ceil((user.lockUntil - Date.now())/60000);
      await logSec('ACCOUNT_LOCKED', user, req, 'Login while locked', 'high');
      throw new AppError(`Account locked. Try again in ${min} minute(s).`, 423);
    }
    await user.resetLoginAttempts();
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    const refreshed = await User.findById(user._id).select('+isLocked +loginAttempts');
    if (refreshed.isLocked) { await sendAccountLockedEmail(user).catch(()=>{}); await logSec('ACCOUNT_LOCKED',user,req,'Too many attempts','high'); throw new AppError('Account locked for 30 minutes.', 423); }
    const rem = parseInt(process.env.MAX_LOGIN_ATTEMPTS||'5',10) - refreshed.loginAttempts;
    await logSec('LOGIN_FAILED', user, req, `Wrong password (${rem} left)`, 'medium');
    throw new AppError(`${INVALID} ${rem} attempt(s) remaining.`, 401);
  }

  if (!user.isActive) throw new AppError('Account deactivated. Contact administration.', 403);
  await user.resetLoginAttempts();

  const refreshToken  = signRefreshToken({ id: user._id, role: user.role });
  await Session.create({ user: user._id, refreshToken: hashToken(refreshToken), userAgent: req.get('user-agent'), ip: req.ip, expiresAt: new Date(Date.now()+7*24*3600000) });

  user.lastLoginAt = new Date(); user.lastLoginIP = req.ip;
  await user.save({ validateBeforeSave: false });

  const { accessToken } = sendTokens(res, user);
  await logSec('LOGIN_SUCCESS', user, req);
  return { user: user.toJSON(), accessToken };
}

async function logout(req, res) {
  const rt = req.cookies && req.cookies.refreshToken;
  if (rt) await Session.findOneAndUpdate({ refreshToken: hashToken(rt) }, { isRevoked: true });
  clearTokens(res);
  await logSec('LOGOUT', req.user, req);
}

async function refreshAccessToken(req, res) {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) throw new AppError('Refresh token missing.', 401);
  let decoded;
  try { decoded = verifyRefreshToken(token); }
  catch(e) { await logSec('EXPIRED_TOKEN', null, req, 'Refresh token invalid', 'medium'); throw new AppError('Session expired. Please log in again.', 401); }

  const session = await Session.findOne({ refreshToken: hashToken(token), isRevoked: false });
  if (!session || session.expiresAt < Date.now()) { await logSec('INVALID_TOKEN',null,req,'Session not found','medium'); throw new AppError('Invalid session. Please log in again.', 401); }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive || user.isDeleted) throw new AppError('Account not found.', 401);

  const newAccessToken = signAccessToken({ id: user._id, role: user.role });
  res.cookie('accessToken', newAccessToken, { httpOnly:true, secure: process.env.NODE_ENV==='production', sameSite:'strict', maxAge:15*60*1000 });
  return newAccessToken;
}

async function forgotPassword(email, req) {
  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
  if (!user) return;
  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  await sendPasswordResetEmail(user, token);
  await logSec('PASSWORD_RESET_REQUEST', user, req);
}

async function resetPassword(token, newPassword, req) {
  const hashed = hashToken(token);
  const user   = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() }, isDeleted: false });
  if (!user) throw new AppError('Reset link is invalid or expired.', 400);
  user.password=newPassword; user.passwordResetToken=undefined; user.passwordResetExpires=undefined; user.passwordChangedAt=new Date();
  await user.save();
  await Session.updateMany({ user: user._id }, { isRevoked: true });
  await logSec('PASSWORD_RESET_SUCCESS', user, req);
}

async function changePassword(userId, currentPassword, newPassword, req) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found.', 404);
  if (!(await user.comparePassword(currentPassword))) throw new AppError('Current password is incorrect.', 401);
  user.password = newPassword;
  await user.save();
  await Session.updateMany({ user: userId }, { isRevoked: true });
  await logSec('PASSWORD_CHANGED', user, req);
}

async function verifyEmail(token) {
  const hashed = hashToken(token);
  const user   = await User.findOne({ emailVerifyToken: hashed, emailVerifyExpires: { $gt: Date.now() } });
  if (!user) throw new AppError('Verification link is invalid or expired.', 400);
  user.isEmailVerified=true; user.emailVerifyToken=undefined; user.emailVerifyExpires=undefined;
  await user.save({ validateBeforeSave: false });
}

module.exports = { login, logout, refreshAccessToken, forgotPassword, resetPassword, changePassword, verifyEmail };
