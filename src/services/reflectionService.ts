/**
 * Reflection Service
 * Handles saving and retrieving reflections from Supabase
 */

import { supabase } from '../lib/supabase';
import { updateGrowthInsightsForUser } from './growthInsightsService';

export interface ReflectionData {
  id?: string;
  user_id: string;
  type: string;
  data: Record<string, any>;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ReflectionStats {
  totalReflections: number;
  weeklyReflections: number;
  monthlyReflections: number;
  streakDays: number;
  lastReflectionDate: string | null;
  topReflectionTypes: Array<{ type: string; count: number }>;
}

/**
 * Save a reflection to Supabase and update growth insights
 */
export async function saveReflectionToSupabase(
  userId: string,
  type: string,
  data: Record<string, any>
): Promise<{ success: boolean; error?: string; reflection?: ReflectionData }> {
  try {
    // Save to reflections table
    const { data: reflection, error } = await supabase
      .from('reflections')
      .insert({
        user_id: userId,
        type,
        answers: data,
        status: 'completed',
        metadata: {
          completed_at: new Date().toISOString(),
          source: 'web_app',
          version: '1.0'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update growth insights based on reflection type
    if (type.includes('Check') || type.includes('Reflection')) {
      await updateGrowthInsightsForUser(userId, data);
    }

    // Track reflection event for analytics
    await supabase
      .from('reflection_events')
      .insert({
        user_id: userId,
        event_type: 'reflection_completed',
        reflection_id: reflection.id,
        reflection_type: type,
        created_at: new Date().toISOString()
      });

    return { 
      success: true, 
      reflection: {
        ...reflection,
        data: reflection.answers
      }
    };
  } catch (error) {
    console.error('Error saving reflection:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save reflection' 
    };
  }
}

/**
 * Get recent reflections for a user
 */
export async function getUserReflections(
  userId: string,
  limit: number = 10,
  timePeriod?: 'week' | 'month' | '90days'
): Promise<{ success: boolean; error?: string; reflections?: ReflectionData[] }> {
  try {
    let query = supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply time filter if specified
    if (timePeriod) {
      const now = new Date();
      let startDate: Date;

      switch (timePeriod) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const reflections = data?.map(r => ({
      id: r.id,
      user_id: r.user_id,
      type: r.type,
      data: r.answers || {},
      timestamp: r.created_at,
      metadata: r.metadata
    })) || [];

    return { success: true, reflections };
  } catch (error) {
    console.error('Error fetching reflections:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch reflections' 
    };
  }
}

/**
 * Get reflection statistics for Growth Insights
 */
export async function getReflectionStats(
  userId: string
): Promise<{ success: boolean; error?: string; stats?: ReflectionStats }> {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all reflections for the user
    const { data: allReflections, error: allError } = await supabase
      .from('reflections')
      .select('id, type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (allError) throw allError;

    // Get weekly reflections
    const weeklyReflections = allReflections?.filter(r => 
      new Date(r.created_at) >= weekAgo
    ).length || 0;

    // Get monthly reflections
    const monthlyReflections = allReflections?.filter(r => 
      new Date(r.created_at) >= monthAgo
    ).length || 0;

    // Calculate streak days
    const streakDays = calculateStreakDays(allReflections || []);

    // Get top reflection types
    const typeCount: Record<string, number> = {};
    allReflections?.forEach(r => {
      typeCount[r.type] = (typeCount[r.type] || 0) + 1;
    });

    const topReflectionTypes = Object.entries(typeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const stats: ReflectionStats = {
      totalReflections: allReflections?.length || 0,
      weeklyReflections,
      monthlyReflections,
      streakDays,
      lastReflectionDate: allReflections?.[0]?.created_at || null,
      topReflectionTypes
    };

    return { success: true, stats };
  } catch (error) {
    console.error('Error fetching reflection stats:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch reflection stats' 
    };
  }
}

/**
 * Calculate streak days from reflections
 */
function calculateStreakDays(reflections: Array<{ created_at: string }>): number {
  if (reflections.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reflectionDates = reflections.map(r => {
    const date = new Date(r.created_at);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  });

  const uniqueDates = [...new Set(reflectionDates)].sort((a, b) => b - a);
  
  let streak = 0;
  let currentDate = today.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  for (const date of uniqueDates) {
    if (Math.abs(currentDate - date) <= oneDayMs) {
      streak++;
      currentDate = date;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get reflection insights for Growth Insights dashboard
 */
export async function getReflectionInsights(
  userId: string,
  timePeriod: 'week' | 'month' | '90days'
): Promise<{
  success: boolean;
  error?: string;
  insights?: {
    patterns: string[];
    recommendations: string[];
    achievements: string[];
    areasOfGrowth: string[];
  };
}> {
  try {
    const { reflections } = await getUserReflections(userId, 100, timePeriod);
    
    if (!reflections || reflections.length === 0) {
      return {
        success: true,
        insights: {
          patterns: ['Start building your reflection practice'],
          recommendations: ['Try a daily wellness check-in', 'Set reflection reminders'],
          achievements: [],
          areasOfGrowth: ['Consistency', 'Self-awareness']
        }
      };
    }

    // Analyze reflection data for patterns
    const patterns: string[] = [];
    const recommendations: string[] = [];
    const achievements: string[] = [];
    const areasOfGrowth: string[] = [];

    // Count reflection types
    const typeCount: Record<string, number> = {};
    reflections.forEach(r => {
      typeCount[r.type] = (typeCount[r.type] || 0) + 1;
    });

    // Identify patterns
    const mostFrequent = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (mostFrequent) {
      patterns.push(`Most frequent: ${mostFrequent[0]} (${mostFrequent[1]} times)`);
    }

    // Check for consistency
    const daysWithReflections = new Set(
      reflections.map(r => new Date(r.timestamp).toDateString())
    ).size;

    if (daysWithReflections >= 7) {
      achievements.push('Consistent weekly practice');
    } else if (daysWithReflections >= 3) {
      achievements.push('Regular reflection habit forming');
    }

    // Analyze content for common themes
    const allAnswers = reflections.flatMap(r => Object.values(r.data));
    
    // Check for stress-related keywords
    const stressKeywords = ['stress', 'overwhelmed', 'anxious', 'tired', 'burnout'];
    const hasStressThemes = allAnswers.some(answer => 
      typeof answer === 'string' && 
      stressKeywords.some(keyword => answer.toLowerCase().includes(keyword))
    );

    if (hasStressThemes) {
      patterns.push('Stress management focus detected');
      recommendations.push('Try stress-reset techniques', 'Schedule regular breaks');
    }

    // Check for growth themes
    const growthKeywords = ['learning', 'improving', 'progress', 'better', 'growth'];
    const hasGrowthThemes = allAnswers.some(answer => 
      typeof answer === 'string' && 
      growthKeywords.some(keyword => answer.toLowerCase().includes(keyword))
    );

    if (hasGrowthThemes) {
      achievements.push('Growth mindset demonstrated');
    }

    // Areas for growth based on reflection gaps
    const reflectionTypes = [
      'Wellness Check-in',
      'In-Session Self-Check',
      'Values Alignment Check-In',
      'Post-Assignment Debrief'
    ];

    const missingTypes = reflectionTypes.filter(type => !typeCount[type]);
    if (missingTypes.length > 0) {
      areasOfGrowth.push(`Try: ${missingTypes[0]}`);
    }

    return {
      success: true,
      insights: {
        patterns,
        recommendations,
        achievements,
        areasOfGrowth
      }
    };
  } catch (error) {
    console.error('Error generating reflection insights:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate insights'
    };
  }
}

/**
 * Integration with Elya AI Assistant
 * Prepare reflection data for Elya analysis
 */
export async function prepareDataForElya(
  userId: string,
  timePeriod: 'week' | 'month' | '90days'
): Promise<{
  success: boolean;
  error?: string;
  elyaData?: {
    userId: string;
    reflectionSummary: {
      totalCount: number;
      types: string[];
      dateRange: { start: string; end: string };
    };
    keyThemes: string[];
    emotionalPatterns: Array<{ emotion: string; frequency: number }>;
    recommendations: string[];
    integrationToken?: string;
  };
}> {
  try {
    const { reflections } = await getUserReflections(userId, 100, timePeriod);
    const { stats } = await getReflectionStats(userId);
    
    if (!reflections || !stats) {
      throw new Error('Unable to fetch reflection data');
    }

    // Extract emotional patterns from reflection data
    const emotionKeywords = {
      stressed: ['stress', 'overwhelmed', 'pressure'],
      anxious: ['anxious', 'worry', 'nervous'],
      calm: ['calm', 'peaceful', 'relaxed'],
      energized: ['energized', 'motivated', 'excited'],
      tired: ['tired', 'exhausted', 'fatigue']
    };

    const emotionalPatterns: Record<string, number> = {};
    
    reflections.forEach(r => {
      const content = JSON.stringify(r.data).toLowerCase();
      Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
        if (keywords.some(keyword => content.includes(keyword))) {
          emotionalPatterns[emotion] = (emotionalPatterns[emotion] || 0) + 1;
        }
      });
    });

    // Extract key themes
    const themes = new Set<string>();
    reflections.forEach(r => {
      if (r.type.includes('Wellness')) themes.add('wellness');
      if (r.type.includes('Values')) themes.add('values-alignment');
      if (r.type.includes('Team')) themes.add('team-collaboration');
      if (r.type.includes('Session')) themes.add('in-session-management');
    });

    // Generate Elya-specific recommendations
    const elyaRecommendations = [
      'Schedule weekly reflection review with Elya',
      'Use Elya for guided reflection prompts',
      'Ask Elya to analyze your growth patterns',
      'Request personalized wellness strategies from Elya'
    ];

    const now = new Date();
    const startDate = new Date(now);
    if (timePeriod === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timePeriod === 'month') {
      startDate.setDate(now.getDate() - 30);
    } else {
      startDate.setDate(now.getDate() - 90);
    }

    return {
      success: true,
      elyaData: {
        userId,
        reflectionSummary: {
          totalCount: reflections.length,
          types: [...new Set(reflections.map(r => r.type))],
          dateRange: {
            start: startDate.toISOString(),
            end: now.toISOString()
          }
        },
        keyThemes: Array.from(themes),
        emotionalPatterns: Object.entries(emotionalPatterns)
          .map(([emotion, frequency]) => ({ emotion, frequency }))
          .sort((a, b) => b.frequency - a.frequency),
        recommendations: elyaRecommendations,
        integrationToken: `elya_${userId}_${Date.now()}` // Temporary token for Elya integration
      }
    };
  } catch (error) {
    console.error('Error preparing data for Elya:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to prepare Elya data'
    };
  }
}