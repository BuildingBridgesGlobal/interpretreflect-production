import React, { useState, useEffect } from 'react'
import { stripeService } from '../services/stripe'
import { useAuth } from '../contexts/AuthContext'
import { Check, Loader, Heart, Shield, Users, ArrowLeft, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PricingPlan {
  name: string
  price: number
  priceId: string
  features: string[]
  popular?: boolean
  icon: React.ReactNode
  description: string
}

const plans: PricingPlan[] = [
  {
    name: 'Essential',
    price: 12,
    priceId: 'price_1QWxNjAcqSgJBqQgJdOQ1HEv',
    icon: <Heart className="w-6 h-6" />,
    description: 'Beta access - Early adopter pricing',
    features: [
      'Unlimited guided reflections',
      'All quick reset tools',
      'Elya AI Companion',
      'Growth tracking + insights',
      'CEU credits',
      'Mobile responsive access',
      'Data export capabilities'
    ],
    popular: true
  },
  {
    name: 'Professional',
    price: 24,
    priceId: 'price_1QWxNjAcqSgJBqQgKfPR2IGw',
    icon: <Shield className="w-6 h-6" />,
    description: 'Coming Q2 2026',
    features: [
      'Everything in Essential',
      'CEUs & email support',
      'Advanced progress analytics',
      'Priority support',
      'Custom wellness reminders',
      'Team collaboration features',
      'API access for integrations',
      'Unlimited reflection storage'
    ]
  },
  {
    name: 'Organizations',
    price: 0,
    priceId: 'price_custom',
    icon: <Users className="w-6 h-6" />,
    description: 'For agencies & programs',
    features: [
      'Custom pricing',
      'Volume discounts',
      'Team wellness dashboard',
      'Usage analytics',
      'Custom integrations',
      'Dedicated support',
      'Perfect for interpreting agencies',
      'VRS/VRI providers',
      'Educational programs',
      'Healthcare systems'
    ]
  }
]

export const PricingNew: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

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

  const calculateYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8) // 20% discount for yearly
  }

  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F0EDE8 100%)' }}
    >
      {/* Back to App Button */}
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-white/50"
          style={{ color: '#5C7F4F' }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to App</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-5xl font-bold mb-4"
            style={{ color: '#2D3748' }}
          >
            Invest in Your Interpreter Wellbeing
          </h1>
          <p 
            className="text-xl max-w-2xl mx-auto mb-8"
            style={{ color: '#4A5568' }}
          >
            Evidence-based tools designed specifically for interpreters to prevent burnout, 
            process vicarious trauma, and sustain long-term wellness
          </p>
          
          {/* Billing Period Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingPeriod === 'monthly' 
                  ? 'text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{ 
                backgroundColor: billingPeriod === 'monthly' ? '#5C7F4F' : 'transparent'
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingPeriod === 'yearly' 
                  ? 'text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{ 
                backgroundColor: billingPeriod === 'yearly' ? '#5C7F4F' : 'transparent'
              }}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="mb-8 mx-auto max-w-md p-4 rounded-lg text-center"
            style={{ 
              backgroundColor: '#FEE2E2', 
              border: '1px solid #FECACA',
              color: '#991B1B'
            }}
          >
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.name.toLowerCase()
            const displayPrice = billingPeriod === 'yearly' 
              ? calculateYearlyPrice(plan.price) 
              : plan.price
            
            return (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  plan.popular
                    ? 'shadow-2xl relative'
                    : 'shadow-lg'
                } bg-white p-8`}
                style={{
                  borderColor: plan.popular ? '#5C7F4F' : '#E5E7EB'
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span 
                      className="text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
                      style={{ backgroundColor: '#5C7F4F' }}
                    >
                      <Sparkles className="w-4 h-4" />
                      BETA ACCESS
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full text-white mb-4"
                    style={{ backgroundColor: plan.popular ? '#5C7F4F' : '#7A9B6E' }}
                  >
                    {plan.icon}
                  </div>
                  <h3 
                    className="text-2xl font-bold mb-2"
                    style={{ color: '#2D3748' }}
                  >
                    {plan.name}
                  </h3>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: '#4A5568' }}
                  >
                    {plan.description}
                  </p>
                  {plan.name === 'Organizations' ? (
                    <div className="text-2xl font-bold" style={{ color: '#2D3748' }}>
                      Custom Pricing
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-center">
                        <span 
                          className="text-5xl font-extrabold"
                          style={{ color: '#2D3748' }}
                        >
                          ${displayPrice}
                        </span>
                        <span 
                          className="ml-2"
                          style={{ color: '#6B7280' }}
                        >
                          /{billingPeriod === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      {billingPeriod === 'yearly' && plan.name === 'Essential' && (
                        <p className="text-sm mt-2" style={{ color: '#10B981' }}>
                          Save ${plan.price * 12 - displayPrice} per year
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check 
                        className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0"
                        style={{ color: '#10B981' }}
                      />
                      <span style={{ color: '#4A5568' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                {isCurrentPlan ? (
                  <button
                    onClick={handleManageSubscription}
                    disabled={loading === 'manage'}
                    className="w-full py-3 px-4 rounded-xl font-semibold transition-all"
                    style={{ 
                      backgroundColor: '#F3F4F6',
                      color: '#4B5563'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E5E7EB'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F3F4F6'
                    }}
                  >
                    {loading === 'manage' ? (
                      <span className="flex items-center justify-center">
                        <Loader className="w-5 h-5 animate-spin mr-2" />
                        Loading...
                      </span>
                    ) : (
                      'Manage Your Plan'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (plan.name === 'Organizations') {
                        window.location.href = 'mailto:info@buildingbridgeslearning.com?subject=InterpretReflect Organizations Plan';
                      } else if (plan.name === 'Professional') {
                        // Do nothing for coming soon
                        return;
                      } else {
                        handleSubscribe(plan.priceId, plan.name);
                      }
                    }}
                    disabled={loading === plan.priceId || plan.name === 'Professional'}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                    style={{ 
                      backgroundColor: plan.popular ? '#5C7F4F' : '#7A9B6E'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = plan.popular ? '#4A6D3F' : '#6A8B5E'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = plan.popular ? '#5C7F4F' : '#7A9B6E'
                    }}
                  >
                    {loading === plan.priceId ? (
                      <span className="flex items-center justify-center">
                        <Loader className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </span>
                    ) : plan.name === 'Organizations' ? (
                      'Contact Us'
                    ) : plan.name === 'Professional' ? (
                      'Coming Soon'
                    ) : (
                      'Get Started - $12/month'
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Trust Badges */}
        <div 
          className="text-center space-y-4 p-8 rounded-2xl"
          style={{ backgroundColor: '#F5F9F3' }}
        >
          <p 
            className="text-lg font-semibold"
            style={{ color: '#2D3748' }}
          >
            ✨ Built for Interpreters, By Interpreters
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm" style={{ color: '#4A5568' }}>
            <span>✓ Beta access available</span>
            <span>✓ Cancel anytime</span>
            <span>✓ 100% secure</span>
            <span>✓ Research-backed</span>
            <span>✓ Completely confidential</span>
          </div>
        </div>

        {/* Current Subscription Status */}
        {user && currentPlan && (
          <div className="mt-12 text-center">
            <p style={{ color: '#6B7280' }}>
              Currently subscribed to: 
              <span 
                className="font-semibold capitalize ml-2"
                style={{ color: '#5C7F4F' }}
              >
                {currentPlan} Plan
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}