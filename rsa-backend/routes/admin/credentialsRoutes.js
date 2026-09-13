'use strict';
const router  = require('express').Router();
const fs      = require('fs');
const path    = require('path');
const { authenticate, authorize } = require('../../middleware/auth');
const { sendSuccess }             = require('../../utils/apiResponse');
const catchAsync                  = require('../../utils/catchAsync');

const CREDS_LOG = path.join(__dirname, '../../logs/credentials.log');

const getCredentials = catchAsync(async (req, res) => {
  if (!fs.existsSync(CREDS_LOG))
    return sendSuccess(res, { data: { entries: [], raw: '' } });

  const raw    = fs.readFileSync(CREDS_LOG, 'utf8');
  const blocks = raw.split('='.repeat(60)).filter(b => b.trim());
  const entries = blocks.map(block => {
    const lines = block.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    const obj   = {};
    lines.forEach(l => {
      const colon = l.indexOf(':');
      if (colon === -1) return;
      const key = l.slice(0, colon).trim().toLowerCase().replace(/\s+/g, '_');
      const val = l.slice(colon + 1).trim();
      obj[key]  = val;
    });
    return obj;
  }).filter(e => e.email);

  sendSuccess(res, { data: { entries: entries.reverse(), count: entries.length } });
});

const clearCredentials = catchAsync(async (req, res) => {
  const header = `# Cleared on ${new Date().toLocaleString('en-IN')} by ${req.user.email}\n`;
  fs.writeFileSync(CREDS_LOG, header);
  sendSuccess(res, { message: 'Credentials log cleared.' });
});

router.use(authenticate, authorize('admin', 'developer'));
router.get('/',    getCredentials);
router.delete('/', clearCredentials);

module.exports = router;
