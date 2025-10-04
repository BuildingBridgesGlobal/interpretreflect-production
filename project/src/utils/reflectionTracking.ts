// Reflection tracking utilities for Supabase
import { supabase } from '../lib/supabase';

// Save a reflection to Supabase
export async function saveReflectionToSupabase(reflectionData: {
  type: string;
  content?: string;
  data?: any;
  confidence_level?: number;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user');
      return { data: null, error: new Error('Not authenticated') };
    }

    const saveData = {
      user_id: user.id,
      reflection_type: reflectionData.type,
      type: reflectionData.type,
      content: reflectionData.content || '',
      data: {
        ...reflectionData.data,
        confidence_level: reflectionData.confidence_level,
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('reflections')
      .insert(saveData)
      .select()
      .single();

    if (error) {
      console.error('Error saving reflection:', error);
      return { data: null, error };
    }

    console.log('✅ Reflection saved successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Failed to save reflection:', error);
    return { data: null, error };
  }
}

// Get reflection streak for current user
export async function getReflectionStreak() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user');
      return 0;
    }

    // Use the database function to calculate streak
    const { data, error } = await supabase
      .rpc('calculate_reflection_streak', { p_user_id: user.id });

    if (error) {
      console.error('Error getting reflection streak:', error);

      // Fallback: calculate streak manually
      const { data: reflections, error: fetchError } = await supabase
        .from('reflections')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError || !reflections) {
        console.error('Error fetching reflections:', fetchError);
        return 0;
      }

      return calculateStreakFromReflections(reflections);
    }

    return data || 0;
  } catch (error) {
    console.error('Failed to get reflection streak:', error);
    return 0;
  }
}

// Calculate streak from reflections array (fallback method)
function calculateStreakFromReflections(reflections: Array<{ created_at: string }>) {
  if (reflections.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  // Group reflections by date
  const reflectionDates = new Set(
    reflections.map(r => {
      const date = new Date(r.created_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );

  // Check consecutive days starting from today
  while (streak < 365) {
    if (reflectionDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (streak === 0) {
      // Check if streak starts from yesterday
      currentDate.setDate(currentDate.getDate() - 1);
      if (reflectionDates.has(currentDate.getTime())) {
        streak = 1;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    } else {
      break; // Streak broken
    }
  }

  return streak;
}

// Get today's reflections for confidence level
export async function getTodayReflections() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user');
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching today reflections:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get today reflections:', error);
    return [];
  }
}

// Get reflection statistics
export async function getReflectionStats() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user');
      return null;
    }

    const { data, error } = await supabase
      .from('user_reflection_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching reflection stats:', error);
      // Fallback: get basic stats
      const { data: reflections } = await supabase
        .from('reflections')
        .select('created_at')
        .eq('user_id', user.id);

      return {
        total_reflections: reflections?.length || 0,
        current_streak: await getReflectionStreak(),
        last_reflection: reflections?.[0]?.created_at || null
      };
    }

    return data;
  } catch (error) {
    console.error('Failed to get reflection stats:', error);
    return null;
  }
}