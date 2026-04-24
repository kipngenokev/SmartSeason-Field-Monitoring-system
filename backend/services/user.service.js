const User = require('../models/user.model');

const getAgents = async () => User.findAllByRole('Agent');

const getAgentsWithStats = async () => User.findAllAgentsWithStats();

module.exports = { getAgents, getAgentsWithStats };
