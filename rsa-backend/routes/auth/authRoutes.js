'use strict';
const router = require('express').Router();
const ctrl   = require('../../controllers/auth/authController');
const { authenticate } = require('../../middleware/auth');
const { authLimiter }  = require('../../middleware/rateLimiter');
const { loginRules, registerRules, forgotPasswordRules, resetPasswordRules, changePasswordRules, runValidation } = require('../../validators/authValidators');

router.post('/register',          registerRules,       runValidation, ctrl.register);
router.post('/login',  authLimiter, loginRules,        runValidation, ctrl.login);
router.post('/forgot-password',   forgotPasswordRules, runValidation, ctrl.forgotPassword);
router.post('/reset-password',    resetPasswordRules,  runValidation, ctrl.resetPassword);
router.get ('/verify-email',                                          ctrl.verifyEmail);
router.post('/refresh-token',                                         ctrl.refreshToken);

router.use(authenticate);
router.post  ('/logout',              ctrl.logout);
router.patch ('/change-password',     changePasswordRules, runValidation, ctrl.changePassword);
router.post  ('/resend-verification', ctrl.resendVerification);
router.get   ('/me',                  ctrl.getMe);
router.patch ('/update-me',           ctrl.updateMe);

module.exports = router;
