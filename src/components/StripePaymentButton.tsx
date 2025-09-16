import React from 'react';
import { STRIPE_PRODUCT } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { analytics } from '../utils/analytics';

interface StripePaymentButtonProps {
  className?: string;
  buttonText?: string;
  useDirectLink?: boolean;
}

export function StripePaymentButton({ 
  className = '', 
  buttonText = 'Subscribe Now',
  useDirectLink = false 
}: StripePaymentButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    // Track subscription intent
    analytics.trackSubscriptionIntent();
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login first
        alert('Please log in to subscribe');
        return;
      }

      if (useDirectLink) {
        // Option 1: Use the direct payment link (simpler but less control)
        window.open(STRIPE_PRODUCT.paymentLink, '_blank');
      } else {
        // Option 2: Use Stripe Checkout Session (more control, better integration)
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            priceId: STRIPE_PRODUCT.priceId,
            userId: user.id,
            userEmail: user.email,
            successUrl: `${window.location.origin}/payment-success`,
            cancelUrl: `${window.location.origin}/pricing`
          }
        });

        if (error) throw error;

        // Redirect to Stripe Checkout
        if (data?.sessionId) {
          const stripe = await import('@stripe/stripe-js').then(m => 
            m.loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
          );
          
          if (stripe) {
            await stripe.redirectToCheckout({ sessionId: data.sessionId });
          }
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to start payment process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`px-6 py-3 rounded-lg font-semibold transition-all ${className}`}
      style={{
        background: loading 
          ? '#ccc'
          : 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
        color: '#FFFFFF',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? 'Processing...' : buttonText}
    </button>
  );
}