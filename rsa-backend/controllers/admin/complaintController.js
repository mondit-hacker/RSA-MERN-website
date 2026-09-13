'use strict';
const Complaint = require('../../models/Complaint');
const { sendSuccess } = require('../../utils/apiResponse');
const { paginate }    = require('../../services/queryService');
const catchAsync      = require('../../utils/catchAsync');
const AppError        = require('../../utils/AppError');

const listComplaints = catchAsync(async (req, res) => {
  const filter = { isDeleted: false };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type)   filter.type   = req.query.type;
  const { docs, meta } = await paginate(Complaint, filter, req.query, ['subject','message'], 'from to', '');
  sendSuccess(res, { data: { complaints: docs }, meta });
});

const respond = catchAsync(async (req, res) => {
  const { response, status } = req.body;
  if (!response) throw new AppError('Response text is required.', 400);
  const complaint = await Complaint.findByIdAndUpdate(req.params.id, {
    response, status: status || 'resolved',
    respondedBy: req.user._id, respondedAt: new Date(),
  }, { new: true });
  if (!complaint) throw new AppError('Complaint not found.', 404);
  await req.audit('COMPLAINT_RESPONDED', 'Complaint', complaint._id);
  sendSuccess(res, { message: 'Response sent.', data: { complaint } });
});

const createComplaint = catchAsync(async (req, res) => {
  const { to, toRole, subject, message, type, priority } = req.body;
  const complaint = await Complaint.create({
    from: req.user._id, fromRole: req.user.role,
    to, toRole, subject, message,
    type: type || 'complaint', priority: priority || 'medium',
  });
  sendSuccess(res, { statusCode: 201, message: 'Submitted successfully.', data: { complaint } });
});

const getMyComplaints = catchAsync(async (req, res) => {
  const filter = { from: req.user._id, isDeleted: false };
  const { docs, meta } = await paginate(Complaint, filter, req.query, ['subject'], 'to', '');
  sendSuccess(res, { data: { complaints: docs }, meta });
});

module.exports = { listComplaints, respond, createComplaint, getMyComplaints };
