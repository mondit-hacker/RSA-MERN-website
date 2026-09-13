'use strict';
const XLSX      = require('xlsx');
const fs        = require('fs');
const path      = require('path');
const Student   = require('../models/Student');
const Teacher   = require('../models/Teacher');
const Result    = require('../models/Result');
const Attendance= require('../models/Attendance');
const Enquiry   = require('../models/Enquiry');
const User      = require('../models/User');

/**
 * Build an XLSX workbook Buffer from query results
 */
function buildXLSX(sheets) {
  const wb = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) {
    const ws = XLSX.utils.json_to_sheet(rows);
    // Auto column widths
    const cols = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length + 2, 14) }));
    ws['!cols'] = cols;
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0,31));
  }
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

/** Export all students */
async function exportStudents(filter = {}) {
  const students = await Student.find({ ...filter, isDeleted: false })
    .populate('user', 'firstName lastName email phone isActive')
    .sort({ admissionNo: 1 });

  const rows = students.map(s => ({
    'Admission No':   s.admissionNo,
    'First Name':     s.user?.firstName || '',
    'Last Name':      s.user?.lastName  || '',
    'Email':          s.user?.email     || '',
    'Phone':          s.user?.phone     || '',
    'Programme':      s.programme,
    'Grade':          s.grade,
    'Section':        s.section   || '',
    'Campus':         s.campus,
    'Academic Year':  s.academicYear,
    'Status':         s.status,
    'Blood Group':    s.bloodGroup  || '',
    'Gender':         s.gender      || '',
    'Father Name':    s.father?.name  || '',
    'Father Phone':   s.father?.phone || '',
    'Father Email':   s.father?.email || '',
    'Mother Name':    s.mother?.name  || '',
    'Mother Phone':   s.mother?.phone || '',
    'Address':        `${s.address?.street||''} ${s.address?.city||''} ${s.address?.pincode||''}`.trim(),
    'Admission Date': s.admissionDate ? new Date(s.admissionDate).toLocaleDateString('en-IN') : '',
    'Account Active': s.user?.isActive ? 'Yes' : 'No',
  }));

  return buildXLSX({ Students: rows });
}

/** Export all teachers */
async function exportTeachers(filter = {}) {
  const teachers = await Teacher.find({ ...filter, isDeleted: false })
    .populate('user', 'firstName lastName email phone isActive');

  const rows = teachers.map(t => ({
    'Employee ID':   t.employeeId,
    'First Name':    t.user?.firstName || '',
    'Last Name':     t.user?.lastName  || '',
    'Email':         t.user?.email     || '',
    'Phone':         t.user?.phone     || '',
    'Designation':   t.designation  || '',
    'Department':    t.department   || '',
    'Subjects':      (t.subjects||[]).join(', '),
    'Grades':        (t.grades||[]).join(', '),
    'Campus':        t.campus,
    'Employment Type': t.employmentType || '',
    'Experience (Years)': t.experience?.total || 0,
    'Joining Date':  t.joiningDate ? new Date(t.joiningDate).toLocaleDateString('en-IN') : '',
    'Status':        t.status,
    'Account Active': t.user?.isActive ? 'Yes' : 'No',
  }));

  return buildXLSX({ Teachers: rows });
}

/** Export results */
async function exportResults(filter = {}) {
  const results = await Result.find(filter)
    .populate({ path:'student', populate:{ path:'user', select:'firstName lastName' } })
    .sort({ createdAt: -1 });

  const rows = results.map(r => {
    const base = {
      'Admission No':    r.student?.admissionNo || '',
      'Student Name':    `${r.student?.user?.firstName||''} ${r.student?.user?.lastName||''}`.trim(),
      'Exam Name':       r.examName,
      'Exam Type':       r.examType,
      'Grade':           r.grade,
      'Section':         r.section || '',
      'Academic Year':   r.academicYear,
      'Total Max':       r.totalMax,
      'Total Obtained':  r.totalObtained,
      'Percentage':      `${r.percentage}%`,
      'Result':          r.result,
    };
    // Add per-subject columns
    (r.subjects||[]).forEach(s => {
      base[`${s.name} (Max)`]    = s.maxMarks;
      base[`${s.name} (Marks)`]  = s.obtained;
    });
    return base;
  });

  return buildXLSX({ Results: rows });
}

/** Export attendance for a date range */
async function exportAttendance(filter = {}) {
  const records = await Attendance.find(filter)
    .populate({ path:'student', populate:{ path:'user', select:'firstName lastName' } })
    .sort({ date: -1 });

  const rows = records.map(a => ({
    'Date':          new Date(a.date).toLocaleDateString('en-IN'),
    'Admission No':  a.student?.admissionNo || '',
    'Student Name':  `${a.student?.user?.firstName||''} ${a.student?.user?.lastName||''}`.trim(),
    'Grade':         a.grade,
    'Section':       a.section || '',
    'Campus':        a.campus,
    'Status':        a.status,
    'Remarks':       a.remarks || '',
  }));

  return buildXLSX({ Attendance: rows });
}

/** Export enquiries */
async function exportEnquiries(filter = {}) {
  const enquiries = await Enquiry.find({ ...filter, isSpam: false }).sort({ createdAt: -1 });
  const rows = enquiries.map(e => ({
    'Name':           e.name,
    'Phone':          e.phone,
    'Email':          e.email || '',
    'Class Interest': e.classInterest || '',
    'Campus':         e.campus || '',
    'Status':         e.status,
    'Notes Count':    (e.notes||[]).length,
    'Date':           new Date(e.createdAt).toLocaleDateString('en-IN'),
  }));
  return buildXLSX({ Enquiries: rows });
}

/** Full school data export — all sheets in one workbook */
async function exportAll() {
  const [students, teachers, results, attendance, enquiries] = await Promise.all([
    Student.find({ isDeleted:false }).populate('user','firstName lastName email phone'),
    Teacher.find({ isDeleted:false }).populate('user','firstName lastName email phone'),
    Result.find().populate({ path:'student', populate:{ path:'user', select:'firstName lastName' } }),
    Attendance.find().populate({ path:'student', populate:{ path:'user', select:'firstName lastName' } }),
    Enquiry.find({ isSpam:false }),
  ]);

  const sheets = {
    'Students':   students.map(s => ({ 'Admission No':s.admissionNo,'Name':`${s.user?.firstName} ${s.user?.lastName}`,'Email':s.user?.email||'','Programme':s.programme,'Grade':s.grade,'Campus':s.campus,'Status':s.status })),
    'Teachers':   teachers.map(t => ({ 'Employee ID':t.employeeId,'Name':`${t.user?.firstName} ${t.user?.lastName}`,'Email':t.user?.email||'','Designation':t.designation,'Campus':t.campus,'Status':t.status })),
    'Results':    results.map(r => ({ 'Admission No':r.student?.admissionNo||'','Exam':r.examName,'Grade':r.grade,'Total':r.totalObtained,'Max':r.totalMax,'Percentage':`${r.percentage}%`,'Result':r.result })),
    'Attendance': attendance.map(a => ({ 'Date':new Date(a.date).toLocaleDateString('en-IN'),'Admission No':a.student?.admissionNo||'','Grade':a.grade,'Status':a.status })),
    'Enquiries':  enquiries.map(e => ({ 'Name':e.name,'Phone':e.phone,'Class':e.classInterest||'','Campus':e.campus||'','Status':e.status,'Date':new Date(e.createdAt).toLocaleDateString('en-IN') })),
  };

  return buildXLSX(sheets);
}

module.exports = { exportStudents, exportTeachers, exportResults, exportAttendance, exportEnquiries, exportAll };
