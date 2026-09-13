'use strict';
const mongoose = require('mongoose');
const sessionSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  refreshToken: { type: String, required: true, select: false },
  userAgent:    { type: String },
  ip:           { type: String },
  isRevoked:    { type: Boolean, default: false, index: true },
  expiresAt:    { type: Date, required: true, index: true },
}, { timestamps: true, versionKey: false });
sessionSchema.index({ user: 1, isRevoked: 1 });
module.exports = mongoose.model('Session', sessionSchema);
