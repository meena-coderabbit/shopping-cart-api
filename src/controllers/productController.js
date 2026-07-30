const productService = require('../services/productService');

function parseOptionalNonNegativeNumber(value) {
  if (value === undefined) {
    return undefined;
  }
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    const err = new Error('minPrice and maxPrice must be numbers >= 0');
    err.status = 400;
    throw err;
  }
  return num;
}

async function listProducts(req, res, next) {
  try {
    const { page, limit, search, minPrice, maxPrice } = req.query;
    const result = await productService.listProducts({
      page,
      limit,
      search: typeof search === 'string' ? search : undefined,
      minPrice: parseOptionalNonNegativeNumber(minPrice),
      maxPrice: parseOptionalNonNegativeNumber(maxPrice),
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
