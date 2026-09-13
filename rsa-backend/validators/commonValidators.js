'use strict';
const { body, query, param, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError('Validation failed.', 400, errors.array().map(e=>e.msg)));
  next();
}
const paginationRules = [
  query('page').optional().isInt({ min:1 }).withMessage('Page must be positive integer.').toInt(),
  query('limit').optional().isInt({ min:1, max:200 }).withMessage('Limit must be 1-200.').toInt(),
  query('sort').optional().isString().trim(),
  query('order').optional().isIn(['asc','desc']).withMessage("Order must be 'asc' or 'desc'."),
  query('search').optional().isString().trim().escape(),
];
const mongoIdParam = [param('id').isMongoId().withMessage('Invalid ID format.')];
const enquiryRules = [
  body('name').trim().notEmpty().isLength({ max:100 }).escape().withMessage('Name required (max 100).'),
  body('phone').trim().notEmpty().matches(/^[+]?[\d\s\-().]{7,15}$/).withMessage('Valid phone required.'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('classInterest').optional().isIn(['nursery','1-5','6-10','11-12','']),
  body('campus').optional().isIn(['hcpur','kashimpur','']),
  body('message').optional().trim().isLength({ max:1000 }).escape(),
];
module.exports = { runValidation, paginationRules, mongoIdParam, enquiryRules };
