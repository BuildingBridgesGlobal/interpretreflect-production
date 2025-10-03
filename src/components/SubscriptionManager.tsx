import React, { useEffect, useState } from 'react'
import { stripeService } from '../services/stripe'

export const SubscriptionManager: React.FC = () => {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    try {
      const data = await stripeService.getSubscriptionDetails()
      setSubscription(data)
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCustomerPortal = async () => {
    try {
      setPortalLoading(true)
      const { url } = await stripeService.createPortalSession()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error opening customer portal:', error)
      alert('Failed to open customer portal. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">No Active Subscription</h3>
        <p className="text-gray-600 mb-4">
          You don't have an active subscription. Choose a plan to get started.
        </p>
        <a
          href="/pricing"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          View Plans
        </a>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-semibold">Subscription Details</h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            subscription.status === 'active'
              ? 'bg-green-100 text-green-800'
              : subscription.status === 'trialing'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Plan</p>
          <p className="font-medium">{subscription.plan_name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-medium">{formatAmount(subscription.plan_amount)}/month</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Current Period</p>
          <p className="font-medium">
            {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
          </p>
        </div>

        {subscription.cancel_at_period_end && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              Your subscription will be canceled at the end of the current billing period on{' '}
              {formatDate(subscription.current_period_end)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t">
        <button
          onClick={openCustomerPortal}
          disabled={portalLoading}
          className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {portalLoading ? 'Opening Portal...' : 'Manage Subscription'}
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Update payment method, download invoices, or cancel subscription
        </p>
      </div>
    </div>
  )
}