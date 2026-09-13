'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/manager/managerController');
const { authenticate, authorize } = require('../../middleware/auth');
const { mongoIdParam, paginationRules, runValidation } = require('../../validators/commonValidators');

router.use(authenticate, authorize('manager','admin','developer'));
router.get   ('/enquiries',           paginationRules, runValidation, ctrl.listEnquiries);
router.get   ('/enquiries/:id',       mongoIdParam,    runValidation, ctrl.getEnquiry);
router.patch ('/enquiries/:id',       mongoIdParam,    runValidation, ctrl.updateEnquiry);
router.post  ('/enquiries/:id/note',  mongoIdParam,    runValidation, ctrl.addEnquiryNote);
router.delete('/enquiries/:id',       mongoIdParam,    runValidation, ctrl.deleteEnquiry);
router.post  ('/notifications/broadcast',                             ctrl.broadcastNotification);
router.get   ('/reports/overview',                                    ctrl.getOverview);
router.get   ('/reports/students-by-campus',                          ctrl.studentsByCampus);

module.exports = router;
