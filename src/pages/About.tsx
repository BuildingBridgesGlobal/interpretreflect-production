import React from 'react';
import { Heart, Target, Users, BookOpen, Award, Shield, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function About() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#FAF9F6', minHeight: '100vh' }}>
      {/* Header */}
      <nav
        className="sticky top-0 z-50"
        style={{
          backgroundColor: 'rgba(250, 249, 246, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(92, 127, 79, 0.2)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="h-5 w-5" style={{ color: '#6B8B60' }} />
                <div className="flex items-center space-x-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                      boxShadow: '0 2px 8px rgba(107, 139, 96, 0.3)',
                    }}
                  >
                    <Heart className="h-6 w-6" style={{ color: '#FFFFFF' }} />
                  </div>
                  <span className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                    InterpretReflect™
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div 
        className="relative overflow-hidden py-16"
        style={{
          background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.05) 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            About InterpretReflect
          </h1>
          <p className="text-xl" style={{ color: '#5A5A5A' }}>
            Wellness tools made for interpreters, by interpreters
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Why We Exist */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Target className="h-8 w-8 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
              Why We Exist
            </h2>
          </div>
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <p className="text-lg leading-relaxed mb-4" style={{ color: '#5A5A5A' }}>
              Interpreters show up in life's most important moments. Hospital rooms. Courtrooms. Classrooms. We carry the weight of people's stories, and too often, we carry it alone.
            </p>
            <p className="text-lg leading-relaxed" style={{ color: '#5A5A5A' }}>
              InterpretReflect was created to change that. Our goal is simple: give interpreters the space, tools, and support to recover, reflect, and keep doing the work we love without burning out.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <BookOpen className="h-8 w-8 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
              What We Do
            </h2>
          </div>
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <p className="text-lg leading-relaxed mb-4" style={{ color: '#5A5A5A' }}>
              We bring together three things that matter:
            </p>
            <div className="space-y-3 mb-6 ml-4">
              <p className="text-lg" style={{ color: '#5A5A5A' }}>• Neuroscience that explains stress and resilience</p>
              <p className="text-lg" style={{ color: '#5A5A5A' }}>• Real interpreter experience across all settings</p>
              <p className="text-lg" style={{ color: '#5A5A5A' }}>• Technology that is private, secure, and easy to use</p>
            </div>
            <p className="text-lg font-semibold" style={{ color: '#2D5F3F' }}>
              The result: practical tools you can use anywhere — in the break room, in your car after an assignment, or at home when you're trying to reset.
            </p>
          </div>
        </section>

        {/* Who We Are */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Users className="h-8 w-8 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
              Who We Are
            </h2>
          </div>
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <p className="text-lg leading-relaxed" style={{ color: '#5A5A5A' }}>
              We are interpreters, researchers, and wellness experts who believe interpreters deserve the same care we give to others. Everything we build is tested with working interpreters to make sure it fits the real world, not just theory.
            </p>
          </div>
        </section>


        {/* Values */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Award className="h-8 w-8 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
              What We Value
            </h2>
          </div>
          <div 
            className="rounded-2xl p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.05) 100%)',
              border: '2px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-2" style={{ color: '#2D5F3F' }}>
                  Accessibility
                </h3>
                <p className="text-sm" style={{ color: '#5A5A5A' }}>
                  Support that works for every interpreter, no matter the setting.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2" style={{ color: '#2D5F3F' }}>
                  Authenticity
                </h3>
                <p className="text-sm" style={{ color: '#5A5A5A' }}>
                  Built by people who understand this work.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2" style={{ color: '#2D5F3F' }}>
                  Sustainability
                </h3>
                <p className="text-sm" style={{ color: '#5A5A5A' }}>
                  Helping interpreters build long, healthy careers.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2" style={{ color: '#2D5F3F' }}>
                  Innovation
                </h3>
                <p className="text-sm" style={{ color: '#5A5A5A' }}>
                  Smarter tools for reflection, recovery, and growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Join Us
          </h2>
          <p className="text-lg mb-4" style={{ color: '#5A5A5A' }}>
            We are building a future where interpreter wellness is just as important as professional skill.
          </p>
          <p className="text-lg mb-8 font-semibold" style={{ color: '#2D5F3F' }}>
            Because when interpreters are supported, everyone benefits.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            style={{
              background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(107, 139, 96, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
            }}
          >
            Start Your Wellness Journey
          </button>
        </section>

        {/* Footer */}
        <div 
          className="mt-16 pt-8 text-center" 
          style={{ borderTop: '1px solid #E8E5E0' }}
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#6B8B60',
              border: '2px solid #6B8B60',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FBF6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}