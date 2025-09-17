import React from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { Logo } from '../Logo';
import { UserDropdown } from './UserDropdown';

interface HeaderProps {
  user: any;
  devMode: boolean;
  showUserDropdown: boolean;
  setShowUserDropdown: (show: boolean) => void;
  setDevMode: (mode: boolean) => void;
  signOut: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  devMode,
  showUserDropdown,
  setShowUserDropdown,
  setDevMode,
  signOut,
}) => {
  return (
    <>
      {/* DEV MODE INDICATOR */}
      {devMode && (
        <div
          className="fixed top-0 left-0 right-0 text-center py-1 text-xs font-medium z-50"
          style={{
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            borderBottom: '1px solid #FDE68A',
          }}
        >
          Development Mode - Authentication Bypassed
        </div>
      )}

      {/* Header with proper semantic structure */}
      <header
        className="border-b"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottomColor: 'rgba(92, 127, 79, 0.15)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Greeting */}
            <div className="flex items-center space-x-8">
              <Logo size="md" variant="default" linkToHome={false} />
              <div className="hidden md:block">
                <p className="text-lg font-medium" style={{ color: '#2D3A31' }}>
                  Welcome back, {devMode ? 'Dev Mode' : user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-sm" style={{ color: '#5C6A60' }}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Upgrade to Premium Button - Show only for non-premium users */}
              {user && !devMode && (
                <button
                  onClick={() =>
                    window.open('https://buy.stripe.com/3cIcN5fYa7Ry2bA9i1b7y03', '_blank')
                  }
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all animate-pulse-subtle"
                  style={{
                    background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(27, 94, 32, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 94, 32, 0.3)';
                    e.currentTarget.classList.remove('animate-pulse-subtle');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(27, 94, 32, 0.2)';
                    e.currentTarget.classList.add('animate-pulse-subtle');
                  }}
                >
                  <Sparkles size={16} />
                  Upgrade to Premium
                </button>
              )}

              <UserDropdown
                user={user}
                devMode={devMode}
                showUserDropdown={showUserDropdown}
                setShowUserDropdown={setShowUserDropdown}
                setDevMode={setDevMode}
                signOut={signOut}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};