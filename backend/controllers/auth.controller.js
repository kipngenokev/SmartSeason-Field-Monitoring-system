const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');

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

const register = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const { name, email, password, role } = req.body;
    const data = await authService.register({ name, email, password, role });
    res.status(201).json({ success: true, message: 'User registered successfully', data });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const { email, password } = req.body;
    const data = await authService.login({ email, password });
    res.status(200).json({ success: true, message: 'Login successful', data });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
