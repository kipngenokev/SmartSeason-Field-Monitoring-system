const { Router } = require('express');
const { getAllUpdates } = require('../controllers/fieldUpdate.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = Router();

router.get('/', protect, authorize('Admin', 'Agent'), getAllUpdates);

module.exports = router;
