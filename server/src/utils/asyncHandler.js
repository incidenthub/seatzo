// ─── asyncHandler ──────────────────────────────────────────────────────────
// Wraps an async Express handler so rejected promises are automatically
// forwarded to `next(err)` instead of crashing.

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
