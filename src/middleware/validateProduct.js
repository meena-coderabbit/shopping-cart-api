function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isOptionalString(value) {
  return value === undefined || value === null || typeof value === 'string';
}

function isBlank(value) {
  return (
    value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
  );
}

// Product.price is stored as Decimal(10, 2): up to 8 integer digits and at
// most 2 fractional digits.
function parseNonNegativeNumber(value) {
  if (isBlank(value) || (typeof value !== 'number' && typeof value !== 'string')) {
    return null;
  }
  const strValue = typeof value === 'number' ? String(value) : value.trim();
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(strValue)) {
    return null;
  }
  const num = Number(strValue);
  if (!Number.isFinite(num)) {
    return null;
  }
  return num;
}

function parseNonNegativeInt(value) {
  if (isBlank(value) || (typeof value !== 'number' && typeof value !== 'string')) {
    return null;
  }
  const strValue = typeof value === 'number' ? String(value) : value.trim();
  if (!/^\d+$/.test(strValue)) {
    return null;
  }
  const num = Number(strValue);
  if (!Number.isInteger(num) || num < 0) {
    return null;
  }
  return num;
}

function validateCreateProduct(req, _res, next) {
  const { name, description, price, sku, imageUrl, stockQuantity } = req.body || {};
  const errors = [];

  if (!isNonEmptyString(name)) {
    errors.push('name is required and must be a non-empty string');
  }
  if (!isNonEmptyString(sku)) {
    errors.push('sku is required and must be a non-empty string');
  }
  if (!isOptionalString(description)) {
    errors.push('description must be a string');
  }
  if (!isOptionalString(imageUrl)) {
    errors.push('imageUrl must be a string');
  }

  const parsedPrice = parseNonNegativeNumber(price);
  if (parsedPrice === null) {
    errors.push('price is required and must be a number >= 0');
  }

  const parsedStock = stockQuantity === undefined ? 0 : parseNonNegativeInt(stockQuantity);
  if (parsedStock === null) {
    errors.push('stockQuantity must be an integer >= 0');
  }

  if (errors.length > 0) {
    const err = new Error(errors.join('; '));
    err.status = 400;
    next(err);
    return;
  }

  req.body = {
    name: name.trim(),
    sku: sku.trim(),
    description: description == null ? null : String(description),
    imageUrl: imageUrl == null || imageUrl === '' ? null : String(imageUrl),
    price: parsedPrice,
    stockQuantity: parsedStock,
  };

  next();
}

function validateUpdateProduct(req, _res, next) {
  const body = req.body || {};
  const errors = [];
  const updates = {};

  if (body.name !== undefined) {
    if (!isNonEmptyString(body.name)) {
      errors.push('name must be a non-empty string');
    } else {
      updates.name = body.name.trim();
    }
  }

  if (body.sku !== undefined) {
    if (!isNonEmptyString(body.sku)) {
      errors.push('sku must be a non-empty string');
    } else {
      updates.sku = body.sku.trim();
    }
  }

  if (body.description !== undefined) {
    if (!isOptionalString(body.description)) {
      errors.push('description must be a string');
    } else {
      updates.description = body.description == null ? null : String(body.description);
    }
  }

  if (body.imageUrl !== undefined) {
    if (!isOptionalString(body.imageUrl)) {
      errors.push('imageUrl must be a string');
    } else {
      updates.imageUrl =
        body.imageUrl == null || body.imageUrl === '' ? null : String(body.imageUrl);
    }
  }

  if (body.price !== undefined) {
    const parsedPrice = parseNonNegativeNumber(body.price);
    if (parsedPrice === null) {
      errors.push('price must be a number >= 0');
    } else {
      updates.price = parsedPrice;
    }
  }

  if (body.stockQuantity !== undefined) {
    const parsedStock = parseNonNegativeInt(body.stockQuantity);
    if (parsedStock === null) {
      errors.push('stockQuantity must be an integer >= 0');
    } else {
      updates.stockQuantity = parsedStock;
    }
  }

  if (Object.keys(updates).length === 0 && errors.length === 0) {
    errors.push('at least one field is required for update');
  }

  if (errors.length > 0) {
    const err = new Error(errors.join('; '));
    err.status = 400;
    next(err);
    return;
  }

  req.body = updates;
  next();
}

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
};
