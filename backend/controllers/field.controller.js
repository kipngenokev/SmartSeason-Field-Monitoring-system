const { validationResult } = require('express-validator');
const fieldService = require('../services/field.service');

const getField = async (req, res, next) => {
  try {
    const data = await fieldService.getFieldById(Number(req.params.id), req.user);
    res.json({ success: true, message: 'Field retrieved successfully', data });
  } catch (err) {
    next(err);
  }
};

const getMyFields = async (req, res, next) => {
  try {
    const data = await fieldService.getMyFields(req.user.id);
    res.json({ success: true, message: 'Assigned fields retrieved', data });
  } catch (err) {
    next(err);
  }
};

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => e.msg),
    });
    return false;
  }
  return true;
};

const createField = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const { name, crop_type, planting_date, location, size_ha, status } = req.body;
    const data = await fieldService.createField({ name, crop_type, planting_date, location, size_ha, status });
    res.status(201).json({ success: true, message: 'Field created successfully', data });
  } catch (err) {
    next(err);
  }
};

const getAllFields = async (req, res, next) => {
  try {
    const data = await fieldService.getAllFields();
    res.json({ success: true, message: 'Fields retrieved successfully', data });
  } catch (err) {
    next(err);
  }
};

const assignAgent = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    const data = await fieldService.assignAgent(Number(id), Number(agentId));
    res.json({ success: true, message: 'Agent assigned successfully', data });
  } catch (err) {
    next(err);
  }
};

module.exports = { createField, getAllFields, assignAgent, getMyFields, getField };
