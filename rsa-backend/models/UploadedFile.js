'use strict';
const mongoose = require('mongoose');
const uploadedFileSchema = new mongoose.Schema({
  uploader:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category:     { type: String, enum: ['profile','document','certificate','other'], default: 'document' },
  originalName: { type: String, required: true },
  storedName:   { type: String, required: true },
  path:         { type: String, required: true },
  mimeType:     { type: String, required: true },
  size:         { type: Number, required: true },
  entity:       { type: String },
  entityId:     { type: mongoose.Schema.Types.ObjectId, index: true },
  isDeleted:    { type: Boolean, default: false, index: true },
  deletedAt:    { type: Date },
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model('UploadedFile', uploadedFileSchema);
