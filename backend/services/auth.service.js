const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const signToken = (id, email, role) =>
  jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const register = async ({ name, email, password, role = 'Agent' }) => {
  const existing = await User.findByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await User.create({ name, email, hashedPassword, role });
  const token = signToken(userId, email, role);

  return { id: userId, name, email, role, token };
};

const login = async ({ email, password }) => {
  const user = await User.findByEmail(email);
  const valid = user && (await bcrypt.compare(password, user.password));

  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const token = signToken(user.id, user.email, user.role);
  return { id: user.id, name: user.name, email: user.email, role: user.role, token };
};

module.exports = { register, login };
