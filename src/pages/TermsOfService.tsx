import React from 'react';
import { FileText, Users, CreditCard, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TermsOfService() {
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
                    <FileText className="h-6 w-6" style={{ color: '#FFFFFF' }} />
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
          Terms of Service
        </h1>
        
        <p className="text-sm mb-8" style={{ color: '#5A5A5A' }}>
          Effective Date: January 2025
        </p>

        {/* Service Description */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              Service Description
            </h2>
          </div>
          <div className="space-y-4" style={{ color: '#5A5A5A' }}>
            <p>
              InterpretReflect is a wellness platform designed specifically for professional interpreters. Our services include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Burnout assessment and monitoring tools</li>
              <li>Guided reflection exercises and journaling</li>
              <li>Stress management and recovery techniques</li>
              <li>Professional development tracking</li>
              <li>AI-powered wellness companion (Elya)</li>
              <li>Educational resources and continuing education credits (Professional Plan)</li>
            </ul>
            <p className="font-semibold" style={{ color: '#2D5F3F' }}>
              InterpretReflect is a wellness support tool and does not provide medical or psychological treatment.
            </p>
          </div>
        </section>

        {/* User Responsibilities */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              User Responsibilities
            </h2>
          </div>
          <div className="space-y-4" style={{ color: '#5A5A5A' }}>
            <p>
              By using InterpretReflect, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information during registration</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use the service for personal wellness purposes only</li>
              <li>Respect the privacy and confidentiality of any shared community features</li>
              <li>Not share or redistribute proprietary content or tools</li>
              <li>Seek professional help for serious mental health concerns</li>
            </ul>
            <p>
              You acknowledge that InterpretReflect is not a substitute for professional mental health care, and you should consult qualified professionals for medical or psychological conditions.
            </p>
          </div>
        </section>

        {/* Subscription Terms */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <CreditCard className="h-6 w-6 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              Subscription Terms
            </h2>
          </div>
          <div className="space-y-4" style={{ color: '#5A5A5A' }}>
            <p>
              InterpretReflect offers monthly subscription plans:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Plan ($12/month):</strong> Core wellness tools and unlimited reflections</li>
              <li><strong>Professional Plan ($24/month):</strong> All Essential features plus AI companion, CEU credits, and advanced analytics</li>
              <li><strong>Organizations:</strong> Custom pricing for agencies and educational programs</li>
            </ul>
            <div className="mt-4 space-y-2">
              <p><strong>Billing:</strong> Subscriptions renew automatically each month</p>
              <p><strong>Cancellation:</strong> Cancel anytime with no penalties. Access continues until the end of the billing period</p>
              <p><strong>Refunds:</strong> We offer a 7-day money-back guarantee for new subscribers</p>
              <p><strong>Price Changes:</strong> We'll notify you 30 days before any price increases</p>
            </div>
          </div>
        </section>

        {/* Liability Limitations */}
        <section className="mb-12">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 mr-3" style={{ color: '#6B8B60' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              Liability Limitations
            </h2>
          </div>
          <div className="space-y-4" style={{ color: '#5A5A5A' }}>
            <p>
              InterpretReflect provides wellness tools on an "as is" basis:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We do not guarantee specific wellness outcomes or results</li>
              <li>We are not liable for decisions made based on our tools or content</li>
              <li>Our liability is limited to the amount paid for the service in the past 12 months</li>
              <li>We are not responsible for third-party services or content</li>
              <li>Service availability may be interrupted for maintenance or updates</li>
            </ul>
            <p className="font-semibold" style={{ color: '#2D5F3F' }}>
              In case of medical or psychological emergency, contact emergency services immediately.
            </p>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Intellectual Property
          </h2>
          <div className="space-y-4" style={{ color: '#5A5A5A' }}>
            <p>
              All content, tools, and materials on InterpretReflect are protected by copyright and intellectual property laws. You retain ownership of your personal reflections and data. By using our service, you grant us a limited license to process and store your data to provide our services.
            </p>
          </div>
        </section>

        {/* Modifications */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Modifications to Terms
          </h2>
          <p style={{ color: '#5A5A5A' }}>
            We may update these terms periodically. Significant changes will be communicated via email at least 30 days in advance. Continued use of the service after changes indicates acceptance of the updated terms.
          </p>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Questions?
          </h2>
          <p style={{ color: '#5A5A5A' }}>
            For questions about these terms, please contact us at{' '}
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