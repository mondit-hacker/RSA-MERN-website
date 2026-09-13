'use strict';
const authService = require('../../services/authService');
const User        = require('../../models/User');
const { sendVerificationEmail } = require('../../utils/emailUtils');
const { sendSuccess } = require('../../utils/apiResponse');
const catchAsync  = require('../../utils/catchAsync');
const AppError    = require('../../utils/AppError');

const register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, role, phone } = req.body;
  const requestedRole = role || 'student';
  if (!['student'].includes(requestedRole) && (!req.user || !['admin','developer'].includes(req.user.role)))
    return next(new AppError('Only admin or developer can create non-student accounts.', 403));
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return next(new AppError('An account with this email already exists.', 409));
  const user = await User.create({ firstName, lastName, email, password, role: requestedRole, phone });
  const verifyToken = user.createEmailVerifyToken();
  await user.save({ validateBeforeSave: false });
  await sendVerificationEmail(user, verifyToken).catch(() => {});
  await req.audit('USER_REGISTERED', 'User', user._id, null, { email, role: requestedRole });
  sendSuccess(res, { statusCode: 201, message: 'Account created. Check your email to verify.', data: { userId: user._id, email: user.email } });
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password, req, res);
  sendSuccess(res, { message: 'Logged in successfully.', data: { user: result.user, accessToken: result.accessToken } });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req, res);
  sendSuccess(res, { message: 'Logged out successfully.' });
});

const refreshToken = catchAsync(async (req, res) => {
  const accessToken = await authService.refreshAccessToken(req, res);
  sendSuccess(res, { message: 'Token refreshed.', data: { accessToken } });
});

const forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(req.body.email, req);
  sendSuccess(res, { message: 'If that email is registered, a reset link has been sent.' });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password, req);
  sendSuccess(res, { message: 'Password reset successfully. Please log in.' });
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword, req);
  sendSuccess(res, { message: 'Password changed. Please log in again.' });
});

const verifyEmail = catchAsync(async (req, res, next) => {
  if (!req.query.token) return next(new AppError('Verification token is required.', 400));
  await authService.verifyEmail(req.query.token);
  sendSuccess(res, { message: 'Email verified successfully. You can now log in.' });
});

const resendVerification = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.isEmailVerified) return sendSuccess(res, { message: 'Email is already verified.' });
  const token = user.createEmailVerifyToken();
  await user.save({ validateBeforeSave: false });
  await sendVerificationEmail(user, token);
  sendSuccess(res, { message: 'Verification email resent.' });
});

const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate('profile');
  sendSuccess(res, { data: { user } });
});

const updateMe = catchAsync(async (req, res) => {
  const ALLOWED = ['firstName','lastName','phone'];
  const updates = {};
  ALLOWED.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  await req.audit('USER_UPDATED', 'User', user._id, {}, updates);
  sendSuccess(res, { message: 'Profile updated.', data: { user } });
});

module.exports = { register, login, logout, refreshToken, forgotPassword, resetPassword, changePassword, verifyEmail, resendVerification, getMe, updateMe };
