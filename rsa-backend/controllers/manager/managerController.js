'use strict';
const Student      = require('../../models/Student');
const Teacher      = require('../../models/Teacher');
const Enquiry      = require('../../models/Enquiry');
const Notification = require('../../models/Notification');
const User         = require('../../models/User');
const { sendSuccess } = require('../../utils/apiResponse');
const { paginate }    = require('../../services/queryService');
const catchAsync      = require('../../utils/catchAsync');
const AppError        = require('../../utils/AppError');

const listEnquiries = catchAsync(async (req, res) => {
  const filter = { isSpam: false };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.campus) filter.campus = req.query.campus;
  const { docs, meta } = await paginate(Enquiry, filter, req.query, ['name','phone','email'], 'assignedTo','');
  sendSuccess(res, { data: { enquiries: docs }, meta });
});

const getEnquiry = catchAsync(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id).populate('assignedTo','firstName lastName email');
  if (!enquiry) throw new AppError('Enquiry not found.', 404);
  sendSuccess(res, { data: { enquiry } });
});

const updateEnquiry = catchAsync(async (req, res) => {
  const ALLOWED = ['status','assignedTo','isSpam'];
  const updates = {};
  ALLOWED.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!enquiry) throw new AppError('Enquiry not found.', 404);
  await req.audit('ENQUIRY_UPDATED','Enquiry',enquiry._id,{},updates);
  sendSuccess(res, { message: 'Enquiry updated.', data: { enquiry } });
});

const addEnquiryNote = catchAsync(async (req, res) => {
  if (!req.body.note || !req.body.note.trim()) throw new AppError('Note content is required.', 400);
  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { $push: { notes: { note: req.body.note.trim(), addedBy: req.user._id } } },
    { new: true }
  );
  if (!enquiry) throw new AppError('Enquiry not found.', 404);
  sendSuccess(res, { message: 'Note added.', data: { enquiry } });
});

const deleteEnquiry = catchAsync(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
  if (!enquiry) throw new AppError('Enquiry not found.', 404);
  await req.audit('ENQUIRY_DELETED','Enquiry',enquiry._id);
  sendSuccess(res, { message: 'Enquiry deleted.' });
});

const broadcastNotification = catchAsync(async (req, res) => {
  const { title, message, recipientRole, type } = req.body;
  if (!title || !message) throw new AppError('Title and message are required.', 400);
  const filter = { isActive: true, isDeleted: false };
  if (recipientRole !== 'all') filter.role = recipientRole;
  const recipients = await User.find(filter).select('_id');
  const notifications = recipients.map(u => ({ recipient: u._id, sender: req.user._id, title, message, type: type||'announcement', recipientRole }));
  await Notification.insertMany(notifications);
  await req.audit('NOTIFICATION_BROADCAST','Notification',null,null,{ title, recipientRole, count: notifications.length });
  sendSuccess(res, { message: `Notification sent to ${notifications.length} user(s).` });
});

const getOverview = catchAsync(async (req, res) => {
  const [totalStudents, activeStudents, totalTeachers, activeTeachers, newEnquiries, pendingEnquiries] = await Promise.all([
    Student.countDocuments({ isDeleted: false }),
    Student.countDocuments({ isDeleted: false, status: 'active' }),
    Teacher.countDocuments({ isDeleted: false }),
    Teacher.countDocuments({ isDeleted: false, status: 'active' }),
    Enquiry.countDocuments({ status: 'new', isSpam: false }),
    Enquiry.countDocuments({ status: { $in: ['new','contacted'] }, isSpam: false }),
  ]);
  sendSuccess(res, { data: { overview: { totalStudents, activeStudents, totalTeachers, activeTeachers, newEnquiries, pendingEnquiries } } });
});

const studentsByCampus = catchAsync(async (req, res) => {
  const data = await Student.aggregate([
    { $match: { isDeleted: false, status: 'active' } },
    { $group: { _id: '$campus', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  sendSuccess(res, { data: { campusBreakdown: data } });
});

module.exports = { listEnquiries, getEnquiry, updateEnquiry, addEnquiryNote, deleteEnquiry, broadcastNotification, getOverview, studentsByCampus };
