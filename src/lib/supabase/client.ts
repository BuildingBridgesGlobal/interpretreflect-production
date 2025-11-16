import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Type definitions for database tables
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          professional_title: string | null;
          certifications: string[] | null;
          years_experience: number | null;
          specializations: string[] | null;
          timezone: string | null;
          subscription_tier: 'free' | 'premium' | 'pro' | 'agency';
          subscription_status: 'active' | 'canceled' | 'expired' | 'trial';
          trial_ends_at: string | null;
          subscription_starts_at: string | null;
          notification_preferences: Record<string, any>;
          performance_goals: Record<string, any>;
          onboarding_completed: boolean;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      baseline_checks: {
        Row: {
          id: string;
          user_id: string;
          cognitive_load: number;
          capacity_reserve: number;
          performance_readiness: number;
          recovery_quality: number;
          notes: string | null;
          tags: string[] | null;
          created_at: string;
          check_in_date: string;
        };
        Insert: Omit<Database['public']['Tables']['baseline_checks']['Row'], 'id' | 'created_at' | 'check_in_date'>;
        Update: Partial<Database['public']['Tables']['baseline_checks']['Insert']>;
      };
      quick_reflect_entries: {
        Row: {
          id: string;
          user_id: string;
          assignment_type: string;
          duration_minutes: number;
          setting_type: string | null;
          performance_rating: number;
          cognitive_load_rating: number;
          challenge_areas: string[] | null;
          success_moments: string[] | null;
          new_vocabulary: string[] | null;
          skills_practiced: string[] | null;
          reflection_notes: string | null;
          ai_insights: Record<string, any> | null;
          ai_processed: boolean;
          created_at: string;
          assignment_date: string;
        };
        Insert: Omit<Database['public']['Tables']['quick_reflect_entries']['Row'], 'id' | 'created_at' | 'assignment_date' | 'ai_processed'>;
        Update: Partial<Database['public']['Tables']['quick_reflect_entries']['Insert']>;
      };
    };
  };
};
