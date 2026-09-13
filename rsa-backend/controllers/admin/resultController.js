'use strict';
const Result  = require('../../models/Result');
const Student = require('../../models/Student');
const { sendSuccess } = require('../../utils/apiResponse');
const { paginate }    = require('../../services/queryService');
const catchAsync      = require('../../utils/catchAsync');
const AppError        = require('../../utils/AppError');

const EXAM_TYPES = ['class-test','1st-term','2nd-term','3rd-term','exam'];

const listResults = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.grade)        filter.grade        = req.query.grade;
  if (req.query.academicYear) filter.academicYear = req.query.academicYear;
  if (req.query.examName)     filter.examName     = req.query.examName;
  if (req.query.examType)     filter.examType     = req.query.examType;
  if (req.query.student)      filter.student      = req.query.student;
  const { docs, meta } = await paginate(Result, filter, req.query, ['examName'],
    'student', 'admissionNo grade section', 'user', 'firstName lastName');
  sendSuccess(res, { data: { results: docs }, meta });
});

const createResult = catchAsync(async (req, res) => {
  const { student, academicYear, examName, examType, grade, section, subjects } = req.body;
  if (!student)      throw new AppError('Student ID is required.', 400);
  if (!examName)     throw new AppError('Exam name is required.', 400);
  if (!subjects?.length) throw new AppError('At least one subject is required.', 400);
  if (examType && !EXAM_TYPES.includes(examType))
    throw new AppError(`examType must be one of: ${EXAM_TYPES.join(', ')}`, 400);

  const totalMax      = subjects.reduce((s,x) => s + (+x.maxMarks || 0), 0);
  const totalObtained = subjects.reduce((s,x) => s + (+x.obtained  || 0), 0);
  const percentage    = totalMax > 0 ? parseFloat((totalObtained / totalMax * 100).toFixed(1)) : 0;

  const result = await Result.create({
    student, academicYear, examName,
    examType: examType || 'class-test',
    grade, section,
    subjects: subjects.map(s => ({
      name:     s.name || s.subject,
      maxMarks: +s.maxMarks,
      obtained: +s.obtained,
      remarks:  s.remarks || '',
    })),
    totalMax, totalObtained, percentage,
    result:     percentage >= 33 ? 'pass' : 'fail',
    enteredBy:  req.user._id,
    publishedAt: new Date(),
  });

  await req.audit('RESULT_CREATED', 'Result', result._id, null, { student, examName });
  sendSuccess(res, { statusCode: 201, message: 'Result saved.', data: { result } });
});

const updateResult = catchAsync(async (req, res) => {
  const existing = await Result.findById(req.params.id);
  if (!existing) throw new AppError('Result not found.', 404);

  const { subjects, examName, examType, academicYear } = req.body;
  const updates = {};
  if (examName)     updates.examName     = examName;
  if (examType)     updates.examType     = examType;
  if (academicYear) updates.academicYear = academicYear;

  if (subjects?.length) {
    updates.subjects      = subjects.map(s => ({ name: s.name||s.subject, maxMarks: +s.maxMarks, obtained: +s.obtained, remarks: s.remarks||'' }));
    updates.totalMax      = updates.subjects.reduce((s,x) => s + x.maxMarks, 0);
    updates.totalObtained = updates.subjects.reduce((s,x) => s + x.obtained, 0);
    updates.percentage    = updates.totalMax > 0 ? parseFloat((updates.totalObtained / updates.totalMax * 100).toFixed(1)) : 0;
    updates.result        = updates.percentage >= 33 ? 'pass' : 'fail';
  }

  const before  = existing.toObject();
  const updated = await Result.findByIdAndUpdate(req.params.id, updates, { new: true });
  await req.audit('RESULT_UPDATED', 'Result', updated._id, before, updates);
  sendSuccess(res, { message: 'Result updated.', data: { result: updated } });
});

const deleteResult = catchAsync(async (req, res) => {
  const result = await Result.findById(req.params.id);
  if (!result) throw new AppError('Result not found.', 404);
  await Result.findByIdAndDelete(req.params.id);
  await req.audit('RESULT_DELETED', 'Result', req.params.id);
  sendSuccess(res, { message: 'Result deleted.' });
});

const studentResults = catchAsync(async (req, res) => {
  const results = await Result.find({ student: req.params.studentId }).sort({ createdAt: -1 });
  sendSuccess(res, { data: { results } });
});

// GET /api/results/students-list?grade=5&campus=hcpur — for admin dropdown
const studentsForResult = catchAsync(async (req, res) => {
  const filter = { isDeleted: false, status: 'active' };
  if (req.query.grade)  filter.grade  = req.query.grade;
  if (req.query.campus) filter.campus = req.query.campus;
  const students = await Student.find(filter)
    .populate('user', 'firstName lastName')
    .sort({ grade: 1, admissionNo: 1 })
    .select('admissionNo grade section campus user');
  sendSuccess(res, { data: { students } });
});

module.exports = { listResults, createResult, updateResult, deleteResult, studentResults, studentsForResult };
