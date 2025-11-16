'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, ArrowLeft, Send, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  'How can I reduce cognitive load during back-to-back assignments?',
  'What patterns do you see in my performance data?',
  'Give me strategies to prevent interpreter burnout',
  'How do I optimize my assignment scheduling?',
  'What are my strongest performance indicators?',
];

export default function CatalystPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);

        // Check subscription tier
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        setSubscriptionTier(profile?.subscription_tier || 'free');
      }
    });
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const newMessage: Message = { role: 'user', content };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/catalyst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages([...updatedMessages, data.message]);
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Show upgrade banner for Free tier
  if (subscriptionTier === 'free') {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-brand-electric hover:text-brand-primary mb-6 font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-gradient-to-r from-brand-electric to-brand-info rounded-data shadow-card-hover p-12 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 font-sans">Unlock Catalyst AI</h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto font-body">
            Get unlimited AI performance coaching with Pro. Ask questions, analyze patterns, and optimize your cognitive load 24/7.
          </p>

          <div className="bg-white/10 rounded-data p-6 max-w-md mx-auto mb-8">
            <p className="text-white/80 text-sm mb-2 font-body">Pro includes:</p>
            <ul className="text-left space-y-2 font-body">
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> Unlimited Catalyst AI conversations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> Personalized performance insights
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> Advanced ECCI analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white">✓</span> Unlimited assignments
              </li>
            </ul>
          </div>

          <Link
            href="/pricing"
            className="inline-block bg-white text-brand-electric px-8 py-4 rounded-data font-bold text-lg hover:shadow-glow transition-all font-body"
          >
            Upgrade to Pro - $29/month
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-brand-electric hover:text-brand-primary mb-4 font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-electric to-brand-energy rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-brand-primary font-sans">
              Catalyst AI
            </h1>
            <p className="text-brand-gray-600 font-body">
              Your 24/7 AI Performance Coach <span className="text-brand-electric font-semibold">• Pro</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg border-2 border-brand-gray-200 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-electric-light to-brand-energy-light rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-brand-electric" />
              </div>
              <h2 className="text-2xl font-bold text-brand-primary mb-2 font-sans">
                Welcome to Catalyst
              </h2>
              <p className="text-brand-gray-600 mb-8 text-center max-w-lg font-body">
                I'm your AI performance coach. I analyze your data to provide personalized insights, identify patterns, and help you optimize your performance.
              </p>

              <div className="w-full max-w-2xl">
                <p className="text-sm font-semibold text-brand-primary mb-3 font-body">
                  Try asking:
                </p>
                <div className="grid gap-2">
                  {STARTER_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      className="text-left bg-brand-gray-50 hover:bg-brand-electric-light border border-brand-gray-200 hover:border-brand-electric rounded-lg p-4 transition-all group"
                    >
                      <p className="text-sm text-brand-primary group-hover:text-brand-electric font-body">
                        {prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-electric to-brand-energy rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-brand-electric text-white'
                        : 'bg-brand-gray-100 text-brand-primary'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap font-body leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-brand-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-brand-primary font-mono">
                        {user?.email?.[0].toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-electric to-brand-energy rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-brand-gray-100 rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 text-brand-electric animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t-2 border-brand-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Catalyst about your performance..."
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-brand-gray-200 rounded-lg font-body text-brand-primary focus:border-brand-electric focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="bg-brand-electric text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-body"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </form>
          <p className="text-xs text-center text-brand-gray-500 mt-2 font-body">
            Catalyst analyzes your performance data to provide personalized insights
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-brand-gray-50 rounded-xl p-4 border border-brand-gray-200">
        <p className="text-sm text-brand-gray-600 font-body">
          <strong className="text-brand-primary">Note:</strong> Catalyst uses GPT-4 to analyze your Quick Reflect and Baseline Check data. Your conversations are private and stored securely.
        </p>
      </div>
    </div>
  );
}
