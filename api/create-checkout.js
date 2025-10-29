// Vercel Serverless Function
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Import Stripe dynamically
    const Stripe = (await import('stripe')).default;
    // Use default API version (let Stripe SDK handle it)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { priceId, email, metadata } = req.body;

    console.log('📦 Creating checkout for:', email);

    if (!priceId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('✅ Found existing customer:', customerId);
    } else {
      const customer = await stripe.customers.create({
        email: email,
        metadata: metadata || {}
      });
      customerId = customer.id;
      console.log('✅ Created new customer:', customerId);
    }

    // Create checkout session
    const origin = req.headers.origin || req.headers.referer || 'https://www.interpretreflect.com';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      // Note: Don't use customer_email when customer is provided
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: false
      },
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/signup?canceled=true`,
      subscription_data: {
        metadata: {
          ...metadata
        },
        trial_period_days: 3,
      },
    });

    console.log('✅ Session created:', session.id);

    return res.status(200).json({
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({
      error: error.message
    });
  }
}
