const { Router } = require('express');
const customerController = require('../controllers/customerController');

const router = Router();

router.post('/', customerController.register);
router.post('/login', customerController.login);
router.get('/:id', customerController.getCustomer);

module.exports = router;
