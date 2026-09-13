'use strict';
const mongoose = require('mongoose');
const enquirySchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true, maxlength: 100 },
  phone:         { type: String, required: true, trim: true, maxlength: 16 },
  email:         { type: String, trim: true, lowercase: true },
  classInterest: { type: String, enum: ['nursery','1-5','6-10','11-12',''], default: '' },
  campus:        { type: String, enum: ['hcpur','kashimpur',''], default: '' },
  message:       { type: String, trim: true, maxlength: 1000 },
  status:        { type: String, enum: ['new','contacted','converted','closed'], default: 'new', index: true },
  assignedTo:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:         [{ note: String, addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, addedAt: { type: Date, default: Date.now } }],
  ip:            { type: String },
  isSpam:        { type: Boolean, default: false, index: true },
}, { timestamps: true, versionKey: false });
enquirySchema.index({ status: 1, createdAt: -1 });
module.exports = mongoose.model('Enquiry', enquirySchema);
