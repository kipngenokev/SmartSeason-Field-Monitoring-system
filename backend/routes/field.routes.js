const { Router } = require('express');
const { body, param } = require('express-validator');
const { createField, getAllFields, assignAgent, getMyFields, getField } = require('../controllers/field.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = Router();

const createFieldValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Field name is required')
    .isLength({ max: 150 }).withMessage('Name must not exceed 150 characters'),
  body('crop_type')
    .trim()
    .notEmpty().withMessage('Crop type is required')
    .isLength({ max: 100 }).withMessage('Crop type must not exceed 100 characters'),
  body('planting_date')
    .notEmpty().withMessage('Planting date is required')
    .isISO8601().withMessage('Planting date must be a valid date'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ max: 255 }).withMessage('Location must not exceed 255 characters'),
  body('size_ha')
    .notEmpty().withMessage('Size is required')
    .isFloat({ gt: 0 }).withMessage('Size must be a positive number'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
];

const assignAgentValidation = [
  param('id').isInt({ gt: 0 }).withMessage('Invalid field ID'),
  body('agentId')
    .notEmpty().withMessage('agentId is required')
    .isInt({ gt: 0 }).withMessage('agentId must be a positive integer'),
];

// Agent: get own assigned fields (registered before Admin-only middleware)
router.get('/mine', protect, authorize('Agent'), getMyFields);

// Both roles: get a single field by ID (agent only sees assigned field)
router.get('/:id', protect, authorize('Admin', 'Agent'), getField);

// All remaining routes require Admin
router.use(protect, authorize('Admin'));

router.post('/', createFieldValidation, createField);
router.get('/', getAllFields);
router.patch('/:id/assign-agent', assignAgentValidation, assignAgent);

module.exports = router;
