
function authMiddleware(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required. Please log in.',
    });
  }

  next();
}

module.exports = authMiddleware;