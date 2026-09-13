'use strict';
const mongoose = require('mongoose');

const feeRecordSchema = new mongoose.Schema({
  student:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  academicYear: { type: String, required: true },
  month:        { type: String, required: true },   // 'January', 'February' etc.
  amount:       { type: Number, required: true },
  discount:     { type: Number, default: 0 },
  paid:         { type: Number, default: 0 },
  balance:      { type: Number, default: 0 },
  dueDate:      { type: Date },
  paidDate:     { type: Date },
  status:       { type: String, enum: ['paid','pending','partial','overdue'], default: 'pending', index: true },
  paymentMode:  { type: String, enum: ['cash','online','cheque','dd'], default: 'cash' },
  receiptNo:    { type: String, trim: true },
  remarks:      { type: String, trim: true, maxlength: 300 },
  collectedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, versionKey: false });

feeRecordSchema.index({ student: 1, academicYear: 1, month: 1 }, { unique: true });
feeRecordSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('FeeRecord', feeRecordSchema);
