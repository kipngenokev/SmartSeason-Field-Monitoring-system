const { pool } = require('../config/db');

const create = async ({ fieldId, agentId, stage, notes }) => {
  const [result] = await pool.execute(
    'INSERT INTO field_updates (field_id, agent_id, stage, notes) VALUES (?, ?, ?, ?)',
    [fieldId, agentId, stage, notes ?? null]
  );
  return result.insertId;
};

const findById = async (id) => {
  const [rows] = await pool.execute(`
    SELECT
      fu.id, fu.field_id, fu.stage, fu.notes, fu.created_at,
      u.id   AS agent_id,
      u.name AS agent_name
    FROM field_updates fu
    JOIN users u ON u.id = fu.agent_id
    WHERE fu.id = ?
    LIMIT 1
  `, [id]);
  return rows[0];
};

const findByFieldId = async (fieldId) => {
  const [rows] = await pool.execute(`
    SELECT
      fu.id, fu.field_id, fu.stage, fu.notes, fu.created_at,
      u.id   AS agent_id,
      u.name AS agent_name
    FROM field_updates fu
    JOIN users u ON u.id = fu.agent_id
    WHERE fu.field_id = ?
    ORDER BY fu.created_at DESC
  `, [fieldId]);
  return rows;
};

const findAll = async () => {
  const [rows] = await pool.execute(`
    SELECT
      fu.id, fu.field_id, fu.stage, fu.notes, fu.created_at,
      u.id   AS agent_id,
      u.name AS agent_name,
      f.name AS field_name
    FROM field_updates fu
    JOIN users u ON u.id = fu.agent_id
    JOIN fields f ON f.id = fu.field_id
    ORDER BY fu.created_at DESC
  `);
  return rows;
};

const findByAgentId = async (agentId) => {
  const [rows] = await pool.execute(`
    SELECT
      fu.id, fu.field_id, fu.stage, fu.notes, fu.created_at,
      u.id   AS agent_id,
      u.name AS agent_name,
      f.name AS field_name
    FROM field_updates fu
    JOIN users u ON u.id = fu.agent_id
    JOIN fields f ON f.id = fu.field_id
    WHERE fu.agent_id = ?
    ORDER BY fu.created_at DESC
  `, [agentId]);
  return rows;
};

module.exports = { create, findById, findByFieldId, findAll, findByAgentId };
