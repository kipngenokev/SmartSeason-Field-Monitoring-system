const Field = require('../models/field.model');
const FieldUpdate = require('../models/fieldUpdate.model');

const addUpdate = async (fieldId, agentId, { stage, notes }) => {
  const field = await Field.findById(fieldId);
  if (!field) {
    const err = new Error('Field not found');
    err.status = 404;
    throw err;
  }

  if (field.agent_id !== agentId) {
    const err = new Error('You are not assigned to this field');
    err.status = 403;
    throw err;
  }

  const updateId = await FieldUpdate.create({ fieldId, agentId, stage, notes });
  return FieldUpdate.findById(updateId);
};

const getUpdates = async (fieldId, user) => {
  const field = await Field.findById(fieldId);
  if (!field) {
    const err = new Error('Field not found');
    err.status = 404;
    throw err;
  }

  if (user.role === 'Agent' && field.agent_id !== user.id) {
    const err = new Error('You are not assigned to this field');
    err.status = 403;
    throw err;
  }

  return FieldUpdate.findByFieldId(fieldId);
};

const getAllUpdates = async (user) => {
  if (user.role === 'Admin') return FieldUpdate.findAll();
  return FieldUpdate.findByAgentId(user.id);
};

module.exports = { addUpdate, getUpdates, getAllUpdates };
