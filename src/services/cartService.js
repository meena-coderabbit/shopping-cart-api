const prisma = require('../db/prisma');
const { createHttpError } = require('../middleware/httpError');

async function getOrCreateCart(userId, tx = prisma) {
  // For now, userId is always expected for cart operations.
  // A proper guest cart implementation would require a separate guestId field and strategy.
  const cart = await tx.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  return cart;
}

function serializeCartItem(item) {
  return {
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    unitPrice: Number(item.product.price),
    quantity: item.quantity,
    lineTotal: Number(item.product.price) * item.quantity,
  };
}

async function getCart(userId = null) {
  const cart = await getOrCreateCart(userId);

  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
  });

  const serializedItems = items.map(serializeCartItem);
  const subtotal = serializedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    items: serializedItems,
    subtotal,
    itemCount: serializedItems.length,
  };
}

async function addItemToCart(userId, productId, quantity) {
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          // Note: getOrCreateCart is now updated to accept a transaction client (tx)
          const cart = await getOrCreateCart(userId, tx);

          const product = await tx.product.findUnique({
            where: { id: productId },
          });

          if (!product) {
            throw createHttpError(404, 'Product not found');
          }

          if (product.stockQuantity < quantity) {
            throw createHttpError(
              409,
              `Not enough stock for ${product.name}. Available: ${product.stockQuantity}`,
            );
          }

          let cartItem = await tx.cartItem.findUnique({
            where: { cartId_productId: { cartId: cart.id, productId } },
          });

          if (cartItem) {
            const newQuantity = cartItem.quantity + quantity;
            if (product.stockQuantity < newQuantity) {
              throw createHttpError(
                409,
                `Adding ${quantity} to cart would exceed available stock for ${product.name}. Available: ${product.stockQuantity}`,
              );
            }
            cartItem = await tx.cartItem.update({
              where: { id: cartItem.id },
              data: { quantity: newQuantity },
              include: { product: true },
            });
          } else {
            cartItem = await tx.cartItem.create({
              data: { cartId: cart.id, productId, quantity },
              include: { product: true },
            });
          }
          return serializeCartItem(cartItem);
        },
        {
          isolationLevel: 'Serializable',
          maxWait: 5000, // default: 2000
          timeout: 10000, // default: 5000
        },
      );
    } catch (error) {
      // P2034: Transaction failed due to a write conflict or a deadlock. (SQLSTATE 40001 / 40P01)
      // P2025: An operation failed because it depends on one or more records that were required but not found. (Often indicates a concurrent delete or update)
      if (error.code === 'P2034' || error.code === 'P2025') {
        retries++;
        // eslint-disable-next-line no-console
        console.warn(
          `Transaction conflict for addItemToCart. Retrying... (Attempt ${retries}/${MAX_RETRIES})`,
        );
        await new Promise((resolve) => setTimeout(resolve, 50 * retries)); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw createHttpError(500, 'Failed to add item to cart due to persistent conflicts.');
}

async function updateCartItemQuantity(userId, itemId, quantity) {
  const cart = await getOrCreateCart(userId);

  let cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId, cartId: cart.id },
    include: { product: true },
  });

  if (!cartItem) {
    throw createHttpError(404, 'Cart item not found');
  }

  if (quantity === 0) {
    throw createHttpError(400, 'Quantity cannot be 0. Use DELETE to remove item.');
  }

  if (cartItem.product.stockQuantity < quantity) {
    throw createHttpError(
      409,
      `Requested quantity exceeds available stock for ${cartItem.product.name}. Available: ${cartItem.product.stockQuantity}`,
    );
  }

  cartItem = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { product: true },
  });

  return serializeCartItem(cartItem);
}

async function removeCartItem(userId, itemId) {
  const cart = await getOrCreateCart(userId);

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId, cartId: cart.id },
  });

  if (!cartItem) {
    throw createHttpError(404, 'Cart item not found');
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
}

async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}

module.exports = {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
