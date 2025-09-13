import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, Sparkles, MessageCircle, X } from 'lucide-react';
import { aiService } from '../services/aiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'elya';
  timestamp: Date;
}

export function GlobalElyaChat() {
  const [isOpen, setIsOpen] = useState(false);
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
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
          }}
          title="Chat with Elya"
        >
          <MessageCircle size={28} className="text-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 shadow-2xl rounded-2xl overflow-hidden"
          style={{
            width: '380px',
            height: '550px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E5E5',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{
              borderBottom: '1px solid #E5E5E5',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FBF9 100%)'
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
              >
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>
                  Elya AI
                </h3>
                <p className="text-xs" style={{ color: '#666' }}>
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
            style={{ backgroundColor: '#FAFAFA' }}
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

          {/* Input */}
          <div
            className="p-3"
            style={{ borderTop: '1px solid #E5E5E5' }}
          >
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 resize-none outline-none px-3 py-2 elya-global-textarea"
                style={{
                  backgroundColor: '#F7F7F7',
                  borderRadius: '20px',
                  border: '1px solid #E0E0E0',
                  fontSize: '14px',
                  minHeight: '36px',
                  maxHeight: '80px',
                  color: '#2D3748'
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
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                {isTyping ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}