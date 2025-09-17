import { supabase } from '../lib/supabase'

export const stripeService = {
  async createCheckoutSession(priceId: string) {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { priceId },
    })

    if (error) throw error
    return data
  },

  async createPortalSession() {
    const { data, error } = await supabase.functions.invoke('create-portal-session')

    if (error) throw error
    return data
  },

  async getSubscriptionStatus() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching subscription status:', error)
      return null
    }

    return data
  },

  async getSubscriptionDetails() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Error fetching subscription details:', error)
      return null
    }

    return data
  }
}