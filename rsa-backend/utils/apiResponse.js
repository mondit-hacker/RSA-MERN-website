'use strict';
function sendSuccess(res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
}
function sendError(res, { statusCode = 500, message = 'Server error', errors = null } = {}) {
  const body = { success: false, message };
  if (errors !== null) body.errors = errors;
  return res.status(statusCode).json(body);
}
function paginationMeta({ page, limit, total }) {
  const p = parseInt(page,10)||1, l = parseInt(limit,10)||20, pages = Math.ceil(total/l);
  return { page: p, limit: l, total, pages, hasNext: p < pages, hasPrev: p > 1 };
}
module.exports = { sendSuccess, sendError, paginationMeta };
