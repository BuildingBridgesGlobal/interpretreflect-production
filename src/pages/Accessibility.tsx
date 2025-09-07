import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Accessibility() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
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
                <ArrowLeft className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
                <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  InterpretReflect™
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Intro */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Accessibility at InterpretReflect
          </h1>
        </div>

        {/* Commitment Statement */}
        <div 
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <p style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: '1.6' }}>
            InterpretReflect is committed to making our platform accessible to everyone, including users with disabilities. 
            We aim to comply with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA and are continually working 
            to improve accessibility across all features.
          </p>
        </div>

        {/* Key Accessibility Practices */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Key Accessibility Practices:
            </h2>
            <div style={{ color: 'var(--text-primary)' }}>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Focus Management:</p>
                <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                  We ensure that interactive elements and navigation components have visible focus states and logical tab order, 
                  making it clear where users are on each page.
                </p>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Semantic HTML:</p>
                <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                  Our site uses semantic tags, headings, and ARIA landmarks to support easy navigation for all users, 
                  including those using screen readers or other assistive technology.
                </p>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Descriptive Non-Visual Text:</p>
                <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                  All controls, icons, and buttons include hidden descriptive text for screen reader users, 
                  beyond standard image alt text.
                </p>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Keyboard Accessibility:</p>
                <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                  Every feature may be accessed and used with only a keyboard.
                </p>
              </div>
              
              <div>
                <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>High Contrast and Zoom:</p>
                <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                  Our design supports browser zoom, high contrast mode, and other user-preferred accessibility settings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Practical Tips for Users */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'var(--primary-50)',
              border: '2px solid var(--primary-300)',
            }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Practical Tips for Users:
            </h2>
            <div style={{ color: 'var(--text-primary)' }}>
              <ul style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                <li style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                  • Use your browser's zoom or text-resize tools for optimal reading comfort.
                </li>
                <li style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                  • Enable high contrast modes if needed (supported in both OS and major browsers).
                </li>
                <li style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                  • Explore built-in keyboard shortcuts for faster navigation.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ASL Video Translations */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'var(--primary-50)',
              border: '2px solid var(--primary-300)',
            }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              ASL Video Translations Coming Soon
            </h2>
            <p style={{ color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.6' }}>
              We are committed to accessibility for all interpreters. ASL video translations will be available in a future release.
              If you have requests or need ASL support before these are available, please contact us at{' '}
              <a 
                href="mailto:info@buildingbridgeslearning.com" 
                className="font-semibold hover:underline"
                style={{ color: 'var(--text-primary)' }}
              >
                info@buildingbridgeslearning.com
              </a>.
            </p>
          </div>
        </section>

        {/* Continuous Improvements */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Continuous Improvements (Planned/In Progress):
            </h2>
            <div style={{ color: 'var(--text-primary)' }}>
              <p style={{ color: 'var(--text-primary)', fontSize: '14px', marginBottom: '12px' }}>
                We regularly review and update our content and features for accessibility. In the coming months, we are working on:
              </p>
              <ul style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                <li style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                  • Expanded language support for non-English users
                </li>
                <li style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                  • Enhanced mobile device accessibility
                </li>
                <li style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                  • Greater customization (font size, color schemes)
                </li>
                <li style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                  • Ongoing user testing with individuals with disabilities
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Assistance & Feedback */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(145deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.05) 100%)',
              border: '2px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Assistance & Feedback:
            </h2>
            <p style={{ color: '#1A1A1A', fontSize: '14px', marginBottom: '12px' }}>
              If you experience any difficulty using our website or have suggestions for improving accessibility, 
              please contact us at{' '}
              <a 
                href="mailto:info@buildingbridgeslearning.com" 
                className="font-semibold hover:underline"
                style={{ color: 'var(--text-primary)' }}
              >
                info@buildingbridgeslearning.com
              </a>. 
              We aim to respond to all accessibility requests within two business days.
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Disclaimer:
            </h2>
            <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
              Some accessibility improvements are ongoing. We appreciate your patience and feedback as we 
              continue to enhance the InterpretReflect user experience.
            </p>
          </div>
        </section>

        {/* Footer */}
        <div 
          className="mt-12 pt-6 text-center" 
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '2px solid var(--text-primary)',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-50)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
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