import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Sparkles, User, Copy, Check, RefreshCw } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'elya';
  timestamp: Date;
}

export function ChatWithElya() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [sessionId] = useState(() => aiService.getSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Add CSS to hide scrollbars
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .elya-textarea::-webkit-scrollbar {
        display: none;
      }
      .elya-textarea {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('elyaMessages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('elyaMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const scrollToBottom = () => {
    // Only scroll within the messages container, not the entire viewport
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'nearest'
      });
    }
  };

  useEffect(() => {
    // Only scroll if there are new messages
    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputMessage.trim() === '' || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    const messageText = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get AI response
      const responseText = await aiService.getResponse(messageText);
      
      const elyaResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'elya',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, elyaResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback response
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand you're reaching out. Every feeling you have is valid and worth exploring. Would you like to tell me more about what's on your mind?",
        sender: 'elya',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyMessage = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('elyaMessages');
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <div 
        className="px-6 py-4 flex items-center justify-between"
        style={{
          borderBottom: '1px solid #E5E5E5',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" 
            style={{ background: '#E8F5E9' }}>
            <img src="/elya_2.png" alt="Elya AI" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-semibold text-xl" style={{ color: '#1A1A1A' }}>
              Elya AI
            </h2>
            <p className="text-xs" style={{ color: '#666' }}>
              Your Wellness Companion
            </p>
          </div>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
            title="Start new conversation"
            style={{
              background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
              color: 'white'
            }}
          >
            <RefreshCw size={16} style={{ color: 'white' }} />
            <span className="text-sm font-medium" style={{ color: 'white' }}>New Chat</span>
          </button>
        )}
      </div>

      {/* Main Chat Container with Messages and Fixed Input */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: '#FAFAFA', position: 'relative', overflow: 'hidden' }}>
        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '160px' }}>
          <div className="max-w-4xl mx-auto px-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-20">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 overflow-hidden"
                style={{ background: '#E8F5E9' }}>
                <img src="/elya_2.png" alt="Elya AI" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-3xl font-semibold mb-3" style={{ color: '#1A1A1A' }}>
                How can I help you today?
              </h3>
              <p className="text-center max-w-lg mb-8" style={{ color: '#666' }}>
                I'm here to support your wellness journey. Share what's on your mind, and let's explore it together.
              </p>
              
              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  "Help me process today's challenging assignment",
                  "I'm feeling overwhelmed and need support",
                  "Guide me through a stress-relief exercise",
                  "I want to reflect on my emotional wellbeing"
                ].map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(prompt)}
                    className="text-left p-4 rounded-xl border hover:shadow-lg transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: '#E5E5E5',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: '#2D3748' }}>
                      {prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`group flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse max-w-[70%]' : 'max-w-[70%]'}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm overflow-hidden"
                        style={{
                          background: message.sender === 'elya' 
                            ? '#E8F5E9'
                            : 'linear-gradient(135deg, #6B7280, #4B5563)'
                        }}
                      >
                        {message.sender === 'user' ? (
                          <User size={18} className="text-white" />
                        ) : (
                          <img src="/elya_2.png" alt="Elya AI" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                        <span className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>
                          {message.sender === 'user' ? 'You' : 'Elya'}
                        </span>
                        <span className="text-xs" style={{ color: '#999' }}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => copyMessage(message.text, message.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md transition-all"
                          title="Copy message"
                          style={{ backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {copiedMessageId === message.id ? (
                            <Check size={14} style={{ color: '#10B981' }} />
                          ) : (
                            <Copy size={14} style={{ color: '#1A1A1A' }} />
                          )}
                        </button>
                      </div>
                      <div 
                        className={`inline-block px-4 py-2.5 rounded-2xl ${
                          message.sender === 'user' 
                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' 
                            : 'bg-gray-100'
                        }`}
                        style={{ 
                          maxWidth: '100%',
                          wordBreak: 'break-word'
                        }}
                      >
                        <p className={`text-sm leading-relaxed ${
                          message.sender === 'user' ? 'text-white' : ''
                        }`} style={{ 
                          color: message.sender === 'user' ? '#FFFFFF' : '#2D3748',
                          margin: 0 
                        }}>
                          {message.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm overflow-hidden"
                      style={{ background: '#E8F5E9' }}
                    >
                      <img src="/elya_2.png" alt="Elya AI" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-4 py-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

            </div>
          )}
          <div ref={messagesEndRef} style={{ height: '20px' }} />
          </div>
        </div>

        {/* Fixed Input Area at Bottom */}
        <div 
          style={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingTop: '20px',
            paddingBottom: '24px',
            background: 'linear-gradient(to top, #FAFAFA 0%, #FAFAFA 75%, rgba(250, 250, 250, 0.9) 90%, rgba(250, 250, 250, 0) 100%)',
            pointerEvents: 'none'
          }}
        >
        <div style={{ pointerEvents: 'auto' }}>
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto px-4">
          <div 
            className="flex items-center gap-3 shadow-md hover:shadow-lg transition-shadow"
            style={{ 
              backgroundColor: '#F9F9F9', 
              border: '1.5px solid #D0D0D0',
              borderRadius: '30px',
              padding: '12px 12px 12px 24px',
              minHeight: '52px'
            }}
          >
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Elya..."
              className="flex-1 resize-none outline-none bg-transparent elya-textarea"
              style={{ 
                color: '#2D3748',
                minHeight: '24px',
                maxHeight: '120px',
                fontSize: '15px',
                lineHeight: '1.5',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                overflow: 'hidden',
                overflowY: 'auto',
                border: 'none',
                outline: 'none',
                boxShadow: 'none'
              }}
              rows={1}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="transition-all hover:scale-110 disabled:hover:scale-100"
              style={{
                background: inputMessage.trim() && !isTyping
                  ? 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))'
                  : '#E0E0E0',
                color: 'white',
                borderRadius: '50%',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: 'none',
                cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
                boxShadow: inputMessage.trim() && !isTyping ? '0 2px 8px rgba(27, 94, 32, 0.3)' : 'none'
              }}
            >
              {isTyping ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-xs text-center mt-2" style={{ color: '#999' }}>
            Elya can make mistakes. For emergencies, contact a healthcare professional.
          </p>
        </form>
        </div>
        </div>
      </div>
    </div>
  );
}