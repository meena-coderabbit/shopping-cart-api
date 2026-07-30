const { Router } = require('express');
const couponController = require('../controllers/couponController');

const router = Router();

router.get('/validate/:code', couponController.validateCoupon);

module.exports = router;
