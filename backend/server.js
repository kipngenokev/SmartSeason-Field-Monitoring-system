require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');
const { initDB } = require('./config/init.db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await testConnection();
  await initDB();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

start();
