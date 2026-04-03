// ─── AppError ──────────────────────────────────────────────────────────────
// Custom error class for operational errors. Controllers and services throw
// AppError instances; the global error handler formats the response.

class AppError extends Error {
  /**
   * @param {string}  message    – Human-readable error description
   * @param {number}  statusCode – HTTP status code (default 500)
   * @param {string}  [code]     – Optional machine-readable error code
   */
  constructor(message, statusCode = 500, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || null;
    this.isOperational = true;

    // Capture the correct stack trace (excludes this constructor)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
