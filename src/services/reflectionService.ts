import { supabase } from '../lib/supabase';

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
      console.log('ReflectionService - saveReflection called:', { userId, entryKind, data });
      
      if (!userId) {
        throw new Error('User ID is required for saving reflections');
      }

      const entry: ReflectionEntry = {
        user_id: userId,
        entry_kind: entryKind,
        data: data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('ReflectionService - Attempting to insert:', entry);

      const { data: savedEntry, error } = await supabase
        .from('reflection_entries')
        .insert([entry])
        .select()
        .single();

      if (error) {
        console.error('ReflectionService - Error saving reflection:', error);
        // If table doesn't exist, provide helpful error
        if (error.code === '42P01') {
          return { 
            success: false, 
            error: 'Database tables not set up. Please run the SQL migrations first.' 
          };
        }
        return { success: false, error: error.message };
      }

      console.log('ReflectionService - Saved successfully:', savedEntry);

      // Also update daily activity to track streaks
      await this.updateDailyActivity(userId);

      console.log(`ReflectionService - Reflection saved successfully for user ${userId}:`, entryKind);
      return { success: true, id: savedEntry.id };
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
      
      const query = supabase
        .from('reflection_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('ReflectionService - Error fetching reflections:', error);
        return [];
      }

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