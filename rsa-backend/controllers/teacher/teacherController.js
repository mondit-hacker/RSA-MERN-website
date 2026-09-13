'use strict';
const Teacher      = require('../../models/Teacher');
const Student      = require('../../models/Student');
const Notification = require('../../models/Notification');
const { sendSuccess } = require('../../utils/apiResponse');
const { paginate }    = require('../../services/queryService');
const catchAsync      = require('../../utils/catchAsync');
const AppError        = require('../../utils/AppError');

const getProfile = catchAsync(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id }).populate('user','firstName lastName email phone avatar');
  if (!teacher) throw new AppError('Teacher profile not found.', 404);
  sendSuccess(res, { data: { teacher } });
});

const updateProfile = catchAsync(async (req, res) => {
  const ALLOWED = ['qualifications','subjects','grades'];
  const updates = {};
  ALLOWED.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const teacher = await Teacher.findOneAndUpdate({ user: req.user._id }, updates, { new: true, runValidators: true });
  if (!teacher) throw new AppError('Teacher profile not found.', 404);
  await req.audit('TEACHER_PROFILE_UPDATED','Teacher',teacher._id,{},updates);
  sendSuccess(res, { message: 'Profile updated.', data: { teacher } });
});

const getMyStudents = catchAsync(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id });
  if (!teacher) throw new AppError('Teacher profile not found.', 404);
  const filter = { isDeleted: false, status: 'active' };
  if (teacher.campus !== 'both') filter.campus = teacher.campus;
  if (teacher.grades && teacher.grades.length > 0) filter.grade = { $in: teacher.grades };
  const { docs, meta } = await paginate(Student, filter, req.query, ['admissionNo','rollNo'], 'user', '-documents');
  sendSuccess(res, { data: { students: docs }, meta });
});

const getNotifications = catchAsync(async (req, res) => {
  const filter = { recipient: req.user._id };
  if (req.query.unread === 'true') filter.isRead = false;
  const { docs, meta } = await paginate(Notification, filter, req.query, ['title','message']);
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

module.exports = { getProfile, updateProfile, getMyStudents, getNotifications, markNotificationRead };
