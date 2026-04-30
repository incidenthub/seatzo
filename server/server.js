
// Dynamic imports AFTER dotenv loads
const { default: env } = await import('./src/config/env.js');
const { default: logger } = await import('./src/config/logger.js');
const { default: app } = await import('./app.js');
const { default: connectDB } = await import('./src/config/db.js');
const { default: User } = await import('./src/models/user.model.js');

// Ensure background workers are initialized
await import('./src/queues/paymentEventsQueue.js');

const ensureDefaultUser = async ({ email, name, password, role, logLabel }) => {
  if (env.nodeEnv === 'production') {
    return;
  }

  const existing = await User.findOne({ email });

  if (!existing) {
    await User.create({
      name,
      email,
      password,
      role,
      isVerified: true,
    });

    logger.info(logLabel, { email });
  }
};

connectDB().then(async () => {
  await ensureDefaultUser({
    email: 'organiser@seatzo.com',
    name: 'Default Organiser',
    password: 'Password123!',
    role: 'organiser',
    logLabel: 'Seeded default organiser account',
  });

  await ensureDefaultUser({
    email: 'customer@seatzo.com',
    name: 'Default Customer',
    password: 'Customer123!',
    role: 'customer',
    logLabel: 'Seeded default customer account',
  });

  await ensureDefaultUser({
    email: 'admin@seatzo.com',
    name: 'Default Admin',
    password: 'Admin123!',
    role: 'admin',
    logLabel: 'Seeded default admin account',
  });

  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`, { env: env.nodeEnv });
  });
}).catch((err) => {
  logger.fatal('Failed to start server', { error: err.message });
  process.exit(1);
});