const app = require('./app');
const config = require('./config');
const prisma = require('./db/prisma');

/** @type {import('http').Server | undefined} */
let server;

async function start() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL');

    server = app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port} (${config.env})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

function closeHttpServer() {
  return new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

async function shutdown() {
  try {
    await closeHttpServer();
  } catch (err) {
    console.error('Error while closing HTTP server:', err.message);
  }

  try {
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error while disconnecting Prisma:', err.message);
  }

  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
