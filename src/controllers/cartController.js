const cartService = require('../services/cartService');

async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.userId);
    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
}

async function addItemToCart(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const item = await cartService.addItemToCart(req.userId, productId, quantity);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function updateItemQuantity(req, res, next) {
  try {
    const itemId = Number(req.params.id); // Use Number() for robust parsing
    const { quantity } = req.body;
    const item = await cartService.updateCartItemQuantity(req.userId, itemId, quantity);
    res.status(200).json(item);
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const itemId = Number(req.params.id); // Use Number() for robust parsing
    await cartService.removeCartItem(req.userId, itemId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    await cartService.clearCart(req.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItem,
  clearCart,
};
