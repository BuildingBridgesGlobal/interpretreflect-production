// AI Service for Chat with Elya
// Supports OpenAI API integration with fallback to simulated responses

interface AIConfig {
  provider: 'openai' | 'openrouter' | 'simulated';
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
}

// Default configuration - can be overridden via environment variables
const defaultConfig: AIConfig = {
  provider: (import.meta.env.VITE_AI_PROVIDER as 'openai' | 'openrouter' | 'simulated') || 'simulated',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY,
  model: import.meta.env.VITE_AI_MODEL || 'openrouter/sonoma-sky-alpha',
  systemPrompt: `You are Elya, a compassionate and knowledgeable AI wellness coach specializing in burnout prevention for healthcare interpreters.
You provide evidence-based support, practical strategies, and empathetic guidance.
You understand the unique challenges of medical interpretation including vicarious trauma, moral distress, and professional isolation.
Keep responses concise, warm, and actionable. Focus on validation, practical tools, and gentle encouragement.`
};

class AIService {
  private config: AIConfig;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(config: AIConfig = defaultConfig) {
    this.config = config;
    
    // Initialize conversation with system prompt
    if (this.config.systemPrompt) {
      this.conversationHistory.push({
        role: 'system',
        content: this.config.systemPrompt
      });
    }
  }

  async getResponse(userMessage: string): Promise<string> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    try {
      let response: string;

      if ((this.config.provider === 'openai' || this.config.provider === 'openrouter') && this.config.apiKey) {
        response = await this.getAIResponse();
      } else {
        response = this.getSimulatedResponse(userMessage);
      }

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

  private getSimulatedResponse(userInput: string): string {
    const input = userInput.toLowerCase();
    
    // Enhanced simulated responses for better fallback experience
    if (input.includes('stress') || input.includes('overwhelm')) {
      const responses = [
        "I hear that you're feeling stressed. Let's take a moment together. Would you like to try a quick 2-minute breathing exercise, or would you prefer to talk about what's weighing on you?",
        "Stress in medical interpretation is so valid. You're holding space for others' pain while managing complex communication. What's feeling most overwhelming right now?",
        "That sounds really heavy. Remember, feeling stressed doesn't mean you're not strong enough - it means you're human. What usually helps you decompress after difficult sessions?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (input.includes('trauma') || input.includes('difficult') || input.includes('hard')) {
      const responses = [
        "Vicarious trauma is real, especially in medical interpretation. You're witnessing and voicing others' pain daily. Have you had a chance to process any of these experiences with someone?",
        "That sounds like such a difficult experience. It's important to acknowledge how these sessions affect you. What do you need most right now - validation, strategies, or just someone to listen?",
        "Carrying others' stories can be exhausting. You're doing important work, and it's okay to feel affected by it. How are you taking care of yourself after these challenging interpretations?"
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
        "Professional isolation is one of the hardest parts of interpretation work. You're often the only interpreter in the room, carrying unique responsibilities. How can we help you feel more connected?",
        "That sense of aloneness is so common among interpreters. You're part of a community, even if it doesn't always feel that way. Have you connected with other interpreters recently?",
        "Feeling alone in this work is incredibly difficult. Your experiences are valid and shared by many in your field. What kind of support would feel most meaningful to you?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (input.includes('mistake') || input.includes('error') || input.includes('wrong')) {
      const responses = [
        "Making mistakes in high-stakes situations is incredibly stressful. Remember, you're human, working in real-time with complex information. How are you practicing self-compassion around this?",
        "Errors happen to even the most experienced interpreters. What matters is how we learn and grow from them. What's helping you process this experience?",
        "That must be weighing on you. Perfectionism in interpretation can be crushing. You're doing your best in challenging circumstances. How can we work through this together?"
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
      return "Hello! I'm Elya, your wellness companion. I'm here to support you through the unique challenges of medical interpretation. How are you feeling today?";
    }
    
    if (input.includes('bye') || input.includes('goodbye') || input.includes('see you')) {
      return "Take care of yourself. Remember, you're doing important work, and it's okay to prioritize your wellbeing. I'm here whenever you need support.";
    }
    
    // Default response for unmatched inputs
    const defaultResponses = [
      "Tell me more about that. How is this affecting you day-to-day?",
      "I'm listening. What aspect of this feels most important to explore right now?",
      "That's significant. How long have you been experiencing this?",
      "I hear you. What would meaningful support look like for you in this situation?",
      "Thank you for sharing that. How can I best support you with this?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  resetConversation() {
    // Reset conversation history but keep system prompt
    this.conversationHistory = this.config.systemPrompt 
      ? [{
          role: 'system',
          content: this.config.systemPrompt
        }]
      : [];
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
}

// Export singleton instance
export const aiService = new AIService();

// Export class for testing or custom instances
export { AIService };