'use strict';
const mongoose = require('mongoose');
const securityLogSchema = new mongoose.Schema({
  event:     { type: String, enum: ['LOGIN_SUCCESS','LOGIN_FAILED','LOGOUT','ACCOUNT_LOCKED','ACCOUNT_UNLOCKED','PASSWORD_RESET_REQUEST','PASSWORD_RESET_SUCCESS','PASSWORD_CHANGED','EMAIL_VERIFIED','INVALID_TOKEN','EXPIRED_TOKEN','UNAUTHORIZED_ACCESS','RATE_LIMIT_HIT','FILE_UPLOAD_BLOCKED','SUSPICIOUS_ACTIVITY'], required: true, index: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  email:     { type: String },
  ip:        { type: String, index: true },
  userAgent: { type: String },
  details:   { type: String },
  severity:  { type: String, enum: ['low','medium','high','critical'], default: 'low', index: true },
}, { timestamps: true, versionKey: false });
securityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365*24*3600 });
module.exports = mongoose.model('SecurityLog', securityLogSchema);
