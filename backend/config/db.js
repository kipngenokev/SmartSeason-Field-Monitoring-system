const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  port: process.env.DB_PORT || process.env.MYSQLPORT,
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const testConnection = async (retries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await pool.getConnection();
      console.log('MySQL connected successfully');
      conn.release();
      return;
    } catch (err) {
      console.error(`MySQL connection attempt ${attempt}/${retries} failed:`, err);
      if (attempt === retries) process.exit(1);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
};

module.exports = { pool, testConnection };
