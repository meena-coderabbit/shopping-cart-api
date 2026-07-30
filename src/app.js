const express = require('express');
const morgan = require('morgan');
const healthRouter = require('./routes/health');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

const auth = require('./middleware/auth');
// ...
app.use(auth);
// ...
app.use('/health', healthRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
