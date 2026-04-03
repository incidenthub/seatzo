// ─── Stripe Client Configuration ───────────────────────────────────────────
// Initializes the Stripe SDK with the secret key from validated env config.
// Every file that needs Stripe imports from here — never construct `new Stripe()` elsewhere.

import Stripe from 'stripe';
import env from './env.js';

if (!env.stripe.secretKey) {
  console.error('[Stripe] Fatal – STRIPE_SECRET_KEY is not set.');
  process.exit(1);
}

const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: '2025-03-31.basil',        // pin API version for deterministic behaviour
  maxNetworkRetries: 2,                   // automatic retries on transient network errors
  timeout: 20_000,                        // 20 s timeout per request
  telemetry: !env.isProduction,           // disable telemetry in production
});

// Quick sanity check that the key looks plausible (test keys start with sk_test_)
if (
  !env.isProduction &&
  !env.stripe.secretKey.startsWith('sk_test_')
) {
  console.warn(
    '[Stripe] WARNING – secret key does not start with "sk_test_". ' +
    'Make sure you are NOT using a live key in development!'
  );
}

console.log(
  `[Stripe] Client initialised (env: ${env.nodeEnv}, ` +
  `key prefix: ${env.stripe.secretKey.slice(0, 7)}…)`
);

export default stripe;
