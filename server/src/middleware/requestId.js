// ─── Request ID Middleware ──────────────────────────────────────────────────
// Assigns a unique ID to every incoming request for traceability across logs.
// Uses crypto.randomUUID() for a fast, collision-free identifier.

import { randomUUID } from 'crypto';

const requestId = (req, _res, next) => {
  req.requestId = req.headers['x-request-id'] || randomUUID();
  next();
};

export default requestId;
