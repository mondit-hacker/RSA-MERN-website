'use strict';
/**
 * passwordUtils.js
 * Auto-generates secure passwords and admission numbers
 */

const UPPER  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';   // no I/O confusion
const LOWER  = 'abcdefghjkmnpqrstuvwxyz';     // no i/l/o confusion
const DIGITS = '23456789';                     // no 0/1 confusion
const SYMBOLS= '@#$!';

/**
 * Generate a secure random password
 * Rules: min 10 chars, 1 uppercase, 1 lowercase, 1 digit, 1 symbol
 */
function generatePassword(length = 10) {
  const rand = (str) => str[Math.floor(Math.random() * str.length)];
  // Guarantee one of each required char type
  const required = [rand(UPPER), rand(LOWER), rand(DIGITS), rand(SYMBOLS)];
  const pool = UPPER + LOWER + DIGITS + SYMBOLS;
  const rest  = Array.from({ length: length - 4 }, () => rand(pool));
  const all   = [...required, ...rest];
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.join('');
}

/**
 * Generate role-specific readable password
 * Students: RSA@2026001 style
 * Staff: formatted random
 */
function generateStudentPassword(admissionNo) {
  const suffix = generatePassword(4).replace(/[^A-Z0-9]/g, '').slice(0,4) || 'Aa1@';
  return `RSA@${admissionNo}${suffix}`;
}

function generateStaffPassword(employeeId) {
  return `Staff@${employeeId}${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Generate next admission number: RSA-YYYY-NNNN
 */
async function generateAdmissionNo(Student) {
  const year  = new Date().getFullYear();
  const prefix = `RSA-${year}-`;
  const last   = await Student.findOne({ admissionNo: { $regex: `^${prefix}` } }).sort({ admissionNo: -1 });
  if (!last) return `${prefix}0001`;
  const lastNum = parseInt(last.admissionNo.replace(prefix, ''), 10) || 0;
  return `${prefix}${String(lastNum + 1).padStart(4, '0')}`;
}

/**
 * Generate next employee ID: EMP-ROLE-NNNN
 */
async function generateEmployeeId(model, role) {
  const prefix = `${role.toUpperCase().slice(0,3)}-`;
  const last   = await model.findOne({ employeeId: { $regex: `^${prefix}` } }).sort({ employeeId: -1 });
  if (!last) return `${prefix}0001`;
  const lastNum = parseInt(last.employeeId.replace(prefix, ''), 10) || 0;
  return `${prefix}${String(lastNum + 1).padStart(4, '0')}`;
}

module.exports = {
  generatePassword,
  generateStudentPassword,
  generateStaffPassword,
  generateAdmissionNo,
  generateEmployeeId,
};
