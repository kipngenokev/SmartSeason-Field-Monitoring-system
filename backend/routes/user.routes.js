const { Router } = require('express');
const { getAgents, getAgentsWithStats } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = Router();

router.get('/agents', protect, authorize('Admin'), getAgents);
router.get('/agents/stats', protect, authorize('Admin'), getAgentsWithStats);

module.exports = router;
