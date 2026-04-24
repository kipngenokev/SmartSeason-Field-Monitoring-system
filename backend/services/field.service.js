const Field = require('../models/field.model');
const User = require('../models/user.model');
const { attachStatus } = require('./fieldStatus.service');

const createField = async ({ name, crop_type, planting_date, location, size_ha, status = 'Active' }) => {
  const fieldId = await Field.create({ name, crop_type, planting_date, location, size_ha, status });
  return attachStatus(await Field.findById(fieldId));
};

const getAllFields = async () => {
  const fields = await Field.findAll();
  return fields.map(attachStatus);
};

const assignAgent = async (fieldId, agentId) => {
  const field = await Field.findById(fieldId);
  if (!field) {
    const err = new Error('Field not found');
    err.status = 404;
    throw err;
  }

  const agent = await User.findById(agentId);
  if (!agent || agent.role !== 'Agent') {
    const err = new Error('User not found or is not an Agent');
    err.status = 400;
    throw err;
  }

  await Field.assignAgent(fieldId, agentId);
  return attachStatus(await Field.findById(fieldId));
};

const getMyFields = async (agentId) => {
  const fields = await Field.findByAgentId(agentId);
  return fields.map(attachStatus);
};

const getFieldById = async (id, user) => {
  const field = await Field.findById(id);
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
  return attachStatus(field);
};

module.exports = { createField, getAllFields, assignAgent, getMyFields, getFieldById };
