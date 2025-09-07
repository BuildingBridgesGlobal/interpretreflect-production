import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Shield,
  Mail,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Sparkles
} from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t" style={{ 
      backgroundColor: 'rgba(250, 251, 253, 0.95)',
      borderColor: 'rgba(147, 197, 253, 0.1)'
    }}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute bottom-0 left-0 w-96 h-48" 
          style={{ 
            background: 'radial-gradient(circle, rgba(147, 197, 253, 0.08) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }} 
        />
        <div className="absolute bottom-0 right-0 w-80 h-40" 
          style={{ 
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
            filter: 'blur(30px)'
          }} 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {/* Logo */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
                }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: '#2D3748' }}>
                  Wellness Platform
                </h3>
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  For Interpreters, By Interpreters
                </p>
              </div>
            </div>
            
            <p className="text-sm mb-4 max-w-md" style={{ color: '#718096' }}>
              A dedicated wellness sanctuary designed to support interpreters in preventing burnout, 
              managing vicarious trauma, and nurturing sustainable well-being through evidence-based practices.
            </p>
            
            {/* Tagline */}
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4" style={{ color: '#EC4899' }} />
              <p className="text-sm font-medium italic" style={{ color: '#5B8FE3' }}>
                "Your wellness matters. Your presence matters. You matter."
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" style={{ color: '#10B981' }} />
                <span className="text-xs" style={{ color: '#6B7280' }}>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" style={{ color: '#10B981' }} />
                <span className="text-xs" style={{ color: '#6B7280' }}>End-to-End Encrypted</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: '#2D3748' }}>
              Resources
            </h4>
            <ul className="space-y-2">
               <li>
                 <Link to="/about" className="text-sm hover:underline transition-colors"
                   style={{ color: '#6B7280' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = '#5B8FE3'}
                   onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}>
                   About Us
                 </Link>
               </li>
               <li>
                 <Link to="/privacy" className="text-sm hover:underline transition-colors"
                   style={{ color: '#6B7280' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = '#5B8FE3'}
                   onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}>
                   Privacy Policy
                 </Link>
               </li>
               <li>
                 <Link to="/terms" className="text-sm hover:underline transition-colors"
                   style={{ color: '#6B7280' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = '#5B8FE3'}
                   onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}>
                   Terms of Service
                 </Link>
               </li>
               <li>
                 <Link to="/support" className="text-sm hover:underline transition-colors"
                   style={{ color: '#6B7280' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = '#5B8FE3'}
                   onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}>
                   Support Center
                 </Link>
               </li>
               <li>
                 <Link to="/research-evidence" className="text-sm hover:underline transition-colors"
                   style={{ color: '#6B7280' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = '#5B8FE3'}
                   onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}>
                   Research & Evidence
                 </Link>
               </li>
             </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: '#2D3748' }}>
              Connect With Us
            </h4>
            
            {/* Social Media Icons */}
            <div className="flex gap-3 mb-4">
              <a href="#" 
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ 
                  backgroundColor: 'rgba(147, 197, 253, 0.1)',
                  border: '1px solid rgba(147, 197, 253, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(147, 197, 253, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(147, 197, 253, 0.2)';
                }}
                aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" style={{ color: '#5B8FE3' }} />
              </a>
              
              <a href="#" 
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ 
                  backgroundColor: 'rgba(147, 197, 253, 0.1)',
                  border: '1px solid rgba(147, 197, 253, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(147, 197, 253, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(147, 197, 253, 0.2)';
                }}
                aria-label="Twitter">
                <Twitter className="w-4 h-4" style={{ color: '#5B8FE3' }} />
              </a>
              
              <a href="#" 
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ 
                  backgroundColor: 'rgba(147, 197, 253, 0.1)',
                  border: '1px solid rgba(147, 197, 253, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(147, 197, 253, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(147, 197, 253, 0.2)';
                }}
                aria-label="Instagram">
                <Instagram className="w-4 h-4" style={{ color: '#5B8FE3' }} />
              </a>
              
              <a href="#" 
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ 
                  backgroundColor: 'rgba(147, 197, 253, 0.1)',
                  border: '1px solid rgba(147, 197, 253, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(147, 197, 253, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(147, 197, 253, 0.2)';
                }}
                aria-label="YouTube">
                <Youtube className="w-4 h-4" style={{ color: '#5B8FE3' }} />
              </a>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <a href="mailto:support@wellnessplatform.com" 
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#5B8FE3'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}>
                <Mail className="w-4 h-4" />
                support@wellnessplatform.com
              </a>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <p className="text-xs mb-2" style={{ color: '#6B7280' }}>
                Subscribe to wellness tips & updates
              </p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    backgroundColor: 'rgba(147, 197, 253, 0.05)',
                    border: '1px solid rgba(147, 197, 253, 0.2)',
                    color: '#3A3A3A',
                    fontSize: '12px'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#5B8FE3';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(147, 197, 253, 0.2)';
                  }}
                />
                <button 
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: 'white'
                  }}>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t" style={{ borderColor: 'rgba(147, 197, 253, 0.1)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              © {currentYear} Wellness Platform. All rights reserved. Made with 💜 for the interpreter community.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs hover:underline" style={{ color: '#9CA3AF' }}>
                Accessibility
              </a>
              <a href="#" className="text-xs hover:underline" style={{ color: '#9CA3AF' }}>
                Cookie Settings
              </a>
              <a href="#" className="text-xs hover:underline" style={{ color: '#9CA3AF' }}>
                Site Map
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};