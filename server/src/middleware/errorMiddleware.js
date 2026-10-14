
function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json({
    status: 'error',
    message:
            statusCode >= 500
              ? 'Internal server error'
              : err.message,
  });
}

module.exports = errorMiddleware;