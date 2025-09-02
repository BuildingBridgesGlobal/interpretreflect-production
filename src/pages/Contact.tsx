import React from 'react';
import { Mail, Clock, Users, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Contact() {
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
                    <MessageSquare className="h-6 w-6" style={{ color: '#FFFFFF' }} />
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
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
          Contact Us
        </h1>
        
        <p className="text-lg mb-12" style={{ color: '#5A5A5A' }}>
          We're here to support your wellness journey. Reach out with questions, feedback, or partnership inquiries.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* General Support */}
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div className="flex items-center mb-4">
              <div
                className="p-3 rounded-xl mr-4"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                }}
              >
                <Mail className="h-6 w-6" style={{ color: '#FFFFFF' }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                General Support
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-1" style={{ color: '#2D5F3F' }}>
                  Email
                </p>
                <a 
                  href="mailto:info@buildingbridgeslearning.com"
                  className="text-lg hover:underline"
                  style={{ color: '#6B8B60' }}
                >
                  info@buildingbridgeslearning.com
                </a>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-2 mt-0.5" style={{ color: '#A8C09A' }} />
                <div>
                  <p className="font-semibold mb-1" style={{ color: '#2D5F3F' }}>
                    Response Time
                  </p>
                  <p style={{ color: '#5A5A5A' }}>
                    Within 48 hours during business days
                  </p>
                </div>
              </div>

              <div className="pt-4" style={{ borderTop: '1px solid #E8E5E0' }}>
                <p className="text-sm" style={{ color: '#5A5A5A' }}>
                  For account issues, billing questions, technical support, or general inquiries about our wellness tools.
                </p>
              </div>
            </div>
          </div>

          {/* Partnership Inquiries */}
          <div 
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div className="flex items-center mb-4">
              <div
                className="p-3 rounded-xl mr-4"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                }}
              >
                <Users className="h-6 w-6" style={{ color: '#FFFFFF' }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                Partnerships & Organizations
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-1" style={{ color: '#2D5F3F' }}>
                  Email
                </p>
                <a 
                  href="mailto:info@buildingbridgeslearning.com"
                  className="text-lg hover:underline"
                  style={{ color: '#6B8B60' }}
                >
                  info@buildingbridgeslearning.com
                </a>
              </div>
              
              <div className="pt-4" style={{ borderTop: '1px solid #E8E5E0' }}>
                <p className="text-sm mb-3" style={{ color: '#5A5A5A' }}>
                  Perfect for:
                </p>
                <ul className="space-y-1 text-sm" style={{ color: '#5A5A5A' }}>
                  <li>• Interpreting agencies</li>
                  <li>• Educational institutions</li>
                  <li>• Healthcare organizations</li>
                  <li>• Professional associations</li>
                  <li>• Wellness program collaborations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div 
          className="rounded-2xl p-8 mb-12"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
          }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
            Helpful Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2" style={{ color: '#2D5F3F' }}>
                Common Topics
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: '#5A5A5A' }}>
                <li>• Getting started with InterpretReflect</li>
                <li>• Understanding your burnout assessment</li>
                <li>• Using reflection tools effectively</li>
                <li>• Managing your subscription</li>
                <li>• Privacy and data security</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2" style={{ color: '#2D5F3F' }}>
                Other Contacts
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: '#5A5A5A' }}>
                <li>
                  <strong>Privacy concerns:</strong>{' '}
                  <a 
                    href="mailto:info@buildingbridgeslearning.com"
                    className="hover:underline"
                    style={{ color: '#6B8B60' }}
                  >
                    info@buildingbridgeslearning.com
                  </a>
                </li>
                <li>
                  <strong>Legal inquiries:</strong>{' '}
                  <a 
                    href="mailto:info@buildingbridgeslearning.com"
                    className="hover:underline"
                    style={{ color: '#6B8B60' }}
                  >
                    info@buildingbridgeslearning.com
                  </a>
                </li>
                <li>
                  <strong>Media requests:</strong>{' '}
                  <a 
                    href="mailto:info@buildingbridgeslearning.com"
                    className="hover:underline"
                    style={{ color: '#6B8B60' }}
                  >
                    info@buildingbridgeslearning.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Form Placeholder */}
        <div 
          className="rounded-2xl p-8 text-center"
          style={{
            backgroundColor: 'rgba(168, 192, 154, 0.1)',
            border: '2px dashed #A8C09A',
          }}
        >
          <Send className="h-12 w-12 mx-auto mb-4" style={{ color: '#6B8B60' }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            Contact Form Coming Soon
          </h3>
          <p style={{ color: '#5A5A5A' }}>
            In the meantime, please reach out via email. We look forward to hearing from you!
          </p>
        </div>

        {/* Office Location */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A1A1A' }}>
            InterpretReflect
          </h3>
          <p style={{ color: '#5A5A5A' }}>
            Supporting interpreters worldwide from our base in the United States
          </p>
          <p className="text-sm mt-2" style={{ color: '#6B8B60' }}>
            Remote-first wellness platform designed by interpreters, for interpreters
          </p>
        </div>

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