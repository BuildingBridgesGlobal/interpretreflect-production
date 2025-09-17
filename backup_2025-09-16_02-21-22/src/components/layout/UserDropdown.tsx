import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronRight, Globe, ChevronDown } from 'lucide-react';

interface UserDropdownProps {
  user: any;
  devMode: boolean;
  showUserDropdown: boolean;
  setShowUserDropdown: (show: boolean) => void;
  setDevMode: (mode: boolean) => void;
  signOut: () => Promise<void>;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  devMode,
  showUserDropdown,
  setShowUserDropdown,
  setDevMode,
  signOut,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={() => setShowUserDropdown(!showUserDropdown)}
        className="flex items-center space-x-3 px-4 py-2 rounded-xl transition-all"
        style={{
          backgroundColor: 'rgba(92, 127, 79, 0.08)',
          border: '1px solid rgba(92, 127, 79, 0.2)',
        }}
        aria-label="User menu"
        aria-expanded={showUserDropdown}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
          }}
        >
          <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <span className="text-sm font-medium" style={{ color: '#1A3D26' }}>
          {devMode ? 'Dev Mode' : user?.email?.split('@')[0] || 'User'}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
          style={{ color: '#5C6A60' }}
        />
      </button>

      {/* User Dropdown Menu */}
      {showUserDropdown && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowUserDropdown(false)}
          />

          <div
            className="absolute right-0 top-full mt-2 w-72 rounded-lg shadow-lg z-20"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid rgba(92, 127, 79, 0.15)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* User Info */}
            <div
              className="p-4"
              style={{
                borderBottom: '1px solid rgba(92, 127, 79, 0.1)',
                backgroundColor: 'rgba(92, 127, 79, 0.03)',
              }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
                  }}
                >
                  <span className="text-base font-medium" style={{ color: '#FFFFFF' }}>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-base" style={{ color: '#000000' }}>
                    {devMode ? 'Dev Mode' : user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-sm" style={{ color: '#333333' }}>
                    {devMode
                      ? 'Development Environment'
                      : user?.email || 'user@interpretreflect.com'}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-3">
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  navigate('/profile-settings');
                }}
                className="w-full flex items-center space-x-3 p-4 rounded-xl transition-all text-left group"
                style={{
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
                >
                  <User className="h-5 w-5" style={{ color: '#1A3D26' }} />
                </div>
                <div className="flex-grow">
                  <div className="font-medium" style={{ color: '#000000' }}>
                    Profile Settings
                  </div>
                  <div className="text-xs" style={{ color: '#333333' }}>
                    Manage your account
                  </div>
                </div>
                <ChevronRight
                  className="h-4 w-4 opacity-60"
                  style={{ color: '#6A6A6A' }}
                />
              </button>
            </div>

            {/* Sign Out */}
            <div
              className="p-3"
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <button
                onClick={async () => {
                  setShowUserDropdown(false);
                  if (devMode) {
                    setDevMode(false);
                    // Clear any local storage
                    localStorage.clear();
                  } else {
                    await signOut();
                  }
                  // Navigation will happen automatically as user state changes
                }}
                className="w-full flex items-center space-x-3 p-4 rounded-xl transition-all text-left"
                style={{
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(255, 100, 100, 0.15)' }}
                >
                  <Globe className="h-5 w-5" style={{ color: '#FF8A8A' }} />
                </div>
                <div className="font-medium" style={{ color: '#000000' }}>
                  Sign Out
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};