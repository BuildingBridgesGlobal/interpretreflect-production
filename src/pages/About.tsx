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
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(27, 94, 32, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 94, 32, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(27, 94, 32, 0.2)';
                }}
              >
                <ArrowLeft className="h-5 w-5" style={{ color: '#FFFFFF' }} />
                <span className="text-base">
                  InterpretReflect™
                </span>
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
            About InterpretReflect™
          </h1>
          
          {/* Opening Statement */}
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-2xl font-semibold mb-4" style={{ color: '#2D5F3F' }}>
              Interpreters carry the weight of other people's most difficult moments.
            </p>
            <p className="text-xl italic" style={{ color: '#5A5A5A' }}>
              Now there is a place designed to help them put it down.
            </p>
          </div>

          {/* Context Setting */}
          <div 
            className="max-w-3xl mx-auto p-6 rounded-xl"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '2px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <p className="text-lg leading-relaxed mb-4" style={{ color: '#3A3A3A' }}>
              Imagine finishing an assignment where you interpreted a traumatic medical diagnosis. 
              The family's emotions still linger as you walk away. Where can you go to safely 
              process what you just experienced?
            </p>
            <p className="text-lg leading-relaxed" style={{ color: '#3A3A3A' }}>
              Interpreters navigate high-stakes conversations that shape lives. They deliver news, 
              bridge cultures, and stand with people in moments of celebration and crisis. The impact 
              of how interpreters show up affects not only their own wellbeing but also the trust, 
              clarity, and dignity of the people they serve. InterpretReflect™ was created to support 
              both sides of that equation.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Why We Exist */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            Why We Exist
          </h2>
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <p className="text-lg leading-relaxed mb-4" style={{ color: '#3A3A3A' }}>
              Burnout, vicarious trauma, and compassion fatigue are not signs of weakness. 
              They are natural outcomes of a profession that requires emotional endurance.
            </p>
            
            <p className="text-lg font-semibold mb-4" style={{ color: '#2D5F3F' }}>
              InterpretReflect provides tools that:
            </p>
            
            <div className="space-y-3 mb-6 ml-4">
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: '#6B8B60' }} />
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Help manage compassion fatigue through evidence-based daily practices
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: '#6B8B60' }} />
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Offer confidential, guided reflection to process the emotional load of assignments
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: '#6B8B60' }} />
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Build long-term resilience so interpreters can sustain their careers while serving 
                  communities with clarity and presence
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.05)' }}>
              <p className="text-base font-medium" style={{ color: '#2D5F3F' }}>
                When interpreters are supported, the people who rely on them benefit too. 
                Conversations become clearer, interactions feel safer, and communities experience 
                more equitable access to communication.
              </p>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            What We Do
          </h2>
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <p className="text-lg leading-relaxed mb-4" style={{ color: '#3A3A3A' }}>
              We translate neuroscience and trauma-informed care into tools that fit into 
              an interpreter's real workday:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(107, 139, 96, 0.05)' }}>
                <p className="text-base font-semibold" style={{ color: '#2D5F3F' }}>
                  3-minute decompression exercises
                </p>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  Designed for use between assignments
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(107, 139, 96, 0.05)' }}>
                <p className="text-base font-semibold" style={{ color: '#2D5F3F' }}>
                  Confidential journaling prompts
                </p>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  That reflect interpreting realities
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(107, 139, 96, 0.05)' }}>
                <p className="text-base font-semibold" style={{ color: '#2D5F3F' }}>
                  Grounding techniques
                </p>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  For moments when stress runs high
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(107, 139, 96, 0.05)' }}>
                <p className="text-base font-semibold" style={{ color: '#2D5F3F' }}>
                  Reflection guidance
                </p>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  Informed by lived experience of interpreters
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            How It Works
          </h2>
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <p className="text-lg mb-6" style={{ color: '#3A3A3A' }}>
              In three simple steps, support is always within reach:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6B8B60, #5F7F55)' }}
                >
                  1
                </div>
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Sign up in 30 seconds
                </p>
              </div>
              
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6B8B60, #5F7F55)' }}
                >
                  2
                </div>
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Choose your focus: stress relief, resilience, or emotional reset
                </p>
              </div>
              
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6B8B60, #5F7F55)' }}
                >
                  3
                </div>
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Access tools instantly on any device, in any setting
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose InterpretReflect */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            Why Choose InterpretReflect
          </h2>
          <div 
            className="rounded-2xl p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(107, 139, 96, 0.03) 0%, rgba(92, 127, 79, 0.03) 100%)',
              border: '2px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: '#6B8B60' }} />
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Created by interpreters who understand the work from the inside
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: '#6B8B60' }} />
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Grounded in neuroscience and trauma-informed care principles
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: '#6B8B60' }} />
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Confidential, secure, and designed for interpreter privacy
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: '#6B8B60' }} />
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Developed through consultation with working interpreters across healthcare, legal, and educational settings
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full mr-3 mt-2" style={{ backgroundColor: '#6B8B60' }} />
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Building a growing community of interpreters committed to sustainable practice
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Common Concerns */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            Common Concerns, Answered
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <p className="font-semibold mb-2" style={{ color: '#2D5F3F' }}>No time?</p>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Tools are designed for 3–5 minute breaks.
              </p>
            </div>
            
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <p className="font-semibold mb-2" style={{ color: '#2D5F3F' }}>Privacy worried?</p>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                All reflections are secure and can remain anonymous if you choose.
              </p>
            </div>
            
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <p className="font-semibold mb-2" style={{ color: '#2D5F3F' }}>Not tech-savvy?</p>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                The interface is simple and tested with interpreters across experience levels.
              </p>
            </div>
            
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <p className="font-semibold mb-2" style={{ color: '#2D5F3F' }}>Cost concerns?</p>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Affordable options are available, with employer sponsorship programs on the way.
              </p>
            </div>
          </div>
        </section>

        {/* The Bigger Picture */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            The Bigger Picture
          </h2>
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <p className="text-lg leading-relaxed mb-4" style={{ color: '#3A3A3A' }}>
              Research consistently shows that interpreters experience high levels of stress, 
              vicarious trauma, and burnout. Many leave the profession earlier than expected 
              because of the emotional toll.
            </p>
            
            <div className="p-5 rounded-lg" style={{ 
              backgroundColor: 'rgba(92, 127, 79, 0.05)',
              borderLeft: '4px solid #6B8B60'
            }}>
              <p className="text-base font-medium" style={{ color: '#2D5F3F' }}>
                Supporting interpreters is not just about protecting professionals. It is about 
                ensuring that the communities who depend on interpreters for access to communication 
                receive support from professionals who are clear, present, and able to sustain their service.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            Take the First Step
          </h2>
          
          <div 
            className="max-w-2xl mx-auto p-6 rounded-xl mb-8"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '2px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <p className="text-lg font-medium" style={{ color: '#2D5F3F' }}>
              Every day interpreters help others carry their burdens. InterpretReflect is here 
              to help carry theirs, so the communities they serve can thrive too.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
              color: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(27, 94, 32, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(27, 94, 32, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(27, 94, 32, 0.3)';
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