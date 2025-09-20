import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  loading: boolean;
  subscription: any | null;
}

export const useSubscription = (): SubscriptionStatus => {
  const { user } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    checkSubscription();
  }, [user]);

  const checkSubscription = async () => {
    if (!user) {
      setHasActiveSubscription(false);
      setLoading(false);
      return;
    }

    try {
      // Check for active subscription in database
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.log('Error checking subscription:', error);
        // Don't throw - just set defaults
        setHasActiveSubscription(false);
        setSubscription(null);
        return;
      }

      if (data) {
        setHasActiveSubscription(true);
        setSubscription(data);
      } else {
        setHasActiveSubscription(false);
        setSubscription(null);
      }
    } catch (err) {
      console.error('Failed to check subscription:', err);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  return { hasActiveSubscription, loading, subscription };
};