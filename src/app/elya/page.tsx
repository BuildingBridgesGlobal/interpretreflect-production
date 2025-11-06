'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, ChevronRight, Heart, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.next';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ElyaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Load chat history from localStorage
    const savedMessages = localStorage.getItem(`elya_chat_${user.id}`);
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
    } else {
      // Welcome message
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm Elya, your AI companion for interpreter wellness. I'm here to support you with reflective practice, vicarious trauma processing, and building sustainable self-care habits.

How are you feeling today? Or if you prefer, you can ask me about:
- Processing a recent assignment
- Using the BREATHE protocol
- Understanding the ECCI Model
- Building professional boundaries
- Managing burnout or compassion fatigue`,
        timestamp: new Date()
      }]);
    }
  }, [user]);

  useEffect(() => {
    // Save messages to localStorage whenever they change
    if (user && messages.length > 0) {
      localStorage.setItem(`elya_chat_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/elya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Elya');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "I just finished a difficult assignment",
    "Help me with the BREATHE protocol",
    "I'm feeling burned out",
    "What is the ECCI Model?",
    "How do I maintain professional boundaries?"
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E6E3] flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#5C7F4F] hover:text-[#4a6640] mb-3"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2C3E50]">Chat with Elya</h1>
              <p className="text-sm text-[#7F8C8D]">
                Your AI companion for interpreter wellness
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-6">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-xl p-4 ${
                    message.role === 'user'
                      ? 'bg-[#5C7F4F] text-white'
                      : 'bg-white border border-[#E8E6E3] text-[#2C3E50]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-[#7F8C8D]'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-[#5C7F4F] rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-[#E8E6E3] rounded-xl p-4">
                  <Loader2 className="w-5 h-5 text-[#5C7F4F] animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-[#E8E6E3]">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="mb-4">
              <p className="text-sm text-[#7F8C8D] mb-2">Quick prompts:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-3 py-2 bg-[#F0EDE6] hover:bg-[#E8E6E3] rounded-lg text-sm text-[#2C3E50] transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-[#E8E6E3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C7F4F] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-[#5C7F4F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4a6640] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Send
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-center text-[#7F8C8D] mt-3">
            Elya is powered by Claude AI. Conversations are private and stored locally.
          </p>
        </div>
      </div>
    </div>
  );
}
