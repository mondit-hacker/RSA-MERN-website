'use strict';
const User       = require('../../models/User');
const Student    = require('../../models/Student');
const Teacher    = require('../../models/Teacher');
const Staff      = require('../../models/Staff');
const { sendSuccess }  = require('../../utils/apiResponse');
const { paginate }     = require('../../services/queryService');
const catchAsync       = require('../../utils/catchAsync');
const AppError         = require('../../utils/AppError');
const { sendWelcomeWithCredentials } = require('../../utils/emailUtils');
const { generatePassword, generateStudentPassword, generateStaffPassword, generateAdmissionNo, generateEmployeeId } = require('../../utils/passwordUtils');

/* ── DASHBOARD ── */
const getDashboard = catchAsync(async (req, res) => {
  const [totalUsers, totalStudents, activeStudents, totalTeachers, activeTeachers, totalStaff, lockedAccounts, activeSessions] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    Student.countDocuments({ isDeleted: false }),
    Student.countDocuments({ isDeleted: false, status: 'active' }),
    Teacher.countDocuments({ isDeleted: false }),
    Teacher.countDocuments({ isDeleted: false, status: 'active' }),
    Staff.countDocuments({ isDeleted: false }),
    User.countDocuments({ isDeleted: false, isLocked: true }),
    require('../../models/Session').countDocuments({ expiresAt: { $gt: new Date() } }),
  ]);
  sendSuccess(res, { data: { dashboard: { totalUsers, totalStudents, activeStudents, totalTeachers, activeTeachers, totalStaff, lockedAccounts, activeSessions } } });
});

/* ── USERS ── */
const listUsers = catchAsync(async (req, res) => {
  const filter = { isDeleted: false };
  if (req.query.role) filter.role = req.query.role;
  const { docs, meta } = await paginate(User, filter, req.query, ['firstName','lastName','email'], '', '');
  sendSuccess(res, { data: { users: docs }, meta });
});

const createUser = catchAsync(async (req, res) => {
  const { firstName, lastName, email, role, employeeId, campus, designation, subjects, grades, password: manualPass } = req.body;
  if (await User.findOne({ email })) throw new AppError('Email already registered.', 409);

  // Auto-generate password if not provided
  const password = manualPass || generatePassword(12);

  const user = await User.create({ firstName, lastName, email, password, role: role || 'student', isEmailVerified: true });

  // Create role-specific profile
  let profile = null;
  if (role === 'teacher') {
    const empId = employeeId || await generateEmployeeId(Teacher, 'TEA');
    profile = await Teacher.create({ user: user._id, employeeId: empId, campus: campus||'hcpur', designation: designation||'Teacher', subjects: subjects||[], grades: grades||[], joiningDate: new Date(), status:'active' });
  } else if (['hr','manager','admin','developer'].includes(role)) {
    const empId = employeeId || await generateEmployeeId(Staff, role.toUpperCase().slice(0,3));
    profile = await Staff.create({ user: user._id, employeeId: empId, role, campus: campus||'both', designation: designation||role, status:'active' });
  }

  // Send welcome email with credentials
  sendWelcomeWithCredentials(user, password, role, { employeeId: profile?.employeeId, campus }).catch(() => {});

  await req.audit('USER_CREATED','User',user._id,null,{ email, role });
  sendSuccess(res, { statusCode:201, message: `${role} account created. Credentials emailed to ${email}.`, data: { user, password, profile } });
});

const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  sendSuccess(res, { data: { user } });
});

const updateUser = catchAsync(async (req, res) => {
  const allowed = ['firstName','lastName','phone','isActive','role'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found.', 404);
  await req.audit('USER_UPDATED','User',user._id,{},updates);
  sendSuccess(res, { message: 'User updated.', data: { user } });
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isDeleted: true, isActive: false }, { new: true });
  if (!user) throw new AppError('User not found.', 404);
  await req.audit('USER_DELETED','User',user._id);
  sendSuccess(res, { message: 'User removed.' });
});

const unlockUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  await user.resetLoginAttempts();
  await req.audit('USER_UNLOCKED','User',user._id);
  sendSuccess(res, { message: 'Account unlocked.' });
});

// PATCH /api/admin/users/:id/reset-password
const resetUserPassword = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) throw new AppError('User not found.', 404);
  const newPassword = req.body.password || generatePassword(12);
  user.password = newPassword;
  user.mustChangePassword = true;
  await user.save();
  // Email new credentials
  sendWelcomeWithCredentials(user, newPassword, user.role, {}).catch(() => {});
  await req.audit('PASSWORD_RESET','User',user._id,null,{ resetBy: req.user.email });
  sendSuccess(res, { message: `Password reset. New credentials emailed to ${user.email}.`, data: { password: newPassword } });
});

/* ── STUDENTS ── */
const listStudents = catchAsync(async (req, res) => {
  const filter = { isDeleted: false };
  if (req.query.campus)    filter.campus    = req.query.campus;
  if (req.query.grade)     filter.grade     = req.query.grade;
  if (req.query.programme) filter.programme = req.query.programme;
  if (req.query.status)    filter.status    = req.query.status;

  const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const skip  = (page - 1) * limit;

  if (req.query.search) {
    const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'i');
    filter.$or = [{ admissionNo: rx }];
  }

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
    meta: { page, limit, total, pages, hasNext: page < pages, hasPrev: page > 1 },
  });
});

const createStudent = catchAsync(async (req, res) => {
  const { firstName, lastName, email, phone, admissionNo: reqAdmNo, programme, grade, section, campus, academicYear, password: manualPass } = req.body;

  if (email && await User.findOne({ email })) throw new AppError('Email already registered.', 409);

  // Auto-generate admission number if not provided
  const admissionNo = reqAdmNo || await generateAdmissionNo(Student);

  // Auto-generate password if not provided
  const password = manualPass || generateStudentPassword(admissionNo);

  // Create user account
  const userEmail = email || `${admissionNo.toLowerCase()}@rsa.school`;
  const user = await User.create({
    firstName, lastName, email: userEmail, phone: phone||'',
    password, role: 'student', isEmailVerified: true,
  });

  // Create student profile
  const student = await Student.create({
    user: user._id, admissionNo, programme, grade, section, campus,
    academicYear: academicYear || `${new Date().getFullYear()}-${String(new Date().getFullYear()+1).slice(2)}`,
    admissionDate: new Date(), status: 'active',
  });

  // Send welcome email with credentials
  sendWelcomeWithCredentials(user, password, 'student', { admissionNo, grade, section, campus }).catch(() => {});

  await req.audit('STUDENT_ADMITTED','Student',student._id,null,{ admissionNo, programme, grade, campus });
  sendSuccess(res, { statusCode: 201, message: `Student admitted. Admission No: ${admissionNo}. Credentials emailed.`, data: { student, user: { email: userEmail }, password, admissionNo } });
});

const updateStudent = catchAsync(async (req, res) => {
  const allowed = ['grade','section','programme','campus','status','academicYear','address','father','mother','bloodGroup','gender'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const student = await Student.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate('user','firstName lastName email');
  if (!student) throw new AppError('Student not found.', 404);
  await req.audit('STUDENT_UPDATED','Student',student._id,{},updates);
  sendSuccess(res, { message: 'Student updated.', data: { student } });
});

const deleteStudent = catchAsync(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { isDeleted: true, status: 'inactive' }, { new: true });
  if (!student) throw new AppError('Student not found.', 404);
  if (student.user) await User.findByIdAndUpdate(student.user, { isDeleted: true, isActive: false });
  await req.audit('STUDENT_REMOVED','Student',student._id);
  sendSuccess(res, { message: 'Student removed.' });
});

/* ── AUDIT / SECURITY LOGS ── */
const getAuditLogs = catchAsync(async (req, res) => {
  const AuditLog = require('../../models/AuditLog');
  const filter   = {};
  if (req.query.entity) filter.entity = req.query.entity;
  if (req.query.action) filter.action = new RegExp(req.query.action, 'i');
  const { docs, meta } = await paginate(AuditLog, filter, req.query, [], 'actor', 'firstName lastName email role');
  sendSuccess(res, { data: { logs: docs }, meta });
});

const getSecurityLogs = catchAsync(async (req, res) => {
  const SecurityLog = require('../../models/SecurityLog');
  const filter = {};
  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.event)    filter.event    = new RegExp(req.query.event, 'i');
  const { docs, meta } = await paginate(SecurityLog, filter, req.query, ['email','ip'], '', '');
  sendSuccess(res, { data: { logs: docs }, meta });
});

module.exports = { getDashboard, listUsers, createUser, getUser, updateUser, deleteUser, unlockUser, resetUserPassword, listStudents, createStudent, updateStudent, deleteStudent, getAuditLogs, getSecurityLogs };
