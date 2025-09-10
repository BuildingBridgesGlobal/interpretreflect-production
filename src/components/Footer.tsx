import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Shield,
  Mail,
  Linkedin,
  Instagram,
  Youtube,
  Sparkles,
  Check
} from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubscribed(true);
    setIsSubmitting(false);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail('');
    }, 3000);
  };

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
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Wellness Platform
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  For Interpreters, By Interpreters
                </p>
              </div>
            </div>
            
            <p className="text-sm mb-4 max-w-md" style={{ color: 'var(--text-secondary)' }}>
              A dedicated wellness sanctuary designed to support interpreters in preventing burnout, 
              managing vicarious trauma, and nurturing sustainable well-being through evidence-based practices.
            </p>
            
            {/* Tagline */}
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4" style={{ color: '#EC4899' }} />
              <p className="text-sm font-medium italic" style={{ color: 'var(--primary-600)' }}>
                "Your wellness matters. Your presence matters. You matter."
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" style={{ color: '#10B981' }} />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Secure & Private</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" style={{ color: '#10B981' }} />
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>End-to-End Encrypted</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Resources
            </h4>
            <ul className="space-y-2">
               <li>
                 <Link to="/about" className="text-sm hover:underline transition-colors"
                   style={{ color: 'var(--text-tertiary)' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-600)'}
                   onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>
                   About Us
                 </Link>
               </li>
               <li>
                 <Link to="/privacy" className="text-sm hover:underline transition-colors"
                   style={{ color: 'var(--text-tertiary)' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-600)'}
                   onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>
                   Privacy Policy
                 </Link>
               </li>
               <li>
                 <Link to="/terms" className="text-sm hover:underline transition-colors"
                   style={{ color: 'var(--text-tertiary)' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-600)'}
                   onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>
                   Terms of Service
                 </Link>
               </li>
               <li>
                 <Link to="/accessibility" className="text-sm hover:underline transition-colors"
                   style={{ color: 'var(--text-tertiary)' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-600)'}
                   onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>
                   Accessibility
                 </Link>
               </li>
             </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Connect With Us
            </h4>
            
            {/* Social Media Icons */}
            <div className="flex gap-3 mb-4">
              <a href="https://www.linkedin.com/in/sarah-wheeler-interpreteredu/" 
                target="_blank"
                rel="noopener noreferrer"
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
              
              <a href="https://www.instagram.com/buildingbridges_learning/" 
                target="_blank"
                rel="noopener noreferrer"
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
              
              <a href="https://www.youtube.com/@interpretreflect" 
                target="_blank"
                rel="noopener noreferrer"
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
              <a href="mailto:hello@huviatechnologies.com" 
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#5B8FE3'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}>
                <Mail className="w-4 h-4" />
                hello@huviatechnologies.com
              </a>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <p className="text-xs mb-2" style={{ color: '#6B7280' }}>
                Subscribe to wellness tips & updates
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  disabled={isSubscribed}
                  required
                  aria-label="Email address for newsletter"
                  style={{
                    backgroundColor: isSubscribed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    border: isSubscribed ? '1.5px solid rgba(34, 197, 94, 0.4)' : '1.5px solid rgba(147, 197, 253, 0.4)',
                    color: '#3A3A3A',
                    fontSize: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    opacity: isSubscribed ? 0.8 : 1
                  }}
                  onFocus={(e) => {
                    if (!isSubscribed) {
                      e.currentTarget.style.borderColor = '#5B8FE3';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91, 143, 227, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!isSubscribed) {
                      e.currentTarget.style.borderColor = 'rgba(147, 197, 253, 0.4)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                    }
                  }}
                />
                <button 
                  type="submit"
                  disabled={isSubscribed || isSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2"
                  aria-label={isSubscribed ? 'Successfully subscribed' : 'Subscribe to newsletter'}
                  style={{
                    background: isSubscribed 
                      ? 'linear-gradient(135deg, #22C55E, #16A34A)' 
                      : isSubmitting 
                        ? 'linear-gradient(135deg, #9CA3AF, #6B7280)'
                        : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    color: 'white',
                    cursor: isSubscribed || isSubmitting ? 'not-allowed' : 'pointer',
                    transform: isSubscribed || isSubmitting ? 'scale(1)' : undefined
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubscribed && !isSubmitting) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}>
                  {isSubscribed ? (
                    <>
                      <Check className="w-3 h-3" />
                      Subscribed!
                    </>
                  ) : isSubmitting ? (
                    'Subscribing...'
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </form>
              {isSubscribed && (
                <p className="text-xs mt-2 text-green-600" role="status" aria-live="polite">
                  Thank you for subscribing! Check your email for confirmation.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t" style={{ borderColor: 'rgba(147, 197, 253, 0.1)' }}>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
              © {currentYear} Wellness Platform. All rights reserved. Made with 💜 for the interpreter community.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};