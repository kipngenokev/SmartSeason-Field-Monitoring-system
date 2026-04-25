const mysql = require('mysql2/promise');

const host     = process.env.DB_HOST     || process.env.MYSQLHOST;
const port     = process.env.DB_PORT     || process.env.MYSQLPORT;
const user     = process.env.DB_USER     || process.env.MYSQLUSER;
const database = process.env.DB_NAME     || process.env.MYSQLDATABASE;
// Password intentionally omitted from logs
const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD;

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 2000; // 2 s → 4 s → 8 s → 10 s → 10 s (capped)
const MAX_DELAY_MS = 10000;

const testConnection = async () => {
  console.log('MySQL config — host: %s, port: %s, user: %s, database: %s',
    host, port, user, database);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await pool.getConnection();
      console.log('MySQL connected successfully (attempt %d/%d)', attempt, MAX_RETRIES);
      conn.release();
      return; // success — stop retrying
    } catch (err) {
      const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);
      console.error(
        'MySQL connection failed (attempt %d/%d): %s',
        attempt, MAX_RETRIES, err.message
      );

      if (attempt < MAX_RETRIES) {
        console.log('Retrying in %d ms…', delay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('All %d MySQL connection attempts exhausted. Exiting.', MAX_RETRIES);
        process.exit(1);
      }
    }
  }
};

module.exports = { pool, testConnection };
