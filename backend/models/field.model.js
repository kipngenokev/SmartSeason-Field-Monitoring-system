const { pool } = require('../config/db');

const create = async ({ name, crop_type, planting_date, location, size_ha, status }) => {
  const [result] = await pool.execute(
    'INSERT INTO fields (name, crop_type, planting_date, location, size_ha, status) VALUES (?, ?, ?, ?, ?, ?)',
    [name, crop_type ?? null, planting_date ?? null, location, size_ha, status]
  );
  return result.insertId;
};

const FIELD_COLS = `
  f.id, f.name, f.crop_type, f.planting_date,
  f.location, f.size_ha, f.status, f.created_at,
  f.agent_id,
  u.name  AS agent_name,
  u.email AS agent_email,
  lu.stage      AS latest_stage,
  lu.created_at AS latest_update_at
`;

const LATEST_UPDATE_JOIN = `
  LEFT JOIN (
    SELECT field_id, stage, created_at
    FROM field_updates
    WHERE id IN (SELECT MAX(id) FROM field_updates GROUP BY field_id)
  ) lu ON lu.field_id = f.id
`;

const findAll = async () => {
  const [rows] = await pool.execute(`
    SELECT ${FIELD_COLS}
    FROM fields f
    LEFT JOIN users u ON u.id = f.agent_id
    ${LATEST_UPDATE_JOIN}
    ORDER BY f.created_at DESC
  `);
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.execute(`
    SELECT ${FIELD_COLS}
    FROM fields f
    LEFT JOIN users u ON u.id = f.agent_id
    ${LATEST_UPDATE_JOIN}
    WHERE f.id = ?
    LIMIT 1
  `, [id]);
  return rows[0];
};

const findByAgentId = async (agentId) => {
  const [rows] = await pool.execute(`
    SELECT ${FIELD_COLS}
    FROM fields f
    LEFT JOIN users u ON u.id = f.agent_id
    ${LATEST_UPDATE_JOIN}
    WHERE f.agent_id = ?
    ORDER BY f.created_at DESC
  `, [agentId]);
  return rows;
};

const assignAgent = async (fieldId, agentId) => {
  await pool.execute(
    'UPDATE fields SET agent_id = ? WHERE id = ?',
    [agentId, fieldId]
  );
};

module.exports = { create, findAll, findById, findByAgentId, assignAgent };
