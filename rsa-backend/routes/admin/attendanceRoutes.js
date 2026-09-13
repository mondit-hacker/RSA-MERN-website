'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/attendanceController');
const { authenticate, authorize } = require('../../middleware/auth');
const { mongoIdParam, runValidation } = require('../../validators/commonValidators');

router.use(authenticate, authorize('admin','teacher','developer'));
router.get('/',                                    ctrl.listAttendance);
router.post('/bulk',                               ctrl.markBulkAttendance);
router.get('/summary/:studentId', mongoIdParam, runValidation, ctrl.studentAttendanceSummary);
module.exports = router;
