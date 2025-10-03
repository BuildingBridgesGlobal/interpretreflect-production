import React, { useState, useEffect } from 'react';
import { Check, Shield, Brain, Heart, Clock, Users, Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StripePaymentButton } from '../components/StripePaymentButton';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ChatBubbleIcon, SecureLockIcon, HeartPulseIcon, HourglassPersonIcon, CommunityIcon, TargetIcon } from '../components/CustomIcon';

export function PricingProduction() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single();

      if (data && data.subscription_status === 'active') {
        setHasActiveSubscription(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <ChatBubbleIcon size={48} />,
      title: "AI Wellness Companion",
      description: "24/7 support from Elya, your personal wellness AI"
    },
    {
      icon: <HeartPulseIcon size={48} />,
      title: "Burnout Prevention",
      description: "Daily assessments and early warning system"
    },
    {
      icon: <HeartPulseIcon size={48} />,
      title: "Emotional Processing",
      description: "Guided reflection and trauma-informed tools"
    },
    {
      icon: <HourglassPersonIcon size={48} />,
      title: "3-Minute Tools",
      description: "Quick exercises that fit between assignments"
    },
    {
      icon: <CommunityIcon size={48} />,
      title: "Community Support",
      description: "Connect with fellow interpreters"
    },
    {
      icon: <TargetIcon size={48} />,
      title: "Progress Tracking",
      description: "Insights and growth analytics"
    }
  ];

  const testimonials = [
    {
      quote: "InterpretReflect helped me recognize burnout signs early. The daily check-ins are a game-changer.",
      author: "Sarah M.",
      role: "Medical Interpreter"
    },
    {
      quote: "Finally, a platform that understands the unique challenges we face. Elya feels like having a therapist on call.",
      author: "James L.",
      role: "Court Interpreter"
    },
    {
      quote: "The 3-minute exercises fit perfectly between assignments. I feel more grounded throughout my day.",
      author: "Maria G.",
      role: "Educational Interpreter"
    }
  ];

  return (
    <div style={{ backgroundColor: '#FAF9F6', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div 
        className="relative py-20"
        style={{
          background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.05) 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            Invest in Your Wellbeing
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: '#5A5A5A' }}>
            Join thousands of interpreters who are preventing burnout and building sustainable careers
          </p>
          
          {/* Trust Badges */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <SecureLockIcon size={28} />
              <span className="text-sm font-semibold" style={{ color: '#2D5F3F' }}>
                SSL Secured
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TargetIcon size={28} />
              <span className="text-sm font-semibold" style={{ color: '#2D5F3F' }}>
                3-Day Free Trial
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CommunityIcon size={28} />
              <span className="text-sm font-semibold" style={{ color: '#2D5F3F' }}>
                2,000+ Members
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-10">
        <div 
          className="rounded-3xl shadow-xl overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid rgba(92, 127, 79, 0.2)',
          }}
        >
          {/* Card Header */}
          <div 
            className="p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.05), rgba(46, 125, 50, 0.05))',
              borderBottom: '1px solid rgba(92, 127, 79, 0.15)',
            }}
          >
            <div className="inline-block px-4 py-1 rounded-full mb-4" 
              style={{ 
                backgroundColor: 'rgba(27, 94, 32, 0.1)',
                color: '#1b5e20',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
              MOST POPULAR
            </div>
            
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
              InterpretReflect Premium
            </h2>
            
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span className="text-5xl font-bold" style={{ color: '#1b5e20' }}>
                $12.99
              </span>
              <span className="text-lg" style={{ color: '#5A5A5A' }}>
                /month
              </span>
            </div>
            
            <p className="text-sm" style={{ color: '#666' }}>
              Cancel anytime • No hidden fees
            </p>
          </div>

          {/* Features Grid */}
          <div className="p-8">
            <h3 className="font-semibold text-lg mb-6" style={{ color: '#1A1A1A' }}>
              Everything you need to thrive:
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1" style={{ color: '#2D5F3F' }}>
                      {feature.title}
                    </h4>
                    <p className="text-xs" style={{ color: '#666' }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center">
              {hasActiveSubscription ? (
                <div className="space-y-4">
                  <div 
                    className="inline-block px-6 py-3 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(27, 94, 32, 0.1)',
                      color: '#1b5e20',
                    }}
                  >
                    <Check className="inline w-5 h-5 mr-2" />
                    You have an active subscription
                  </div>
                  <div>
                    <button
                      onClick={() => navigate('/profile')}
                      className="text-sm underline"
                      style={{ color: '#6B8B60' }}
                    >
                      Manage Subscription
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {user ? (
                    <button
                      onClick={() => navigate('/signup')}
                      className="w-full md:w-auto px-8 py-4 text-lg rounded-lg font-semibold transition-all"
                      style={{
                        background: 'linear-gradient(135deg, rgb(92, 127, 79), rgb(107, 142, 94))',
                        color: '#FFFFFF',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F5F5DC';
                        e.currentTarget.style.color = 'rgb(92, 127, 79)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgb(92, 127, 79), rgb(107, 142, 94))';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                    >
                      Get Started Now
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/signup')}
                      className="w-full md:w-auto px-8 py-4 text-lg rounded-lg font-semibold transition-all"
                      style={{
                        background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
                        color: '#FFFFFF',
                      }}
                    >
                      Get Started
                    </button>
                  )}
                  
                  <p className="text-xs" style={{ color: '#999' }}>
                    $12.99/month. Cancel anytime.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#1A1A1A' }}>
          Trusted by Interpreters Worldwide
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <p className="text-sm mb-4 italic" style={{ color: '#3A3A3A' }}>
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #6B8B60, #5F7F55)',
                  }}
                />
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>
                    {testimonial.author}
                  </p>
                  <p className="text-xs" style={{ color: '#666' }}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#1A1A1A' }}>
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          <details className="group">
            <summary className="cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="font-semibold" style={{ color: '#2D5F3F' }}>
                How does the free trial work?
              </span>
            </summary>
            <p className="px-4 pb-4 text-sm" style={{ color: '#666' }}>
              You get full access to all features for 3 days. No credit card required upfront. 
              You'll only be charged if you decide to continue after the trial.
            </p>
          </details>
          
          <details className="group">
            <summary className="cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="font-semibold" style={{ color: '#2D5F3F' }}>
                Can I cancel anytime?
              </span>
            </summary>
            <p className="px-4 pb-4 text-sm" style={{ color: '#666' }}>
              Yes! You can cancel your subscription at any time from your account settings. 
              You'll continue to have access until the end of your billing period.
            </p>
          </details>
          
          <details className="group">
            <summary className="cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="font-semibold" style={{ color: '#2D5F3F' }}>
                Is my data secure?
              </span>
            </summary>
            <p className="px-4 pb-4 text-sm" style={{ color: '#666' }}>
              Absolutely. We use bank-level encryption, HIPAA-compliant infrastructure, 
              and never share your personal information. Your reflections and data are private.
            </p>
          </details>
          
          <details className="group">
            <summary className="cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="font-semibold" style={{ color: '#2D5F3F' }}>
                Do you offer team or enterprise plans?
              </span>
            </summary>
            <p className="px-4 pb-4 text-sm" style={{ color: '#666' }}>
              Yes! Contact us at hello@huviatechnologies.com for custom pricing 
              for agencies and organizations.
            </p>
          </details>
        </div>
      </div>

      {/* Bottom CTA */}
      <div 
        className="py-16"
        style={{
          background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.05), rgba(46, 125, 50, 0.05))',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Ready to Transform Your Wellness Journey?
          </h2>
          <p className="text-lg mb-8" style={{ color: '#5A5A5A' }}>
            Join thousands of interpreters who are thriving with InterpretReflect
          </p>
          
          {!hasActiveSubscription && (
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 text-lg rounded-lg font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, rgb(92, 127, 79), rgb(107, 142, 94))',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F5F5DC';
                e.currentTarget.style.color = 'rgb(92, 127, 79)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgb(92, 127, 79), rgb(107, 142, 94))';
                e.currentTarget.style.color = '#FFFFFF';
              }}
            >
              Get Started Now →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}