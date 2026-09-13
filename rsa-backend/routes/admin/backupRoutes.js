'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/backupController');
const { authenticate, authorize } = require('../../middleware/auth');

// Backup routes — admin + developer only
const adminDev = authorize('admin','developer');

router.use(authenticate);

// Backup management
router.post('/run',                     adminDev, ctrl.triggerBackup);
router.get('/list',                     adminDev, ctrl.getBackupList);
router.get('/download/:filename',       adminDev, ctrl.downloadBackup);
router.delete('/:filename',             adminDev, ctrl.deleteBackup);

// Export routes — admin, manager, developer
const exportAuth = authorize('admin','manager','developer');
router.get('/export/students',          exportAuth, ctrl.exportStudents);
router.get('/export/teachers',          exportAuth, ctrl.exportTeachers);
router.get('/export/results',           exportAuth, ctrl.exportResults);
router.get('/export/attendance',        exportAuth, ctrl.exportAttendance);
router.get('/export/enquiries',         exportAuth, ctrl.exportEnquiries);
router.get('/export/all',               adminDev,   ctrl.exportAll);

module.exports = router;
