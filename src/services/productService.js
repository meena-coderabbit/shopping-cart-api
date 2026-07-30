const prisma = require('../db/prisma');
const { createHttpError } = require('../middleware/httpError');

function serializeProduct(product) {
  return {
    ...product,
    price: Number(product.price),
  };
}

function parseId(id) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw createHttpError(400, 'Invalid product id');
  }
  return parsed;
}

async function listProducts({ page = 1, limit = 20, search, minPrice, maxPrice } = {}) {
  const parsedLimit = Number(limit);
  const parsedPage = Number(page);

  if (!Number.isInteger(parsedLimit) || !Number.isInteger(parsedPage)) {
    throw createHttpError(400, 'page and limit must be integers');
  }

  const take = Math.min(Math.max(parsedLimit, 1), 100);
  const currentPage = Math.max(parsedPage, 1);
  const skip = (currentPage - 1) * take;

  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { id: 'asc' },
    }),
  ]);

  return {
    data: products.map(serializeProduct),
    pagination: {
      page: currentPage,
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 0,
    },
  };
}

async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id: parseId(id) },
  });

  if (!product) {
    throw createHttpError(404, 'Product not found');
  }

  return serializeProduct(product);
}

async function createProduct(data) {
  try {
    const product = await prisma.product.create({ data });
    return serializeProduct(product);
  } catch (err) {
    if (err.code === 'P2002') {
      throw createHttpError(409, 'A product with this SKU already exists');
    }
    throw err;
  }
}

async function updateProduct(id, data) {
  try {
    const product = await prisma.product.update({
      where: { id: parseId(id) },
      data,
    });
    return serializeProduct(product);
  } catch (err) {
    if (err.code === 'P2025') {
      throw createHttpError(404, 'Product not found');
    }
    if (err.code === 'P2002') {
      throw createHttpError(409, 'A product with this SKU already exists');
    }
    throw err;
  }
}

async function deleteProduct(id) {
  try {
    await prisma.product.delete({
      where: { id: parseId(id) },
    });
  } catch (err) {
    if (err.code === 'P2025') {
      throw createHttpError(404, 'Product not found');
    }
    throw err;
  }
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
