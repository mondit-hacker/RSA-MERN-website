'use strict';
const nodemailer = require('nodemailer');
const fs         = require('fs');
const path       = require('path');
const logger     = require('./logger');

// ── Credentials file log (always works, no email needed) ────────
const CREDS_LOG = path.join(__dirname, '../logs/credentials.log');
if (!fs.existsSync(path.dirname(CREDS_LOG))) {
  fs.mkdirSync(path.dirname(CREDS_LOG), { recursive: true });
}

function saveCredentialsToFile(data) {
  const line = [
    '='.repeat(60),
    `Created   : ${new Date().toLocaleString('en-IN')}`,
    `Name      : ${data.name}`,
    `Role      : ${data.role}`,
    `Email     : ${data.email}`,
    `Password  : ${data.password}`,
    ...(data.employeeId  ? [`Emp ID    : ${data.employeeId}`]  : []),
    ...(data.admissionNo ? [`Adm No    : ${data.admissionNo}`] : []),
    ...(data.campus      ? [`Campus    : ${data.campus}`]      : []),
    '='.repeat(60),
    '',
  ].join('\n');
  try { fs.appendFileSync(CREDS_LOG, line); } catch(e) { logger.warn('Could not write credentials.log: '+e.message); }
}

// ── Transporter ─────────────────────────────────────────────────
let transporter = null;
let emailReady  = false;

async function initTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const fake = !user || !pass || pass === 'your_app_password_here' || user.includes('XXXX');

  if (!fake) {
    transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
      port:   parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth:   { user, pass },
    });
    try {
      await transporter.verify();
      emailReady = true;
      logger.info(`✅ Email ready: ${user}`);
    } catch(e) {
      emailReady = false;
      logger.warn(`⚠️  Email not ready: ${e.message}. Passwords saved to logs/credentials.log`);
    }
  } else {
    // Ethereal fallback
    try {
      const test = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email', port: 587, secure: false,
        auth: { user: test.user, pass: test.pass },
      });
      emailReady = true;
      logger.info(`📧 Using Ethereal test email (preview at https://ethereal.email)`);
      logger.info(`   Ethereal login: ${test.user} / ${test.pass}`);
    } catch(e) {
      emailReady = false;
      logger.warn('No email configured. Passwords only saved to logs/credentials.log');
    }
  }
}
initTransporter().catch(() => {});

// ── Send email ───────────────────────────────────────────────────
async function sendEmail({ to, subject, html, text }) {
  if (!transporter || !emailReady) {
    logger.warn(`Email skipped (not ready): ${subject} → ${to}`);
    return null;
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Rise & Shine Academy" <riseandshine462@gmail.com>',
      to, subject, html, text,
    });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) logger.info(`📧 Email preview: ${preview}`);
    else         logger.info(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch(err) {
    logger.error(`Email send failed to ${to}: ${err.message}`);
    return null;
  }
}

// ── Templates ────────────────────────────────────────────────────
const NAVY = '#0B1F3A', GOLD = '#C9A84C';

const HEADER = `<div style="background:linear-gradient(135deg,${NAVY},#1A3A5C);padding:24px 28px;text-align:center;">
  <h1 style="color:${GOLD};margin:0;font-size:1.4rem;font-weight:800;">Rise &amp; Shine Academy</h1>
  <p style="color:rgba(255,255,255,.45);font-size:.78rem;margin:4px 0 0;">Excellence in Education · Malda, West Bengal</p>
</div>`;

const FOOTER_HTML = `<div style="background:${NAVY};padding:14px 28px;text-align:center;">
  <p style="color:rgba(255,255,255,.3);font-size:.72rem;margin:0;">
    © ${new Date().getFullYear()} Rise &amp; Shine Academy, Station Road, Harish Chandra Pur, Malda WB 732125<br/>
    📞 +91 90621 41212 &nbsp;·&nbsp; ✉️ riseandshine462@gmail.com
  </p>
</div>`;

const WRAP = (content) => `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1);">
  ${HEADER}<div style="padding:28px;background:#F8F9FA;">${content}</div>${FOOTER_HTML}
</div>`;

const INFO_BOX = (rows) => `<div style="background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:16px 20px;margin:16px 0;">
  ${rows.map(([l,v])=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #F1F5F9;">
    <span style="color:#64748B;font-size:.85rem;font-weight:600;">${l}</span>
    <span style="color:#1E293B;font-size:.85rem;font-weight:700;">${v}</span>
  </div>`).join('')}
</div>`;

const BTN = (url, text) => `<div style="text-align:center;margin:20px 0;">
  <a href="${url}" style="background:${GOLD};color:${NAVY};padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">${text}</a>
</div>`;

// ── sendWelcomeWithCredentials ────────────────────────────────────
async function sendWelcomeWithCredentials(user, password, role, extra = {}) {
  const roleLabel = { student:'Student', teacher:'Teacher', hr:'HR Staff', manager:'Manager', admin:'Administrator', developer:'Developer' }[role] || role;
  const panelUrl  = { student:'/workspace/hub', teacher:'/workspace/edu', hr:'/workspace/ppl', manager:'/workspace/ops', admin:'/workspace/ctl', developer:'/workspace/sys' }[role] || '/login';
  const loginUrl  = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

  // Always save to file first (never fails)
  saveCredentialsToFile({
    name:        `${user.firstName} ${user.lastName}`,
    role:        roleLabel,
    email:       user.email,
    password,
    employeeId:  extra.employeeId,
    admissionNo: extra.admissionNo,
    campus:      extra.campus,
  });

  const rows = [
    ['Full Name',   `${user.firstName} ${user.lastName}`],
    ['Login Email', user.email],
    ['Password',    password],
    ['Role',        roleLabel],
    ['Login Page',  loginUrl],
    ...(extra.employeeId  ? [['Employee ID',  extra.employeeId]]  : []),
    ...(extra.admissionNo ? [['Admission No', extra.admissionNo]] : []),
    ...(extra.campus      ? [['Campus', extra.campus === 'hcpur' ? 'Harish Chandra Pur' : extra.campus === 'kashimpur' ? 'Kashim Pur' : 'Both']] : []),
  ];

  await sendEmail({
    to:      user.email,
    subject: `Welcome to Rise & Shine Academy — Your ${roleLabel} Account`,
    html: WRAP(`
      <h2 style="color:${NAVY};margin-bottom:4px;">Welcome to Rise &amp; Shine Academy!</h2>
      <p style="color:${GOLD};font-weight:700;margin-bottom:12px;">${roleLabel} Account Created</p>
      <p>Dear <strong>${user.firstName} ${user.lastName}</strong>,</p>
      <p style="color:#64748B;">Your account has been created. Use these credentials to log in:</p>
      ${INFO_BOX(rows)}
      ${BTN(loginUrl, 'Login to Your Account')}
      <div style="background:#FEF9C3;border:1px solid #FDE68A;border-radius:8px;padding:12px;margin-top:14px;font-size:.83rem;color:#92400E;">
        ⚠️ <strong>Important:</strong> Please change your password after first login. Do not share these credentials.
      </div>
    `),
    text: `Welcome!\nEmail: ${user.email}\nPassword: ${password}\nLogin: ${loginUrl}`,
  });
}

async function sendPasswordResetEmail(user, token) {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email, subject: 'Reset your RSA password',
    html: WRAP(`<h2 style="color:${NAVY};">Reset Your Password</h2><p>Hello <strong>${user.firstName}</strong>,</p><p style="color:#64748B;">Click below to reset your password. This link expires in 30 minutes.</p>${BTN(url,'Reset Password')}`),
    text: `Reset your password: ${url}`,
  });
}

async function sendLockoutAlert(user) {
  await sendEmail({
    to: user.email, subject: '⚠️ RSA Account Locked',
    html: WRAP(`<h2 style="color:#EF4444;">Account Locked</h2><p>Hello <strong>${user.firstName}</strong>,</p><p style="color:#64748B;">Your account was locked after 5 failed login attempts. It will unlock in 30 minutes. Contact admin if you need help.</p>`),
    text: 'Your RSA account has been locked due to too many failed login attempts.',
  });
}

async function sendBackupNotification(adminEmail, info) {
  await sendEmail({
    to: adminEmail, subject: 'RSA Backup Completed ✅',
    html: WRAP(`<h2 style="color:${NAVY};">Backup Completed</h2>${INFO_BOX([['Time',info.timestamp],['Collections',String(info.collections)],['Records',String(info.totalRecords)],['File Size',info.fileSize],['Filename',info.filename]])}`),
    text: `Backup done at ${info.timestamp}`,
  });
}

module.exports = { sendEmail, sendWelcomeWithCredentials, sendPasswordResetEmail, sendLockoutAlert, sendAccountLockedEmail: sendLockoutAlert, sendBackupNotification };