// backend/middlewares/errorHandler.js

export function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err);
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

export default errorHandler;
