const { createHttpError } = require('../middleware/httpError');

const COUPONS = {
  SAVE10: { code: 'SAVE10', discountPercent: 10 },
  SAVE20: { code: 'SAVE20', discountPercent: 20 },
};

function validateCoupon(code) {
  const coupon = COUPONS[code];
  if (!coupon) {
    throw createHttpError(404, 'Coupon not found');
  }
  return coupon;
}

module.exports = { validateCoupon };
