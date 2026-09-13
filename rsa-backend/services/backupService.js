'use strict';
const mongoose  = require('mongoose');
const archiver  = require('archiver');
const fs        = require('fs');
const path      = require('path');
const cron      = require('node-cron');
const logger    = require('../utils/logger');
const { sendBackupNotification } = require('../utils/emailUtils');

const BACKUP_DIR = path.join(__dirname, '../backups');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// Collections to back up
const COLLECTIONS = [
  'users','students','teachers','staff','sessions',
  'notifications','auditlogs','activitylogs','securitylogs',
  'enquiries','attendances','feerecords','results','complaints',
  'deletedlogs','uploadedfiles',
];

/**
 * Run a full database backup → JSON + ZIP
 */
async function runBackup() {
  const ts       = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `RSA-Backup-${ts}.zip`;
  const zipPath  = path.join(BACKUP_DIR, filename);
  const tmpDir   = path.join(BACKUP_DIR, `tmp-${ts}`);

  fs.mkdirSync(tmpDir, { recursive: true });
  let totalRecords = 0;

  logger.info(`Backup started: ${filename}`);

  // Export each collection to JSON
  for (const col of COLLECTIONS) {
    try {
      const db   = mongoose.connection.db;
      const docs = await db.collection(col).find({}).toArray();
      fs.writeFileSync(path.join(tmpDir, `${col}.json`), JSON.stringify(docs, null, 2));
      totalRecords += docs.length;
      logger.info(`Backup: ${col} → ${docs.length} records`);
    } catch (err) {
      logger.warn(`Backup: skipped ${col}: ${err.message}`);
    }
  }

  // Write backup metadata
  const meta = {
    school:      'Rise & Shine Academy',
    backupDate:  new Date().toISOString(),
    collections: COLLECTIONS.length,
    totalRecords,
    generatedBy: 'RSA Backup Service v9',
  };
  fs.writeFileSync(path.join(tmpDir, 'BACKUP_INFO.json'), JSON.stringify(meta, null, 2));

  // Zip everything
  await new Promise((resolve, reject) => {
    const output  = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(tmpDir, false);
    archive.finalize();
  });

  // Cleanup tmp
  fs.rmSync(tmpDir, { recursive: true, force: true });

  const stats    = fs.statSync(zipPath);
  const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

  logger.info(`Backup complete: ${filename} (${fileSizeMB} MB, ${totalRecords} records)`);

  // Keep only last 30 backups
  cleanOldBackups(30);

  return { filename, zipPath, totalRecords, fileSizeMB, timestamp: new Date().toISOString() };
}

function cleanOldBackups(keepCount = 30) {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.zip'))
      .map(f => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    files.slice(keepCount).forEach(f => {
      fs.unlinkSync(path.join(BACKUP_DIR, f.name));
      logger.info(`Backup: removed old file ${f.name}`);
    });
  } catch (err) {
    logger.warn(`Backup cleanup error: ${err.message}`);
  }
}

function listBackups() {
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.zip'))
    .map(f => {
      const stats = fs.statSync(path.join(BACKUP_DIR, f));
      return {
        filename: f,
        size:     `${(stats.size/1024/1024).toFixed(2)} MB`,
        created:  stats.mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.created) - new Date(a.created));
}

/**
 * Schedule automatic backups
 * Default: every day at 2:00 AM
 */
function scheduleBackups() {
  const schedule = process.env.BACKUP_CRON || '0 2 * * *'; // Daily 2 AM

  cron.schedule(schedule, async () => {
    logger.info('Scheduled backup starting…');
    try {
      const result = await runBackup();
      // Notify admin by email
      const adminEmail = process.env.BACKUP_NOTIFY_EMAIL || process.env.EMAIL_USER;
      if (adminEmail) {
        await sendBackupNotification(adminEmail, {
          timestamp:    result.timestamp,
          collections:  COLLECTIONS.length,
          totalRecords: result.totalRecords,
          fileSize:     `${result.fileSizeMB} MB`,
          filename:     result.filename,
        }).catch(() => {});
      }
    } catch (err) {
      logger.error(`Scheduled backup failed: ${err.message}`);
    }
  }, { timezone: 'Asia/Kolkata' });

  logger.info(`Backup scheduler active: "${schedule}" (IST)`);
}

module.exports = { runBackup, listBackups, scheduleBackups, BACKUP_DIR };
