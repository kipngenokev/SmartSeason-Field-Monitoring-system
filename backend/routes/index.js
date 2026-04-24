const { Router } = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const fieldRoutes = require('./field.routes');
const fieldUpdateRoutes = require('./fieldUpdate.routes');
const userRoutes = require('./user.routes');
const updatesRoutes = require('./updates.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/fields/:fieldId/updates', fieldUpdateRoutes);
router.use('/fields', fieldRoutes);
router.use('/users', userRoutes);
router.use('/updates', updatesRoutes);

module.exports = router;
