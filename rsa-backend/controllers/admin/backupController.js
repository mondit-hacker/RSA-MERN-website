'use strict';
const path        = require('path');
const fs          = require('fs');
const { runBackup, listBackups, BACKUP_DIR } = require('../../services/backupService');
const exportSvc   = require('../../services/exportService');
const { sendSuccess } = require('../../utils/apiResponse');
const catchAsync      = require('../../utils/catchAsync');
const AppError        = require('../../utils/AppError');

// POST /api/backup/run — trigger manual backup
const triggerBackup = catchAsync(async (req, res) => {
  const result = await runBackup();
  await req.audit('BACKUP_CREATED','Backup',null,null,{ filename: result.filename, records: result.totalRecords });
  sendSuccess(res, { message: 'Backup completed successfully.', data: { backup: result } });
});

// GET /api/backup/list — list all available backups
const getBackupList = catchAsync(async (req, res) => {
  const backups = listBackups();
  sendSuccess(res, { data: { backups, count: backups.length } });
});

// GET /api/backup/download/:filename — download a specific backup zip
const downloadBackup = catchAsync(async (req, res) => {
  const { filename } = req.params;
  // Security: only allow our own backup files
  if (!/^RSA-Backup-[\d\-T]+\.zip$/.test(filename))
    throw new AppError('Invalid backup filename.', 400);
  const filePath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filePath)) throw new AppError('Backup file not found.', 404);
  await req.audit('BACKUP_DOWNLOADED','Backup',null,null,{ filename });
  res.download(filePath, filename);
});

// DELETE /api/backup/:filename — delete a specific backup
const deleteBackup = catchAsync(async (req, res) => {
  const { filename } = req.params;
  if (!/^RSA-Backup-[\d\-T]+\.zip$/.test(filename))
    throw new AppError('Invalid backup filename.', 400);
  const filePath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filePath)) throw new AppError('Backup file not found.', 404);
  fs.unlinkSync(filePath);
  await req.audit('BACKUP_DELETED','Backup',null,null,{ filename });
  sendSuccess(res, { message: 'Backup deleted.' });
});

// GET /api/export/students — export students as XLSX
const exportStudents = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.campus)  filter.campus  = req.query.campus;
  if (req.query.grade)   filter.grade   = req.query.grade;
  if (req.query.status)  filter.status  = req.query.status;
  const buf = await exportSvc.exportStudents(filter);
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition','attachment; filename="RSA-Students.xlsx"');
  res.send(buf);
});

// GET /api/export/teachers
const exportTeachers = catchAsync(async (req, res) => {
  const buf = await exportSvc.exportTeachers(req.query.campus ? { campus: req.query.campus } : {});
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition','attachment; filename="RSA-Teachers.xlsx"');
  res.send(buf);
});

// GET /api/export/results
const exportResults = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.grade)        filter.grade        = req.query.grade;
  if (req.query.academicYear) filter.academicYear = req.query.academicYear;
  const buf = await exportSvc.exportResults(filter);
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition','attachment; filename="RSA-Results.xlsx"');
  res.send(buf);
});

// GET /api/export/attendance
const exportAttendance = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.grade)  filter.grade  = req.query.grade;
  if (req.query.campus) filter.campus = req.query.campus;
  if (req.query.from && req.query.to) {
    filter.date = { $gte: new Date(req.query.from), $lte: new Date(req.query.to) };
  }
  const buf = await exportSvc.exportAttendance(filter);
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition','attachment; filename="RSA-Attendance.xlsx"');
  res.send(buf);
});

// GET /api/export/enquiries
const exportEnquiries = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const buf = await exportSvc.exportEnquiries(filter);
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition','attachment; filename="RSA-Enquiries.xlsx"');
  res.send(buf);
});

// GET /api/export/all — full school data in one Excel workbook
const exportAll = catchAsync(async (req, res) => {
  const buf = await exportSvc.exportAll();
  const ts  = new Date().toISOString().slice(0,10);
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition',`attachment; filename="RSA-Complete-Export-${ts}.xlsx"`);
  await req.audit('DATA_EXPORTED','All',null,null,{ requestedBy: req.user.email });
  res.send(buf);
});

module.exports = { triggerBackup, getBackupList, downloadBackup, deleteBackup, exportStudents, exportTeachers, exportResults, exportAttendance, exportEnquiries, exportAll };
