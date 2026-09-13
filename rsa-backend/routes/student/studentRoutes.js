'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/student/studentController');
const { authenticate, authorize } = require('../../middleware/auth');
const { mongoIdParam, runValidation } = require('../../validators/commonValidators');

router.use(authenticate, authorize('student'));
router.get  ('/profile',                      ctrl.getProfile);
router.patch('/profile',                      ctrl.updateProfile);
router.get  ('/notifications',                ctrl.getNotifications);
router.patch('/notifications/read-all',       ctrl.markAllNotificationsRead);
router.patch('/notifications/:id/read', mongoIdParam, runValidation, ctrl.markNotificationRead);

module.exports = router;
