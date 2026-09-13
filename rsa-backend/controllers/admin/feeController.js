'use strict';
const FeeRecord = require('../../models/FeeRecord');
const Student   = require('../../models/Student');
const { sendSuccess } = require('../../utils/apiResponse');
const { paginate }    = require('../../services/queryService');
const catchAsync      = require('../../utils/catchAsync');
const AppError        = require('../../utils/AppError');

// GET /api/admin/fees?status=pending&campus=hcpur
const listFees = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.academicYear) filter.academicYear = req.query.academicYear;
  const { docs, meta } = await paginate(FeeRecord, filter, req.query, ['receiptNo'], 'student', '');
  sendSuccess(res, { data: { fees: docs }, meta });
});

// POST /api/admin/fees — create fee record
const createFee = catchAsync(async (req, res) => {
  const { studentId, academicYear, month, amount, discount, dueDate, remarks } = req.body;
  const student = await Student.findById(studentId);
  if (!student) throw new AppError('Student not found.', 404);
  const balance = amount - (discount || 0);
  const fee = await FeeRecord.create({
    student: studentId, academicYear, month, amount,
    discount: discount || 0, balance,
    dueDate: dueDate ? new Date(dueDate) : null,
    remarks, status: 'pending',
  });
  await req.audit('FEE_CREATED', 'FeeRecord', fee._id, null, { studentId, month, amount });
  sendSuccess(res, { statusCode: 201, message: 'Fee record created.', data: { fee } });
});

// PATCH /api/admin/fees/:id/pay — collect payment
const collectPayment = catchAsync(async (req, res) => {
  const { paid, paymentMode, receiptNo } = req.body;
  const fee = await FeeRecord.findById(req.params.id);
  if (!fee) throw new AppError('Fee record not found.', 404);
  fee.paid        = (fee.paid || 0) + paid;
  fee.balance     = fee.amount - (fee.discount || 0) - fee.paid;
  fee.status      = fee.balance <= 0 ? 'paid' : fee.paid > 0 ? 'partial' : 'pending';
  fee.paidDate    = fee.status === 'paid' ? new Date() : fee.paidDate;
  fee.paymentMode = paymentMode || fee.paymentMode;
  fee.receiptNo   = receiptNo   || fee.receiptNo;
  fee.collectedBy = req.user._id;
  await fee.save();
  await req.audit('PAYMENT_COLLECTED', 'FeeRecord', fee._id, {}, { paid, status: fee.status });
  sendSuccess(res, { message: 'Payment recorded.', data: { fee } });
});

// GET /api/admin/fees/student/:studentId
const studentFees = catchAsync(async (req, res) => {
  const fees = await FeeRecord.find({ student: req.params.studentId }).sort({ createdAt: -1 });
  const totalPaid    = fees.filter(f=>f.status==='paid').reduce((s,f)=>s+f.paid,0);
  const totalPending = fees.filter(f=>f.status!=='paid').reduce((s,f)=>s+f.balance,0);
  sendSuccess(res, { data: { fees, summary: { totalPaid, totalPending } } });
});

module.exports = { listFees, createFee, collectPayment, studentFees };
