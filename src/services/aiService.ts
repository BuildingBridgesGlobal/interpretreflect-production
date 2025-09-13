// AI Service for Chat with Elya
// Supports Agentic Flow integration with user context from Supabase

import { userContextService, ElyaUserContext } from './userContextService';

interface AIConfig {
  provider: 'openai' | 'openrouter' | 'agenticflow' | 'simulated';
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  agentId?: string;
}

// Default configuration - can be overridden via environment variables
const defaultConfig: AIConfig = {
  provider: (import.meta.env.VITE_AI_PROVIDER as 'openai' | 'openrouter' | 'agenticflow' | 'simulated') || 'agenticflow',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_AGENTICFLOW_API_KEY,
  model: import.meta.env.VITE_AI_MODEL || 'openrouter/sonoma-sky-alpha',
  agentId: import.meta.env.VITE_AGENTICFLOW_AGENT_ID || 'a1cab40c-bcc2-49d8-ab97-f233f9b83fb2',
  systemPrompt: `You are Elya, a compassionate and knowledgeable AI wellness coach specializing in burnout prevention and mental wellness.
You provide evidence-based support, practical strategies, and empathetic guidance.
You understand the unique challenges of modern work including stress, anxiety, work-life balance, and professional burnout.
Keep responses concise, warm, and actionable. Focus on validation, practical tools, and gentle encouragement.`
};

class AIService {
  private config: AIConfig;
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private sessionId: string;
  private userContext: ElyaUserContext | null = null;

  constructor(config: AIConfig = defaultConfig) {
    this.config = config;
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize conversation with system prompt (will be updated with user context)
    this.initializeWithContext();
  }

  private async initializeWithContext() {
    try {
      // Get user context and generate contextual system prompt
      this.userContext = await userContextService.getUserContextForElya();
      const contextualPrompt = await userContextService.generateContextualSystemPrompt();
      
      // Initialize with contextual system prompt
      this.conversationHistory = [{
        role: 'system',
        content: contextualPrompt
      }];
      
      // Update user activity
      await userContextService.updateUserActivity();
    } catch (error) {
      console.error('Error initializing with context:', error);
      // Fallback to default system prompt
      if (this.config.systemPrompt) {
        this.conversationHistory.push({
          role: 'system',
          content: this.config.systemPrompt
        });
      }
    }
  }

  async getResponse(userMessage: string): Promise<string> {
    // Generate unique message ID
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Save user message to Supabase
    await userContextService.saveConversationMessage(
      this.sessionId,
      `${messageId}-user`,
      'user',
      userMessage,
      { message_id: messageId, timestamp: new Date().toISOString() }
    );
    
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    try {
      let response: string;

      if (this.config.provider === 'agenticflow') {
        response = await this.getAgenticFlowResponse(userMessage);
      } else if ((this.config.provider === 'openai' || this.config.provider === 'openrouter') && this.config.apiKey) {
        response = await this.getAIResponse();
      } else {
        response = this.getSimulatedResponse(userMessage);
      }

      // Save Elya response to Supabase
      await userContextService.saveConversationMessage(
        this.sessionId,
        `${messageId}-elya`,
        'elya',
        response,
        { 
          message_id: messageId, 
          timestamp: new Date().toISOString(),
          provider: this.config.provider,
          user_context_used: this.userContext ? true : false
        }
      );
      
      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response
      });

      // Keep conversation history manageable (last 10 exchanges)
      if (this.conversationHistory.length > 21) {
        // Keep system prompt + last 10 exchanges (20 messages)
        this.conversationHistory = [
          this.conversationHistory[0], // System prompt
          ...this.conversationHistory.slice(-20)
        ];
      }

      return response;
    } catch (error) {
      console.error('AI Service Error:', error);
      // Fallback to simulated response on error
      return this.getSimulatedResponse(userMessage);
    }
  }

  private async getAgenticFlowResponse(userMessage: string): Promise<string> {
    const agentId = this.config.agentId || 'a1cab40c-bcc2-49d8-ab97-f233f9b83fb2';
    
    try {
      // Prepare enhanced metadata with user context
      const enhancedMetadata = {
        user_type: 'healthcare_interpreter',
        context: 'wellness_support',
        session_id: this.sessionId,
        has_user_context: this.userContext ? true : false,
        ...(this.userContext?.user_summary && {
          user_profile: {
            avg_stress_level: this.userContext.user_summary.avg_stress_level,
            avg_energy_level: this.userContext.user_summary.avg_energy_level,
            burnout_risk: this.userContext.user_summary.burnout_risk_level,
            recent_emotions: this.userContext.user_summary.recent_emotions?.slice(0, 5),
            common_challenges: this.userContext.user_summary.common_challenges?.slice(0, 3),
            effective_strategies: this.userContext.user_summary.effective_strategies?.slice(0, 3)
          }
        })
      };
      
      // Try primary Agentic Flow API endpoint
      const response = await fetch(`https://api.agenticflow.ai/v1/agents/${agentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: this.conversationHistory.slice(-10),
          metadata: enhancedMetadata
        })
      });

      if (!response.ok) {
        // If Agentic Flow fails, try the embed URL approach
        const embedResponse = await fetch('https://agenticflow.ai/api/v1/agent/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: agentId,
            message: userMessage,
            sessionId: `session-${Date.now()}` // Create a session ID for conversation continuity
          })
        });
        
        if (embedResponse.ok) {
          const data = await embedResponse.json();
          return data.response || data.message || this.getContextualSimulatedResponse(userMessage);
        }
        
        throw new Error('Agentic Flow API error');
      }

      const data = await response.json();
      return data.response || data.message || this.getContextualSimulatedResponse(userMessage);
    } catch (error) {
      console.error('Agentic Flow Error:', error);
      // Fallback to contextual simulated response
      return this.getContextualSimulatedResponse(userMessage);
    }
  }

  private async getAIResponse(): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error(`${this.config.provider} API key not configured`);
    }

    const isOpenRouter = this.config.provider === 'openrouter';
    const endpoint = isOpenRouter
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...(isOpenRouter && { 'HTTP-Referer': window.location.origin }),
        ...(isOpenRouter && { 'X-Title': 'Elya Wellness Coach' })
      },
      body: JSON.stringify({
        model: this.config.model || (isOpenRouter ? 'openrouter/sonoma-sky-alpha' : 'gpt-3.5-turbo'),
        messages: this.conversationHistory,
        temperature: 0.7,
        max_tokens: 300,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${this.config.provider} API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  private getContextualSimulatedResponse(userInput: string): string {
    // Use user context to provide more personalized fallback responses
    if (this.userContext?.user_summary) {
      return this.getContextAwareResponse(userInput, this.userContext);
    }
    return this.getSimulatedResponse(userInput);
  }

  private getContextAwareResponse(userInput: string, context: ElyaUserContext): string {
    const input = userInput.toLowerCase();
    const summary = context.user_summary;
    
    // High stress context responses
    if ((input.includes('stress') || input.includes('overwhelm')) && summary.avg_stress_level >= 7) {
      return `I can see you've been carrying a lot of stress lately. Your recent patterns show stress levels around ${summary.avg_stress_level.toFixed(1)}/10. Let's work together on some immediate relief strategies. What feels most urgent to address right now?`;
    }
    
    // Low energy context responses
    if ((input.includes('tired') || input.includes('exhausted')) && summary.avg_energy_level <= 4) {
      return `Your energy levels have been running quite low (around ${summary.avg_energy_level.toFixed(1)}/10 recently). This kind of persistent fatigue is your body communicating something important. When did you last have genuinely restorative time?`;
    }
    
    // Burnout risk awareness
    if (summary.burnout_risk_level === 'high' || summary.burnout_risk_level === 'critical') {
      const riskMessages = {
        'high': 'I want you to know that you\'re showing signs of high burnout risk. This isn\'t a judgment - it\'s information we can use to better support you.',
        'critical': 'Your recent patterns suggest critical burnout risk. I\'m genuinely concerned about your wellbeing right now.'
      };
      return `${riskMessages[summary.burnout_risk_level]} What kind of support would feel most helpful right now? I\'m here to help you navigate this.`;
    }
    
    // Use effective strategies context
    if (input.includes('help') && summary.effective_strategies?.length > 0) {
      const strategies = summary.effective_strategies.slice(0, 2).join(' and ');
      return `I remember that ${strategies} have worked well for you before. Would you like to explore how to apply these strategies to what you're facing now, or try something different?`;
    }
    
    // Recent emotions context
    if (summary.recent_emotions?.length > 0) {
      const commonEmotion = summary.recent_emotions[0];
      if (input.includes(commonEmotion) || input.includes('feeling')) {
        return `I notice that ${commonEmotion} has come up for you recently. These patterns in our emotions often have important messages. What do you think this feeling is trying to tell you?`;
      }
    }
    
    // Fallback to general contextual awareness
    return `Based on what I know about your recent experiences, this sounds like something that's been weighing on you. I'm here to support you through this. What would feel most helpful right now?`;
  }

  private getSimulatedResponse(userInput: string): string {
    const input = userInput.toLowerCase();
    
    // Enhanced simulated responses for better fallback experience
    if (input.includes('stress') || input.includes('overwhelm')) {
      const responses = [
        "I can sense that you're feeling stressed. Let's take a moment together. Would you like to try a quick 2-minute breathing exercise, or would you prefer to talk about what's weighing on you?",
        "Stress at work is so valid. You're managing complex responsibilities while trying to maintain your well-being. What's feeling most overwhelming right now?",
        "That seems really heavy. Remember, feeling stressed doesn't mean you're not strong enough - it means you're human. What usually helps you decompress after difficult sessions?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (input.includes('trauma') || input.includes('difficult') || input.includes('hard')) {
      const responses = [
        "Dealing with difficult situations can be really challenging. You're processing a lot right now. Have you had a chance to talk through any of these experiences with someone?",
        "That seems like such a difficult experience. It's important to acknowledge how these situations affect you. What do you need most right now - validation, strategies, or just someone to be present with you?",
        "Carrying stress and challenges can be exhausting. You're doing important work, and it's okay to feel affected by it. How are you taking care of yourself after these challenging moments?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (input.includes('tired') || input.includes('exhausted') || input.includes('burnout')) {
      const responses = [
        "Exhaustion in this field is so common but often unspoken. You're not alone in feeling this way. When did you last take a real break - not just physical rest, but mental and emotional rest too?",
        "Burnout often creeps up gradually. I'm glad you're recognizing these signs. What aspects of your work still bring you energy or meaning, even on tough days?",
        "Your exhaustion is valid. This work requires constant emotional labor that often goes unrecognized. What would genuine rest look like for you right now?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (input.includes('alone') || input.includes('isolated') || input.includes('lonely')) {
      const responses = [
        "Professional isolation is one of the hardest parts of modern work. You're carrying unique responsibilities and challenges. How can we help you feel more connected?",
        "That sense of aloneness is so common in today's world. You're not alone, even if it doesn't always feel that way. Have you been able to connect with others recently?",
        "Feeling alone is incredibly difficult. Your experiences are valid and shared by many. What kind of support would feel most meaningful to you?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (input.includes('mistake') || input.includes('error') || input.includes('wrong')) {
      const responses = [
        "Making mistakes in high-pressure situations is incredibly stressful. Remember, you're human, working with complex challenges. How are you practicing self-compassion around this?",
        "Errors happen to even the most experienced professionals. What matters is how we learn and grow from them. What's helping you process this experience?",
        "That must be weighing on you. Perfectionism can be crushing. You're doing your best in challenging circumstances. How can we work through this together?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (input.includes('help') || input.includes('support') || input.includes('need')) {
      return "I'm here to support you. You can share what's on your mind, explore coping strategies, or work through specific challenges you're facing. What would be most helpful right now?";
    }
    
    if (input.includes('thank') || input.includes('grateful') || input.includes('appreciate')) {
      return "You're so welcome. Remember, seeking support is a sign of professional wisdom, not weakness. I'm here whenever you need to talk, process, or simply be heard.";
    }
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! I'm Elya, your wellness companion. I'm here to support you through life's challenges and help you maintain your well-being. How are you feeling today?";
    }
    
    if (input.includes('bye') || input.includes('goodbye') || input.includes('see you')) {
      return "Take care of yourself. Remember, you're doing important work, and it's okay to prioritize your wellbeing. I'm here whenever you need support.";
    }
    
    // Default response for unmatched inputs
    const defaultResponses = [
      "Tell me more about that. How is this affecting you day-to-day?",
      "I'm here for you. What aspect of this feels most important to explore right now?",
      "That's significant. How long have you been experiencing this?",
      "I understand. What would meaningful support look like for you in this situation?",
      "Thank you for sharing that. How can I best support you with this?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  async resetConversation() {
    // Generate new session ID
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Re-initialize with fresh context
    await this.initializeWithContext();
  }

  getSessionId(): string {
    return this.sessionId;
  }

  async refreshUserContext(): Promise<void> {
    try {
      this.userContext = await userContextService.getUserContextForElya();
      const contextualPrompt = await userContextService.generateContextualSystemPrompt();
      
      // Update system prompt with fresh context
      if (this.conversationHistory.length > 0 && this.conversationHistory[0].role === 'system') {
        this.conversationHistory[0].content = contextualPrompt;
      }
    } catch (error) {
      console.error('Error refreshing user context:', error);
    }
  }

  updateConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Update system prompt if changed
    if (newConfig.systemPrompt && this.conversationHistory.length > 0) {
      this.conversationHistory[0] = {
        role: 'system',
        content: newConfig.systemPrompt
      };
    }
  }

  getUserContext(): ElyaUserContext | null {
    return this.userContext;
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export class for testing or custom instances
export { AIService };