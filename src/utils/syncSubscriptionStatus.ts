import { supabase } from '../lib/supabase';
import { clearSubscriptionCache } from '../hooks/useSubscription';

/**
 * Manually sync subscription status from Stripe
 * This function calls a Supabase edge function to verify the subscription
 * status directly with Stripe and update the database accordingly
 */
export async function syncSubscriptionStatus(userId: string): Promise<{ success: boolean; message: string }> {
  console.log('🔄 Syncing subscription status from Stripe for user:', userId);

  try {
    // First, get the user's stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { success: false, message: 'Failed to fetch user profile' };
    }

    if (!profile?.stripe_customer_id) {
      console.log('User has no Stripe customer ID - likely never had a subscription');

      // Ensure subscription_status is null if no customer ID
      if (profile?.subscription_status) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: null,
            subscription_tier: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      }

      // Clear any orphaned subscriptions
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('user_id', userId)
        .neq('status', 'canceled');

      clearSubscriptionCache();
      return { success: true, message: 'No Stripe customer found - cleared subscription status' };
    }

    // Call the sync-stripe-subscription edge function to verify with Stripe
    const { data, error } = await supabase.functions.invoke('sync-stripe-subscription', {
      body: { customerId: profile.stripe_customer_id, userId }
    });

    if (error) {
      console.error('Error syncing with Stripe:', error);

      // Fallback: Check local database for subscription status
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      console.log('Local subscriptions found:', subscriptions);

      // Update profile based on latest subscription
      const activeSubscription = subscriptions?.find(s => s.status === 'active' || s.status === 'past_due');

      if (!activeSubscription) {
        // No active subscription - clear the status
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_tier: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        clearSubscriptionCache();
        return { success: true, message: 'No active subscription found - status cleared' };
      }

      return { success: false, message: 'Failed to sync with Stripe, using local data' };
    }

    console.log('Stripe sync response:', data);
    clearSubscriptionCache();

    return {
      success: true,
      message: data?.message || 'Subscription status synced successfully'
    };

  } catch (err) {
    console.error('Unexpected error syncing subscription:', err);
    return { success: false, message: 'Unexpected error occurred' };
  }
}

/**
 * Force logout user if they don't have an active subscription
 */
export async function enforceSubscriptionAccess(userId: string): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, is_admin, trial_ends_at')
    .eq('id', userId)
    .single();

  const isAdmin = profile?.is_admin === true;
  const hasActiveSubscription = profile?.subscription_status === 'active' || profile?.subscription_status === 'past_due';
  const hasActiveTrial = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();

  if (!isAdmin && !hasActiveSubscription && !hasActiveTrial) {
    console.log('⚠️ User does not have valid access - signing out');
    await supabase.auth.signOut();
    window.location.href = '/pricing';
  }
}