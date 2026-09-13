'use strict';
const mongoose = require('mongoose');
const activityLogSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  role:       { type: String },
  method:     { type: String },
  path:       { type: String },
  statusCode: { type: Number },
  ip:         { type: String },
  userAgent:  { type: String },
  duration:   { type: Number },
  event:      { type: String, index: true },
}, { timestamps: true, versionKey: false });
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90*24*3600 });
activityLogSchema.index({ user: 1, createdAt: -1 });
module.exports = mongoose.model('ActivityLog', activityLogSchema);
