const { Router } = require('express');
const productController = require('../controllers/productController');
const { validateCreateProduct, validateUpdateProduct } = require('../middleware/validateProduct');

const router = Router();

router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);
router.post('/', validateCreateProduct, productController.createProduct);
router.put('/:id', validateUpdateProduct, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
