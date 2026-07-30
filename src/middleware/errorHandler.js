const config = require('../config');

function resolveErrorStatus(err) {
  const candidate = err.status || err.statusCode;
  const status = Number(candidate);

  if (Number.isInteger(status) && status >= 400 && status <= 599) {
    return status;
  }

  return 500;
}

function resolveErrorMessage(err) {
  if (config.env === 'production') {
    return 'Internal Server Error';
  }

  return err.message || 'Internal Server Error';
}

function errorHandler(err, _req, res, _next) {
  const status = resolveErrorStatus(err);
  const message = resolveErrorMessage(err);

  if (config.env !== 'test') {
    console.error(err);
  }

  res.status(status).json({
    error: message,
  });
}

module.exports = errorHandler;
