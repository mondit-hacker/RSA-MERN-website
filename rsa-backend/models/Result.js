'use strict';
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  academicYear: { type: String, required: true },
  examName:     { type: String, required: true, trim: true },   // 'Unit Test 1', 'Half Yearly', 'Annual'
  examType:     { type: String, enum: ['class-test','1st-term','2nd-term','3rd-term','exam'], default: 'class-test' },
  grade:        { type: String, required: true },
  section:      { type: String },
  subjects:     [{
    name:       { type: String, required: true },
    maxMarks:   { type: Number, required: true },
    obtained:   { type: Number, required: true },
    grade:      { type: String },
    remarks:    { type: String },
  }],
  totalMax:     { type: Number },
  totalObtained:{ type: Number },
  percentage:   { type: Number },
  rank:         { type: Number },
  result:       { type: String, enum: ['pass','fail','absent','withheld'], default: 'pass' },
  publishedAt:  { type: Date },
  enteredBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, versionKey: false });

resultSchema.index({ student: 1, academicYear: 1, examName: 1 });

module.exports = mongoose.model('Result', resultSchema);
