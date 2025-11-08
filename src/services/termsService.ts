import { createClient } from "../lib/supabase/client";
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from "../content/termsAndConditions";

const supabase = createClient();

export interface TermsAcceptance {
  userId: string;
  termsVersion: string;
  privacyVersion: string;
  acceptedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface TermsStatus {
  hasAcceptedCurrent: boolean;
  needsAcceptance: boolean;
  currentTermsVersion: string;
  currentPrivacyVersion: string;
  lastAcceptedTermsVersion?: string;
  lastAcceptedPrivacyVersion?: string;
  lastAcceptedAt?: Date;
}

class TermsService {
  private static instance: TermsService;

  private constructor() {}

  static getInstance(): TermsService {
    if (!TermsService.instance) {
      TermsService.instance = new TermsService();
    }
    return TermsService.instance;
  }

  /**
   * Check if user has accepted current terms
   */
  async checkTermsStatus(userId: string): Promise<TermsStatus> {
    try {
      // First, ensure the table exists
      await this.ensureTermsTableExists();

      // Get user's latest terms acceptance
      const { data, error } = await supabase
        .from('terms_acceptances')
        .select('*')
        .eq('user_id', userId)
        .order('accepted_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking terms status:', error);
        // Return needs acceptance if there's an error
        return {
          hasAcceptedCurrent: false,
          needsAcceptance: true,
          currentTermsVersion: TERMS_AND_CONDITIONS.version,
          currentPrivacyVersion: PRIVACY_POLICY.version
        };
      }

      const currentTermsVersion = TERMS_AND_CONDITIONS.version;
      const currentPrivacyVersion = PRIVACY_POLICY.version;

      if (!data) {
        // User has never accepted terms
        return {
          hasAcceptedCurrent: false,
          needsAcceptance: true,
          currentTermsVersion,
          currentPrivacyVersion
        };
      }

      // Check if accepted versions match current versions
      const hasAcceptedCurrentTerms = data.terms_version === currentTermsVersion;
      const hasAcceptedCurrentPrivacy = data.privacy_version === currentPrivacyVersion;
      const hasAcceptedCurrent = hasAcceptedCurrentTerms && hasAcceptedCurrentPrivacy;

      return {
        hasAcceptedCurrent,
        needsAcceptance: !hasAcceptedCurrent,
        currentTermsVersion,
        currentPrivacyVersion,
        lastAcceptedTermsVersion: data.terms_version,
        lastAcceptedPrivacyVersion: data.privacy_version,
        lastAcceptedAt: new Date(data.accepted_at)
      };
    } catch (error) {
      console.error('Error checking terms status:', error);
      // Default to requiring acceptance on error
      return {
        hasAcceptedCurrent: false,
        needsAcceptance: true,
        currentTermsVersion: TERMS_AND_CONDITIONS.version,
        currentPrivacyVersion: PRIVACY_POLICY.version
      };
    }
  }

  /**
   * Record user's acceptance of terms
   */
  async acceptTerms(userId: string, metadata?: { ipAddress?: string; userAgent?: string }): Promise<boolean> {
    try {
      // First try using the RPC function if it exists
      const { data: rpcResult, error: rpcError } = await supabase.rpc('record_terms_acceptance', {
        p_terms_version: TERMS_AND_CONDITIONS.version,
        p_privacy_version: PRIVACY_POLICY.version,
        p_ip_address: metadata?.ipAddress || null,
        p_user_agent: metadata?.userAgent || null,
        p_terms_hash: this.hashContent(TERMS_AND_CONDITIONS.content),
        p_privacy_hash: this.hashContent(PRIVACY_POLICY.content)
      });

      if (!rpcError && rpcResult?.success) {
        console.log('Terms acceptance recorded successfully via RPC');
        return true;
      }

      // Fallback to direct table insertion if RPC fails
      console.log('RPC failed, falling back to direct insertion', rpcError);
      await this.ensureTermsTableExists();

      const acceptance = {
        user_id: userId,
        terms_version: TERMS_AND_CONDITIONS.version,
        privacy_version: PRIVACY_POLICY.version,
        accepted_at: new Date().toISOString(),
        ip_address: metadata?.ipAddress || null,
        user_agent: metadata?.userAgent || null,
        terms_content_hash: this.hashContent(TERMS_AND_CONDITIONS.content),
        privacy_content_hash: this.hashContent(PRIVACY_POLICY.content)
      };

      const { error } = await supabase
        .from('terms_acceptances')
        .insert(acceptance);

      if (error) {
        console.error('Error recording terms acceptance:', error);
        return false;
      }

      // Also update user profile to track current acceptance
      await supabase
        .from('profiles')
        .update({
          terms_accepted_at: new Date().toISOString(),
          terms_version: TERMS_AND_CONDITIONS.version,
          privacy_version: PRIVACY_POLICY.version
        })
        .eq('id', userId);

      return true;
    } catch (error) {
      console.error('Error accepting terms:', error);
      return false;
    }
  }

  /**
   * Get full terms acceptance history for a user
   */
  async getAcceptanceHistory(userId: string): Promise<TermsAcceptance[]> {
    try {
      const { data, error } = await supabase
        .from('terms_acceptances')
        .select('*')
        .eq('user_id', userId)
        .order('accepted_at', { ascending: false });

      if (error) {
        console.error('Error fetching acceptance history:', error);
        return [];
      }

      return data.map(record => ({
        userId: record.user_id,
        termsVersion: record.terms_version,
        privacyVersion: record.privacy_version,
        acceptedAt: new Date(record.accepted_at),
        ipAddress: record.ip_address,
        userAgent: record.user_agent
      }));
    } catch (error) {
      console.error('Error getting acceptance history:', error);
      return [];
    }
  }

  /**
   * Ensure terms acceptance table exists
   */
  private async ensureTermsTableExists(): Promise<void> {
    try {
      // Check if table exists by trying to select from it
      const { error } = await supabase
        .from('terms_acceptances')
        .select('user_id')
        .limit(1);

      if (error && error.code === '42P01') { // Table doesn't exist
        // Create the table using raw SQL
        const { error: createError } = await supabase.rpc('create_terms_table', {
          sql: `
            CREATE TABLE IF NOT EXISTS terms_acceptances (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
              terms_version VARCHAR(50) NOT NULL,
              privacy_version VARCHAR(50) NOT NULL,
              accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
              ip_address VARCHAR(45),
              user_agent TEXT,
              terms_content_hash VARCHAR(64),
              privacy_content_hash VARCHAR(64),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_terms_user_id ON terms_acceptances(user_id);
            CREATE INDEX IF NOT EXISTS idx_terms_accepted_at ON terms_acceptances(accepted_at);

            -- Also ensure profiles table has necessary columns
            ALTER TABLE profiles
            ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
            ADD COLUMN IF NOT EXISTS terms_version VARCHAR(50),
            ADD COLUMN IF NOT EXISTS privacy_version VARCHAR(50);
          `
        });

        if (createError) {
          console.error('Error creating terms table:', createError);
        }
      }
    } catch (error) {
      console.error('Error ensuring terms table exists:', error);
    }
  }

  /**
   * Simple hash function for content versioning
   */
  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Check if terms have been updated since user's last acceptance
   */
  async hasTermsBeenUpdated(userId: string): Promise<boolean> {
    const status = await this.checkTermsStatus(userId);
    return status.needsAcceptance;
  }

  /**
   * Get current terms and privacy content
   */
  getTermsContent() {
    return {
      terms: TERMS_AND_CONDITIONS,
      privacy: PRIVACY_POLICY
    };
  }

  /**
   * Format terms for display
   */
  formatTermsForDisplay(type: 'terms' | 'privacy' = 'terms') {
    const content = type === 'terms' ? TERMS_AND_CONDITIONS : PRIVACY_POLICY;
    return {
      version: content.version,
      effectiveDate: content.effectiveDate,
      lastUpdated: content.lastUpdated,
      content: content.content
    };
  }
}

export const termsService = TermsService.getInstance();