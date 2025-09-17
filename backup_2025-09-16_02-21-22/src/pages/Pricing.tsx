import React, { useState } from 'react';
import { Check, X, Loader } from 'lucide-react';
import { stripePromise, STRIPE_PRODUCT } from '../lib/stripe';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const Pricing: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubscribe = async () => {
    try {
      setLoading('basic');
      setError(null);

      if (!user) {
        setError('Please sign in to subscribe');
        setLoading(null);
        return;
      }

      if (!stripePromise) {
        setError('Payment system is not configured. Please contact support.');
        setLoading(null);
        return;
      }

      const stripe = await stripePromise;
      
      // Call Supabase Edge Function to create checkout session
      const response = await fetch(`https://kvguxuxanpynwdffpssm.supabase.co/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          priceId: STRIPE_PRODUCT.priceId,
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe!.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Failed to start subscription. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Wellness Journey
          </h1>
          <p className="text-xl text-gray-600">
            Access all the tools you need to prevent and manage burnout
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 relative ring-2 ring-indigo-500">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Launch Special
              </span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {STRIPE_PRODUCT.name}
              </h2>
              <div className="mb-4">
                <span className="text-5xl font-bold text-gray-900">
                  ${STRIPE_PRODUCT.price}
                </span>
                <span className="text-gray-600 text-xl">/month</span>
              </div>
              <p className="text-gray-600">
                Everything you need to manage workplace wellness
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {STRIPE_PRODUCT.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={loading === 'basic'}
              className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'basic' ? (
                <span className="flex items-center justify-center">
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </span>
              ) : (
                'Start Your Free Trial'
              )}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">All plans include a 7-day free trial</p>
          <p className="text-sm">Cancel anytime. No questions asked.</p>
        </div>
      </div>
    </div>
  );
};