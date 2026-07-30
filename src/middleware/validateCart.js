const { createHttpError } = require('./httpError');

function validateCartItem(req, _res, next) {
  const { productId, quantity } = req.body;

  if (typeof productId !== 'number' || !Number.isSafeInteger(productId) || productId <= 0) {
    return next(createHttpError(400, 'productId must be a positive integer'));
  }
  if (typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity <= 0) {
    return next(createHttpError(400, 'quantity must be a positive integer'));
  }

  next();
}

function validateUpdateCartItem(req, _res, next) {
  const { quantity } = req.body;
  const itemId = parseInt(req.params.id, 10);

  if (isNaN(itemId) || itemId <= 0) {
    return next(createHttpError(400, 'Invalid item ID'));
  }

  if (typeof quantity !== 'number' || quantity <= 0) {
    return next(createHttpError(400, 'quantity must be a positive number'));
  }

  next();
}

module.exports = {
  validateCartItem,
  validateUpdateCartItem,
};
