'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/admin/feeController');
const { authenticate, authorize } = require('../../middleware/auth');
const { mongoIdParam, runValidation } = require('../../validators/commonValidators');

router.use(authenticate, authorize('admin','manager','developer'));
router.get('/',                                    ctrl.listFees);
router.post('/',                                   ctrl.createFee);
router.patch('/:id/pay', mongoIdParam, runValidation, ctrl.collectPayment);
router.get('/student/:studentId', mongoIdParam, runValidation, ctrl.studentFees);
module.exports = router;
