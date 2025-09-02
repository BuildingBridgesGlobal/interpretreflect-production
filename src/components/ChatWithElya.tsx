import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import { aiService } from '../services/aiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'elya';
  timestamp: Date;
}

export function ChatWithElya() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Elya, your burnout prevention companion. I'm here to listen and support you. How are you feeling today?",
      sender: 'elya',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
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
      
      setMessages((prev) => [...prev, elyaResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to simulated response on error
      const elyaResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getElyaResponse(messageText),
        sender: 'elya',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, elyaResponse]);
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

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FAFAF8' }}>
      {/* Chat Header */}
      <div
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(168, 192, 154, 0.2)',
        }}
      >
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(168, 192, 154, 0.2)' }}
          >
            <Bot className="h-6 w-6" style={{ color: '#2D5F3F' }} />
          </div>
          <div>
            <h2 className="font-semibold text-lg" style={{ color: '#1A1A1A' }}>
              Elya
            </h2>
            <p className="text-xs" style={{ color: '#6B7C6B' }}>
              Your burnout prevention companion
            </p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs" style={{ color: '#6B7C6B' }}>
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex space-x-2 max-w-[70%] ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user'
                    ? 'bg-blue-500'
                    : ''
                }`}
                style={{
                  backgroundColor: message.sender === 'elya' ? 'rgba(168, 192, 154, 0.2)' : undefined,
                }}
              >
                {message.sender === 'user' ? (
                  <User className="h-5 w-5 text-white" />
                ) : (
                  <Bot className="h-5 w-5" style={{ color: '#2D5F3F' }} />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : ''
                }`}
                style={{
                  backgroundColor: message.sender === 'elya' ? '#FFFFFF' : undefined,
                  border: message.sender === 'elya' ? '1px solid rgba(168, 192, 154, 0.2)' : undefined,
                  color: message.sender === 'elya' ? '#3A3A3A' : undefined,
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
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-2 max-w-[70%]">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(168, 192, 154, 0.2)' }}
              >
                <Bot className="h-5 w-5" style={{ color: '#2D5F3F' }} />
              </div>
              <div
                className="px-4 py-3 rounded-2xl"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(168, 192, 154, 0.2)',
                }}
              >
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: '#A8C09A',
                      animationDelay: '0ms',
                    }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: '#A8C09A',
                      animationDelay: '150ms',
                    }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: '#A8C09A',
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
        className="px-6 py-4 border-t"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(168, 192, 154, 0.2)',
        }}
      >
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-xl outline-none transition-all"
            style={{
              backgroundColor: 'rgba(168, 192, 154, 0.05)',
              border: '1px solid rgba(168, 192, 154, 0.2)',
              color: '#3A3A3A',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#A8C09A';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(168, 192, 154, 0.2)';
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === '' || isTyping}
            className="px-4 py-3 rounded-xl transition-all flex items-center justify-center"
            style={{
              backgroundColor: inputMessage.trim() === '' || isTyping 
                ? 'rgba(168, 192, 154, 0.2)' 
                : '#A8C09A',
              color: inputMessage.trim() === '' || isTyping 
                ? '#9CA3AF' 
                : '#FFFFFF',
              cursor: inputMessage.trim() === '' || isTyping 
                ? 'not-allowed' 
                : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (inputMessage.trim() !== '' && !isTyping) {
                e.currentTarget.style.backgroundColor = '#8FAC82';
              }
            }}
            onMouseLeave={(e) => {
              if (inputMessage.trim() !== '' && !isTyping) {
                e.currentTarget.style.backgroundColor = '#A8C09A';
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
        <p className="text-xs mt-2 text-center" style={{ color: '#9CA3AF' }}>
          Elya is an AI companion. For emergencies, please contact a healthcare professional.
        </p>
      </div>
    </div>
  );
}