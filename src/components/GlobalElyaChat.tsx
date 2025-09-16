import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, MessageCircle, X, Plus, Mic } from 'lucide-react';
import { aiService } from '../services/aiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'elya';
  timestamp: Date;
}

export function GlobalElyaChat() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Log to confirm component is mounted
  useEffect(() => {
    console.log('GlobalElyaChat component mounted');
  }, []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add CSS to hide scrollbars
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .elya-global-textarea::-webkit-scrollbar {
        display: none;
      }
      .elya-global-textarea {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add/remove class to body when chat opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('elya-chat-open');
    } else {
      document.body.classList.remove('elya-chat-open');
    }
    return () => {
      document.body.classList.remove('elya-chat-open');
    };
  }, [isOpen]);

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('elyaGlobalMessages');
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
      localStorage.setItem('elyaGlobalMessages', JSON.stringify(messages));
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Test element to confirm rendering */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'red',
        color: 'white',
        padding: '10px',
        zIndex: 999999,
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        CHAT COMPONENT LOADED
      </div>
      
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed shadow-lg hover:shadow-xl transition-all hover:scale-105"
          style={{
            bottom: '30px',
            right: '30px',
            background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
            borderRadius: '50%',
            width: '70px',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            border: '3px solid white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
          title="Chat with Elya"
        >
          <MessageCircle size={30} className="text-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed shadow-2xl rounded-2xl"
          style={{
            bottom: '30px',
            right: '30px',
            width: '380px',
            maxWidth: 'calc(100vw - 40px)',
            height: '480px',
            maxHeight: 'calc(100vh - 100px)',
            backgroundColor: '#FFFFFF',
            border: '2px solid #E5E5E5',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{
              borderBottom: '0.5px solid #E5E5E5',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FBF9 100%)'
            }}
          >
            <div className="flex items-center gap-2">
              <div>
                <h3 className="font-semibold text-xs" style={{ color: '#1A1A1A' }}>
                  Chat with Elya
                </h3>
                <p className="text-xs" style={{ color: '#666', fontSize: '10px' }}>
                  Always here to help
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} style={{ color: '#666' }} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ 
              backgroundColor: '#FAFAFA',
              paddingBottom: '20px'
            }}
          >
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: '#666' }}>
                  Hi! I'm Elya, your wellness companion. How can I help you today?
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'text-white'
                        : ''
                    }`}
                    style={{
                      background: message.sender === 'user'
                        ? 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))'
                        : '#FFFFFF',
                      border: message.sender === 'elya' ? '1px solid #E5E5E5' : 'none',
                      color: message.sender === 'user' ? '#FFFFFF' : '#2D3748'
                    }}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl bg-white border border-gray-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Container */}
          <div
            style={{ 
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E5E7EB',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flexShrink: 0
            }}
          >
            {/* Privacy Notice */}
            <div style={{
              textAlign: 'center',
              color: '#6B7280',
              fontSize: '11px',
              marginBottom: '4px'
            }}>
              Your conversations are private and secure.
            </div>
            
            {/* Input Wrapper */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              position: 'relative'
            }}>
              {/* Attachment Button */}
              <button
                type="button"
                className="flex-shrink-0"
                style={{
                  width: '48px',
                  height: '48px',
                  minWidth: '48px',
                  minHeight: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '20px',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                aria-label="Add attachment"
                title="Add attachment"
              >
                <Plus size={24} style={{ color: '#6B7280' }} />
              </button>
              
              {/* Text Input */}
              <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="elya-global-textarea"
                  style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '26px',
                    border: '2px solid #E5E7EB',
                    fontSize: '16px',
                    padding: '14px 18px',
                    minHeight: '52px',
                    height: '52px',
                    maxHeight: '104px',
                    resize: 'none',
                    outline: 'none',
                    color: '#1F2937',
                    lineHeight: '1.5',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                  rows={1}
                  disabled={isTyping}
                  aria-label="Message input"
                />
              </div>
              
              {/* Audio Button */}
              <button
                type="button"
                className="flex-shrink-0"
                style={{
                  width: '48px',
                  height: '48px',
                  minWidth: '48px',
                  minHeight: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '20px',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                aria-label="Voice input"
                title="Voice input"
              >
                <Mic size={24} style={{ color: '#6B7280' }} />
              </button>
              
              {/* Send Button */}
              <button
                type="button"
                disabled={!inputMessage.trim() || isTyping}
                onClick={handleSendMessage}
                className="flex-shrink-0"
                style={{
                  background: inputMessage.trim() && !isTyping
                    ? '#10B981'
                    : '#F3F4F6',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  minWidth: '48px',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid',
                  borderColor: inputMessage.trim() && !isTyping ? '#10B981' : '#E5E7EB',
                  cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  fontSize: '20px',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (inputMessage.trim() && !isTyping) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label="Send message"
                title="Send message"
              >
                {isTyping ? (
                  <Loader size={22} className="animate-spin" style={{ color: inputMessage.trim() ? 'white' : '#6B7280' }} />
                ) : (
                  <Send size={22} style={{ color: inputMessage.trim() ? 'white' : '#6B7280' }} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}