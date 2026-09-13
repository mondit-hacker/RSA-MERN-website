'use strict';
const AuditLog    = require('../../models/AuditLog');
const SecurityLog = require('../../models/SecurityLog');
const ActivityLog = require('../../models/ActivityLog');
const DeletedLog  = require('../../models/DeletedLog');
const { sendSuccess } = require('../../utils/apiResponse');
const catchAsync      = require('../../utils/catchAsync');
const AppError        = require('../../utils/AppError');

// GET /api/logs/deleted — list all deletion audit trail
const listDeletedLogs = catchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
  const limit = Math.min(50, parseInt(req.query.limit || '20', 10));
  const skip  = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    DeletedLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('deletedBy','firstName lastName email role'),
    DeletedLog.countDocuments(),
  ]);
  const pages = Math.ceil(total / limit);
  sendSuccess(res, { data: { logs }, meta: { total, page, pages, limit } });
});

// DELETE /api/logs/audit — delete audit logs older than N days
const deleteAuditLogs = catchAsync(async (req, res) => {
  const { olderThanDays = 90, reason } = req.body;
  if (!reason || reason.trim().length < 5)
    throw new AppError('A reason is required to delete logs (min 5 characters).', 400);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(olderThanDays, 10));

  const toDelete = await AuditLog.find({ createdAt: { $lt: cutoff } }, '_id');
  if (!toDelete.length) throw new AppError('No audit logs found older than that date.', 404);

  // Record deletion BEFORE deleting
  await DeletedLog.create({
    deletedBy:     req.user._id,
    deletedByRole: req.user.role,
    deletedByEmail:req.user.email,
    entity:        'AuditLog',
    entityIds:     toDelete.map(d => d._id),
    count:         toDelete.length,
    reason:        reason.trim(),
    ipAddress:     req.ip,
    userAgent:     req.headers['user-agent'],
  });

  await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });

  sendSuccess(res, {
    message: `${toDelete.length} audit log(s) deleted. Deletion recorded permanently.`,
    data: { deletedCount: toDelete.length, cutoffDate: cutoff },
  });
});

// DELETE /api/logs/security — delete security logs older than N days
const deleteSecurityLogs = catchAsync(async (req, res) => {
  const { olderThanDays = 365, reason } = req.body;
  if (!reason || reason.trim().length < 5)
    throw new AppError('A reason is required to delete logs (min 5 characters).', 400);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(olderThanDays, 10));

  const toDelete = await SecurityLog.find({ createdAt: { $lt: cutoff } }, '_id');
  if (!toDelete.length) throw new AppError('No security logs found older than that date.', 404);

  await DeletedLog.create({
    deletedBy:     req.user._id,
    deletedByRole: req.user.role,
    deletedByEmail:req.user.email,
    entity:        'SecurityLog',
    entityIds:     toDelete.map(d => d._id),
    count:         toDelete.length,
    reason:        reason.trim(),
    ipAddress:     req.ip,
    userAgent:     req.headers['user-agent'],
  });

  await SecurityLog.deleteMany({ createdAt: { $lt: cutoff } });

  sendSuccess(res, {
    message: `${toDelete.length} security log(s) deleted. Deletion recorded permanently.`,
    data: { deletedCount: toDelete.length, cutoffDate: cutoff },
  });
});

// DELETE /api/logs/activity — delete activity logs older than N days
const deleteActivityLogs = catchAsync(async (req, res) => {
  const { olderThanDays = 30, reason } = req.body;
  if (!reason || reason.trim().length < 5)
    throw new AppError('A reason is required to delete logs (min 5 characters).', 400);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(olderThanDays, 10));

  const toDelete = await ActivityLog.find({ createdAt: { $lt: cutoff } }, '_id');
  if (!toDelete.length) throw new AppError('No activity logs found older than that date.', 404);

  await DeletedLog.create({
    deletedBy:     req.user._id,
    deletedByRole: req.user.role,
    deletedByEmail:req.user.email,
    entity:        'ActivityLog',
    entityIds:     toDelete.map(d => d._id),
    count:         toDelete.length,
    reason:        reason.trim(),
    ipAddress:     req.ip,
    userAgent:     req.headers['user-agent'],
  });

  await ActivityLog.deleteMany({ createdAt: { $lt: cutoff } });

  sendSuccess(res, {
    message: `${toDelete.length} activity log(s) deleted. Deletion recorded permanently.`,
    data: { deletedCount: toDelete.length, cutoffDate: cutoff },
  });
});

module.exports = { listDeletedLogs, deleteAuditLogs, deleteSecurityLogs, deleteActivityLogs };
