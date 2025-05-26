const roleGuard = function roleGuard(allowedRoles) {
  allowedRoles.push("Admin");
  return (req, res, next) => {
    if (!allowedRoles.includes(req.role)) {
      return res.status(403).send('Forbidden: insufficient role');
    }
    next();
  };
};

module.exports = { roleGuard };