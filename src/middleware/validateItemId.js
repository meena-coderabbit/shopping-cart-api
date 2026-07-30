const { createHttpError } = require('./httpError');

function validateItemId(req, _res, next) {
  const itemId = Number(req.params.id);

  if (typeof itemId !== 'number' || !Number.isSafeInteger(itemId) || itemId <= 0) {
    return next(createHttpError(400, 'Invalid item ID: must be a positive integer'));
  }
  req.params.id = itemId; // Coerce to number for consistency
  next();
}

module.exports = {
  validateItemId,
};
