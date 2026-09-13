'use strict';
const router = require('express').Router();
const ctrl   = require('../controllers/public/publicController');
const { authenticate }  = require('../middleware/auth');
const { enquiryLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const { uploadProfilePicture, uploadDocument } = require('../middleware/upload');
const { enquiryRules, mongoIdParam, runValidation } = require('../validators/commonValidators');

router.post  ('/enquiry',          enquiryLimiter, enquiryRules, runValidation, ctrl.submitEnquiry);
router.post  ('/upload/avatar',    authenticate, uploadLimiter, uploadProfilePicture, ctrl.uploadAvatar);
router.post  ('/upload/document',  authenticate, uploadLimiter, uploadDocument,       ctrl.uploadDocument);
router.get   ('/upload/my-files',  authenticate,                                      ctrl.getMyFiles);
router.delete('/upload/:id',       authenticate, mongoIdParam, runValidation,         ctrl.deleteFile);

module.exports = router;
