'use strict';
const Attendance = require('../../models/Attendance');
const Student    = require('../../models/Student');
const { sendSuccess } = require('../../utils/apiResponse');
const { paginate }    = require('../../services/queryService');
const catchAsync      = require('../../utils/catchAsync');
const AppError        = require('../../utils/AppError');

// GET /api/admin/attendance?date=2026-08-01&grade=5&section=A&campus=hcpur
const listAttendance = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.date)    filter.date    = new Date(req.query.date);
  if (req.query.grade)   filter.grade   = req.query.grade;
  if (req.query.section) filter.section = req.query.section;
  if (req.query.campus)  filter.campus  = req.query.campus;
  if (req.query.status)  filter.status  = req.query.status;
  if (req.query.student) filter.student = req.query.student;
  const { docs, meta } = await paginate(Attendance, filter, req.query, [], 'student', '');
  sendSuccess(res, { data: { attendance: docs }, meta });
});

// POST /api/admin/attendance/bulk — mark attendance for a class
const markBulkAttendance = catchAsync(async (req, res) => {
  const { date, grade, section, campus, records } = req.body;
  if (!date || !grade || !campus || !records?.length)
    throw new AppError('date, grade, campus and records are required.', 400);

  const attendanceDate = new Date(date); attendanceDate.setHours(0,0,0,0);
  const ops = records.map(r => ({
    updateOne: {
      filter: { student: r.studentId, date: attendanceDate },
      update: {
        $set: {
          status: r.status, grade, section, campus,
          remarks: r.remarks || '',
          markedBy: req.user._id,
        },
      },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(ops);
  await req.audit('ATTENDANCE_MARKED', 'Attendance', null, null, { date, grade, section, campus, count: records.length });
  sendSuccess(res, { message: `Attendance marked for ${records.length} student(s).` });
});

// GET /api/admin/attendance/summary/:studentId
const studentAttendanceSummary = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const year = req.query.year || new Date().getFullYear();
  const since = new Date(`${year}-04-01`); // academic year starts April

  const [present, absent, late, halfDay] = await Promise.all([
    Attendance.countDocuments({ student: studentId, date: { $gte: since }, status: 'present' }),
    Attendance.countDocuments({ student: studentId, date: { $gte: since }, status: 'absent' }),
    Attendance.countDocuments({ student: studentId, date: { $gte: since }, status: 'late' }),
    Attendance.countDocuments({ student: studentId, date: { $gte: since }, status: 'half-day' }),
  ]);
  const total = present + absent + late + halfDay;
  const percentage = total > 0 ? ((present + late * 0.5) / total * 100).toFixed(1) : 0;
  sendSuccess(res, { data: { summary: { present, absent, late, halfDay, total, percentage } } });
});

module.exports = { listAttendance, markBulkAttendance, studentAttendanceSummary };
