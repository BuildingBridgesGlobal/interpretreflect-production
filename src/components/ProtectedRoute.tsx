import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresPaidAccount?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresPaidAccount = true
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setChecking(false);
        return;
      }

      // If route doesn't require paid account, allow access
      if (!requiresPaidAccount) {
        setHasAccess(true);
        setChecking(false);
        return;
      }

      // Check if user has an active paid subscription or is admin
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_tier, is_admin, trial_started_at, trial_ends_at')
          .eq('id', user.id)
          .single();

        if (!profile) {
          setHasAccess(false);
          setChecking(false);
          return;
        }

        // Allow access if:
        // 1. User is admin
        // 2. User has active subscription (including trialing)
        // 3. User has active trial
        const isAdmin = profile.is_admin === true;
        const hasActiveSubscription = profile.subscription_status === 'active' || profile.subscription_status === 'trialing';

        // Check if trial is still valid
        const hasActiveTrial = profile.trial_started_at &&
          profile.trial_ends_at &&
          new Date(profile.trial_ends_at) > new Date();

        const hasValidAccess = isAdmin || hasActiveSubscription || hasActiveTrial;

        console.log('Access check:', {
          userId: user.id,
          isAdmin,
          hasActiveSubscription,
          hasActiveTrial,
          hasValidAccess,
          subscriptionStatus: profile.subscription_status
        });

        setHasAccess(hasValidAccess);
        setChecking(false);
      } catch (error) {
        console.error('Error checking user access:', error);
        setHasAccess(false);
        setChecking(false);
      }
    };

    checkAccess();
  }, [user, requiresPaidAccount]);

  // Show loading state
  if (loading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to signup
  if (!user) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  // Logged in but no access - redirect to pricing/subscription page
  if (hasAccess === false) {
    return <Navigate to="/pricing" state={{ from: location, reason: 'subscription_required' }} replace />;
  }

  // Has access - render the protected content
  return <>{children}</>;
};
