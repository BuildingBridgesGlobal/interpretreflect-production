import React from 'react';
import { FileText, Users, CreditCard, AlertCircle, ArrowLeft, Leaf, Waves, Flower, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FAFBFA 0%, #F4F6F5 50%, #E8F5EC 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232D5A3D' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.5
      }} />

      {/* Header */}
      <nav
        className="sticky top-0 z-50"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid #2D5A3D',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="h-5 w-5" style={{ color: '#2D5A3D' }} />
                <div className="flex items-center space-x-3">
                  <div
                    className="p-2 rounded-full"
                    style={{
                      background: 'linear-gradient(145deg, #2D5A3D 0%, #4A7C59 100%)',
                      boxShadow: '0 4px 12px rgba(45, 90, 61, 0.3)',
                    }}
                  >
                    <FileText className="h-6 w-6" style={{ color: '#FFFFFF' }} />
                  </div>
                  <span className="text-xl font-bold" style={{
                    color: '#1A2821',
                    fontFamily: "'Playfair Display', serif"
                  }}>
                    InterpretReflect™
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Welcoming Introduction */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 mb-6">
            <Flower className="h-8 w-8" style={{ color: '#2D5A3D' }} />
            <Heart className="h-6 w-6" style={{ color: '#3B6B7C' }} />
            <Flower className="h-8 w-8" style={{ color: '#2D5A3D' }} />
          </div>
          <h1 className="text-5xl font-bold mb-6" style={{
            color: '#2D5A3D',
            fontFamily: "'Playfair Display', serif",
            lineHeight: '1.2'
          }}>
            Terms of Service
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{
            color: '#3A4742',
            fontFamily: "'Open Sans', sans-serif"
          }}>
            Welcome to InterpretReflect – where clarity meets calm. Please review our Terms of Service to ensure a harmonious and informed experience.
          </p>
          <p className="text-sm mt-4" style={{
            color: '#546660',
            fontFamily: "'Open Sans', sans-serif"
          }}>
            Effective Date: January 2025
          </p>
        </div>

        {/* Service Description Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: 'rgba(45, 90, 61, 0.1)' }}>
              <FileText className="h-8 w-8" style={{ color: '#2D5A3D' }} />
            </div>
            <h2 className="text-3xl font-bold" style={{
              color: '#2D5A3D',
              fontFamily: "'Playfair Display', serif"
            }}>
              Service Description
            </h2>
          </div>
          <div className="space-y-6" style={{
            color: '#3A4742',
            fontFamily: "'Open Sans', sans-serif",
            lineHeight: '1.7'
          }}>
            <p>
              InterpretReflect is a wellness platform designed specifically for professional interpreters. Our services include:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>Burnout assessment and monitoring tools</span>
              </li>
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>Guided reflection exercises and journaling</span>
              </li>
              <li className="flex items-start">
                <Waves className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>Stress management and recovery techniques</span>
              </li>
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>Professional development tracking</span>
              </li>
              <li className="flex items-start">
                <Heart className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>AI-powered wellness companion (Elya)</span>
              </li>
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>Educational resources and continuing education credits (Professional Plan)</span>
              </li>
            </ul>
            <p className="font-semibold text-lg" style={{ color: '#2D5A3D' }}>
              InterpretReflect is a wellness support tool and does not provide medical or psychological treatment.
            </p>
          </div>
        </div>

        {/* User Responsibilities Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: 'rgba(45, 90, 61, 0.1)' }}>
              <Users className="h-8 w-8" style={{ color: '#2D5A3D' }} />
            </div>
            <h2 className="text-3xl font-bold" style={{
              color: '#2D5A3D',
              fontFamily: "'Playfair Display', serif"
            }}>
              User Responsibilities
            </h2>
          </div>
          <div className="space-y-6" style={{
            color: '#3A4742',
            fontFamily: "'Open Sans', sans-serif",
            lineHeight: '1.7'
          }}>
            <p>
              By using InterpretReflect, you agree to:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>Provide accurate information during registration</span>
              </li>
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>Maintain the confidentiality of your account credentials</span>
              </li>
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>Use the service for personal wellness purposes only</span>
              </li>
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>Respect the privacy and confidentiality of any shared community features</span>
              </li>
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>Not share or redistribute proprietary content or tools</span>
              </li>
              <li className="flex items-start">
                <Heart className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>Seek professional help for serious mental health concerns</span>
              </li>
            </ul>
            <p>
              You acknowledge that InterpretReflect is not a substitute for professional mental health care, and you should consult qualified professionals for medical or psychological conditions.
            </p>
          </div>
        </div>

        {/* Subscription Terms Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: 'rgba(45, 90, 61, 0.1)' }}>
              <CreditCard className="h-8 w-8" style={{ color: '#2D5A3D' }} />
            </div>
            <h2 className="text-3xl font-bold" style={{
              color: '#2D5A3D',
              fontFamily: "'Playfair Display', serif"
            }}>
              Subscription Terms
            </h2>
          </div>
          <div className="space-y-6" style={{
            color: '#3A4742',
            fontFamily: "'Open Sans', sans-serif",
            lineHeight: '1.7'
          }}>
            <p>
              InterpretReflect offers monthly subscription plans:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span><strong>Essential Plan ($12/month):</strong> Core wellness tools and unlimited reflections</span>
              </li>
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span><strong>Professional Plan ($24/month):</strong> All Essential features plus AI companion, CEU credits, and advanced analytics</span>
              </li>
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span><strong>Organizations:</strong> Custom pricing for agencies and educational programs</span>
              </li>
            </ul>
            <div className="mt-6 space-y-3 bg-gray-50 rounded-xl p-6">
              <p><strong>Billing:</strong> Subscriptions renew automatically each month</p>
              <p><strong>Cancellation:</strong> Cancel anytime with no penalties. Access continues until the end of the billing period</p>
              <p><strong>Refunds:</strong> We offer a 7-day money-back guarantee for new subscribers</p>
              <p><strong>Price Changes:</strong> We'll notify you 30 days before any price increases</p>
            </div>
          </div>
        </div>

        {/* Liability Limitations Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: 'rgba(45, 90, 61, 0.1)' }}>
              <AlertCircle className="h-8 w-8" style={{ color: '#2D5A3D' }} />
            </div>
            <h2 className="text-3xl font-bold" style={{
              color: '#2D5A3D',
              fontFamily: "'Playfair Display', serif"
            }}>
              Liability Limitations
            </h2>
          </div>
          <div className="space-y-6" style={{
            color: '#3A4742',
            fontFamily: "'Open Sans', sans-serif",
            lineHeight: '1.7'
          }}>
            <p>
              InterpretReflect provides wellness tools on an "as is" basis:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>We do not guarantee specific wellness outcomes or results</span>
              </li>
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>We are not liable for decisions made based on our tools or content</span>
              </li>
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>Our liability is limited to the amount paid for the service in the past 12 months</span>
              </li>
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>We are not responsible for third-party services or content</span>
              </li>
              <li className="flex items-start">
                <Leaf className="h-5 w-5 mr-3 mt-1 flex-shrink-0" style={{ color: '#2D5A3D' }} />
                <span>Service availability may be interrupted for maintenance or updates</span>
              </li>
            </ul>
            <p className="font-semibold text-lg" style={{ color: '#2D5A3D' }}>
              In case of medical or psychological emergency, contact emergency services immediately.
            </p>
          </div>
        </div>

        {/* Intellectual Property Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-3xl font-bold mb-6" style={{
            color: '#2D5A3D',
            fontFamily: "'Playfair Display', serif"
          }}>
            Intellectual Property
          </h2>
          <div className="space-y-6" style={{
            color: '#3A4742',
            fontFamily: "'Open Sans', sans-serif",
            lineHeight: '1.7'
          }}>
            <p>
              All content, tools, and materials on InterpretReflect are protected by copyright and intellectual property laws. You retain ownership of your personal reflections and data. By using our service, you grant us a limited license to process and store your data to provide our services.
            </p>
          </div>
        </div>

        {/* Modifications Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-3xl font-bold mb-6" style={{
            color: '#2D5A3D',
            fontFamily: "'Playfair Display', serif"
          }}>
            Modifications to Terms
          </h2>
          <p style={{
            color: '#3A4742',
            fontFamily: "'Open Sans', sans-serif",
            lineHeight: '1.7'
          }}>
            We may update these terms periodically. Significant changes will be communicated via email at least 30 days in advance. Continued use of the service after changes indicates acceptance of the updated terms.
          </p>
        </div>

        {/* Contact Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-3xl font-bold mb-6" style={{
            color: '#2D5A3D',
            fontFamily: "'Playfair Display', serif"
          }}>
            Questions?
          </h2>
          <p style={{
            color: '#3A4742',
            fontFamily: "'Open Sans', sans-serif",
            lineHeight: '1.7'
          }}>
            For questions about these terms, please contact us at{' '}
            <a
              href="mailto:info@buildingbridgeslearning.com"
              className="font-semibold hover:underline transition-colors"
              style={{ color: '#2D5A3D' }}
            >
              info@buildingbridgeslearning.com
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#2D5A3D',
              border: '2px solid #2D5A3D',
              boxShadow: '0 4px 12px rgba(45, 90, 61, 0.2)',
              fontFamily: "'Open Sans', sans-serif"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2D5A3D';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.color = '#2D5A3D';
            }}
          >
            <ArrowLeft className="h-5 w-5 mr-3" />
            Back to Home
          </button>
        </div>
      </div>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@400;600;700&display=swap');
      `}</style>
    </div>
  );
}