const { Router } = require('express');
const { body, param } = require('express-validator');
const { addUpdate, getUpdates } = require('../controllers/fieldUpdate.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = Router({ mergeParams: true });

router.use(protect);

const fieldIdValidation = [
  param('fieldId').isInt({ gt: 0 }).withMessage('Invalid field ID'),
];

const addUpdateValidation = [
  ...fieldIdValidation,
  body('stage')
    .trim()
    .notEmpty().withMessage('Stage is required')
    .isLength({ max: 100 }).withMessage('Stage must not exceed 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Notes must not exceed 2000 characters'),
];

router.post('/', authorize('Agent'), addUpdateValidation, addUpdate);
router.get('/', authorize('Admin', 'Agent'), fieldIdValidation, getUpdates);

module.exports = router;
