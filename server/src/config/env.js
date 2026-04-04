// ─── Environment Validation ────────────────────────────────────────────────
// Centralised config loader. Validates that every required environment
// variable is present at boot time and exports typed values.
// Fail-fast: if anything critical is missing, the process exits immediately.

import AppError from '../utils/appError.js';

import dotenv from "dotenv";

dotenv.config();

// ── Required keys (process will crash if any are absent) ──
const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

// ── Optional keys with sensible defaults ──
const DEFAULTS = {
  PORT: '5000',
  NODE_ENV: 'development',
  STRIPE_PUBLISHABLE_KEY: '',
  
};

/**
 * Validate that all required variables exist and return a frozen config.
 * Call once at startup; the returned object is the app's single config
 * source for everything env-related.
 */
function loadAndValidateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    console.error(
      `[ENV] Fatal – missing required environment variables:\n  ${missing.join('\n  ')}`
    );
    process.exit(1);
  }

  return Object.freeze({
    // Server
    port: parseInt(process.env.PORT || DEFAULTS.PORT, 10),
    nodeEnv: process.env.NODE_ENV || DEFAULTS.NODE_ENV,
    isProduction: (process.env.NODE_ENV || DEFAULTS.NODE_ENV) === 'production',

    // Database
    mongoUri: process.env.MONGO_URI,

    // Auth
    jwtSecret: process.env.JWT_SECRET,

    // Redis
    redisUrl: process.env.REDIS_URL || DEFAULTS.REDIS_URL,

    // Stripe
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || DEFAULTS.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  });
}

const env = loadAndValidateEnv();
export default env;
