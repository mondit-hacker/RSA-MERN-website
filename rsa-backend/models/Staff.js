'use strict';
const mongoose = require('mongoose');
const staffSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  employeeId:     { type: String, required: true, unique: true, trim: true, index: true },
  role:           { type: String, enum: ['hr','manager','admin','developer'], required: true, index: true },
  campus:         { type: String, enum: ['hcpur','kashimpur','both','remote'], default: 'both' },
  designation:    { type: String, trim: true },
  department:     { type: String, trim: true },
  joiningDate:    { type: Date, default: Date.now },
  salary:         { type: Number, select: false },
  employmentType: { type: String, enum: ['permanent','contractual','part-time','full-time'], default: 'permanent' },
  permissions:    [{ type: String }],
  documents:      [{ type: { type: String }, url: String, uploadedAt: { type: Date, default: Date.now } }],
  status:         { type: String, enum: ['active','on-leave','resigned','terminated'], default: 'active', index: true },
  isDeleted:      { type: Boolean, default: false, index: true },
  deletedAt:      { type: Date },
}, { timestamps: true, versionKey: false });
staffSchema.index({ role: 1, campus: 1, status: 1 });
module.exports = mongoose.model('Staff', staffSchema);
