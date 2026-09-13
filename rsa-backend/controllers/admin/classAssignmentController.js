'use strict';
const ClassAssignment = require('../../models/ClassAssignment');
const Teacher         = require('../../models/Teacher');
const Student         = require('../../models/Student');
const { sendSuccess } = require('../../utils/apiResponse');
const catchAsync      = require('../../utils/catchAsync');
const AppError        = require('../../utils/AppError');

const list = catchAsync(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.teacher)      filter.teacher      = req.query.teacher;
  if (req.query.grade)        filter.grade        = req.query.grade;
  if (req.query.campus)       filter.campus       = req.query.campus;
  if (req.query.academicYear) filter.academicYear = req.query.academicYear;
  if (req.query.active === 'false') filter.isActive = false;
  const assignments = await ClassAssignment.find(filter)
    .populate({ path:'teacher', populate:{ path:'user', select:'firstName lastName email' } })
    .populate('assignedBy','firstName lastName')
    .sort({ grade:1, section:1, subject:1 });
  sendSuccess(res, { data: { assignments, count: assignments.length } });
});

const assign = catchAsync(async (req, res) => {
  const { teacherId, grade, section, subject, campus, academicYear } = req.body;
  if (!teacherId || !grade || !subject || !campus)
    throw new AppError('teacherId, grade, subject, and campus are required.', 400);

  // Accept Teacher._id OR User._id (fix for the bug)
  let teacher = await Teacher.findById(teacherId).populate('user','firstName lastName email');
  if (!teacher) teacher = await Teacher.findOne({ user: teacherId }).populate('user','firstName lastName email');
  if (!teacher) throw new AppError('Teacher profile not found. The teacher must be created in HR Panel → Faculty first.', 404);
  if (teacher.isDeleted) throw new AppError('This teacher is deactivated.', 400);

  const year = academicYear || `${new Date().getFullYear()}-${String(new Date().getFullYear()+1).slice(2)}`;
  const exists = await ClassAssignment.findOne({ teacher:teacher._id, grade, section:section||'', subject, academicYear:year });

  if (exists) {
    if (exists.isActive) throw new AppError(`${teacher.user.firstName} already assigned to Grade ${grade}${section?' Sec '+section:''} — ${subject}.`, 409);
    exists.isActive = true; await exists.save();
    const p = await ClassAssignment.findById(exists._id).populate({ path:'teacher', populate:{ path:'user', select:'firstName lastName email' } });
    return sendSuccess(res, { message:'Assignment re-activated.', data:{ assignment:p } });
  }

  const assignment = await ClassAssignment.create({
    teacher:teacher._id, grade, section:section||'', subject, campus, academicYear:year, assignedBy:req.user._id,
  });

  const upd = {};
  if (!teacher.grades?.includes(grade))     upd['$addToSet'] = { ...(upd['$addToSet']||{}), grades:grade };
  if (!teacher.subjects?.includes(subject)) upd['$addToSet'] = { ...(upd['$addToSet']||{}), subjects:subject };
  if (Object.keys(upd).length) await Teacher.findByIdAndUpdate(teacher._id, upd);

  if (req.audit) await req.audit('ASSIGNMENT_CREATED','ClassAssignment',assignment._id,null,{ teacher:teacher._id, grade, subject, campus });

  const populated = await ClassAssignment.findById(assignment._id)
    .populate({ path:'teacher', populate:{ path:'user', select:'firstName lastName email' } });

  sendSuccess(res, {
    statusCode:201,
    message:`${teacher.user.firstName} ${teacher.user.lastName} assigned to Grade ${grade}${section?' Section '+section:''} — ${subject}`,
    data:{ assignment:populated }
  });
});

const remove = catchAsync(async (req, res) => {
  const assignment = await ClassAssignment.findByIdAndUpdate(req.params.id, { isActive:false }, { new:true });
  if (!assignment) throw new AppError('Assignment not found.', 404);
  if (req.audit) await req.audit('ASSIGNMENT_REMOVED','ClassAssignment',assignment._id);
  sendSuccess(res, { message:'Assignment removed.' });
});

const byClass = catchAsync(async (req, res) => {
  const filter = { isActive:true };
  if (req.query.grade)        filter.grade        = req.query.grade;
  if (req.query.campus)       filter.campus       = req.query.campus;
  if (req.query.academicYear) filter.academicYear = req.query.academicYear;
  const assignments = await ClassAssignment.find(filter)
    .populate({ path:'teacher', populate:{ path:'user', select:'firstName lastName' } })
    .sort({ grade:1, section:1, subject:1 });
  const grouped = {};
  assignments.forEach(a => {
    const key = `Grade ${a.grade}${a.section?' — Section '+a.section:''}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ _id:a._id, subject:a.subject, teacher:`${a.teacher?.user?.firstName||''} ${a.teacher?.user?.lastName||''}`.trim(), teacherId:a.teacher?._id, campus:a.campus, grade:a.grade, section:a.section });
  });
  sendSuccess(res, { data:{ grouped, assignments, count:assignments.length } });
});

const teacherStudents = catchAsync(async (req, res) => {
  let teacherId = req.params.teacherId;
  let teacher   = await Teacher.findById(teacherId);
  if (!teacher) { teacher = await Teacher.findOne({ user:teacherId }); if (teacher) teacherId = teacher._id; }
  const assignments = await ClassAssignment.find({ teacher:teacherId, isActive:true });
  if (!assignments.length) return sendSuccess(res, { data:{ students:[], assignments:[], totalStudents:0 } });
  const conditions = assignments.map(a => ({
    grade:a.grade, status:'active', isDeleted:false,
    ...(a.section ? { section:a.section } : {}),
    ...(a.campus !== 'both' ? { campus:a.campus } : {}),
  }));
  const students = await Student.find({ $or:conditions })
    .populate('user','firstName lastName email phone')
    .sort({ grade:1, section:1, admissionNo:1 });
  sendSuccess(res, { data:{ students, assignments, totalStudents:students.length } });
});

module.exports = { list, assign, remove, byClass, teacherStudents };
