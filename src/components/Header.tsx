import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  Users,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  isAuthenticated?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isAuthenticated = false, 
  userName = 'User',
  onLogout 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/resources', label: 'Resources', icon: BookOpen },
    { path: '/journal', label: 'Journal', icon: PenTool },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Skip to main content link - visible on focus */}
      <a 
        href="#main-content" 
        className="skip-to-main"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0.5rem',
          zIndex: 9999,
          padding: '1rem 1.5rem',
          backgroundColor: '#5C7F4F',
          color: '#FFFFFF',
          textDecoration: 'none',
          borderRadius: '0.5rem',
          fontSize: '1.125rem',
          fontWeight: 600,
        }}
        onFocus={(e) => {
          e.currentTarget.style.left = '0.5rem';
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = '-9999px';
        }}
      >
        Skip to main content
      </a>

      {/* Main Header */}
      <header
        role="banner"
        className={`header-main ${isScrolled ? 'scrolled' : ''}`}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : '#FFFFFF',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          borderBottom: '1px solid',
          borderColor: isScrolled ? 'rgba(92, 127, 79, 0.2)' : 'rgba(92, 127, 79, 0.1)',
          transition: 'all 0.3s ease',
          boxShadow: isScrolled ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none',
        }}
      >
        <div 
          className="header-container"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 1.5rem',
          }}
        >
          <div 
            className="header-content"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '5rem',
            }}
          >
            {/* Logo and Site Title */}
            <div className="header-brand" style={{ display: 'flex', alignItems: 'center' }}>
              <Logo 
                size="md" 
                showTagline={!isMobileMenuOpen} 
                variant="default"
                linkToHome={true}
              />
            </div>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav 
                role="navigation" 
                aria-label="Main navigation"
                className="desktop-nav"
                style={{
                  display: 'none',
                  '@media (min-width: 1024px)': { display: 'flex' },
                }}
              >
                <ul 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`nav-link ${active ? 'active' : ''}`}
                          aria-current={active ? 'page' : undefined}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            fontSize: '1.125rem',
                            fontWeight: active ? 600 : 500,
                            color: active ? '#5C7F4F' : '#2D3A31',
                            backgroundColor: active ? 'rgba(92, 127, 79, 0.1)' : 'transparent',
                            borderRadius: '0.5rem',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                          }}
                          onMouseEnter={(e) => {
                            if (!active) {
                              e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.05)';
                              e.currentTarget.style.color = '#5C7F4F';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!active) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#2D3A31';
                            }
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.outline = '3px solid #5C7F4F';
                            e.currentTarget.style.outlineOffset = '2px';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.outline = 'none';
                          }}
                        >
                          <Icon size={20} aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                  
                  {/* Logout Button */}
                  <li style={{ marginLeft: '1rem' }}>
                    <button
                      onClick={onLogout}
                      className="logout-btn"
                      aria-label="Logout from your account"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1.125rem',
                        fontWeight: 500,
                        color: '#FFFFFF',
                        backgroundColor: '#B91C1C',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#991B1B';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#B91C1C';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = '3px solid #B91C1C';
                        e.currentTarget.style.outlineOffset = '2px';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = 'none';
                      }}
                    >
                      <LogOut size={20} aria-hidden="true" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            )}

            {/* Mobile Menu Button */}
            {isAuthenticated && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mobile-menu-btn lg:hidden"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '3rem',
                  height: '3rem',
                  color: '#2D3A31',
                  backgroundColor: 'transparent',
                  border: '2px solid #5C7F4F',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '3px solid #5C7F4F';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                {isMobileMenuOpen ? (
                  <X size={24} aria-hidden="true" />
                ) : (
                  <Menu size={24} aria-hidden="true" />
                )}
              </button>
            )}

            {/* Sign In/Sign Up for non-authenticated users */}
            {!isAuthenticated && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link
                  to="/login"
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1.125rem',
                    fontWeight: 500,
                    color: '#5C7F4F',
                    backgroundColor: 'transparent',
                    border: '2px solid #5C7F4F',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = '3px solid #5C7F4F';
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    backgroundColor: '#5C7F4F',
                    border: '2px solid #5C7F4F',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4A6B3E';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#5C7F4F';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = '3px solid #5C7F4F';
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isAuthenticated && isMobileMenuOpen && (
          <nav
            id="mobile-navigation"
            role="navigation"
            aria-label="Mobile navigation"
            className="mobile-nav lg:hidden"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid rgba(92, 127, 79, 0.1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              maxHeight: 'calc(100vh - 5rem)',
              overflowY: 'auto',
            }}
          >
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: '1rem',
              }}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`mobile-nav-link ${active ? 'active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        fontSize: '1.125rem',
                        fontWeight: active ? 600 : 500,
                        color: active ? '#5C7F4F' : '#2D3A31',
                        backgroundColor: active ? 'rgba(92, 127, 79, 0.1)' : 'transparent',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon size={20} aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
              
              {/* Mobile Logout */}
              <li style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(92, 127, 79, 0.2)' }}>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout?.();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.125rem',
                    fontWeight: 500,
                    color: '#B91C1C',
                    backgroundColor: 'rgba(185, 28, 28, 0.1)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={20} aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* Add responsive styles */}
      <style>{`
        @media (min-width: 1024px) {
          .mobile-menu-btn {
            display: none !important;
          }
          .desktop-nav {
            display: flex !important;
          }
        }
        @media (max-width: 1023px) {
          .desktop-nav {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;