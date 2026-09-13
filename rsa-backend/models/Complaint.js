'use strict';
const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  from:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fromRole:     { type: String, required: true },
  to:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  toRole:       { type: String },
  subject:      { type: String, required: true, trim: true, maxlength: 200 },
  message:      { type: String, required: true, trim: true, maxlength: 2000 },
  type:         { type: String, enum: ['complaint','feedback','suggestion','query','appreciation'], default: 'complaint' },
  status:       { type: String, enum: ['open','in-review','resolved','closed'], default: 'open', index: true },
  priority:     { type: String, enum: ['low','medium','high'], default: 'medium' },
  response:     { type: String, trim: true, maxlength: 2000 },
  respondedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  respondedAt:  { type: Date },
  isDeleted:    { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

complaintSchema.index({ from: 1, createdAt: -1 });
complaintSchema.index({ to: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
