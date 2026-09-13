'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/logManagementController');
const { authenticate, authorize } = require('../../middleware/auth');

// Only admin and developer can manage logs
router.use(authenticate, authorize('admin', 'developer'));

router.get('/deleted',          ctrl.listDeletedLogs);
router.delete('/audit',         ctrl.deleteAuditLogs);
router.delete('/security',      ctrl.deleteSecurityLogs);
router.delete('/activity',      ctrl.deleteActivityLogs);

module.exports = router;
