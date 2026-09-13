'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/complaintController');
const { authenticate, authorize } = require('../../middleware/auth');
const { mongoIdParam, paginationRules, runValidation } = require('../../validators/commonValidators');

router.use(authenticate);
router.get('/mine',                                    ctrl.getMyComplaints);
router.post('/',                                       ctrl.createComplaint);
router.get('/', authorize('admin','manager','developer'), paginationRules, runValidation, ctrl.listComplaints);
router.patch('/:id/respond', authorize('admin','manager','developer'), mongoIdParam, runValidation, ctrl.respond);
module.exports = router;
