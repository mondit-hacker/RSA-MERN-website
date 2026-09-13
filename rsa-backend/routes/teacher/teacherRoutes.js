'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/teacher/teacherController');
const { authenticate, authorize } = require('../../middleware/auth');
const { mongoIdParam, paginationRules, runValidation } = require('../../validators/commonValidators');

router.use(authenticate, authorize('teacher'));
router.get  ('/profile',                                         ctrl.getProfile);
router.patch('/profile',                                         ctrl.updateProfile);
router.get  ('/students',    paginationRules, runValidation,     ctrl.getMyStudents);
router.get  ('/notifications', paginationRules, runValidation,   ctrl.getNotifications);
router.patch('/notifications/:id/read', mongoIdParam, runValidation, ctrl.markNotificationRead);

module.exports = router;
