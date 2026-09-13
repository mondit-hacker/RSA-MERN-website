'use strict';
const { createLogger, format, transports } = require('winston');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const { combine, timestamp, json, colorize, printf, errors } = format;

const devFormat = combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => stack ? `${ts} [${level}]: ${message}\n${stack}` : `${ts} [${level}]: ${message}`)
);
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: prodFormat,
  transports: [
    new transports.File({ filename: path.join(LOGS_DIR, 'error.log'),    level: 'error', maxsize: 5242880, maxFiles: 10 }),
    new transports.File({ filename: path.join(LOGS_DIR, 'combined.log'),                 maxsize: 5242880, maxFiles: 10 }),
  ],
  exceptionHandlers: [new transports.File({ filename: path.join(LOGS_DIR, 'exceptions.log') })],
  rejectionHandlers: [new transports.File({ filename: path.join(LOGS_DIR, 'rejections.log') })],
});

const securityLogger = createLogger({ level: 'info', format: prodFormat, transports: [new transports.File({ filename: path.join(LOGS_DIR, 'security.log'), maxsize: 5242880, maxFiles: 20 })] });
const auditLogger    = createLogger({ level: 'info', format: prodFormat, transports: [new transports.File({ filename: path.join(LOGS_DIR, 'audit.log'),    maxsize: 5242880, maxFiles: 20 })] });

if (process.env.NODE_ENV !== 'production') logger.add(new transports.Console({ format: devFormat }));

logger.security = (message, meta = {}) => securityLogger.info(message, meta);
logger.audit    = (message, meta = {}) => auditLogger.info(message, meta);

module.exports = logger;
