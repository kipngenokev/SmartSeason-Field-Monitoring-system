const { pool } = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT id, name, email, password, role, created_at FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0];
};

const create = async ({ name, email, hashedPassword, role }) => {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role]
  );
  return result.insertId;
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0];
};

const findAllByRole = async (role) => {
  const [rows] = await pool.execute(
    'SELECT id, name, email, role, created_at FROM users WHERE role = ? ORDER BY name ASC',
    [role]
  );
  return rows;
};

const findAllAgentsWithStats = async () => {
  const [rows] = await pool.execute(`
    SELECT
      u.id, u.name, u.email, u.role, u.created_at,
      COUNT(DISTINCT f.id)  AS field_count,
      COUNT(DISTINCT fu.id) AS update_count
    FROM users u
    LEFT JOIN fields f  ON f.agent_id  = u.id
    LEFT JOIN field_updates fu ON fu.agent_id = u.id
    WHERE u.role = 'Agent'
    GROUP BY u.id
    ORDER BY u.name ASC
  `);
  return rows;
};

module.exports = { findByEmail, create, findById, findAllByRole, findAllAgentsWithStats };
