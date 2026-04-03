// ─── Global Error Handler Middleware ───────────────────────────────────────
// Catches all errors forwarded via next(err) and sends a consistent JSON
// response. Distinguishes operational (AppError) from unexpected errors.

import logger from '../config/logger.js';

const errorHandler = (err, req, res, _next) => {
  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log every error — include requestId if present
  const logPayload = {
    requestId: req.requestId || undefined,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    stack: statusCode >= 500 ? err.stack : undefined,
  };

  if (statusCode >= 500) {
    logger.error(err.message, logPayload);
  } else {
    logger.warn(err.message, logPayload);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: isOperational ? err.message : 'Internal server error',
      code: err.code || undefined,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

export default errorHandler;
