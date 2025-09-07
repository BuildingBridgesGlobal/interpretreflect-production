import React from 'react';
import { FileText, Users, CreditCard, AlertCircle, ArrowLeft, Heart, Shield, BookOpen, Gavel } from 'lucide-react';
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
        {/* Title and Intro */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Terms of Service
          </h1>
          <p className="text-sm mb-6" style={{ color: '#6B7C6B' }}>
            Effective Date: January 2025
          </p>
        </div>

        {/* 1. Introduction */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
              1. Introduction
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: '#3A3A3A' }}>
              These Terms of Service ("Terms") govern your access to and use of the InterpretReflect™ wellness platform. 
              By using our services, you acknowledge and accept these Terms in full.
            </p>
          </div>
        </section>

        {/* 2. Service Description */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
              2. Service Description
            </h2>
            <div className="space-y-3" style={{ color: '#3A3A3A' }}>
              <p className="mb-2 text-sm">
                InterpretReflect is a platform designed for professional interpreters, offering:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-start">
                  <span className="mr-2 text-sm">•</span>
                  <p className="text-sm">Burnout assessment and monitoring tools</p>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-sm">•</span>
                  <p className="text-sm">Guided reflection and journaling</p>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-sm">•</span>
                  <p className="text-sm">Stress management and recovery programming</p>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-sm">•</span>
                  <p className="text-sm">Professional development tracking features</p>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-sm">•</span>
                  <p className="text-sm">AI-powered wellness companion (Elya)</p>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-sm">•</span>
                  <p className="text-sm">Continuing education credits (Professional Plan)</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold" style={{ color: '#2D5F3F' }}>
                InterpretReflect is not a provider of medical or psychological treatment.
              </p>
            </div>
          </div>
        </section>

        {/* 3. User Obligations */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
              3. User Obligations
            </h2>
            <div className="space-y-3" style={{ color: '#3A3A3A' }}>
              <p className="mb-2 text-sm">
                By using InterpretReflect, you agree to:
              </p>
              <div className="space-y-1.5 text-sm">
                <p>•
 Provide accurate information during registration and account maintenance</p>
                <p>• Maintain the confidentiality of your account credentials</p>
                <p>• Use the platform solely for your personal wellness and professional development</p>
                <p>• Respect privacy and confidentiality within any shared or community features</p>
                <p>• Not copy, redistribute, or otherwise misuse proprietary content, tools, or intellectual property</p>
                <p>• Consult qualified professionals for any serious mental health concerns</p>
              </div>
              <p className="mt-3 text-sm font-semibold" style={{ color: '#2D5F3F' }}>
                The platform does not substitute professional medical, mental health, or therapeutic services.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Subscription and Payment Terms */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
              4. Subscription and Payment Terms
            </h2>
            <div className="space-y-3" style={{ color: '#3A3A3A' }}>
              <p className="mb-2 text-sm">InterpretReflect offers the following plans:</p>
              
              <div className="space-y-2">
                <p className="text-sm">• <strong>Essential Plan ($12/month):</strong> All core wellness tools and unlimited reflection</p>
                <p className="text-sm">• <strong>Professional Plan ($24/month):</strong> Essential features plus access to the AI companion, CEU credits, and advanced analytics</p>
                <p className="text-sm">• <strong>Custom organizational plans:</strong> Available upon request</p>
              </div>

              <div className="mt-3">
                <p className="font-semibold mb-2 text-sm">Subscription details:</p>
                <div className="space-y-1.5 text-sm">
                  <p>• Subscriptions renew automatically each month</p>
                  <p>• You may cancel at any time; services remain active until the end of the billing cycle</p>
                  <p>• A 7-day money-back guarantee is available to new subscribers</p>
                  <p>• Users will be notified of any changes in subscription fees no less than 30 days prior to implementation</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Liability Limitations */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'rgba(92, 127, 79, 0.05)',
              border: '2px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
              5. Liability Limitations
            </h2>
            <div style={{ color: '#3A3A3A' }}>
              <p className="mb-2 text-sm">InterpretReflect services are provided "as is." The following limitations apply:</p>
              <div className="space-y-1.5 text-sm">
                <p>• InterpretReflect does not guarantee any specific outcomes or results from the use of its tools or services.</p>
                <p>• InterpretReflect assumes no liability for user actions, decisions, or outcomes resulting from use of the platform's resources or recommendations.</p>
                <p>• The total liability of InterpretReflect, in any claim, is limited to the amount paid for the service during the prior twelve months.</p>
                <p>• The company is not responsible for third-party content, services, or conduct.</p>
                <p>• Service availability may be suspended or interrupted without notice for maintenance, updates, or unforeseen circumstances.</p>
                <p>• In emergencies or mental health crises, users must contact local emergency services.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Intellectual Property */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
              6. Intellectual Property
            </h2>
            <p style={{ color: '#3A3A3A' }}>
              All content, software, and materials provided via InterpretReflect remain the exclusive property of 
              InterpretReflect or its licensors. User-generated reflections and data remain your property, but you 
              grant us a limited license to process and store this information as needed for service provision.
            </p>
          </div>
        </section>

        {/* 7. Modifications to These Terms */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
              7. Modifications to These Terms
            </h2>
            <p style={{ color: '#3A3A3A' }}>
              We may update or revise these Terms from time to time. If material changes occur, you will be 
              notified by email at least 30 days before the changes become effective. Continued use of the 
              platform constitutes acceptance of revised Terms.
            </p>
          </div>
        </section>

        {/* 8. Contact */}
        <section className="mb-8">
          <div 
            className="rounded-2xl p-6 text-center"
            style={{
              background: 'linear-gradient(145deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.05) 100%)',
              border: '2px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
              8. Contact
            </h2>
            <p className="mb-2 text-sm" style={{ color: '#3A3A3A' }}>
              For any questions or concerns related to these Terms, please email:
            </p>
            <a 
              href="mailto:info@buildingbridgeslearning.com" 
              className="font-semibold text-base hover:underline"
              style={{ color: '#2D5F3F' }}
            >
              info@buildingbridgeslearning.com
            </a>
          </div>
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