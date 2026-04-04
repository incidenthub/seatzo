
// ── Validated config (fail-fast if required env vars are missing) ───────────
import env from './src/config/env.js';
import logger from './src/config/logger.js';

import app from './app.js';
import connectDB from './src/config/db.js';

connectDB().then(() => {
  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`, { env: env.nodeEnv });
  });
}).catch((err) => {
  logger.fatal('Failed to start server', { error: err.message });
  process.exit(1);
});