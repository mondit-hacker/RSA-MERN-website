'use strict';
const mongoose = require('mongoose');

const classAssignmentSchema = new mongoose.Schema({
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  grade:       { type: String, required: true, trim: true },
  section:     { type: String, trim: true, default: '' },
  subject:     { type: String, required: true, trim: true },
  campus:      { type: String, enum: ['hcpur','kashimpur','both'], required: true },
  academicYear:{ type: String, default: () => { const y=new Date().getFullYear(); return `${y}-${String(y+1).slice(2)}`; } },
  isActive:    { type: Boolean, default: true },
  assignedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, versionKey: false });

classAssignmentSchema.index({ teacher:1, grade:1, section:1, subject:1, academicYear:1 }, { unique:true });

module.exports = mongoose.model('ClassAssignment', classAssignmentSchema);
