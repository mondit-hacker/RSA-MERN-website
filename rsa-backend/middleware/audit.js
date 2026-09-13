'use strict';
const AuditLog = require('../models/AuditLog');
const logger   = require('../utils/logger');

module.exports = function auditMiddleware(req, res, next) {
  req.audit = async function(action, entity, entityId, before=null, after=null, status='success', reason='') {
    try {
      await AuditLog.create({
        actor: req.user ? req.user._id : null, actorRole: req.user ? req.user.role : 'anonymous',
        action, entity, entityId, before, after, ip: req.ip, userAgent: req.get('user-agent'), status, reason,
      });
    } catch(e) { logger.error(`Audit log failed: ${e.message}`); }
  };
  next();
};
