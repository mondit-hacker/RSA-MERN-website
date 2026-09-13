'use strict';
const router  = require('express').Router();
const ctrl    = require('../../controllers/admin/adminController');
const { authenticate, authorize } = require('../../middleware/auth');
const { mongoIdParam, paginationRules, runValidation } = require('../../validators/commonValidators');

const adminDev = [authenticate, authorize('admin','developer')];

router.get('/dashboard',                       ...adminDev, ctrl.getDashboard);

// Users
router.get('/users',                           ...adminDev, paginationRules, runValidation, ctrl.listUsers);
router.post('/users',                          ...adminDev, ctrl.createUser);
router.get('/users/:id',                       ...adminDev, mongoIdParam, runValidation, ctrl.getUser);
router.patch('/users/:id',                     ...adminDev, mongoIdParam, runValidation, ctrl.updateUser);
router.delete('/users/:id',                    ...adminDev, mongoIdParam, runValidation, ctrl.deleteUser);
router.post('/users/:id/unlock',               ...adminDev, mongoIdParam, runValidation, ctrl.unlockUser);
router.patch('/users/:id/reset-password',      ...adminDev, mongoIdParam, runValidation, ctrl.resetUserPassword);

// Students
router.get('/students',                        ...adminDev, paginationRules, runValidation, ctrl.listStudents);
router.post('/students',                       ...adminDev, ctrl.createStudent);
router.patch('/students/:id',                  ...adminDev, mongoIdParam, runValidation, ctrl.updateStudent);
router.delete('/students/:id',                 ...adminDev, mongoIdParam, runValidation, ctrl.deleteStudent);

// Logs
router.get('/logs/audit',                      ...adminDev, paginationRules, runValidation, ctrl.getAuditLogs);
router.get('/logs/security',                   ...adminDev, paginationRules, runValidation, ctrl.getSecurityLogs);

module.exports = router;
