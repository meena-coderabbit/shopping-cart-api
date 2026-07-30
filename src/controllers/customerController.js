const customerService = require('../services/customerService');

async function register(req, res, next) {
  try {
    const customer = await customerService.registerCustomer(req.body);
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const customer = await customerService.authenticate(email, password);
    res.status(200).json({
      id: customer.id,
      email: customer.email,
      token: `session-${customer.id}`,
    });
  } catch (err) {
    next(err);
  }
}

async function getCustomer(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const customer = await customerService.getCustomerById(id);
    res.status(200).json(customer);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getCustomer,
};
