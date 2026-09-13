'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/analyticsController');
const { authenticate, authorize } = require('../../middleware/auth');

router.use(authenticate, authorize('admin','developer'));
router.get('/overview',          ctrl.overview);
router.get('/admissions',        ctrl.admissionsTrend);
router.get('/attendance',        ctrl.attendanceTrend);
router.get('/programmes',        ctrl.programmeBreakdown);
router.get('/campus',            ctrl.campusBreakdown);
router.get('/enquiry-funnel',    ctrl.enquiryFunnel);
router.get('/today-attendance',  ctrl.todayAttendance);
module.exports = router;
