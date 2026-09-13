'use strict';
const multer   = require('multer');
const path     = require('path');
const crypto   = require('crypto');
const AppError = require('../utils/AppError');

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10) * 1024 * 1024;
const TYPES = {
  image:    ['image/jpeg','image/png','image/webp'],
  document: ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  any:      ['image/jpeg','image/png','image/webp','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

function buildStorage(subDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', subDir)),
    filename:    (req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g,'')}`)
  });
}
function buildFilter(cat) {
  return (req, file, cb) => {
    if (!(TYPES[cat]||TYPES.any).includes(file.mimetype)) return cb(new AppError('File type not allowed.', 400));
    cb(null, true);
  };
}
function wrap(fn) {
  return (req, res, next) => fn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code==='LIMIT_FILE_SIZE') return next(new AppError(`File too large. Max: ${process.env.MAX_FILE_SIZE_MB||5}MB.`, 400));
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    if (err) return next(err);
    next();
  });
}

module.exports = {
  uploadProfilePicture: wrap(multer({ storage: buildStorage('profiles'),    limits: { fileSize: MAX_SIZE, files: 1 }, fileFilter: buildFilter('image') }).single('avatar')),
  uploadDocument:       wrap(multer({ storage: buildStorage('documents'),   limits: { fileSize: MAX_SIZE, files: 1 }, fileFilter: buildFilter('document') }).single('document')),
  uploadCertificate:    wrap(multer({ storage: buildStorage('certificates'),limits: { fileSize: MAX_SIZE, files: 1 }, fileFilter: buildFilter('any') }).single('certificate')),
  uploadMultiple:       wrap(multer({ storage: buildStorage('documents'),   limits: { fileSize: MAX_SIZE, files: 5 }, fileFilter: buildFilter('any') }).array('files', 5)),
};
