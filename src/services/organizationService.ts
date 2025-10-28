import { supabase } from '../lib/supabase';

export interface OrganizationMetrics {
  date: string;
  totalMembers: number;
  activeMembers: number;
  avgBurnoutScore: number;
  avgConfidenceLevel: number;
  highBurnoutCount: number;
  lowConfidenceCount: number;
  totalReflections: number;
  totalStressResets: number;
}

export interface OrganizationAlert {
  id: string;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  actionItems: string[];
  createdAt: string;
  isRead: boolean;
}

export interface Organization {
  id: string;
  name: string;
  totalMembers: number;
  settings: any;
}

/**
 * Get access token for REST API calls
 */
async function getAccessToken(): Promise<string | null> {
  try {
    // Try localStorage first
    const authKey = Object.keys(localStorage).find(key => key.includes('supabase.auth.token'));
    if (authKey) {
      const authData = JSON.parse(localStorage.getItem(authKey) || '{}');
      const token = authData.access_token || authData.currentSession?.access_token;
      if (token) return token;
    }
  } catch (e) {
    console.warn('Could not get token from localStorage:', e);
  }
  
  // Fallback to getSession
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Service for fetching organization data
 */
export const organizationService = {
  /**
   * Get organization details for the current user
   */
  async getOrganization(organizationId: string): Promise<Organization | null> {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        console.error('No access token available');
        return null;
      }

      // Get organization details
      const orgUrl = new URL(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/organizations`);
      orgUrl.searchParams.set('id', `eq.${organizationId}`);
      orgUrl.searchParams.set('select', 'id,name,settings');
      
      const orgResponse = await fetch(orgUrl.toString(), {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.pgrst.object+json'
        }
      });

      if (!orgResponse.ok) {
        throw new Error(`HTTP ${orgResponse.status}`);
      }

      const data = await orgResponse.json();

      // Get member count
      const countUrl = new URL(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/organization_members`);
      countUrl.searchParams.set('organization_id', `eq.${organizationId}`);
      countUrl.searchParams.set('is_active', 'eq.true');
      countUrl.searchParams.set('select', 'id');
      
      const countResponse = await fetch(countUrl.toString(), {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Prefer': 'count=exact'
        }
      });

      const countHeader = countResponse.headers.get('content-range');
      const count = countHeader ? parseInt(countHeader.split('/')[1]) : 0;

      return {
        id: data.id,
        name: data.name,
        totalMembers: count || 0,
        settings: data.settings
      };
    } catch (error) {
      console.error('Error fetching organization:', error);
      return null;
    }
  },

  /**
   * Get latest metrics for an organization
   */
  async getLatestMetrics(organizationId: string): Promise<OrganizationMetrics | null> {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        console.error('No access token available');
        return null;
      }

      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/organization_metrics_cache`);
      url.searchParams.set('organization_id', `eq.${organizationId}`);
      url.searchParams.set('order', 'date.desc');
      url.searchParams.set('limit', '1');
      
      const response = await fetch(url.toString(), {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // No metrics yet - return zeros
      if (!data || data.length === 0) {
        return {
          date: new Date().toISOString().split('T')[0],
          totalMembers: 0,
          activeMembers: 0,
          avgBurnoutScore: 0,
          avgConfidenceLevel: 0,
          highBurnoutCount: 0,
          lowConfidenceCount: 0,
          totalReflections: 0,
          totalStressResets: 0
        };
      }

      const metric = data[0];
      return {
        date: metric.date,
        totalMembers: metric.total_members,
        activeMembers: metric.active_members,
        avgBurnoutScore: parseFloat(metric.avg_burnout_score) || 0,
        avgConfidenceLevel: parseFloat(metric.avg_confidence_level) || 0,
        highBurnoutCount: metric.high_burnout_count,
        lowConfidenceCount: metric.low_confidence_count,
        totalReflections: metric.total_reflections,
        totalStressResets: metric.total_stress_resets
      };
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return null;
    }
  },

  /**
   * Get recent alerts for an organization
   */
  async getRecentAlerts(organizationId: string, limit: number = 10): Promise<OrganizationAlert[]> {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        console.error('No access token available');
        return [];
      }

      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/organization_alerts`);
      url.searchParams.set('organization_id', `eq.${organizationId}`);
      url.searchParams.set('order', 'created_at.desc');
      url.searchParams.set('limit', limit.toString());
      
      const response = await fetch(url.toString(), {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      return (data || []).map((alert: any) => ({
        id: alert.id,
        alertType: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        actionItems: alert.action_items || [],
        createdAt: alert.created_at,
        isRead: alert.is_read
      }));
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  },

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId: string): Promise<boolean> {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        console.error('No access token available');
        return false;
      }

      const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/organization_alerts`);
      url.searchParams.set('id', `eq.${alertId}`);
      
      const response = await fetch(url.toString(), {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ is_read: true })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      return false;
    }
  }
};
