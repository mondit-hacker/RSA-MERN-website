'use strict';
const mongoose = require('mongoose');

// Immutable record — once created, cannot be modified or deleted via API
const deletedLogSchema = new mongoose.Schema({
  deletedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deletedByRole:{ type: String, required: true },
  deletedByEmail:{ type: String, required: true },
  entity:       { type: String, required: true },  // 'AuditLog', 'SecurityLog', 'ActivityLog'
  entityIds:    [{ type: mongoose.Schema.Types.ObjectId }],
  count:        { type: Number, required: true },
  reason:       { type: String, trim: true, maxlength: 500 },
  ipAddress:    { type: String },
  userAgent:    { type: String },
}, {
  timestamps: true,
  versionKey: false,
});

// Make it truly immutable — disable all updates
deletedLogSchema.pre(['updateOne','findOneAndUpdate','updateMany','findByIdAndUpdate'], function(next) {
  next(new Error('DeletedLog records are immutable.'));
});

// No delete either — these records persist forever
deletedLogSchema.pre(['deleteOne','findOneAndDelete','deleteMany','findByIdAndDelete'], function(next) {
  next(new Error('DeletedLog records cannot be removed.'));
});

module.exports = mongoose.model('DeletedLog', deletedLogSchema);
