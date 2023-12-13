// require env vars
require('dotenv').config();

// handle the uncaught exceptions -- (synchronous errors)
process.on('uncaughtException', (err) => {
  // printing error info
  console.log('[ERROR] [UNCAUGHT_EXCEPTION]: ', err.name, err.message);
  console.error(err);

  // terminate the process
  console.log('💥 Terminate the process...');
  process.exit(1);
});

const app = require('./app');
const mongoose = require('mongoose');

const DB_URL = process.env.DB_URL.replace(
  '<DB_PASSWORD>',
  process.env.DB_PASSWORD,
);
mongoose.connect(DB_URL, {}).then((connection) => {
  console.log('📅 connected to DB');
});

// define the PORT
const PORT = process.env.PORT || 4000;

// listen and start the server
const server = app.listen(PORT, () => {
  console.log(`🚀🚀 App is working on prot ${PORT}`);
});

// handle unhandled rejections -- asynchronous errors
process.on('unhandledRejection', (err) => {
  // printing error info
  console.log('[ERROR] [UNHANDLED_REJECTION]: ', err.name, err.message);
  console.error(err);

  // close the server
  console.log('💥 Shutting down the server...');
  server.close((err) => {
    process.exit(1);
  });
});
