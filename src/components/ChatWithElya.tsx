import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Download, Calendar, BookOpen, RotateCcw } from 'lucide-react';
import { aiService } from '../services/aiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'elya';
  timestamp: Date;
  theme?: string;
}

interface WellnessPrompt {
  category: string;
  prompts: string[];
}

export function ChatWithElya() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showWellnessPrompts, setShowWellnessPrompts] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [conversationStarted, setConversationStarted] = useState(false);

  // Wellness prompts for journaling
  const wellnessPrompts: WellnessPrompt[] = [
    {
      category: "Daily Check-in",
      prompts: [
        "How is my energy level right now, and what might be contributing to it?",
        "What emotions am I noticing in my body today?",
        "What do I need most for my well-being right now?"
      ]
    },
    {
      category: "Burnout Prevention", 
      prompts: [
        "What signs of stress or overwhelm am I noticing lately?",
        "How have I been taking care of myself this week?",
        "What boundaries do I need to set to protect my energy?"
      ]
    },
    {
      category: "Interpreter-Specific",
      prompts: [
        "How did today's assignments affect me emotionally?",
        "What challenging content did I encounter and how did I process it?",
        "How am I managing the emotional labor of interpreting?"
      ]
    },
    {
      category: "Reflection & Growth",
      prompts: [
        "What am I learning about myself through my work?",
        "How can I celebrate my resilience today?",
        "What would I tell a fellow interpreter who was struggling?"
      ]
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Load conversation history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('elyaConversation');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
        setConversationStarted(parsedMessages.length > 0);
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
    }
    
    // If no saved messages, start with welcome message
    if (!savedMessages || JSON.parse(savedMessages).length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: "Welcome to your wellness journal! I'm Elya, your AI companion for interpreter well-being. This is your private space for reflection, processing, and growth. How would you like to begin today?",
        sender: 'elya',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage]);
    }
  }, []);

  // Save messages to localStorage
  const saveMessagesToStorage = (messagesToSave: Message[]) => {
    try {
      localStorage.setItem('elyaConversation', JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  useEffect(() => {
    // Only scroll if there are new messages (not on initial render)
    if (messages.length > 0) {
      scrollToBottom();
      // Save messages when they change
      if (conversationStarted) {
        saveMessagesToStorage(messages);
      }
    }
  }, [messages, conversationStarted]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setConversationStarted(true);
    const messageText = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get AI response using the AI service
      const responseText = await aiService.getResponse(messageText);
      
      const elyaResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'elya',
        timestamp: new Date(),
      };
      
      const finalMessages = [...newMessages, elyaResponse];
      setMessages(finalMessages);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to simulated response on error
      const elyaResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getElyaResponse(messageText),
        sender: 'elya',
        timestamp: new Date(),
      };
      const finalMessages = [...newMessages, elyaResponse];
      setMessages(finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  // Simulated responses (replace with actual AI)
  const getElyaResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('tired') || input.includes('exhausted')) {
      return "I hear you're feeling tired. That's completely valid. Burnout often starts with persistent exhaustion. Have you been able to take any breaks today? Even a 5-minute pause can help reset your nervous system.";
    } else if (input.includes('stressed') || input.includes('overwhelmed')) {
      return "Feeling overwhelmed is your body's signal that you need support. Let's try something together - would you like to do a quick breathing exercise, or would you prefer to talk through what's on your mind?";
    } else if (input.includes('help')) {
      return "I'm here to help you recognize and prevent burnout. I can guide you through stress-relief exercises, help you reflect on your energy levels, or simply listen. What would be most helpful for you right now?";
    } else if (input.includes('better') || input.includes('good') || input.includes('great')) {
      return "That's wonderful to hear! It's important to notice and celebrate when we're feeling good. What's contributing to this positive feeling? Understanding what helps us can be just as important as recognizing what drains us.";
    } else {
      return "Thank you for sharing that with me. Every feeling you have is valid and worth exploring. Would you like to tell me more about what's going on for you right now?";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Export conversation as text file
  const exportConversation = () => {
    const conversationText = messages
      .map(msg => {
        const time = msg.timestamp.toLocaleString();
        const sender = msg.sender === 'elya' ? 'Elya' : 'You';
        return `[${time}] ${sender}: ${msg.text}`;
      })
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-journal-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Clear conversation history
  const clearConversation = () => {
    if (window.confirm('Are you sure you want to clear your wellness journal? This cannot be undone.')) {
      localStorage.removeItem('elyaConversation');
      const welcomeMessage: Message = {
        id: '1',
        text: "Welcome to your wellness journal! I'm Elya, your AI companion for interpreter well-being. This is your private space for reflection, processing, and growth. How would you like to begin today?",
        sender: 'elya',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setConversationStarted(false);
    }
  };

  // Use wellness prompt
  const usePrompt = (prompt: string) => {
    setInputMessage(prompt);
    setShowWellnessPrompts(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#F8FBF9' }}>
      {/* Chat Header */}
      <div
        className="px-8 py-5 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F7F3 100%)',
          borderBottom: '1px solid rgba(92, 127, 79, 0.15)',
        }}
      >
        <div className="flex items-center space-x-4 max-w-7xl mx-auto">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
            style={{ 
              background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
            }}
          >
            <Bot className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-xl" style={{ color: '#0D3A14' }}>
              Wellness Journal with Elya
            </h2>
            <p className="text-sm" style={{ color: '#5C7F4F' }}>
              Your private space for reflection, processing, and growth
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {messages.length > 1 && (
              <button
                onClick={exportConversation}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100"
                title="Export journal as text file"
              >
                <Download size={16} style={{ color: '#5C7F4F' }} />
                <span className="text-sm" style={{ color: '#5C7F4F' }}>Export</span>
              </button>
            )}
            {messages.length > 1 && (
              <button
                onClick={clearConversation}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100"
                title="Clear journal history"
              >
                <RotateCcw size={16} style={{ color: '#5C7F4F' }} />
                <span className="text-sm" style={{ color: '#5C7F4F' }}>Clear</span>
              </button>
            )}
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                Private & Secure
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 max-w-5xl mx-auto w-full" style={{ overscrollBehavior: 'contain' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar size={48} className="mx-auto mb-4" style={{ color: '#5C7F4F' }} />
              <p className="text-lg" style={{ color: '#0D3A14' }}>Your wellness journal awaits</p>
              <p className="text-sm" style={{ color: '#5C7F4F' }}>Start by sharing how you're feeling or use a reflection prompt below</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex space-x-3 max-w-[75%] ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  message.sender === 'user'
                    ? ''
                    : ''
                }`}
                style={{
                  background: message.sender === 'elya' 
                    ? 'linear-gradient(135deg, #1b5e20, #2e7d32)' 
                    : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                }}
              >
                {message.sender === 'user' ? (
                  <User className="h-5 w-5 text-white" />
                ) : (
                  <Bot className="h-5 w-5 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`px-5 py-3.5 rounded-2xl shadow-sm ${
                  message.sender === 'user'
                    ? 'text-white'
                    : ''
                }`}
                style={{
                  background: message.sender === 'elya' 
                    ? '#FFFFFF' 
                    : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  border: message.sender === 'elya' ? '1px solid rgba(92, 127, 79, 0.1)' : 'none',
                  color: message.sender === 'elya' ? '#2D3748' : '#FFFFFF',
                  maxWidth: '100%',
                }}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : ''
                  }`}
                  style={{
                    color: message.sender === 'elya' ? '#9CA3AF' : undefined,
                  }}
                >
                  {message.timestamp.toLocaleDateString() === new Date().toLocaleDateString() 
                    ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : message.timestamp.toLocaleString([], { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                  }
                </p>
              </div>
            </div>
          </div>
        })
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-[75%]">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ 
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                }}
              >
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div
                className="px-5 py-3.5 rounded-2xl shadow-sm"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(92, 127, 79, 0.1)',
                }}
              >
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: '#5C7F4F',
                      animationDelay: '0ms',
                    }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: '#5C7F4F',
                      animationDelay: '150ms',
                    }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: '#5C7F4F',
                      animationDelay: '300ms',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="px-8 py-5 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FBF9 100%)',
          borderTop: '1px solid rgba(92, 127, 79, 0.1)',
        }}
      >
        {/* Wellness Prompts */}
        {showWellnessPrompts && (
          <div className="max-w-5xl mx-auto mb-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(92, 127, 79, 0.05)', border: '1px solid rgba(92, 127, 79, 0.1)' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#0D3A14' }}>Wellness Reflection Prompts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wellnessPrompts.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h4 className="text-sm font-medium mb-2" style={{ color: '#5C7F4F' }}>{category.category}</h4>
                  <div className="space-y-2">
                    {category.prompts.map((prompt, promptIndex) => (
                      <button
                        key={promptIndex}
                        onClick={() => usePrompt(prompt)}
                        className="w-full text-left text-sm p-2 rounded-lg hover:bg-white transition-colors"
                        style={{ color: '#2D3748', border: '1px solid rgba(92, 127, 79, 0.1)' }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowWellnessPrompts(false)}
              className="mt-3 text-sm px-3 py-1 rounded-md" 
              style={{ color: '#5C7F4F', backgroundColor: 'rgba(92, 127, 79, 0.1)' }}
            >
              Close prompts
            </button>
          </div>
        )}
        
        <div className="flex space-x-4 max-w-5xl mx-auto">
          {!showWellnessPrompts && (
            <button
              onClick={() => setShowWellnessPrompts(true)}
              className="flex items-center justify-center px-4 py-3.5 rounded-xl transition-all"
              style={{
                backgroundColor: 'rgba(92, 127, 79, 0.1)',
                border: '2px solid rgba(92, 127, 79, 0.15)',
                color: '#5C7F4F'
              }}
              title="Show wellness reflection prompts"
            >
              <BookOpen size={20} />
            </button>
          )}
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Elya anything about your wellness..."
            className="flex-1 px-5 py-3.5 rounded-xl outline-none transition-all text-base shadow-sm"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid rgba(92, 127, 79, 0.15)',
              color: '#2D3748',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#2e7d32';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(46, 125, 50, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(92, 127, 79, 0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === '' || isTyping}
            className="px-6 py-3.5 rounded-xl transition-all flex items-center justify-center shadow-sm hover:shadow-md"
            style={{
              background: inputMessage.trim() === '' || isTyping 
                ? 'rgba(92, 127, 79, 0.2)' 
                : 'linear-gradient(135deg, #1b5e20, #2e7d32)',
              color: '#FFFFFF',
              cursor: inputMessage.trim() === '' || isTyping 
                ? 'not-allowed' 
                : 'pointer',
              minWidth: '120px',
            }}
            onMouseEnter={(e) => {
              if (inputMessage.trim() !== '' && !isTyping) {
                e.currentTarget.style.backgroundColor = '#8FAC82';
              }
            }}
            onMouseLeave={(e) => {
              if (inputMessage.trim() !== '' && !isTyping) {
                e.currentTarget.style.backgroundColor = '#5C7F4F';
              }
            }}
          >
            {isTyping ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="flex flex-col items-center gap-1 mt-2">
          <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
            Elya is an AI wellness companion. For mental health emergencies, please contact a healthcare professional or crisis hotline.
          </p>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3" style={{ color: '#93C5FD' }} />
            <span className="text-xs" style={{ color: '#93C5FD' }}>
              {isConnected 
                ? 'Your conversations are encrypted and stored securely'
                : 'Your journal entries are stored locally and kept private'
              }
            </span>
          </div>
          {!isAuthenticated && (
            <p className="text-xs text-center" style={{ color: '#F59E0B' }}>
              Sign in to sync conversations and get personalized support based on your wellness history
            </p>
          )}
        </div>
      </div>
    </div>
  );
}