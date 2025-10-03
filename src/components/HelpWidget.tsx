import React, { useState, useRef, useEffect } from 'react';
import { 
  HelpCircle, 
  X, 
  FileText, 
  MessageCircle, 
  BookOpen, 
  Mail,
  Phone,
  Video,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface HelpLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
  description?: string;
}

interface HelpWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'brand';
  showContactInfo?: boolean;
  customLinks?: HelpLink[];
  onLinkClick?: (link: HelpLink) => void;
}

const HelpWidget: React.FC<HelpWidgetProps> = ({
  position = 'bottom-right',
  theme = 'brand',
  showContactInfo = true,
  customLinks,
  onLinkClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'main' | 'contact'>('main');
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Default help links
  const defaultLinks: HelpLink[] = [
    {
      label: 'Getting Started Guide',
      href: '/docs/getting-started',
      icon: <BookOpen size={18} />,
      description: 'New to the platform? Start here'
    },
    {
      label: 'Video Tutorials',
      href: '/tutorials',
      icon: <Video size={18} />,
      description: 'Watch step-by-step guides'
    },
    {
      label: 'Frequently Asked Questions',
      href: '/faq',
      icon: <FileText size={18} />,
      description: 'Find answers to common questions'
    },
    {
      label: 'Documentation',
      href: '/docs',
      icon: <BookOpen size={18} />,
      description: 'Detailed platform documentation'
    },
    {
      label: 'Contact Support',
      href: '/support',
      icon: <MessageCircle size={18} />,
      description: 'Get help from our support team'
    }
  ];

  const helpLinks = customLinks || defaultLinks;

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveSection('main');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setActiveSection('main');
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstLink = menuRef.current.querySelector('a, button');
      if (firstLink instanceof HTMLElement) {
        firstLink.focus();
      }
    }
  }, [isOpen, activeSection]);

  const handleLinkClick = (link: HelpLink) => {
    if (onLinkClick) {
      onLinkClick(link);
    }
    // Don't close if it's an internal navigation
    if (!link.external) {
      setIsOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveSection('main');
    }
  };

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-lg right-lg',
    'bottom-left': 'bottom-lg left-lg',
    'top-right': 'top-lg right-lg',
    'top-left': 'top-lg left-lg'
  };

  // Menu position classes
  const menuPositionClasses = {
    'bottom-right': 'bottom-full right-0 mb-2',
    'bottom-left': 'bottom-full left-0 mb-2',
    'top-right': 'top-full right-0 mt-2',
    'top-left': 'top-full left-0 mt-2'
  };

  // Theme classes
  const themeClasses = {
    light: 'help-widget-light',
    dark: 'help-widget-dark',
    brand: 'help-widget-brand'
  };

  return (
    <div 
      className={`help-widget ${positionClasses[position]} ${themeClasses[theme]}`}
      role="complementary"
      aria-label="Help and support"
    >
      {/* Help Trigger Button */}
      <button
        ref={triggerRef}
        className={`help-trigger ${isOpen ? 'help-trigger-active' : ''}`}
        onClick={toggleMenu}
        aria-label={isOpen ? 'Close help menu' : 'Open help menu'}
        aria-expanded={isOpen}
        aria-controls="help-menu"
        aria-haspopup="true"
      >
        {isOpen ? (
          <X size={24} aria-hidden="true" />
        ) : (
          <HelpCircle size={24} aria-hidden="true" />
        )}
      </button>

      {/* Help Menu */}
      <div
        ref={menuRef}
        id="help-menu"
        className={`help-menu ${menuPositionClasses[position]} ${isOpen ? 'help-menu-open' : ''}`}
        hidden={!isOpen}
        role="dialog"
        aria-label="Help menu"
        aria-modal="false"
      >
        {activeSection === 'main' ? (
          <>
            {/* Header */}
            <div className="help-menu-header">
              <h3 className="help-menu-title">How can we help?</h3>
              <p className="help-menu-subtitle">Choose from the options below</p>
            </div>

            {/* Help Links */}
            <nav className="help-menu-nav" role="navigation" aria-label="Help resources">
              <ul className="help-menu-list">
                {helpLinks.map((link, index) => (
                  <li key={index} className="help-menu-item">
                    <a
                      href={link.href}
                      className="help-menu-link"
                      onClick={() => handleLinkClick(link)}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                    >
                      <span className="help-menu-link-icon">
                        {link.icon || <ChevronRight size={16} />}
                      </span>
                      <div className="help-menu-link-content">
                        <span className="help-menu-link-label">
                          {link.label}
                          {link.external && (
                            <ExternalLink 
                              size={12} 
                              className="help-menu-external-icon"
                              aria-label="Opens in new window"
                            />
                          )}
                        </span>
                        {link.description && (
                          <span className="help-menu-link-description">
                            {link.description}
                          </span>
                        )}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contact Section */}
            {showContactInfo && (
              <>
                <div className="help-menu-divider" />
                <button
                  className="help-menu-contact-button"
                  onClick={() => setActiveSection('contact')}
                  aria-label="View contact information"
                >
                  <MessageCircle size={18} />
                  <span>Direct Contact Options</span>
                  <ChevronRight size={16} className="help-menu-chevron" />
                </button>
              </>
            )}

            {/* Footer */}
            <div className="help-menu-footer">
              <p className="help-menu-footer-text">
                Available 24/7 • Response within 24 hours
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Contact Section */}
            <div className="help-menu-header">
              <button
                className="help-menu-back"
                onClick={() => setActiveSection('main')}
                aria-label="Back to main help menu"
              >
                <ChevronRight size={18} className="rotate-180" />
                <span>Back</span>
              </button>
              <h3 className="help-menu-title">Contact Us</h3>
            </div>

            <div className="help-menu-contact">
              <div className="help-contact-item">
                <Mail size={20} className="help-contact-icon" />
                <div>
                  <p className="help-contact-label">Email Support</p>
                  <a 
                    href="mailto:hello@huviatechnologies.com"
                    className="help-contact-value"
                  >
                    hello@huviatechnologies.com
                  </a>
                </div>
              </div>

              <div className="help-contact-item">
                <MessageCircle size={20} className="help-contact-icon" />
                <div>
                  <p className="help-contact-label">Live Chat</p>
                  <button className="help-contact-button">
                    Start Chat Session
                  </button>
                  <p className="help-contact-status">
                    <span className="help-status-dot"></span>
                    Agents online
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Screen reader announcement */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {isOpen ? 'Help menu is open' : 'Help menu is closed'}
      </div>
    </div>
  );
};

export default HelpWidget;