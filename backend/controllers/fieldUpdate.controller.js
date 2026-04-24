const { validationResult } = require('express-validator');
const fieldUpdateService = require('../services/fieldUpdate.service');

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

const addUpdate = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const fieldId = Number(req.params.fieldId);
    const { stage, notes } = req.body;
    const data = await fieldUpdateService.addUpdate(fieldId, req.user.id, { stage, notes });
    res.status(201).json({ success: true, message: 'Update added successfully', data });
  } catch (err) {
    next(err);
  }
};

const getUpdates = async (req, res, next) => {
  try {
    const fieldId = Number(req.params.fieldId);
    const data = await fieldUpdateService.getUpdates(fieldId, req.user);
    res.json({ success: true, message: 'Updates retrieved successfully', data });
  } catch (err) {
    next(err);
  }
};

const getAllUpdates = async (req, res, next) => {
  try {
    const data = await fieldUpdateService.getAllUpdates(req.user);
    res.json({ success: true, message: 'Updates retrieved successfully', data });
  } catch (err) {
    next(err);
  }
};

module.exports = { addUpdate, getUpdates, getAllUpdates };
