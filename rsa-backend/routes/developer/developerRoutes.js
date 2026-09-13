'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/developer/developerController');
const { authenticate, authorize } = require('../../middleware/auth');
const { mongoIdParam, paginationRules, runValidation } = require('../../validators/commonValidators');

router.use(authenticate, authorize('developer'));
router.get   ('/system/health',              ctrl.systemHealth);
router.get   ('/system/stats',               ctrl.systemStats);
router.get   ('/users',    paginationRules,  runValidation, ctrl.listAllUsers);
router.patch ('/users/:id/role', mongoIdParam, runValidation, ctrl.changeUserRole);
router.delete('/users/:id',      mongoIdParam, runValidation, ctrl.hardDeleteUser);
router.delete('/sessions',                   ctrl.revokeAllSessions);
router.post  ('/maintenance/purge-sessions', ctrl.purgeExpiredSessions);
router.get   ('/logs/activity', paginationRules, runValidation, ctrl.getActivityLogs);
router.get   ('/logs/audit',    paginationRules, runValidation, ctrl.getAuditLogs);
router.get   ('/logs/security', paginationRules, runValidation, ctrl.getSecurityLogs);

module.exports = router;
