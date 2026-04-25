const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQL_HOST,
  port: process.env.DB_PORT || process.env.MYSQL_PORT,
  user: process.env.DB_USER || process.env.MYSQL_USER,
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
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
