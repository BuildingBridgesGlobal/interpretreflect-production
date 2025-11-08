'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, ChevronRight, Zap, Loader2, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.next';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function CatalystPage() {
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
    const savedMessages = localStorage.getItem(`catalyst_chat_${user.id}`);
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
        content: `Hi! I'm Catalyst, your AI performance partner. I accelerate your professional growth by analyzing cognitive load patterns and optimizing capacity using the ECCI Model.

Ready to elevate your performance? You can ask me about:
- Analyzing a challenging assignment
- Optimizing cognitive load patterns
- Understanding the ECCI Model frameworks
- Building sustainable capacity
- Performance metrics and benchmarking`,
        timestamp: new Date()
      }]);
    }
  }, [user]);

  useEffect(() => {
    // Save messages to localStorage whenever they change
    if (user && messages.length > 0) {
      localStorage.setItem(`catalyst_chat_${user.id}`, JSON.stringify(messages));
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
      const response = await fetch('/api/catalyst/chat', {
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
        throw new Error('Failed to get response from Catalyst');
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
    "Analyze my recent assignment performance",
    "How do I optimize cognitive load?",
    "What is the ECCI Model?",
    "Help me build sustainable capacity",
    "Show me my performance patterns"
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="min-h-screen bg-brand-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-brand-gray-200 flex-shrink-0 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-brand-electric hover:text-brand-electric-hover mb-3 font-body"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-electric to-brand-info rounded-lg flex items-center justify-center shadow-glow-sm">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-primary font-sans">Catalyst</h1>
              <p className="text-sm text-brand-gray-600 font-body">
                Your AI Performance Partner
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
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-electric to-brand-info rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-data p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-brand-primary to-brand-slate text-white shadow-sm'
                      : 'bg-white border border-brand-gray-200 text-brand-charcoal shadow-card'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-body">{message.content}</p>
                  <div
                    className={`text-xs mt-2 font-mono ${
                      message.role === 'user' ? 'text-white/70' : 'text-brand-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center flex-shrink-0 text-white font-semibold font-sans shadow-sm">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-electric to-brand-info rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-brand-gray-200 rounded-data p-4 shadow-card">
                  <Loader2 className="w-5 h-5 text-brand-electric animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-brand-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="mb-4">
              <p className="text-sm text-brand-gray-600 mb-2 font-body">Quick start:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-3 py-2 bg-brand-electric-light hover:bg-brand-electric/20 rounded-data text-sm text-brand-charcoal transition-colors font-body border border-brand-electric/20"
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
              placeholder="Ask Catalyst for performance insights..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-body"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-brand-primary to-brand-slate text-white px-6 py-3 rounded-data font-semibold hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-body"
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

          <p className="text-xs text-center text-brand-gray-500 mt-3 font-body">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            Catalyst is powered by Claude AI. Conversations are private and stored locally.
          </p>
        </div>
      </div>
    </div>
  );
}
