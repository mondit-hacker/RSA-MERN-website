'use strict';
const mongoose = require('mongoose');
const auditLogSchema = new mongoose.Schema({
  actor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  actorRole: { type: String },
  action:    { type: String, required: true, index: true },
  entity:    { type: String, required: true },
  entityId:  { type: mongoose.Schema.Types.ObjectId, index: true },
  before:    { type: mongoose.Schema.Types.Mixed },
  after:     { type: mongoose.Schema.Types.Mixed },
  ip:        { type: String },
  userAgent: { type: String },
  status:    { type: String, enum: ['success','failure'], default: 'success' },
  reason:    { type: String },
}, { timestamps: true, versionKey: false });
auditLogSchema.index({ actor: 1, createdAt: -1 });
module.exports = mongoose.model('AuditLog', auditLogSchema);
