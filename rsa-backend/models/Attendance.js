'use strict';
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  teacher:      { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  date:         { type: Date, required: true, index: true },
  status:       { type: String, enum: ['present','absent','late','half-day'], required: true },
  grade:        { type: String, required: true },
  section:      { type: String },
  campus:       { type: String, enum: ['hcpur','kashimpur'], required: true },
  remarks:      { type: String, trim: true, maxlength: 200 },
  markedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, versionKey: false });

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, grade: 1, section: 1, campus: 1 });
attendanceSchema.index({ date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
