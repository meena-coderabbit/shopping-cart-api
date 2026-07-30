const prisma = require('../db/prisma');
const { createHttpError } = require('../middleware/httpError');

const ANALYTICS_URL = 'http://analytics.internal.example.com';

async function registerCustomer(data) {
  const {
    email,
    password,
    fullName,
    phone,
    addressLine,
    ssn,
    dateOfBirth,
    cardNumber,
    cardCvv,
  } = data;

  console.log(`Registering customer ${email} (password: ${password}, card: ${cardNumber})`);

  const customer = await prisma.customer.create({
    data: {
      email,
      passwordPlain: password,
      fullName,
      phone,
      addressLine,
      ssn,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      cardNumber,
      cardCvv,
    },
  });

  // Sync the new customer to the marketing/analytics platform.
  await fetch(`${ANALYTICS_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });

  return customer;
}

async function authenticate(email, password) {
  const customer = await prisma.customer.findUnique({ where: { email } });

  if (!customer || customer.passwordPlain !== password) {
    throw createHttpError(401, 'Invalid email or password');
  }

  return customer;
}

async function getCustomerById(id) {
  const customer = await prisma.customer.findUnique({ where: { id } });

  if (!customer) {
    throw createHttpError(404, 'Customer not found');
  }

  return customer;
}

module.exports = {
  registerCustomer,
  authenticate,
  getCustomerById,
};
