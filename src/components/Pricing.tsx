import React, { useState } from 'react'
import { stripeService } from '../services/stripe'
import { useAuth } from '../contexts/AuthContext'

interface PricingPlan {
  name: string
  price: number
  priceId: string
  features: string[]
  popular?: boolean
}

const plans: PricingPlan[] = [
  {
    name: 'Basic',
    price: 9,
    priceId: 'price_xxxxx', // Replace with your actual Stripe Basic price ID
    features: [
      '10 projects',
      'Basic support',
      '1GB storage',
      'Email notifications'
    ]
  },
  {
    name: 'Pro',
    price: 29,
    priceId: 'price_xxxxx', // Replace with your actual Stripe Pro price ID
    features: [
      'Unlimited projects',
      'Priority support',
      '10GB storage',
      'Email & SMS notifications',
      'Advanced analytics',
      'API access'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 99,
    priceId: 'price_xxxxx', // Replace with your actual Stripe Enterprise price ID
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Unlimited storage',
      'Custom integrations',
      'SLA guarantee',
      'White-label options'
    ]
  }
]

export const Pricing: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      alert('Please sign in to subscribe')
      return
    }

    try {
      setLoading(priceId)
      const { url } = await stripeService.createCheckoutSession(priceId)
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to create checkout session. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600">
          Select the perfect plan for your needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg border ${
              plan.popular
                ? 'border-blue-500 shadow-xl scale-105'
                : 'border-gray-200 shadow-lg'
            } bg-white p-8 relative`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {plan.name}
              </h3>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-extrabold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.priceId)}
              disabled={loading === plan.priceId}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                plan.popular
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === plan.priceId ? 'Processing...' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}