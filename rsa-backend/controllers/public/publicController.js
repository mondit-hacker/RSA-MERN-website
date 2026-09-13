'use strict';
const Enquiry      = require('../../models/Enquiry');
const UploadedFile = require('../../models/UploadedFile');
const User         = require('../../models/User');
const { sendSuccess } = require('../../utils/apiResponse');
const catchAsync      = require('../../utils/catchAsync');
const AppError        = require('../../utils/AppError');

const submitEnquiry = catchAsync(async (req, res) => {
  const { name, phone, email, classInterest, campus, message } = req.body;
  const enquiry = await Enquiry.create({ name, phone, email, classInterest, campus, message, ip: req.ip });
  sendSuccess(res, { statusCode: 201, message: 'Thank you! We will contact you within 24 hours.', data: { enquiryId: enquiry._id } });
});

const uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded.', 400);
  const fileDoc = await UploadedFile.create({
    uploader: req.user._id, category: 'profile',
    originalName: req.file.originalname, storedName: req.file.filename,
    path: req.file.path, mimeType: req.file.mimetype, size: req.file.size,
    entity: 'User', entityId: req.user._id,
  });
  const avatarPath = `/uploads/profiles/${req.file.filename}`;
  await User.findByIdAndUpdate(req.user._id, { avatar: avatarPath });
  sendSuccess(res, { message: 'Profile picture updated.', data: { avatar: avatarPath, file: fileDoc } });
});

const uploadDocument = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded.', 400);
  const fileDoc = await UploadedFile.create({
    uploader: req.user._id, category: req.body.category||'document',
    originalName: req.file.originalname, storedName: req.file.filename,
    path: req.file.path, mimeType: req.file.mimetype, size: req.file.size,
    entity: req.body.entity, entityId: req.body.entityId,
  });
  sendSuccess(res, { message: 'Document uploaded.', data: { file: fileDoc, path: `/uploads/documents/${req.file.filename}` } });
});

const getMyFiles = catchAsync(async (req, res) => {
  const files = await UploadedFile.find({ uploader: req.user._id, isDeleted: false }).sort({ createdAt: -1 });
  sendSuccess(res, { data: { files } });
});

const deleteFile = catchAsync(async (req, res) => {
  const file = await UploadedFile.findOne({ _id: req.params.id, uploader: req.user._id });
  if (!file) throw new AppError('File not found.', 404);
  file.isDeleted = true; file.deletedAt = new Date();
  await file.save();
  sendSuccess(res, { message: 'File deleted.' });
});

module.exports = { submitEnquiry, uploadAvatar, uploadDocument, getMyFiles, deleteFile };
