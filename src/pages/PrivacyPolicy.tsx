import React from 'react';
import { Shield, Lock, Eye, Cookie, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PrivacyPolicy() {
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
                    <Shield className="h-6 w-6" style={{ color: '#FFFFFF' }} />
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8" style={{ color: '#1A1A1A' }}>
          Privacy Policy
        </h1>
        
        <p className="text-sm mb-8" style={{ color: '#5A5A5A' }}>
          Last updated: January 2025
        </p>

        {/* Data Collection */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Eye className="h-6 w-6 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              Data Collection Practices
            </h2>
          </div>
          <div className="space-y-4" style={{ color: '#5A5A5A' }}>
            <p>
              InterpretReflect collects minimal personal information necessary to provide our wellness services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (email, name, professional credentials)</li>
              <li>Wellness assessment responses and reflection entries</li>
              <li>Usage analytics to improve our services</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>
            <p>
              We never collect or store information about your clients or specific assignment details beyond what you choose to share in reflections.
            </p>
          </div>
        </section>

        {/* Data Security Standards */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              Data Security Standards
            </h2>
          </div>
          <div className="space-y-4" style={{ color: '#5A5A5A' }}>
            <p>
              InterpretReflect is committed to protecting your wellness data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All data is encrypted at rest and in transit</li>
              <li>Access controls ensure only you can view your personal data</li>
              <li>We follow industry best practices for data security</li>
              <li>Regular security audits and updates</li>
              <li>We are working toward full HIPAA compliance</li>
            </ul>
            <p className="font-semibold" style={{ color: '#2D5F3F' }}>
              Note: InterpretReflect is a wellness tool, not a medical service.
            </p>
          </div>
        </section>

        {/* User Data Protection */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Lock className="h-6 w-6 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              User Data Protection
            </h2>
          </div>
          <div className="space-y-4" style={{ color: '#5A5A5A' }}>
            <p>
              Your privacy and data security are our top priorities:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your reflections and assessments are private and never shared without consent</li>
              <li>Anonymous aggregated data may be used for research with explicit opt-in</li>
              <li>You can export or delete all your data at any time</li>
              <li>We never sell or share your personal information with third parties</li>
              <li>Two-factor authentication available for enhanced account security</li>
            </ul>
          </div>
        </section>

        {/* Cookie Usage */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Cookie className="h-6 w-6 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              Cookie Usage
            </h2>
          </div>
          <div className="space-y-4" style={{ color: '#5A5A5A' }}>
            <p>
              We use cookies to enhance your experience:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential cookies:</strong> Required for authentication and security</li>
              <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics cookies:</strong> Help us understand usage patterns (anonymized)</li>
            </ul>
            <p>
              You can manage cookie preferences in your browser settings. Disabling essential cookies may limit functionality.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Questions or Concerns?
          </h2>
          <p style={{ color: '#5A5A5A' }}>
            If you have questions about our privacy practices or wish to exercise your data rights, please contact us at{' '}
            <a 
              href="mailto:info@buildingbridgeslearning.com" 
              className="font-semibold hover:underline"
              style={{ color: '#6B8B60' }}
            >
              info@buildingbridgeslearning.com
            </a>
          </p>
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