const { pool } = require('../config/db');

const healthCheck = async (req, res) => {
  let dbStatus = 'disconnected';

  try {
    const conn = await pool.getConnection();
    conn.release();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  res.json({
    success: true,
    message: 'SmartSeason API is running',
    environment: process.env.NODE_ENV,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { healthCheck };
