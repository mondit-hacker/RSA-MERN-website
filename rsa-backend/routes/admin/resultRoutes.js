'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/resultController');
const { authenticate, authorize } = require('../../middleware/auth');
const { mongoIdParam, runValidation } = require('../../validators/commonValidators');

router.use(authenticate);
const canManage = authorize('admin','hr','developer','teacher');
const canView   = authorize('admin','hr','developer','teacher','student','manager');

router.get   ('/students-list',           canManage, ctrl.studentsForResult);
router.get   ('/',                        canView,   ctrl.listResults);
router.post  ('/',                        canManage, ctrl.createResult);
router.get   ('/student/:studentId',      canView,   ctrl.studentResults);
router.patch ('/:id', mongoIdParam, runValidation, canManage, ctrl.updateResult);
router.delete('/:id', mongoIdParam, runValidation, canManage, ctrl.deleteResult);

module.exports = router;
