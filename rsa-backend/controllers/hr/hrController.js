'use strict';
const User     = require('../../models/User');
const Teacher  = require('../../models/Teacher');
const Staff    = require('../../models/Staff');
const Student  = require('../../models/Student');
const { sendSuccess }                = require('../../utils/apiResponse');
const { paginate }                   = require('../../services/queryService');
const catchAsync                     = require('../../utils/catchAsync');
const AppError                       = require('../../utils/AppError');
const { sendWelcomeWithCredentials } = require('../../utils/emailUtils');
const { generateStaffPassword, generateEmployeeId } = require('../../utils/passwordUtils');

/* ── TEACHERS ── */
const listTeachers = catchAsync(async (req, res) => {
  const filter = { isDeleted: false };
  if (req.query.campus) filter.campus = req.query.campus;
  if (req.query.status) filter.status = req.query.status;

  const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  const skip  = (page - 1) * limit;

  // Search by employeeId or designation
  if (req.query.search) {
    const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'i');
    filter.$or = [{ employeeId: rx }, { designation: rx }];
  }

  const [teachers, total] = await Promise.all([
    Teacher.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .populate('user', 'firstName lastName email phone'),
    Teacher.countDocuments(filter),
  ]);

  const pages = Math.ceil(total / limit);
  sendSuccess(res, {
    data: { teachers },
    meta: { page, limit, total, pages, hasNext: page < pages, hasPrev: page > 1 },
  });
});

const getTeacher = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate('user','-password');
  if (!teacher || teacher.isDeleted) throw new AppError('Teacher not found.', 404);
  sendSuccess(res, { data: { teacher } });
});

const createTeacher = catchAsync(async (req, res) => {
  const { firstName, lastName, email, phone, employeeId, campus,
    designation, department, subjects, grades, joiningDate,
    employmentType, password: manualPass } = req.body;

  if (!email) throw new AppError('Email is required.', 400);
  if (await User.findOne({ email: email.toLowerCase() }))
    throw new AppError('Email already in use.', 409);

  const empId    = employeeId || await generateEmployeeId(Teacher, 'TEA');
  const password = manualPass || generateStaffPassword(empId);

  const user = await User.create({
    firstName, lastName,
    email:      email.toLowerCase(),
    phone:      phone || '',
    password,
    role:       'teacher',
    isEmailVerified: true,
  });

  const subjectsArr = Array.isArray(subjects) ? subjects
    : (subjects ? subjects.split(',').map(s=>s.trim()).filter(Boolean) : []);
  const gradesArr   = Array.isArray(grades)   ? grades
    : (grades   ? grades.split(',').map(g=>g.trim()).filter(Boolean)   : []);

  const teacher = await Teacher.create({
    user:           user._id,
    employeeId:     empId,
    campus:         campus || 'hcpur',
    designation:    designation || 'Teacher',
    department:     department || '',
    subjects:       subjectsArr,
    grades:         gradesArr,
    joiningDate:    joiningDate ? new Date(joiningDate) : new Date(),
    employmentType: employmentType || 'permanent',
    status:         'active',
  });

  user.profile = teacher._id; user.profileModel = 'Teacher';
  await user.save({ validateBeforeSave: false });

  sendWelcomeWithCredentials(user, password, 'teacher', { employeeId: empId, campus }).catch(()=>{});
  await req.audit('TEACHER_CREATED','Teacher',teacher._id,null,{ empId, email });

  const populated = await Teacher.findById(teacher._id)
    .populate('user','firstName lastName email phone');
  sendSuccess(res, {
    statusCode: 201,
    message: `Teacher created. Email: ${email} | Password: ${password}`,
    data: { teacher: populated, password, employeeId: empId },
  });
});

const updateTeacher = catchAsync(async (req, res) => {
  const ALLOWED = ['campus','designation','department','subjects','grades','employmentType','status'];
  const updates = {};
  ALLOWED.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const before  = await Teacher.findById(req.params.id).lean();
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, updates, { new:true })
    .populate('user','firstName lastName email');
  if (!teacher) throw new AppError('Teacher not found.', 404);
  await req.audit('TEACHER_UPDATED','Teacher',teacher._id,before,updates);
  sendSuccess(res, { message:'Teacher updated.', data:{ teacher } });
});

const deleteTeacher = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) throw new AppError('Teacher not found.', 404);
  teacher.isDeleted = true; teacher.status = 'terminated';
  await teacher.save();
  await User.findByIdAndUpdate(teacher.user, { isActive:false, isDeleted:true });
  await req.audit('TEACHER_DELETED','Teacher',teacher._id);
  sendSuccess(res, { message:'Teacher removed.' });
});

/* ── STAFF ── */
const listStaff = catchAsync(async (req, res) => {
  const filter = { isDeleted: false };
  if (req.query.role)   filter.role   = req.query.role;
  if (req.query.campus) filter.campus = req.query.campus;

  const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
  const skip  = (page - 1) * limit;

  const [staff, total] = await Promise.all([
    Staff.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .populate('user', 'firstName lastName email phone'),
    Staff.countDocuments(filter),
  ]);

  const pages = Math.ceil(total / limit);
  sendSuccess(res, {
    data: { staff },
    meta: { page, limit, total, pages },
  });
});

const getStaffMember = catchAsync(async (req, res) => {
  const member = await Staff.findById(req.params.id).populate('user','-password');
  if (!member || member.isDeleted) throw new AppError('Staff not found.', 404);
  sendSuccess(res, { data: { staff: member } });
});

const createStaff = catchAsync(async (req, res) => {
  const { firstName, lastName, email, phone, role, employeeId,
    campus, designation, department, joiningDate,
    employmentType, password: manualPass } = req.body;

  if (!['hr','manager'].includes(role))
    throw new AppError('HR can only create hr or manager accounts.', 403);
  if (!email) throw new AppError('Email is required.', 400);
  if (await User.findOne({ email: email.toLowerCase() }))
    throw new AppError('Email already in use.', 409);

  const empId    = employeeId || await generateEmployeeId(Staff, role.toUpperCase().slice(0,3));
  const password = manualPass || generateStaffPassword(empId);

  const user = await User.create({
    firstName, lastName,
    email:      email.toLowerCase(),
    phone:      phone || '',
    password,
    role,
    isEmailVerified: true,
  });

  const staff = await Staff.create({
    user:           user._id,
    role,
    employeeId:     empId,
    campus:         campus || 'both',
    designation:    designation || role,
    department:     department || '',
    joiningDate:    joiningDate ? new Date(joiningDate) : new Date(),
    employmentType: employmentType || 'permanent',
    status:         'active',
  });

  user.profile = staff._id; user.profileModel = 'Staff';
  await user.save({ validateBeforeSave: false });

  sendWelcomeWithCredentials(user, password, role, { employeeId: empId, campus }).catch(()=>{});
  await req.audit('STAFF_CREATED','Staff',staff._id,null,{ role, email, empId });

  const populated = await Staff.findById(staff._id)
    .populate('user','firstName lastName email phone');
  sendSuccess(res, {
    statusCode: 201,
    message: `Staff created. Email: ${email} | Password: ${password}`,
    data: { staff: populated, password, employeeId: empId },
  });
});

const updateStaff = catchAsync(async (req, res) => {
  const ALLOWED = ['campus','designation','department','employmentType','status'];
  const updates = {};
  ALLOWED.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const before = await Staff.findById(req.params.id).lean();
  const staff  = await Staff.findByIdAndUpdate(req.params.id, updates, { new:true })
    .populate('user','firstName lastName email');
  if (!staff) throw new AppError('Staff not found.', 404);
  await req.audit('STAFF_UPDATED','Staff',staff._id,before,updates);
  sendSuccess(res, { message:'Staff updated.', data:{ staff } });
});

const deleteStaff = catchAsync(async (req, res) => {
  const staff = await Staff.findById(req.params.id);
  if (!staff) throw new AppError('Staff not found.', 404);
  staff.isDeleted = true; staff.status = 'terminated';
  await staff.save();
  await User.findByIdAndUpdate(staff.user, { isActive:false, isDeleted:true });
  await req.audit('STAFF_DELETED','Staff',staff._id);
  sendSuccess(res, { message:'Staff removed.' });
});

/* ── STUDENTS (read-only) ── */
const listStudents = catchAsync(async (req, res) => {
  const filter = { isDeleted: false };
  if (req.query.campus) filter.campus = req.query.campus;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.grade)  filter.grade  = req.query.grade;

  const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const skip  = (page - 1) * limit;

  const [students, total] = await Promise.all([
    Student.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .populate('user', 'firstName lastName email phone'),
    Student.countDocuments(filter),
  ]);

  const pages = Math.ceil(total / limit);
  sendSuccess(res, {
    data: { students },
    meta: { page, limit, total, pages },
  });
});

module.exports = {
  listTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher,
  listStaff, getStaffMember, createStaff, updateStaff, deleteStaff,
  listStudents,
};
