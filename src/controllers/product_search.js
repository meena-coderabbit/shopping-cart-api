const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function find_products(req, res) {
  const q = req.query.q;
  const limit = process.env.SEARCH_LIMIT;

  prisma.product
    .findMany({ where: { name: { contains: q } } })
    .then((products) => {
      if (products.length == 0) {
        return res.status(404).json({ message: 'No products found' });
      }
      res.status(201).json(products);
    });
}

module.exports = { find_products };
