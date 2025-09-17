import React from 'react';
import { ArrowLeft, Eye, Keyboard, Globe, Users, MessageSquare, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Accessibility() {
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div 
          className="text-center mb-12 rounded-3xl p-12"
          style={{
            background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.05), rgba(46, 125, 50, 0.05))',
            border: '1px solid rgba(92, 127, 79, 0.15)',
          }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
            Accessibility at InterpretReflect
          </h1>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: '#666666', lineHeight: '1.8' }}>
            InterpretReflect is committed to making our platform accessible to everyone, including users with disabilities. 
            We aim to comply with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA and are continually working 
            to improve accessibility across all features.
          </p>
        </div>

        {/* Key Accessibility Practices */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#1A1A1A' }}>
            Key Accessibility Practices
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Focus Management */}
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(92, 127, 79, 0.1)',
              }}
            >
              <div className="flex items-center mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(107, 139, 96, 0.1)' }}
                >
                  <Eye className="w-5 h-5" style={{ color: '#6B8B60' }} />
                </div>
                <h3 className="text-lg font-semibold ml-3" style={{ color: '#1A1A1A' }}>Focus Management</h3>
              </div>
              <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>
                Interactive elements and navigation components have visible focus states and logical tab order, 
                making it clear where users are on each page.
              </p>
            </div>

            {/* Semantic HTML */}
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(92, 127, 79, 0.1)',
              }}
            >
              <div className="flex items-center mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(107, 139, 96, 0.1)' }}
                >
                  <Globe className="w-5 h-5" style={{ color: '#6B8B60' }} />
                </div>
                <h3 className="text-lg font-semibold ml-3" style={{ color: '#1A1A1A' }}>Semantic HTML</h3>
              </div>
              <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>
                Uses semantic tags, headings, and ARIA landmarks to support easy navigation for screen readers 
                and assistive technology.
              </p>
            </div>

            {/* Descriptive Text */}
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(92, 127, 79, 0.1)',
              }}
            >
              <div className="flex items-center mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(107, 139, 96, 0.1)' }}
                >
                  <MessageSquare className="w-5 h-5" style={{ color: '#6B8B60' }} />
                </div>
                <h3 className="text-lg font-semibold ml-3" style={{ color: '#1A1A1A' }}>Descriptive Text</h3>
              </div>
              <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>
                Key controls and buttons include descriptive text for screen reader users, 
                enhancing navigation.
              </p>
            </div>

            {/* Keyboard Access */}
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(92, 127, 79, 0.1)',
              }}
            >
              <div className="flex items-center mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(107, 139, 96, 0.1)' }}
                >
                  <Keyboard className="w-5 h-5" style={{ color: '#6B8B60' }} />
                </div>
                <h3 className="text-lg font-semibold ml-3" style={{ color: '#1A1A1A' }}>Keyboard Access</h3>
              </div>
              <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>
                Most features are keyboard accessible, allowing navigation without a mouse.
              </p>
            </div>

            {/* High Contrast */}
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(92, 127, 79, 0.1)',
              }}
            >
              <div className="flex items-center mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(107, 139, 96, 0.1)' }}
                >
                  <Eye className="w-5 h-5" style={{ color: '#6B8B60' }} />
                </div>
                <h3 className="text-lg font-semibold ml-3" style={{ color: '#1A1A1A' }}>High Contrast & Zoom</h3>
              </div>
              <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>
                Supports browser zoom, high contrast mode, and other user-preferred accessibility settings.
              </p>
            </div>

            {/* Screen Readers */}
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(92, 127, 79, 0.1)',
              }}
            >
              <div className="flex items-center mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(107, 139, 96, 0.1)' }}
                >
                  <Users className="w-5 h-5" style={{ color: '#6B8B60' }} />
                </div>
                <h3 className="text-lg font-semibold ml-3" style={{ color: '#1A1A1A' }}>Screen Readers</h3>
              </div>
              <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>
                Designed to work with screen readers including JAWS, NVDA, and VoiceOver.
              </p>
            </div>
          </div>
        </section>

        {/* Practical Tips for Users */}
        <section className="mb-12">
          <div 
            className="rounded-2xl p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.05), rgba(92, 127, 79, 0.08))',
              border: '2px solid rgba(107, 139, 96, 0.2)',
            }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
              Practical Tips for Users
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3" style={{ color: '#6B8B60' }}>🔍</span>
                <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>
                  Use your browser's zoom or text-resize tools for optimal reading comfort.
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3" style={{ color: '#6B8B60' }}>🎨</span>
                <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>
                  Enable high contrast modes if needed (supported in both OS and major browsers).
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3" style={{ color: '#6B8B60' }}>⌨️</span>
                <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>
                  Explore built-in keyboard shortcuts for faster navigation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ASL Video Translations */}
        <section className="mb-12">
          <div 
            className="rounded-2xl p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.05), rgba(46, 125, 50, 0.05))',
              border: '2px solid rgba(27, 94, 32, 0.15)',
            }}
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-4">🤟</span>
              <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                ASL Video Translations Coming Soon
              </h2>
            </div>
            <p style={{ color: '#666666', fontSize: '16px', lineHeight: '1.8' }}>
              We are committed to accessibility for all interpreters. ASL video translations will be available in a future release.
              If you have requests or need ASL support before these are available, please contact us at{' '}
              <a 
                href="mailto:info@buildingbridgeslearning.com" 
                className="font-semibold hover:underline"
                style={{ color: '#6B8B60' }}
              >
                info@buildingbridgeslearning.com
              </a>.
            </p>
          </div>
        </section>

        {/* Continuous Improvements */}
        <section className="mb-12">
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
              Continuous Improvements
            </h2>
            <p style={{ color: '#666666', fontSize: '16px', marginBottom: '20px', lineHeight: '1.8' }}>
              We regularly review and update our content and features for accessibility. In the coming months, we are working on:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div 
                  className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                  style={{ backgroundColor: '#6B8B60' }}
                />
                <p style={{ color: '#666666', fontSize: '15px', lineHeight: '1.6' }}>
                  Expanded language support for non-English users
                </p>
              </div>
              <div className="flex items-start">
                <div 
                  className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                  style={{ backgroundColor: '#6B8B60' }}
                />
                <p style={{ color: '#666666', fontSize: '15px', lineHeight: '1.6' }}>
                  Enhanced mobile device accessibility
                </p>
              </div>
              <div className="flex items-start">
                <div 
                  className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                  style={{ backgroundColor: '#6B8B60' }}
                />
                <p style={{ color: '#666666', fontSize: '15px', lineHeight: '1.6' }}>
                  Greater customization (font size, color schemes)
                </p>
              </div>
              <div className="flex items-start">
                <div 
                  className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                  style={{ backgroundColor: '#6B8B60' }}
                />
                <p style={{ color: '#666666', fontSize: '15px', lineHeight: '1.6' }}>
                  Ongoing user testing with individuals with disabilities
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Assistance & Feedback */}
        <section className="mb-12">
          <div 
            className="rounded-2xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.08), rgba(92, 127, 79, 0.05))',
              border: '2px solid rgba(107, 139, 96, 0.2)',
            }}
          >
            <div className="flex justify-center mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(107, 139, 96, 0.1)' }}
              >
                <HelpCircle className="w-8 h-8" style={{ color: '#6B8B60' }} />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              Need Assistance?
            </h2>
            <p style={{ color: '#666666', fontSize: '16px', marginBottom: '20px', lineHeight: '1.8' }}>
              If you experience any difficulty using our website or have suggestions for improving accessibility, 
              please don't hesitate to reach out.
            </p>
            <a 
              href="mailto:info@buildingbridgeslearning.com" 
              className="inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(27, 94, 32, 0.2)',
              }}
            >
              Contact Us
            </a>
            <p style={{ color: '#666666', fontSize: '14px', marginTop: '16px' }}>
              We aim to respond to all accessibility requests within two business days.
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mb-12">
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>
              <strong style={{ color: '#1A1A1A' }}>Note:</strong> Some accessibility improvements are ongoing. 
              We appreciate your patience and feedback as we continue to enhance the InterpretReflect user experience.
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#6B8B60',
              border: '2px solid #6B8B60',
              fontSize: '15px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(107, 139, 96, 0.05)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(0)';
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