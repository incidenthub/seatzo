import 'dotenv/config';

// Dynamic imports AFTER dotenv loads
const { default: env } = await import('./src/config/env.js');
const { default: logger } = await import('./src/config/logger.js');
const { default: app } = await import('./app.js');
const { default: connectDB } = await import('./src/config/db.js');

connectDB().then(() => {
  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`, { env: env.nodeEnv });
  });
}).catch((err) => {
  logger.fatal('Failed to start server', { error: err.message });
  process.exit(1);
});