'use strict';
const mongoose = require('mongoose');
const teacherSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  employeeId:     { type: String, required: true, unique: true, trim: true, index: true },
  campus:         { type: String, enum: ['hcpur','kashimpur','both'], required: true },
  designation:    { type: String, default: 'Teacher', trim: true },
  department:     { type: String, trim: true },
  subjects:       [{ type: String, trim: true }],
  grades:         [{ type: String, trim: true }],
  qualifications: [{ degree: String, institution: String, year: Number }],
  experience:     { total: { type: Number, default: 0 }, atSchool: { type: Number, default: 0 } },
  joiningDate:    { type: Date, default: Date.now },
  salary:         { type: Number, select: false },
  employmentType: { type: String, enum: ['permanent','contractual','part-time','full-time','visiting'], default: 'permanent' },
  documents:      [{ type: { type: String }, url: String, uploadedAt: { type: Date, default: Date.now } }],
  status:         { type: String, enum: ['active','on-leave','resigned','terminated'], default: 'active', index: true },
  isDeleted:      { type: Boolean, default: false, index: true },
  deletedAt:      { type: Date },
}, { timestamps: true, versionKey: false });
teacherSchema.index({ campus: 1, status: 1 });
module.exports = mongoose.model('Teacher', teacherSchema);
