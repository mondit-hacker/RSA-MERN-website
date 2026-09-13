'use strict';
require('dotenv').config();

const express       = require('express');
const helmet        = require('helmet');
const cors          = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean      = require('xss-clean');
const cookieParser  = require('cookie-parser');
const compression   = require('compression');
const morgan        = require('morgan');
const path          = require('path');

const connectDB      = require('./config/database');
const logger         = require('./utils/logger');
const errorHandler   = require('./middleware/errorHandler');
const auditMiddleware= require('./middleware/audit');
const { apiLimiter } = require('./middleware/rateLimiter');
const AppError       = require('./utils/AppError');

// ── Existing routes ──────────────────────────────────────────────
const authRoutes      = require('./routes/auth/authRoutes');
const studentRoutes   = require('./routes/student/studentRoutes');
const teacherRoutes   = require('./routes/teacher/teacherRoutes');
const hrRoutes        = require('./routes/hr/hrRoutes');
const managerRoutes   = require('./routes/manager/managerRoutes');
const adminRoutes     = require('./routes/admin/adminRoutes');
const developerRoutes = require('./routes/developer/developerRoutes');
const publicRoutes    = require('./routes/publicRoutes');

// ── New feature routes ───────────────────────────────────────────
const analyticsRoutes  = require('./routes/admin/analyticsRoutes');
const attendanceRoutes = require('./routes/admin/attendanceRoutes');
const complaintRoutes  = require('./routes/admin/complaintRoutes');
const resultRoutes     = require('./routes/admin/resultRoutes');
const logMgmtRoutes    = require('./routes/admin/logManagementRoutes');
const backupRoutes          = require('./routes/admin/backupRoutes');
const classAssignmentRoutes = require('./routes/admin/classAssignmentRoutes');
const credentialsRoutes     = require('./routes/admin/credentialsRoutes');

connectDB().then(() => {
  const { scheduleBackups } = require('./services/backupService');
  scheduleBackups();
});

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));

const ALLOWED = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED.includes(origin) || process.env.NODE_ENV === 'development') return cb(null, true);
    cb(new Error(`CORS: Origin '${origin}' not allowed.`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
}));
app.options('*', cors());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(mongoSanitize({ replaceWith: '_', onSanitize: ({ req, key }) => logger.security('MongoDB injection blocked', { ip: req.ip, key }) }));
app.use(xssClean());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: m => logger.info(m.trim()) }, skip: (req, res) => res.statusCode < 400 }));
}

app.use('/api', apiLimiter);
app.use(auditMiddleware);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '1d', etag: true }));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Mount routes ─────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/student',       studentRoutes);
app.use('/api/teacher',       teacherRoutes);
app.use('/api/hr',            hrRoutes);
app.use('/api/manager',       managerRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/developer',     developerRoutes);
app.use('/api',               publicRoutes);

// ── New feature APIs ─────────────────────────────────────────────
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/attendance',    attendanceRoutes);
app.use('/api/complaints',    complaintRoutes);
app.use('/api/results',       resultRoutes);
app.use('/api/logs',          logMgmtRoutes);
app.use('/api/assignments',   classAssignmentRoutes);
app.use('/api/credentials',   credentialsRoutes);
app.use('/api/backup',        backupRoutes);

app.all('*', (req, res, next) => next(new AppError(`Route '${req.originalUrl}' not found.`, 404)));
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000', 10);
const server = app.listen(PORT, () => logger.info(`Server running in ${process.env.NODE_ENV||'development'} mode on port ${PORT}`));

process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION: ${err.message}`, { stack: err.stack });
  server.close(() => process.exit(1));
});
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

module.exports = app;
