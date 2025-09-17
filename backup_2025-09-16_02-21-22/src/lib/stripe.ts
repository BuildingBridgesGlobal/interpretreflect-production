import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file');
}

export const stripePromise = stripePublishableKey 
  ? loadStripe(stripePublishableKey)
  : null;

export const STRIPE_PRICING_TABLE_ID = 'prctbl_your_pricing_table_id'; // Replace with your actual pricing table ID
export const STRIPE_PUBLISHABLE_KEY = stripePublishableKey;

// InterpretReflect Premium Subscription
export const STRIPE_PRODUCT = {
  priceId: 'price_1Sb7y0IouyG60O9hH8MvJTHN', // Live price ID from your payment link
  paymentLink: 'https://buy.stripe.com/3cIcN5fYa7Ry2bA9i1b7y03', // Direct payment link
  name: 'InterpretReflect Premium',
  price: 12.99, // Update this with your actual price
  features: [
    'Access to all wellness tools',
    'Daily burnout gauge',
    'Breathing exercises',
    'Assessment tools',
    'Reflection guides',
    'AI-powered Elya wellness companion',
    'Progress tracking & insights',
    'Email support'
  ]
};

// Keep for backwards compatibility
export const STRIPE_PRODUCTS = {
  BASIC: STRIPE_PRODUCT
};