// This script creates a test product and price in Stripe
// Run with: node scripts/create-stripe-product.js

import Stripe from 'stripe';

// Replace with your Stripe secret key from environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'YOUR_STRIPE_SECRET_KEY', {
  apiVersion: '2024-12-18.acacia'
});

async function createProduct() {
  try {
    // Create a product
    const product = await stripe.products.create({
      name: 'InterpretReflect Essential',
      description: 'Essential wellness platform for interpreters',
      metadata: {
        plan: 'essential'
      }
    });

    console.log('Product created:', product.id);

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 1299, // $12.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'essential'
      }
    });

    console.log('Price created:', price.id);
    console.log('\n✅ Success! Update your stripe.ts file with:');
    console.log(`priceId: '${price.id}'`);

    return price.id;
  } catch (error) {
    console.error('Error creating product/price:', error.message);
  }
}

createProduct();