'use strict';
const mongoose    = require('mongoose');
const os          = require('os');
const User        = require('../../models/User');
const Session     = require('../../models/Session');
const AuditLog    = require('../../models/AuditLog');
const SecurityLog = require('../../models/SecurityLog');
const ActivityLog = require('../../models/ActivityLog');
const { sendSuccess } = require('../../utils/apiResponse');
const { paginate }    = require('../../services/queryService');
const catchAsync      = require('../../utils/catchAsync');
const AppError        = require('../../utils/AppError');
const logger          = require('../../utils/logger');

const systemHealth = catchAsync(async (req, res) => {
  const dbState  = mongoose.connection.readyState;
  const dbStates = { 0:'disconnected', 1:'connected', 2:'connecting', 3:'disconnecting' };
  sendSuccess(res, { data: { health: {
    status:      dbState === 1 ? 'healthy' : 'degraded',
    timestamp:   new Date().toISOString(),
    uptime:      `${Math.floor(process.uptime())}s`,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    database:    { state: dbStates[dbState], name: mongoose.connection.name, host: mongoose.connection.host },
    memory: {
      rss:       `${Math.round(process.memoryUsage().rss/1024/1024)} MB`,
      heapUsed:  `${Math.round(process.memoryUsage().heapUsed/1024/1024)} MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal/1024/1024)} MB`,
    },
    system: {
      platform:    os.platform(),
      cpus:        os.cpus().length,
      totalMemory: `${Math.round(os.totalmem()/1024/1024)} MB`,
      freeMemory:  `${Math.round(os.freemem()/1024/1024)} MB`,
      loadAvg:     os.loadavg().map(l => l.toFixed(2)),
    },
  }}});
});

const systemStats = catchAsync(async (req, res) => {
  const models  = ['User','Student','Teacher','Staff','Enquiry','Notification','AuditLog','SecurityLog','Session'];
  const counts  = await Promise.all(models.map(m => mongoose.model(m).countDocuments()));
  const stats   = Object.fromEntries(models.map((m,i) => [m, counts[i]]));
  const activeSessions = await Session.countDocuments({ isRevoked: false, expiresAt: { $gt: new Date() } });
  sendSuccess(res, { data: { stats: { ...stats, activeSessions } } });
});

const listAllUsers = catchAsync(async (req, res) => {
  const { docs, meta } = await paginate(User, {}, req.query, ['firstName','lastName','email'], '', '-password');
  sendSuccess(res, { data: { users: docs }, meta });
});

const changeUserRole = catchAsync(async (req, res) => {
  const ROLES = ['student','teacher','hr','manager','admin','developer'];
  if (!ROLES.includes(req.body.role)) throw new AppError('Invalid role.', 400);
  const before = await User.findById(req.params.id).lean();
  const user   = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  if (!user) throw new AppError('User not found.', 404);
  await Session.updateMany({ user: req.params.id }, { isRevoked: true });
  await req.audit('ROLE_CHANGED','User',user._id,{ role: before.role },{ role: req.body.role });
  sendSuccess(res, { message: `Role changed to '${req.body.role}'. All sessions revoked.`, data: { user } });
});

const hardDeleteUser = catchAsync(async (req, res) => {
  if (req.params.id === req.user._id.toString()) throw new AppError('Cannot delete your own account.', 400);
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  await Session.deleteMany({ user: req.params.id });
  logger.warn(`HARD DELETE: User ${req.params.id} permanently deleted by ${req.user._id}`);
  await req.audit('USER_HARD_DELETED','User',req.params.id);
  sendSuccess(res, { message: 'User permanently deleted.' });
});

const revokeAllSessions = catchAsync(async (req, res) => {
  const result = await Session.updateMany({ isRevoked: false }, { isRevoked: true });
  logger.warn(`ALL SESSIONS REVOKED by developer ${req.user._id}`);
  await req.audit('ALL_SESSIONS_REVOKED','Session',null,null,{ count: result.modifiedCount });
  sendSuccess(res, { message: `${result.modifiedCount} sessions revoked.` });
});

const getActivityLogs = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.user)  filter.user  = req.query.user;
  if (req.query.event) filter.event = req.query.event;
  const { docs, meta } = await paginate(ActivityLog, filter, req.query, ['path','event'], 'user','');
  sendSuccess(res, { data: { logs: docs }, meta });
});

const getAuditLogs = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.actor)  filter.actor  = req.query.actor;
  if (req.query.action) filter.action = req.query.action;
  const { docs, meta } = await paginate(AuditLog, filter, req.query, ['action','entity'], 'actor','');
  sendSuccess(res, { data: { logs: docs }, meta });
});

const getSecurityLogs = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.event)    filter.event    = req.query.event;
  const { docs, meta } = await paginate(SecurityLog, filter, req.query, ['email','details'], 'user','');
  sendSuccess(res, { data: { logs: docs }, meta });
});

const purgeExpiredSessions = catchAsync(async (req, res) => {
  const result = await Session.deleteMany({ expiresAt: { $lt: new Date() } });
  sendSuccess(res, { message: `Purged ${result.deletedCount} expired sessions.` });
});

module.exports = { systemHealth, systemStats, listAllUsers, changeUserRole, hardDeleteUser, revokeAllSessions, getActivityLogs, getAuditLogs, getSecurityLogs, purgeExpiredSessions };
