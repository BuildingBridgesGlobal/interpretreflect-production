import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface OrganizationRole {
  isOrgAdmin: boolean;
  isOrgOwner: boolean;
  organizations: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  loading: boolean;
}

/**
 * Hook to check if current user is an organization admin/owner
 * Used to show/hide the "Team Dashboard" tab
 */
export const useOrganizationRole = (): OrganizationRole => {
  const { user } = useAuth();
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isOrgOwner, setIsOrgOwner] = useState(false);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOrganizationRole = async () => {
      if (!user) {
        setIsOrgAdmin(false);
        setIsOrgOwner(false);
        setOrganizations([]);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Checking org role for user:', user.id);
        
        // Use direct REST API to bypass RLS issues
        let accessToken: string | null = null;
        
        // Get token from localStorage
        try {
          const authKey = Object.keys(localStorage).find(key => key.includes('supabase.auth.token'));
          if (authKey) {
            const authData = JSON.parse(localStorage.getItem(authKey) || '{}');
            accessToken = authData.access_token || authData.currentSession?.access_token;
          }
        } catch (e) {
          console.warn('Could not get token from localStorage:', e);
        }
        
        // Fallback to getSession if needed
        if (!accessToken) {
          const { data: { session } } = await supabase.auth.getSession();
          accessToken = session?.access_token || null;
        }
        
        if (!accessToken) {
          console.error('No access token available');
          setLoading(false);
          return;
        }
        
        // Build REST API URL
        const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/organization_members`);
        url.searchParams.set('user_id', `eq.${user.id}`);
        url.searchParams.set('is_active', 'eq.true');
        url.searchParams.set('role', 'in.(admin,owner)');
        url.searchParams.set('select', 'role,is_active,organization_id');
        
        console.log('🌐 Fetching org role via REST API');
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        
        const memberships = await response.json();
        const error = null;

        console.log('📊 Memberships query result:', { memberships, error });

        if (error) {
          console.error('❌ Error checking organization role:', error);
          setLoading(false);
          return;
        }

        if (memberships && memberships.length > 0) {
          const hasAdminRole = memberships.some(m => m.role === 'admin' || m.role === 'owner');
          const hasOwnerRole = memberships.some(m => m.role === 'owner');
          
          console.log('✅ User IS an org admin!', { hasAdminRole, hasOwnerRole });
          
          setIsOrgAdmin(hasAdminRole);
          setIsOrgOwner(hasOwnerRole);
          
          // Simplified - just store org IDs for now
          const orgs = memberships.map(m => ({
            id: m.organization_id,
            name: 'Organization', // We'll fetch names later if needed
            role: m.role
          }));
          
          setOrganizations(orgs);
        } else {
          console.log('❌ User is NOT an org admin');
          setIsOrgAdmin(false);
          setIsOrgOwner(false);
          setOrganizations([]);
        }
      } catch (error) {
        console.error('Error in useOrganizationRole:', error);
      } finally {
        setLoading(false);
      }
    };

    checkOrganizationRole();
  }, [user]);

  return { isOrgAdmin, isOrgOwner, organizations, loading };
};
