const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    const err = new Error('Not authorized');
    err.status = 401;
    return next(err);
  }
  if (!roles.includes(req.user.role)) {
    const err = new Error(`Access denied: requires one of [${roles.join(', ')}]`);
    err.status = 403;
    return next(err);
  }
  next();
};

module.exports = { authorize };
