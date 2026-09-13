'use strict';
function escapeRegex(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

async function paginate(Model, filter, queryParams={}, searchFields=[], populate='', selectFields='') {
  const page  = Math.max(parseInt(queryParams.page  ||'1', 10), 1);
  const limit = Math.min(parseInt(queryParams.limit ||'20',10), 100);
  const skip  = (page - 1) * limit;

  if (queryParams.search && searchFields.length > 0) {
    const regex = new RegExp(escapeRegex(queryParams.search), 'i');
    filter.$or  = searchFields.map(f => ({ [f]: regex }));
  }

  const RESERVED = ['page','limit','sort','order','search'];
  Object.keys(queryParams).forEach(k => {
    if (!RESERVED.includes(k) && queryParams[k] !== undefined) filter[k] = queryParams[k];
  });

  const sortField = queryParams.sort  || 'createdAt';
  const sortOrder = queryParams.order === 'asc' ? 1 : -1;

  const [docs, total] = await Promise.all([
    Model.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).populate(populate).select(selectFields),
    Model.countDocuments(filter),
  ]);
  const pages = Math.ceil(total / limit);
  return { docs, meta: { page, limit, total, pages, hasNext: page < pages, hasPrev: page > 1 } };
}

module.exports = { paginate };
