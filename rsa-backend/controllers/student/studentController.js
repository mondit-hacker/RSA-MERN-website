'use strict';
const Student      = require('../../models/Student');
const Notification = require('../../models/Notification');
const { sendSuccess } = require('../../utils/apiResponse');
const { paginate }    = require('../../services/queryService');
const catchAsync      = require('../../utils/catchAsync');
const AppError        = require('../../utils/AppError');

const getProfile = catchAsync(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate('user', 'firstName lastName email phone avatar isEmailVerified');
  if (!student) throw new AppError('Student profile not found.', 404);
  sendSuccess(res, { data: { student } });
});

const updateProfile = catchAsync(async (req, res) => {
  const ALLOWED = ['address','father','mother','guardian'];
  const updates = {};
  ALLOWED.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const student = await Student.findOneAndUpdate({ user: req.user._id }, updates, { new: true, runValidators: true });
  if (!student) throw new AppError('Student profile not found.', 404);
  await req.audit('STUDENT_PROFILE_UPDATED', 'Student', student._id, {}, updates);
  sendSuccess(res, { message: 'Profile updated.', data: { student } });
});

const getNotifications = catchAsync(async (req, res) => {
  const filter = { recipient: req.user._id };
  if (req.query.unread === 'true') filter.isRead = false;
  const { docs, meta } = await paginate(Notification, filter, req.query, ['title','message'], '', '-__v');
  sendSuccess(res, { data: { notifications: docs }, meta });
});

const markNotificationRead = catchAsync(async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true, readAt: new Date() }, { new: true }
  );
  if (!notif) throw new AppError('Notification not found.', 404);
  sendSuccess(res, { message: 'Marked as read.', data: { notification: notif } });
});

const markAllNotificationsRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  sendSuccess(res, { message: 'All notifications marked as read.' });
});

module.exports = { getProfile, updateProfile, getNotifications, markNotificationRead, markAllNotificationsRead };
