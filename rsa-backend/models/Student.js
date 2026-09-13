'use strict';
const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  admissionNo:  { type: String, required: true, unique: true, trim: true, index: true },
  rollNo:       { type: String, trim: true },
  programme:    { type: String, enum: ['eKidz','eChamps','eTechno','SR.Secondary'], required: true },
  grade:        { type: String, required: true, trim: true },
  section:      { type: String, trim: true, uppercase: true, maxlength: 1 },
  campus:       { type: String, enum: ['hcpur','kashimpur'], required: true },
  academicYear: { type: String, required: true, trim: true },
  admissionDate:{ type: Date, default: Date.now },
  dateOfBirth:  { type: Date },
  gender:       { type: String, enum: ['male','female','other'] },
  bloodGroup:   { type: String, default: 'unknown' },
  nationality:  { type: String, default: 'Indian' },
  category:     { type: String, enum: ['general','obc','sc','st','other'] },
  address:      { street: String, city: String, district: String, state: { type: String, default: 'West Bengal' }, pincode: String },
  father:       { name: String, phone: String, occupation: String, email: String },
  mother:       { name: String, phone: String, occupation: String, email: String },
  guardian:     { name: String, phone: String, relation: String },
  documents:    [{ type: { type: String }, url: String, uploadedAt: { type: Date, default: Date.now } }],
  status:       { type: String, enum: ['active','inactive','transferred','graduated','withdrawn'], default: 'active', index: true },
  isDeleted:    { type: Boolean, default: false, index: true },
  deletedAt:    { type: Date },
}, { timestamps: true, versionKey: false });
studentSchema.index({ campus: 1, grade: 1, status: 1 });
module.exports = mongoose.model('Student', studentSchema);
