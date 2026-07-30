const express = require('express');

const router = express.Router();
const { find_products } = require('../controllers/product_search');

router.get('/findProducts', find_products);

module.exports = router;
