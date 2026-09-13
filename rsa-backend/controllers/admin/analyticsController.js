'use strict';
const Student    = require('../../models/Student');
const Teacher    = require('../../models/Teacher');
const User       = require('../../models/User');
const Attendance = require('../../models/Attendance');
const Enquiry    = require('../../models/Enquiry');
const Complaint  = require('../../models/Complaint');
const { sendSuccess } = require('../../utils/apiResponse');
const catchAsync      = require('../../utils/catchAsync');

// GET /api/admin/analytics/overview
const overview = catchAsync(async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisYear  = new Date(today.getFullYear(), 0, 1);

  const [
    totalStudents, activeStudents,
    totalTeachers, activeTeachers,
    totalUsers,
    newEnquiriesMonth,
    todayAttendance, todayAbsent,
    openComplaints,
  ] = await Promise.all([
    Student.countDocuments({ isDeleted: false }),
    Student.countDocuments({ isDeleted: false, status: 'active' }),
    Teacher.countDocuments({ isDeleted: false }),
    Teacher.countDocuments({ isDeleted: false, status: 'active' }),
    User.countDocuments({ isDeleted: false }),
    Enquiry.countDocuments({ createdAt: { $gte: thisMonth }, isSpam: false }),
    Attendance.countDocuments({ date: { $gte: today, $lte: todayEnd }, status: 'present' }),
    Attendance.countDocuments({ date: { $gte: today, $lte: todayEnd }, status: 'absent' }),
    Complaint.countDocuments({ status: 'open' }),
  ]);

  sendSuccess(res, { data: { overview: {
    totalStudents, activeStudents,
    totalTeachers, activeTeachers,
    totalUsers, newEnquiriesMonth,
    todayPresent: todayAttendance, todayAbsent,
    openComplaints,
  }}});
});

// GET /api/admin/analytics/admissions — monthly admissions chart
const admissionsTrend = catchAsync(async (req, res) => {
  const year = parseInt(req.query.year || new Date().getFullYear(), 10);
  const data = await Student.aggregate([
    { $match: { isDeleted: false, admissionDate: { $gte: new Date(year, 0, 1), $lt: new Date(year+1, 0, 1) } } },
    { $group: { _id: { month: { $month: '$admissionDate' } }, count: { $sum: 1 } } },
    { $sort: { '_id.month': 1 } },
  ]);
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthly = MONTHS.map((month, i) => ({
    month, count: data.find(d => d._id.month === i+1)?.count || 0,
  }));
  sendSuccess(res, { data: { year, monthly } });
});

// GET /api/admin/analytics/attendance — last 30 days attendance trend
const attendanceTrend = catchAsync(async (req, res) => {
  const since = new Date(); since.setDate(since.getDate() - 30);
  const data = await Attendance.aggregate([
    { $match: { date: { $gte: since } } },
    { $group: {
      _id:     { date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, status: '$status' },
      count:   { $sum: 1 },
    }},
    { $sort: { '_id.date': 1 } },
  ]);
  sendSuccess(res, { data: { attendance: data } });
});

// GET /api/admin/analytics/programmes — students by programme pie
const programmeBreakdown = catchAsync(async (req, res) => {
  const data = await Student.aggregate([
    { $match: { isDeleted: false, status: 'active' } },
    { $group: { _id: '$programme', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  sendSuccess(res, { data: { programmes: data } });
});

// GET /api/admin/analytics/campus — campus-wise breakdown
const campusBreakdown = catchAsync(async (req, res) => {
  const [students, teachers] = await Promise.all([
    Student.aggregate([{ $match:{ isDeleted:false,status:'active' } }, { $group:{ _id:'$campus', count:{ $sum:1 } } }]),
    Teacher.aggregate([{ $match:{ isDeleted:false,status:'active' } }, { $group:{ _id:'$campus', count:{ $sum:1 } } }]),
  ]);
  sendSuccess(res, { data: { students, teachers } });
});

// GET /api/admin/analytics/enquiry-funnel
const enquiryFunnel = catchAsync(async (req, res) => {
  const data = await Enquiry.aggregate([
    { $match: { isSpam: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  sendSuccess(res, { data: { funnel: data } });
});

// GET /api/admin/analytics/today-attendance
const todayAttendance = catchAsync(async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const end   = new Date(); end.setHours(23,59,59,999);
  const data  = await Attendance.aggregate([
    { $match: { date: { $gte: today, $lte: end } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const total = await Student.countDocuments({ isDeleted: false, status: 'active' });
  sendSuccess(res, { data: { attendance: data, totalStudents: total } });
});

module.exports = { overview, admissionsTrend, attendanceTrend, programmeBreakdown, campusBreakdown, enquiryFunnel, todayAttendance };
