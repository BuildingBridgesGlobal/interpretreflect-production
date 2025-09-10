/**
 * Pre-Assignment Service
 * 
 * Handles all Supabase operations for Pre-Assignment Prep data
 * Including saving, retrieving, and analyzing responses
 * 
 * @module preAssignmentService
 */

import { supabase } from '../lib/supabase';

/**
 * Response data structure for Pre-Assignment Prep V2
 */
export interface PreAssignmentResponseV2 {
  // Metadata
  user_id: string;
  assignment_id?: string;
  created_at?: string;
  updated_at?: string;
  completion_time?: number;
  
  // Role-Space Awareness
  role_boundaries?: number; // Scale 1-10
  role_challenges?: string;
  role_strategies?: string[];
  
  // Neuroscience/Mental Readiness
  attention_reset?: string;
  cognitive_load_assessment?: number; // Scale 1-10
  mental_preparation?: string;
  
  // Ethics & Reflective Practice
  ethical_concerns?: string;
  ethical_framework?: string[];
  reflective_practice?: string;
  
  // Emotional Readiness
  emotional_state?: string[];
  emotional_regulation?: string;
  self_care_plan?: string;
  
  // Strategic Planning
  success_metrics?: string;
  contingency_planning?: string[];
  growth_intention?: string;
  
  // Analytics metadata
  question_timings?: Record<string, number>; // Time spent on each question
  revision_count?: number; // How many times user went back
  total_duration?: number; // Total time in seconds
}

/**
 * Growth insights derived from responses
 */
export interface GrowthInsights {
  strengths: string[];
  areas_for_development: string[];
  patterns: string[];
  recommendations: string[];
  progress_score: number;
}

/**
 * Service class for Pre-Assignment operations
 */
class PreAssignmentService {
  /**
   * Save or update pre-assignment responses
   */
  async saveResponses(userId: string, responses: Partial<PreAssignmentResponseV2>): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      // Check if user already has a draft
      const { data: existing, error: fetchError } = await supabase
        .from('reflections')
        .select('id')
        .eq('user_id', userId)
        .eq('reflection_type', 'pre_assignment_v2')
        .eq('status', 'draft')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const reflectionData = {
        user_id: userId,
        reflection_type: 'pre_assignment_v2',
        status: responses.completion_time ? 'completed' : 'draft',
        data: responses,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        // Update existing draft
        result = await supabase
          .from('reflections')
          .update(reflectionData)
          .eq('id', existing.id)
          .select();
      } else {
        // Create new entry
        result = await supabase
          .from('reflections')
          .insert({
            ...reflectionData,
            created_at: new Date().toISOString()
          })
          .select();
      }

      if (result.error) throw result.error;

      return { 
        success: true, 
        id: result.data?.[0]?.id 
      };
    } catch (error) {
      console.error('Error saving pre-assignment responses:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save responses' 
      };
    }
  }

  /**
   * Retrieve user's pre-assignment responses
   */
  async getResponses(userId: string, assignmentId?: string): Promise<PreAssignmentResponseV2 | null> {
    try {
      const query = supabase
        .from('reflections')
        .select('*')
        .eq('user_id', userId)
        .eq('reflection_type', 'pre_assignment_v2')
        .order('created_at', { ascending: false })
        .limit(1);

      if (assignmentId) {
        query.eq('data->assignment_id', assignmentId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No data found
        }
        throw error;
      }

      return data?.data as PreAssignmentResponseV2;
    } catch (error) {
      console.error('Error retrieving pre-assignment responses:', error);
      return null;
    }
  }

  /**
   * Get all completed pre-assignments for growth analysis
   */
  async getAllCompletedResponses(userId: string): Promise<PreAssignmentResponseV2[]> {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('data, created_at')
        .eq('user_id', userId)
        .eq('reflection_type', 'pre_assignment_v2')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(item => ({
        ...item.data,
        created_at: item.created_at
      })) || [];
    } catch (error) {
      console.error('Error retrieving all responses:', error);
      return [];
    }
  }

  /**
   * Analyze responses to generate growth insights
   */
  async analyzeGrowth(userId: string): Promise<GrowthInsights> {
    try {
      const responses = await this.getAllCompletedResponses(userId);
      
      if (responses.length === 0) {
        return {
          strengths: [],
          areas_for_development: [],
          patterns: [],
          recommendations: [],
          progress_score: 0
        };
      }

      // Analyze patterns across responses
      const insights: GrowthInsights = {
        strengths: [],
        areas_for_development: [],
        patterns: [],
        recommendations: [],
        progress_score: 0
      };

      // Analyze cognitive load trends
      const cognitiveLoads = responses
        .map(r => r.cognitive_load_assessment)
        .filter(Boolean) as number[];
      
      if (cognitiveLoads.length > 0) {
        const avgCognitiveLoad = cognitiveLoads.reduce((a, b) => a + b, 0) / cognitiveLoads.length;
        
        if (avgCognitiveLoad >= 7) {
          insights.strengths.push('Consistently high mental readiness');
        } else if (avgCognitiveLoad <= 4) {
          insights.areas_for_development.push('Mental preparation and cognitive load management');
          insights.recommendations.push('Consider implementing pre-assignment mindfulness routines');
        }

        // Check for improvement trend
        if (cognitiveLoads.length >= 3) {
          const recentAvg = cognitiveLoads.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
          const olderAvg = cognitiveLoads.slice(-3).reduce((a, b) => a + b, 0) / 3;
          
          if (recentAvg > olderAvg + 1) {
            insights.patterns.push('Improving mental readiness over time');
            insights.progress_score += 20;
          }
        }
      }

      // Analyze role boundary clarity
      const roleBoundaries = responses
        .map(r => r.role_boundaries)
        .filter(Boolean) as number[];
      
      if (roleBoundaries.length > 0) {
        const avgRoleBoundaries = roleBoundaries.reduce((a, b) => a + b, 0) / roleBoundaries.length;
        
        if (avgRoleBoundaries >= 8) {
          insights.strengths.push('Strong professional boundary awareness');
          insights.progress_score += 15;
        } else if (avgRoleBoundaries <= 5) {
          insights.areas_for_development.push('Role boundary clarity');
          insights.recommendations.push('Review professional boundary guidelines and practice role clarification scripts');
        }
      }

      // Analyze emotional patterns
      const emotionalStates = responses
        .flatMap(r => r.emotional_state || [])
        .filter(Boolean);
      
      const emotionFrequency: Record<string, number> = {};
      emotionalStates.forEach(emotion => {
        emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
      });

      const mostCommonEmotions = Object.entries(emotionFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([emotion]) => emotion);

      if (mostCommonEmotions.length > 0) {
        insights.patterns.push(`Common emotional states: ${mostCommonEmotions.join(', ')}`);
        
        const positiveEmotions = ['Calm', 'Confident', 'Energized', 'Focused', 'Optimistic', 'Prepared', 'Grounded'];
        const positiveCount = mostCommonEmotions.filter(e => positiveEmotions.includes(e)).length;
        
        if (positiveCount >= 2) {
          insights.strengths.push('Generally positive emotional readiness');
          insights.progress_score += 15;
        }
      }

      // Analyze strategy consistency
      const strategies = responses
        .flatMap(r => r.role_strategies || [])
        .filter(Boolean);
      
      const strategyFrequency: Record<string, number> = {};
      strategies.forEach(strategy => {
        strategyFrequency[strategy] = (strategyFrequency[strategy] || 0) + 1;
      });

      const consistentStrategies = Object.entries(strategyFrequency)
        .filter(([, count]) => count >= responses.length * 0.6)
        .map(([strategy]) => strategy);

      if (consistentStrategies.length > 0) {
        insights.strengths.push(`Consistent use of effective strategies: ${consistentStrategies.slice(0, 2).join(', ')}`);
        insights.progress_score += 20;
      }

      // Calculate overall progress score
      insights.progress_score = Math.min(100, insights.progress_score + (responses.length * 5));

      // Generate personalized recommendations
      if (insights.areas_for_development.length > 0) {
        insights.recommendations.push('Focus on identified development areas in upcoming assignments');
      }

      if (responses.length >= 5) {
        insights.recommendations.push('Consider creating a personal best practices document based on your successful strategies');
      }

      return insights;
    } catch (error) {
      console.error('Error analyzing growth:', error);
      return {
        strengths: [],
        areas_for_development: [],
        patterns: [],
        recommendations: [],
        progress_score: 0
      };
    }
  }

  /**
   * Link pre-assignment to post-assignment debrief
   */
  async linkToDebrief(preAssignmentId: string, postDebriefId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('assignment_links')
        .insert({
          pre_assignment_id: preAssignmentId,
          post_debrief_id: postDebriefId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error linking assignments:', error);
      return false;
    }
  }

  /**
   * Get comparative data between pre and post assignment
   */
  async getComparativeAnalysis(preAssignmentId: string, postDebriefId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('analyze_assignment_comparison', {
          pre_id: preAssignmentId,
          post_id: postDebriefId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting comparative analysis:', error);
      return null;
    }
  }
}

// Export singleton instance
export const preAssignmentService = new PreAssignmentService();