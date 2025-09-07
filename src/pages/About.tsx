import React from 'react';
import { ArrowLeft } from 'lucide-react';
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
                <span className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                  InterpretReflect™
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div 
        className="relative overflow-hidden py-12"
        style={{
          background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.05) 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
            About InterpretReflect
          </h1>
          <p className="text-xl mb-6" style={{ color: '#5A5A5A' }}>
            Wellness tools made for interpreters, by interpreters
          </p>
          {/* Mission Statement */}
          <div 
            className="max-w-3xl mx-auto p-4 rounded-xl"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: '2px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <p className="text-lg font-medium italic" style={{ color: '#2D5F3F' }}>
              "InterpretReflect™ exists to empower interpreters to thrive, both personally and professionally, 
              through science-backed, practical wellness tools designed by interpreters, for interpreters."
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Why We Exist */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Why We Exist
          </h2>
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <p className="text-base leading-relaxed mb-3" style={{ color: '#3A3A3A' }}>
              Interpreters show up in life's most important moments. Hospital rooms. Courtrooms. Classrooms. 
              We carry the weight of people's stories, and too often, we carry it alone.
            </p>
            <p className="text-base leading-relaxed" style={{ color: '#3A3A3A' }}>
              InterpretReflect was created to change that. Our goal is simple: give interpreters the space, 
              tools, and support to recover, reflect, and keep doing the work we love without burning out.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            What We Do
          </h2>
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <p className="text-base leading-relaxed mb-3" style={{ color: '#3A3A3A' }}>
              We bring together three things that matter:
            </p>
            <div className="space-y-2 mb-4 ml-4">
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full mr-3 mt-2" style={{ backgroundColor: '#6B8B60' }} />
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Neuroscience that explains stress and resilience
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full mr-3 mt-2" style={{ backgroundColor: '#6B8B60' }} />
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Real interpreter experience across all settings
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full mr-3 mt-2" style={{ backgroundColor: '#6B8B60' }} />
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Technology that is private, secure, and easy to use
                </p>
              </div>
            </div>
            <p className="text-base font-semibold p-3 rounded-lg" style={{ 
              color: '#2D5F3F',
              backgroundColor: 'rgba(92, 127, 79, 0.05)'
            }}>
              The result: practical tools you can use anywhere — in the break room, in your car after an assignment, 
              or at home when you're trying to reset.
            </p>
          </div>
        </section>

        {/* Who We Are */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Who We Are
          </h2>
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <p className="text-base leading-relaxed" style={{ color: '#3A3A3A' }}>
              We are interpreters, researchers, and wellness experts who believe interpreters deserve the same care 
              we give to others. Everything we build is tested with working interpreters to make sure it fits the 
              real world, not just theory.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            What We Value
          </h2>
          <div 
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(145deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.05) 100%)',
              border: '2px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-1" style={{ color: '#2D5F3F' }}>
                  Accessibility
                </h3>
                <p className="text-sm" style={{ color: '#3A3A3A' }}>
                  Support that works for every interpreter, no matter the setting.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-1" style={{ color: '#2D5F3F' }}>
                  Authenticity
                </h3>
                <p className="text-sm" style={{ color: '#3A3A3A' }}>
                  Built by people who understand this work.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-1" style={{ color: '#2D5F3F' }}>
                  Sustainability
                </h3>
                <p className="text-sm" style={{ color: '#3A3A3A' }}>
                  Helping interpreters build long, healthy careers.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-1" style={{ color: '#2D5F3F' }}>
                  Innovation
                </h3>
                <p className="text-sm" style={{ color: '#3A3A3A' }}>
                  Smarter tools for reflection, recovery, and growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
            Join Us
          </h2>
          <p className="text-base mb-2" style={{ color: '#3A3A3A' }}>
            We are building a future where interpreter wellness is just as important as professional skill.
          </p>
          <p className="text-base mb-6 font-semibold" style={{ color: '#2D5F3F' }}>
            Because when interpreters are supported, everyone benefits.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-base transition-all"
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
          className="mt-12 pt-6 text-center" 
          style={{ borderTop: '1px solid #E8E5E0' }}
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold transition-all text-sm"
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
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}