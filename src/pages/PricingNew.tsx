import React, { useState, useEffect } from 'react'
import { stripeService } from '../services/stripe'
import { useAuth } from '../contexts/AuthContext'
import { Check, Loader, Star, Zap, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PricingPlan {
  name: string
  price: number
  priceId: string
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

const plans: PricingPlan[] = [
  {
    name: 'Essential',
    price: 29,
    priceId: 'price_1QWxNjAcqSgJBqQgJdOQ1HEv', // Replace with your actual Stripe price ID
    icon: <Star className="w-6 h-6" />,
    features: [
      'All reflection tools',
      'Daily burnout gauge',
      'Basic analytics',
      'Email support',
      'Mobile responsive',
      'Data export'
    ]
  },
  {
    name: 'Professional',
    price: 49,
    priceId: 'price_1QWxNjAcqSgJBqQgKfPR2IGw', // Replace with your actual Stripe price ID
    icon: <Zap className="w-6 h-6" />,
    features: [
      'Everything in Essential',
      'Advanced analytics & insights',
      'Priority support',
      'Team collaboration tools',
      'Custom reminders',
      'API access',
      'Unlimited data storage'
    ],
    popular: true
  },
  {
    name: 'Organization',
    price: 199,
    priceId: 'price_1QWxNjAcqSgJBqQgLhQS3JHx', // Replace with your actual Stripe price ID
    icon: <Shield className="w-6 h-6" />,
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'Admin dashboard',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Training sessions',
      'White-label options'
    ]
  }
]

export const PricingNew: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      checkCurrentSubscription()
    }
  }, [user])

  const checkCurrentSubscription = async () => {
    try {
      const status = await stripeService.getSubscriptionStatus()
      if (status?.subscription_tier) {
        setCurrentPlan(status.subscription_tier.toLowerCase())
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      // Redirect to sign in with return URL
      navigate('/auth?returnTo=/pricing')
      return
    }

    try {
      setLoading(priceId)
      setError(null)
      const { url } = await stripeService.createCheckoutSession(priceId)
      if (url) {
        window.location.href = url
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      setError(error.message || 'Failed to create checkout session. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setLoading('manage')
      const { url } = await stripeService.createPortalSession()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
      setError('Failed to open customer portal. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Choose Your Wellness Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Invest in your mental health and prevent burnout with our comprehensive wellness tools
          </p>
        </div>

        {error && (
          <div className="mb-8 mx-auto max-w-md p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.name.toLowerCase()
            return (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  plan.popular
                    ? 'border-purple-500 shadow-2xl relative'
                    : 'border-gray-200 shadow-lg'
                } bg-white p-8`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white mb-4">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
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
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button
                    onClick={handleManageSubscription}
                    disabled={loading === 'manage'}
                    className="w-full py-3 px-4 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {loading === 'manage' ? (
                      <span className="flex items-center justify-center">
                        <Loader className="w-5 h-5 animate-spin mr-2" />
                        Loading...
                      </span>
                    ) : (
                      'Manage Plan'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.priceId, plan.name)}
                    disabled={loading === plan.priceId}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === plan.priceId ? (
                      <span className="flex items-center justify-center">
                        <Loader className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </span>
                    ) : (
                      'Start Free Trial'
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="text-center space-y-4 text-gray-600">
          <p className="text-lg font-semibold">✨ All plans include a 7-day free trial</p>
          <p>Cancel anytime • No credit card required for trial • Secure payment via Stripe</p>
        </div>

        {user && currentPlan && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Currently subscribed to: <span className="font-semibold capitalize">{currentPlan}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}