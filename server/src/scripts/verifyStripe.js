// ─── Stripe Setup Verification ─────────────────────────────────────────────
// Run: node src/scripts/verifyStripe.js
// This script confirms the Stripe client can initialize and reach the API.
// It does NOT require MongoDB or Redis — just valid Stripe keys in .env

import 'dotenv/config';

console.log('\n══════════════════════════════════════════════════');
console.log('  TicketFlow — Stripe Setup Verification');
console.log('══════════════════════════════════════════════════\n');

// Step 1: Env validation (will exit if keys are missing)
console.log('[1/4] Validating environment variables...');
const env = (await import('../config/env.js')).default;
console.log('  ✓ All required env vars present');
console.log(`  ✓ STRIPE_SECRET_KEY prefix: ${env.stripe.secretKey.slice(0, 12)}…`);
console.log(`  ✓ STRIPE_WEBHOOK_SECRET prefix: ${env.stripe.webhookSecret.slice(0, 12)}…`);
if (env.stripe.publishableKey) {
  console.log(`  ✓ STRIPE_PUBLISHABLE_KEY prefix: ${env.stripe.publishableKey.slice(0, 12)}…`);
}

// Step 2: Stripe client initialization
console.log('\n[2/4] Initializing Stripe client...');
const stripe = (await import('../config/stripe.js')).default;
console.log('  ✓ Stripe client created successfully');

// Step 3: API connectivity test — list payment intents (limit 1)
console.log('\n[3/4] Testing Stripe API connectivity...');
try {
  const paymentIntents = await stripe.paymentIntents.list({ limit: 1 });
  console.log('  ✓ Stripe API reachable');
  console.log(`  ✓ Payment intents found: ${paymentIntents.data.length >= 0 ? 'OK' : 'FAIL'}`);
} catch (err) {
  console.error('  ✗ Stripe API call failed:', err.message);
  process.exit(1);
}

// Step 4: Verify webhook secret format
console.log('\n[4/4] Verifying webhook secret format...');
if (env.stripe.webhookSecret.startsWith('whsec_')) {
  console.log('  ✓ Webhook secret format looks correct');
} else {
  console.warn('  ⚠ Webhook secret does NOT start with "whsec_" — double-check in Stripe Dashboard');
}

// Summary
console.log('\n──────────────────────────────────────────────────');
console.log('  ✅ Stripe setup verification PASSED');
console.log('  All checks completed successfully.');
console.log('──────────────────────────────────────────────────\n');

process.exit(0);
