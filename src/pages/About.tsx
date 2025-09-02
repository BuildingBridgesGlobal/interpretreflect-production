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
          borderBottom: '1px solid rgba(168, 192, 154, 0.2)',
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
          background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.05) 0%, rgba(168, 192, 154, 0.05) 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            About InterpretReflect
          </h1>
          <p className="text-xl" style={{ color: '#5A5A5A' }}>
            Supporting interpreter wellness through evidence-based tools and compassionate technology
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Target className="h-8 w-8 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
              Our Mission
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
              InterpretReflect exists to transform interpreter wellness from an afterthought to a professional priority. We believe that interpreters—who bridge communication in humanity's most critical moments—deserve specialized tools to process, recover, and thrive in their essential work.
            </p>
            <p className="text-lg font-semibold" style={{ color: '#2D5F3F' }}>
              Our mission is to provide every interpreter with accessible, evidence-based wellness tools that prevent burnout, build resilience, and sustain long, fulfilling careers.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <BookOpen className="h-8 w-8 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
              Our Story
            </h2>
          </div>
          <div className="space-y-6">
            <div 
              className="rounded-2xl p-8"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div className="flex items-center mb-4">
                <div
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: 'rgba(168, 192, 154, 0.1)',
                    color: '#6B8B60',
                  }}
                >
                  Founded 2024
                </div>
              </div>
              <p className="mb-4" style={{ color: '#5A5A5A' }}>
                InterpretReflect was born from the lived experiences of interpreters who recognized a critical gap in professional support. After witnessing countless colleagues leave the field due to burnout, vicarious trauma, and lack of recovery resources, our founding team decided to act.
              </p>
              <p className="mb-4" style={{ color: '#5A5A5A' }}>
                We partnered with neuroscientists, wellness researchers, and hundreds of working interpreters to understand the unique stressors of language mediation. What emerged was clear: interpreters needed specialized tools designed for their reality—tools that work in courthouse hallways, hospital break rooms, and the moments between assignments.
              </p>
              <p style={{ color: '#5A5A5A' }}>
                Today, InterpretReflect combines cutting-edge research with practical wisdom from the interpreting community to deliver wellness support that actually works for the professionals who need it most.
              </p>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Users className="h-8 w-8 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
              Our Team
            </h2>
          </div>
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <p className="text-lg mb-6" style={{ color: '#5A5A5A' }}>
              InterpretReflect is built by a diverse team of interpreters, wellness experts, and technologists who share a common vision for interpreter wellbeing.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold" style={{ color: '#2D5F3F' }}>
                  Our Expertise Includes:
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: '#5A5A5A' }}>
                  <li className="flex items-start">
                    <Sparkles className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                    Professional interpreters with 50+ years combined experience
                  </li>
                  <li className="flex items-start">
                    <Sparkles className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                    Neuroscience researchers specializing in stress and trauma
                  </li>
                  <li className="flex items-start">
                    <Sparkles className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                    Clinical wellness practitioners
                  </li>
                  <li className="flex items-start">
                    <Sparkles className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                    Technology experts in privacy and security
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold" style={{ color: '#2D5F3F' }}>
                  Our Commitment:
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: '#5A5A5A' }}>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                    Inclusive design for all interpreters
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                    Evidence-based approaches only
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                    Absolute privacy and confidentiality
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#A8C09A' }} />
                    Continuous improvement based on user feedback
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Approach */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <Award className="h-8 w-8 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
              Our Evidence-Based Approach
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <h3 className="font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Grounded in Research
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Every tool and technique is based on peer-reviewed studies in neuroscience, trauma recovery, and occupational wellness, adapted specifically for interpreters.
              </p>
            </div>
            
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <h3 className="font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Community-Validated
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Features are developed and tested with working interpreters across all modalities and settings to ensure real-world effectiveness.
              </p>
            </div>
            
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <h3 className="font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Continuously Evolving
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                We regularly update our tools based on the latest research and user feedback, ensuring you always have access to the most effective wellness strategies.
              </p>
            </div>
            
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <h3 className="font-bold mb-3" style={{ color: '#1A1A1A' }}>
                Privacy-First Design
              </h3>
              <p className="text-sm" style={{ color: '#5A5A5A' }}>
                Built with HIPAA-compliant infrastructure and zero-knowledge architecture for your reflections, ensuring complete confidentiality.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            Our Values
          </h2>
          <div 
            className="rounded-2xl p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(107, 139, 96, 0.05) 0%, rgba(168, 192, 154, 0.05) 100%)',
              border: '2px solid rgba(168, 192, 154, 0.2)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-2" style={{ color: '#2D5F3F' }}>
                  Accessibility
                </h3>
                <p className="text-sm" style={{ color: '#5A5A5A' }}>
                  Wellness support should be available to every interpreter, regardless of setting, modality, or background.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2" style={{ color: '#2D5F3F' }}>
                  Authenticity
                </h3>
                <p className="text-sm" style={{ color: '#5A5A5A' }}>
                  Built by interpreters who understand the real challenges you face every day.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2" style={{ color: '#2D5F3F' }}>
                  Sustainability
                </h3>
                <p className="text-sm" style={{ color: '#5A5A5A' }}>
                  Supporting long, healthy careers through proactive wellness practices.
                </p>
              </div>
              
              <div>
                <h3 className="font-bold mb-2" style={{ color: '#2D5F3F' }}>
                  Innovation
                </h3>
                <p className="text-sm" style={{ color: '#5A5A5A' }}>
                  Leveraging technology to deliver personalized, effective wellness support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Join Our Mission
          </h2>
          <p className="text-lg mb-8" style={{ color: '#5A5A5A' }}>
            Together, we're building a future where interpreter wellness is a professional standard, not an afterthought.
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