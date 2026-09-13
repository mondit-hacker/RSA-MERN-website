'use strict';
const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError('Validation failed.', 400, errors.array().map(e=>e.msg)));
  next();
}
const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];
const registerRules = [
  body('firstName').trim().notEmpty().isLength({ max:50 }).withMessage('First name required (max 50).'),
  body('lastName').trim().notEmpty().isLength({ max:50 }).withMessage('Last name required (max 50).'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('password').isLength({ min:8, max:72 }).withMessage('Password must be 8-72 chars.')
    .matches(/[A-Z]/).withMessage('Must contain uppercase.')
    .matches(/[0-9]/).withMessage('Must contain a number.'),
  body('role').optional().isIn(['student','teacher','hr','manager','admin','developer']).withMessage('Invalid role.'),
];
const forgotPasswordRules = [body('email').isEmail().normalizeEmail().withMessage('Valid email required.')];
const resetPasswordRules  = [
  body('token').notEmpty().withMessage('Token required.'),
  body('password').isLength({ min:8, max:72 }).withMessage('Password must be 8-72 chars.').matches(/[A-Z]/).withMessage('Must contain uppercase.').matches(/[0-9]/).withMessage('Must contain a number.'),
  body('confirmPassword').custom((v, { req }) => { if (v !== req.body.password) throw new Error('Passwords do not match.'); return true; }),
];
const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password required.'),
  body('newPassword').isLength({ min:8, max:72 }).withMessage('New password must be 8-72 chars.').matches(/[A-Z]/).withMessage('Must contain uppercase.').matches(/[0-9]/).withMessage('Must contain a number.')
    .custom((v, { req }) => { if (v === req.body.currentPassword) throw new Error('New password must differ.'); return true; }),
];
module.exports = { loginRules, registerRules, forgotPasswordRules, resetPasswordRules, changePasswordRules, runValidation };
