const { Router } = require('express');
const cartController = require('../controllers/cartController');
const { validateCartItem, validateUpdateCartItem } = require('../middleware/validateCart');
const { validateItemId } = require('../middleware/validateItemId');

const router = Router();

router.get('/', cartController.getCart);
router.post('/items', validateCartItem, cartController.addItemToCart);
router.put('/items/:id', validateUpdateCartItem, cartController.updateItemQuantity);
router.delete('/items/:id', validateItemId, cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
