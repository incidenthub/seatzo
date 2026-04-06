import AppError from '../utils/appError.js';

const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'REDIS_URL',
];

const DEFAULTS = {
  PORT: '5000',
  NODE_ENV: 'development',
  STRIPE_PUBLISHABLE_KEY: '',
};

function loadAndValidateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    console.error(
      `[ENV] Fatal – missing required environment variables:\n  ${missing.join('\n  ')}`
    );
    process.exit(1);
  }

  const config = Object.freeze({
    port: parseInt(process.env.PORT || DEFAULTS.PORT, 10),
    nodeEnv: process.env.NODE_ENV || DEFAULTS.NODE_ENV,
    isProduction: (process.env.NODE_ENV || DEFAULTS.NODE_ENV) === 'production',
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    redisUrl: process.env.REDIS_URL,
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || DEFAULTS.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  });

  return config;
}

const env = loadAndValidateEnv();
export default env;