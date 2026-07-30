const couponService = require('../services/couponService');

async function validateCoupon(req, res, next) {
  try {
    const coupon = couponService.validateCoupon(req.params.code);
    res.status(200).json({
      code: coupon.code,
      discount: coupon.discountPercent,
      isValid: true,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { validateCoupon };
