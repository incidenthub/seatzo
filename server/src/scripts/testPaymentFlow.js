import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function createMockToken() {
  // We just need a valid JWT with an id payload to pass the `protect` middleware
  // We'll give it a random mongoose ObjectId
  const fakeUserId = new mongoose.Types.ObjectId().toString();
  return jwt.sign({ id: fakeUserId }, JWT_SECRET, { expiresIn: '1h' });
}

async function runTests() {
  console.log('══════════════════════════════════════════════════');
  console.log('  Running Payment Integration Tests');
  console.log('══════════════════════════════════════════════════\n');

  try {
    const token = createMockToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const idempotencyKey = `test_idemp_${Date.now()}`;
    const bookingId = new mongoose.Types.ObjectId().toString(); // Random dummy booking ID
    const initialAmount = 15000; // 150.00 INR

    console.log('[1/3] Testing standard Payment Creation...');
    let res = await fetch(`${API_URL}/payments/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        bookingId,
        amount: initialAmount,
        idempotencyKey
      })
    });
    
    let data = await res.json();
    if (!res.ok) throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
    console.log('  ✓ Success! Got client_secret from Stripe:', data.data.clientSecret.substring(0, 15) + '...');
    const paymentId = data.data.paymentId;

    console.log('\n[2/3] Testing Idempotency (Same key & amount)...');
    res = await fetch(`${API_URL}/payments/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        bookingId,
        amount: initialAmount,
        idempotencyKey
      })
    });
    
    data = await res.json();
    if (!res.ok) throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
    if (data.data.paymentId !== paymentId) {
       throw new Error('Idempotency failed: Returned a different payment ID!');
    }
    console.log('  ✓ Success! Backend caught the duplicate and properly returned the original payment intent.');

    console.log('\n[3/3] Testing Idempotency Tamper Protection (Same key, WRONG amount)...');
    res = await fetch(`${API_URL}/payments/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        bookingId,
        amount: 5000, // Client trying to lower the price!
        idempotencyKey
      })
    });
    
    data = await res.json();
    if (res.status === 400 && data.error && data.error.message.includes('amount')) {
        console.log('  ✓ Success! Backend successfully blocked the tamper attempt:');
        console.log(`      Error caught: "${data.error.message}"`);
    } else {
        throw new Error(`Tamper protection failed. It returned status ${res.status}: ${JSON.stringify(data)}`);
    }

    console.log('\n──────────────────────────────────────────────────');
    console.log('  ✅ ALL TESTS PASSED SUCCESSFULLY');
    console.log('──────────────────────────────────────────────────');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
  }
}

runTests();
