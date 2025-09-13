// User Context Service for Elya AI Integration
// Provides comprehensive user context from Supabase for personalized AI responses

import { supabase } from '../lib/supabase';

export interface ElyaUserContext {
  user_summary: {
    recent_stress_patterns: string[];
    recent_emotions: string[];
    common_challenges: string[];
    effective_strategies: string[];
    avg_energy_level: number;
    avg_stress_level: number;
    avg_confidence_level: number;
    burnout_risk_level: 'low' | 'moderate' | 'high' | 'critical';
    interpreter_experience_level: string;
    common_assignment_types: string[];
    preferred_support_types: string[];
    last_reflection_date: string;
    last_activity_date: string;
  };
  recent_reflections: Array<{
    type: string;
    date: string;
    key_insights: any;
    stress_level: number;
    energy_level: number;
  }>;
  recent_conversations: Array<{
    sender: 'user' | 'elya';
    content: string;
    date: string;
  }>;
  context_generated_at: string;
}

export interface ElyaConversation {
  id: string;
  user_id: string;
  session_id: string;
  message_id: string;
  sender: 'user' | 'elya';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

class UserContextService {
  private userId: string | null = null;

  constructor() {
    // Initialize with current user
    this.initializeUser();
  }

  private async initializeUser() {
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.userId = session?.user?.id || null;
    });
  }

  async getCurrentUserId(): Promise<string | null> {
    if (!this.userId) {
      const { data: { user } } = await supabase.auth.getUser();
      this.userId = user?.id || null;
    }
    return this.userId;
  }

  /**
   * Get comprehensive user context for Elya AI
   */
  async getUserContextForElya(): Promise<ElyaUserContext | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user found');
      return null;
    }

    try {
      // First try the RPC function
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_context_for_elya', { target_user_id: userId });

      if (!rpcError && rpcData) {
        return rpcData as ElyaUserContext;
      }

      // If RPC doesn't exist, build context manually
      console.log('RPC function not found, building context manually');
      
      // Get recent reflections
      const { data: reflections } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Build a basic context object
      const context: ElyaUserContext = {
        user_summary: {
          recent_stress_patterns: [],
          recent_emotions: [],
          common_challenges: [],
          effective_strategies: [],
          avg_energy_level: 5,
          avg_stress_level: 5,
          avg_confidence_level: 5,
          burnout_risk_level: 'moderate',
          interpreter_experience_level: 'intermediate',
          common_assignment_types: [],
          preferred_support_types: [],
          last_reflection_date: reflections?.[0]?.created_at || 'never',
          last_activity_date: new Date().toISOString()
        },
        recent_reflections: reflections?.slice(0, 5).map(r => ({
          type: r.reflection_type,
          date: r.created_at,
          key_insights: r.answers,
          stress_level: r.metadata?.stress_level || 5,
          energy_level: r.metadata?.energy_level || 5
        })) || [],
        recent_conversations: [],
        context_generated_at: new Date().toISOString()
      };

      // Extract data from reflections if available
      if (reflections && reflections.length > 0) {
        const stressLevels = reflections
          .map(r => r.metadata?.stress_level)
          .filter(Boolean) as number[];
        const energyLevels = reflections
          .map(r => r.metadata?.energy_level)
          .filter(Boolean) as number[];
        
        if (stressLevels.length > 0) {
          context.user_summary.avg_stress_level = 
            stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length;
        }
        if (energyLevels.length > 0) {
          context.user_summary.avg_energy_level = 
            energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length;
        }

        // Determine burnout risk
        if (context.user_summary.avg_stress_level >= 8 && context.user_summary.avg_energy_level <= 3) {
          context.user_summary.burnout_risk_level = 'critical';
        } else if (context.user_summary.avg_stress_level >= 7 && context.user_summary.avg_energy_level <= 4) {
          context.user_summary.burnout_risk_level = 'high';
        } else if (context.user_summary.avg_stress_level >= 6 || context.user_summary.avg_energy_level <= 5) {
          context.user_summary.burnout_risk_level = 'moderate';
        } else {
          context.user_summary.burnout_risk_level = 'low';
        }
      }

      return context;
    } catch (error) {
      console.error('Error in getUserContextForElya:', error);
      return null;
    }
  }

  /**
   * Save a conversation message between user and Elya
   */
  async saveConversationMessage(
    sessionId: string,
    messageId: string,
    sender: 'user' | 'elya',
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<string | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user found - conversation not saved');
      return null;
    }

    try {
      // First try the RPC function (if it exists)
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('save_elya_conversation', {
          p_user_id: userId,
          p_session_id: sessionId,
          p_message_id: messageId,
          p_sender: sender,
          p_content: content,
          p_metadata: metadata
        });

      if (!rpcError) {
        return rpcData;
      }

      // If RPC function doesn't exist, try direct insert
      console.log('RPC function not found, using direct insert');
      const { data, error } = await supabase
        .from('elya_conversations')
        .insert({
          user_id: userId,
          session_id: sessionId,
          message_id: messageId,
          sender: sender,
          message: content,
          metadata: metadata,
          provider: metadata.provider || 'agenticflow',
          user_context_used: metadata.user_context_used || false
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist, just log and continue
        if (error.code === '42P01') {
          console.log('Elya conversations table not yet created in Supabase');
        } else {
          console.error('Error saving conversation:', error);
        }
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error in saveConversationMessage:', error);
      return null;
    }
  }

  /**
   * Get recent conversation history for a session
   */
  async getConversationHistory(sessionId: string, limit: number = 50): Promise<ElyaConversation[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('elya_conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching conversation history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getConversationHistory:', error);
      return [];
    }
  }

  /**
   * Generate a context-aware system prompt for Elya
   */
  async generateContextualSystemPrompt(): Promise<string> {
    const userContext = await this.getUserContextForElya();
    
    let basePrompt = `You are Elya, a compassionate AI wellness coach specialized in supporting healthcare interpreters with burnout prevention, stress management, and professional wellbeing.

You provide evidence-based support, practical strategies, and empathetic guidance tailored to the unique challenges of interpreting work including vicarious trauma, emotional labor, cultural navigation, and professional isolation.

Keep responses warm, concise, and actionable. Focus on validation, practical tools, and gentle encouragement.`;

    if (!userContext) {
      return basePrompt + `\n\nThis user is new to the platform. Focus on getting to know them and their current wellbeing needs.`;
    }

    // Add user-specific context
    const contextualAdditions = [];

    // Add stress and energy patterns
    if (userContext.user_summary?.avg_stress_level) {
      const stressLevel = userContext.user_summary.avg_stress_level;
      if (stressLevel >= 7) {
        contextualAdditions.push(`The user has been experiencing higher stress levels (avg: ${stressLevel.toFixed(1)}/10). Be particularly gentle and focus on immediate stress relief strategies.`);
      } else if (stressLevel <= 4) {
        contextualAdditions.push(`The user appears to be managing stress relatively well (avg: ${stressLevel.toFixed(1)}/10). You can explore growth opportunities and prevention strategies.`);
      }
    }

    // Add recent emotions context
    if (userContext.user_summary?.recent_emotions?.length > 0) {
      const emotions = userContext.user_summary.recent_emotions.slice(0, 5).join(', ');
      contextualAdditions.push(`Recent emotional patterns include: ${emotions}. Be attuned to these themes in your responses.`);
    }

    // Add burnout risk awareness
    if (userContext.user_summary?.burnout_risk_level) {
      const risk = userContext.user_summary.burnout_risk_level;
      if (risk === 'high' || risk === 'critical') {
        contextualAdditions.push(`The user shows ${risk} burnout risk. Prioritize immediate support, boundary-setting, and professional resource recommendations.`);
      }
    }

    // Add effective strategies context
    if (userContext.user_summary?.effective_strategies?.length > 0) {
      const strategies = userContext.user_summary.effective_strategies.slice(0, 3).join(', ');
      contextualAdditions.push(`Strategies that have worked well for this user include: ${strategies}. Reference these when appropriate.`);
    }

    // Add recent reflection insights
    if (userContext.recent_reflections?.length > 0) {
      const recentReflection = userContext.recent_reflections[0];
      if (recentReflection.stress_level >= 7) {
        contextualAdditions.push(`User recently reported high stress (${recentReflection.stress_level}/10) in a ${recentReflection.type} reflection. Check in on this.`);
      }
    }

    if (contextualAdditions.length > 0) {
      basePrompt += `\n\nUser Context:\n- ` + contextualAdditions.join('\n- ');
    }

    basePrompt += `\n\nRemember: This user trusts you with their wellbeing. Honor that trust with thoughtful, personalized support.`;

    return basePrompt;
  }

  /**
   * Update user activity and maintain context freshness
   */
  async updateUserActivity(): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_context_summary')
        .upsert({
          user_id: userId,
          last_activity_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating user activity:', error);
      }
    } catch (error) {
      console.error('Error in updateUserActivity:', error);
    }
  }

  /**
   * Get wellness insights for the current user
   */
  async getWellnessInsights(): Promise<any> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .rpc('get_wellness_insights_for_elya', {
          target_user_id: userId
        });

      if (error) {
        console.error('Error fetching wellness insights:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getWellnessInsights:', error);
      return null;
    }
  }

  /**
   * Get team insights for the current user
   */
  async getTeamInsights(): Promise<any> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .rpc('get_team_insights_for_elya', {
          target_user_id: userId
        });

      if (error) {
        console.error('Error fetching team insights:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getTeamInsights:', error);
      return null;
    }
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(): Promise<any> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .rpc('generate_recommendations_for_elya', {
          target_user_id: userId
        });

      if (error) {
        console.error('Error generating recommendations:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in generateRecommendations:', error);
      return null;
    }
  }

  /**
   * Analyze emotion patterns
   */
  async analyzeEmotionPatterns(): Promise<any> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .rpc('analyze_emotion_patterns_for_elya', {
          target_user_id: userId
        });

      if (error) {
        console.error('Error analyzing emotion patterns:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in analyzeEmotionPatterns:', error);
      return null;
    }
  }

  /**
   * Get assignment insights
   */
  async getAssignmentInsights(): Promise<any> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .rpc('get_assignment_insights_for_elya', {
          target_user_id: userId
        });

      if (error) {
        console.error('Error fetching assignment insights:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getAssignmentInsights:', error);
      return null;
    }
  }

  /**
   * Get conversation statistics for analytics
   */
  async getConversationStats(): Promise<{
    total_messages: number;
    sessions_count: number;
    avg_session_length: number;
    last_conversation: string | null;
  }> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      return {
        total_messages: 0,
        sessions_count: 0,
        avg_session_length: 0,
        last_conversation: null
      };
    }

    try {
      const { data, error } = await supabase
        .from('elya_conversations')
        .select('session_id, created_at')
        .eq('user_id', userId);

      if (error || !data) {
        console.error('Error fetching conversation stats:', error);
        return {
          total_messages: 0,
          sessions_count: 0,
          avg_session_length: 0,
          last_conversation: null
        };
      }

      const sessions = new Set(data.map(row => row.session_id));
      const lastConversation = data.length > 0 
        ? Math.max(...data.map(row => new Date(row.created_at).getTime()))
        : null;

      return {
        total_messages: data.length,
        sessions_count: sessions.size,
        avg_session_length: sessions.size > 0 ? Math.round(data.length / sessions.size) : 0,
        last_conversation: lastConversation ? new Date(lastConversation).toISOString() : null
      };
    } catch (error) {
      console.error('Error in getConversationStats:', error);
      return {
        total_messages: 0,
        sessions_count: 0,
        avg_session_length: 0,
        last_conversation: null
      };
    }
  }
}

// Export singleton instance
export const userContextService = new UserContextService();

// Export class for testing
export { UserContextService };