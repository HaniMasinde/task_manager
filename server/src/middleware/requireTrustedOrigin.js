const trustedOrigins = new Set([
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean));

function requireTrustedOrigin(req, res, next) {
  const origin = req.get('origin');
  if (!origin || !trustedOrigins.has(origin)) {
    return res.status(403).json({ status: 'error', message: 'Request origin is not allowed.' });
  }
  return next();
}

module.exports = requireTrustedOrigin;
