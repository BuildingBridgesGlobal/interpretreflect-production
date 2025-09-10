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
      const { data, error } = await supabase
        .rpc('get_user_context_for_elya', { target_user_id: userId });

      if (error) {
        console.error('Error fetching user context for Elya:', error);
        return null;
      }

      return data as ElyaUserContext;
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
      console.warn('No authenticated user found');
      return null;
    }

    try {
      const { data, error } = await supabase
        .rpc('save_elya_conversation', {
          target_user_id: userId,
          target_session_id: sessionId,
          target_message_id: messageId,
          message_sender: sender,
          message_content: content,
          message_metadata: metadata
        });

      if (error) {
        console.error('Error saving conversation message:', error);
        return null;
      }

      return data;
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