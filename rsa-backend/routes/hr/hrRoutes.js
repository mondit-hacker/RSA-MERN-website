'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/hr/hrController');
const { authenticate, authorize } = require('../../middleware/auth');
const { mongoIdParam, paginationRules, runValidation } = require('../../validators/commonValidators');

router.use(authenticate, authorize('hr','admin','developer'));
router.get   ('/teachers',     paginationRules, runValidation, ctrl.listTeachers);
router.get   ('/teachers/:id', mongoIdParam,    runValidation, ctrl.getTeacher);
router.post  ('/teachers',                                     ctrl.createTeacher);
router.patch ('/teachers/:id', mongoIdParam,    runValidation, ctrl.updateTeacher);
router.delete('/teachers/:id', mongoIdParam,    runValidation, ctrl.deleteTeacher);
router.get   ('/staff',        paginationRules, runValidation, ctrl.listStaff);
router.get   ('/staff/:id',    mongoIdParam,    runValidation, ctrl.getStaffMember);
router.post  ('/staff',                                        ctrl.createStaff);
router.patch ('/staff/:id',    mongoIdParam,    runValidation, ctrl.updateStaff);
router.delete('/staff/:id',    mongoIdParam,    runValidation, ctrl.deleteStaff);
router.get   ('/students',     paginationRules, runValidation, ctrl.listStudents);

module.exports = router;
