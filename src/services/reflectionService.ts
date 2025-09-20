import { supabase } from '../lib/supabase';
import { getSessionToken } from './directSupabaseApi';
import { saveWellnessMetrics } from './wellnessMetricsService';

/**
 * Service for managing all reflection-related data operations
 * Ensures proper user isolation and data tracking for Growth Insights
 */

export interface ReflectionEntry {
  id?: string;
  user_id: string;
  entry_kind: string;
  data: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface StressResetLog {
  id?: string;
  user_id: string;
  tool_type: string;
  duration_minutes?: number;
  stress_level_before?: number;
  stress_level_after?: number;
  notes?: string;
  created_at?: string;
}

export interface DailyActivity {
  id?: string;
  user_id: string;
  activity_date: string;
  activities_completed: string[];
  created_at?: string;
}

class ReflectionService {
  /**
   * Save a reflection entry to Supabase
   * This is the main function for saving all types of reflections
   */
  async saveReflection(
    userId: string,
    entryKind: string,
    data: Record<string, any>
  ): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      console.log('ReflectionService - saveReflection called with entryKind:', entryKind);
      console.log('ReflectionService - Data keys being saved:', Object.keys(data).slice(0, 10));

      if (!userId) {
        throw new Error('User ID is required for saving reflections');
      }

      const entry = {
        user_id: userId,
        entry_kind: entryKind,
        data: data
      };

      console.log('ReflectionService - Attempting to insert:', entry);

      // Use direct REST API since Supabase client is hanging
      try {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

        console.log('ReflectionService - Supabase URL:', SUPABASE_URL);
        console.log('ReflectionService - Has Anon Key:', !!SUPABASE_ANON_KEY);

        // Try to get token from localStorage since Supabase client is broken
        console.log('ReflectionService - Getting session from localStorage...');
        let accessToken: string | null = null;

        try {
          // Look for the Supabase auth token in localStorage
          const storageKey = 'supabase.auth.token';
          const storedData = localStorage.getItem(storageKey);

          if (storedData) {
            const parsed = JSON.parse(storedData);
            accessToken = parsed?.currentSession?.access_token || parsed?.access_token || null;
            console.log('ReflectionService - Found token in localStorage');
          } else {
            console.log('ReflectionService - No stored session found');
          }
        } catch (e) {
          console.log('ReflectionService - Error reading localStorage:', e);
        }

        console.log('ReflectionService - Using direct API, token available:', !!accessToken);

        const url = `${SUPABASE_URL}/rest/v1/reflection_entries`;
        console.log('ReflectionService - Full URL:', url);
        console.log('ReflectionService - Payload:', JSON.stringify(entry));

        console.log('ReflectionService - Starting fetch...');
        const fetchPromise = fetch(url, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal' // Don't wait for response data
          },
          body: JSON.stringify(entry)
        });

        // Add timeout to fetch
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Fetch timed out after 5 seconds')), 5000);
        });

        console.log('ReflectionService - Waiting for response...');
        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

        console.log('ReflectionService - API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('ReflectionService - API error:', errorText);

          if (errorText.includes('JWT') || response.status === 401) {
            return { success: false, error: 'Session expired. Please refresh the page and try again.' };
          }

          return { success: false, error: errorText };
        }

        console.log('ReflectionService - Direct API insert successful');
      } catch (error) {
        console.error('ReflectionService - Direct API error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to save reflection'
        };
      }

      console.log('ReflectionService - Saved successfully (no data returned with minimal mode)');

      // Save wellness metrics and daily activity in background (non-blocking)
      // These use the broken Supabase client so we don't await them
      Promise.all([
        saveWellnessMetrics(userId, entryKind, data).catch(err =>
          console.log('Wellness metrics save failed (non-critical):', err)
        ),
        this.updateDailyActivity(userId).catch(err =>
          console.log('Daily activity update failed (non-critical):', err)
        )
      ]).then(() => {
        console.log('Background updates completed');
      }).catch(() => {
        console.log('Background updates failed (non-critical)');
      });

      console.log(`ReflectionService - Reflection saved successfully for user ${userId}:`, entryKind);
      return { success: true }; // No ID returned with minimal mode
    } catch (error) {
      console.error('Error in saveReflection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save reflection'
      };
    }
  }

  /**
   * Save a stress reset activity log
   */
  async saveStressResetLog(
    userId: string,
    toolType: string,
    data: {
      duration?: number;
      stressLevelBefore?: number;
      stressLevelAfter?: number;
      notes?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const log: StressResetLog = {
        user_id: userId,
        tool_type: toolType,
        duration_minutes: data.duration,
        stress_level_before: data.stressLevelBefore,
        stress_level_after: data.stressLevelAfter,
        notes: data.notes,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('stress_reset_logs')
        .insert([log]);

      if (error) {
        console.error('Error saving stress reset log:', error);
        if (error.code === '42P01') {
          return { 
            success: false, 
            error: 'Database tables not set up. Please run the SQL migrations first.' 
          };
        }
        return { success: false, error: error.message };
      }

      // Save wellness metrics if we have stress data
      if (data.stressLevelAfter !== undefined || data.stressLevelBefore !== undefined) {
        await saveWellnessMetrics(userId, 'stress_reset', {
          stressLevel: data.stressLevelAfter ?? data.stressLevelBefore,
          stressLevelBefore: data.stressLevelBefore,
          stressLevelAfter: data.stressLevelAfter
        });
      }

      // Update daily activity
      await this.updateDailyActivity(userId);

      console.log(`Stress reset log saved for user ${userId}:`, toolType);
      return { success: true };
    } catch (error) {
      console.error('Error in saveStressResetLog:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save stress reset log' 
      };
    }
  }

  /**
   * Update daily activity for streak tracking
   */
  async updateDailyActivity(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Check if activity already exists for today
      const { data: existing } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_date', today)
        .single();

      if (!existing) {
        // Create new daily activity record
        await supabase
          .from('daily_activity')
          .insert([{
            user_id: userId,
            activity_date: today,
            activities_completed: ['reflection'],
            created_at: new Date().toISOString()
          }]);
      } else {
        // Update existing record
        const activities = existing.activities_completed || [];
        if (!activities.includes('reflection')) {
          activities.push('reflection');
        }
        
        await supabase
          .from('daily_activity')
          .update({ 
            activities_completed: activities,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      }
    } catch (error) {
      console.error('Error updating daily activity:', error);
      // Don't throw - this is a non-critical update
    }
  }

  /**
   * Get all reflections for a specific user
   */
  async getUserReflections(
    userId: string,
    limit?: number
  ): Promise<ReflectionEntry[]> {
    try {
      console.log('ReflectionService - getUserReflections called for user:', userId);

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Get token from localStorage since Supabase client is broken
      let accessToken: string | null = null;
      try {
        const storageKey = 'supabase.auth.token';
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          accessToken = parsed?.currentSession?.access_token || parsed?.access_token || null;
        }
      } catch (e) {
        console.log('ReflectionService - Could not get token from localStorage');
      }

      let url = `${SUPABASE_URL}/rest/v1/reflection_entries?user_id=eq.${userId}&order=created_at.desc`;
      if (limit) {
        url += `&limit=${limit}`;
      }

      console.log('ReflectionService - Fetching from URL:', url);
      console.log('ReflectionService - Using token:', !!accessToken);

      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
        }
      });

      console.log('ReflectionService - Response status:', response.status);

      if (!response.ok) {
        const error = await response.text();

        // Check if it's a JWT error
        if (error.includes('JWT') || error.includes('PGRST303')) {
          console.log('ReflectionService - JWT expired, clearing session and returning empty');
          // Don't throw error on initial load - just return empty
          return [];
        }

        console.error('ReflectionService - Error fetching reflections:', error);
        return [];
      }

      const data = await response.json();
      console.log(`ReflectionService - Found ${data?.length || 0} reflections:`, data);
      return data || [];
    } catch (error) {
      console.error('Error in getUserReflections:', error);
      return [];
    }
  }

  /**
   * Get reflections by type for a specific user
   */
  async getUserReflectionsByType(
    userId: string,
    entryKind: string,
    limit?: number
  ): Promise<ReflectionEntry[]> {
    try {
      const query = supabase
        .from('reflection_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_kind', entryKind)
        .order('created_at', { ascending: false });

      if (limit) {
        query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reflections by type:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserReflectionsByType:', error);
      return [];
    }
  }

  /**
   * Get stress reset logs for a specific user
   */
  async getUserStressResetLogs(
    userId: string,
    startDate?: Date
  ): Promise<StressResetLog[]> {
    try {
      let query = supabase
        .from('stress_reset_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching stress reset logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserStressResetLogs:', error);
      return [];
    }
  }

  /**
   * Get daily activity for streak calculation
   */
  async getUserDailyActivity(
    userId: string,
    days: number = 365
  ): Promise<DailyActivity[]> {
    try {
      const { data, error } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('user_id', userId)
        .order('activity_date', { ascending: false })
        .limit(days);

      if (error) {
        console.error('Error fetching daily activity:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserDailyActivity:', error);
      return [];
    }
  }

  /**
   * Migrate existing localStorage data to Supabase
   * This helps preserve any existing user data
   */
  async migrateLocalStorageToSupabase(userId: string): Promise<void> {
    try {
      // Get existing localStorage data
      const localReflections = localStorage.getItem('savedReflections');
      const localTechniques = localStorage.getItem('techniqueUsage');
      
      if (localReflections) {
        const reflections = JSON.parse(localReflections);
        for (const reflection of reflections) {
          await this.saveReflection(
            userId,
            reflection.type || 'migrated_reflection',
            reflection.data || {}
          );
        }
        console.log('Migrated reflections from localStorage');
      }

      if (localTechniques) {
        const techniques = JSON.parse(localTechniques);
        for (const technique of techniques) {
          if (technique.completed) {
            await this.saveStressResetLog(userId, technique.technique, {
              stressLevelBefore: technique.stressLevelBefore,
              stressLevelAfter: technique.stressLevelAfter
            });
          }
        }
        console.log('Migrated stress reset logs from localStorage');
      }
    } catch (error) {
      console.error('Error migrating localStorage data:', error);
    }
  }
}

// Export singleton instance
export const reflectionService = new ReflectionService();