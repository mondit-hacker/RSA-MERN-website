'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/classAssignmentController');
const { authenticate, authorize } = require('../../middleware/auth');
const { mongoIdParam, runValidation } = require('../../validators/commonValidators');

router.use(authenticate);
const canManage = authorize('admin','hr','developer');
const canView   = authorize('admin','hr','developer','teacher');

router.get   ('/',                                canManage, ctrl.list);
router.post  ('/',                                canManage, ctrl.assign);
router.delete('/:id', mongoIdParam, runValidation, canManage, ctrl.remove);
router.get   ('/by-class',                        canView,   ctrl.byClass);
router.get   ('/teacher/:teacherId/students',     canView,   ctrl.teacherStudents);

module.exports = router;
