const userService = require('../services/user.service');

const getAgents = async (req, res, next) => {
  try {
    const data = await userService.getAgents();
    res.json({ success: true, message: 'Agents retrieved successfully', data });
  } catch (err) {
    next(err);
  }
};

const getAgentsWithStats = async (req, res, next) => {
  try {
    const data = await userService.getAgentsWithStats();
    res.json({ success: true, message: 'Agents retrieved successfully', data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAgents, getAgentsWithStats };
