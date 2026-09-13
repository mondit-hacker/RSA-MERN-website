'use strict';
const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  recipient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type:          { type: String, enum: ['announcement','alert','info','warning','system'], default: 'info' },
  title:         { type: String, required: true, maxlength: 200 },
  message:       { type: String, required: true, maxlength: 2000 },
  link:          { type: String },
  isRead:        { type: Boolean, default: false, index: true },
  readAt:        { type: Date },
  recipientRole: { type: String, enum: ['student','teacher','hr','manager','admin','developer','all'] },
}, { timestamps: true, versionKey: false });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', notificationSchema);
