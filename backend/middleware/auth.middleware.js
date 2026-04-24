const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Not authorized, no token');
    err.status = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    const err = new Error('Not authorized, token invalid or expired');
    err.status = 401;
    return next(err);
  }

  let user;
  try {
    user = await User.findById(decoded.id);
  } catch {
    const err = new Error('Authentication error');
    err.status = 500;
    return next(err);
  }

  if (!user) {
    const err = new Error('Not authorized, user no longer exists');
    err.status = 401;
    return next(err);
  }

  req.user = user;
  next();
};

module.exports = { protect };
