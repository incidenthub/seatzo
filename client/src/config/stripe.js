import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from './constants';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export default stripePromise;
