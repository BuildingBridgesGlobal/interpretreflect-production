import React from 'react';
import { Home, BookOpen, RefreshCw, MessageCircle, TrendingUp } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'reflection', label: 'Reflection Studio', icon: BookOpen },
  { id: 'stress', label: 'Stress Reset', icon: RefreshCw },
  { id: 'chat', label: 'Wellness Journal', icon: MessageCircle, badge: 'NEW' },
  { id: 'insights', label: 'Growth Insights', icon: TrendingUp },
];

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-3" style={{ backgroundColor: '#FAFAF8' }}>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="max-w-7xl mx-auto rounded-full"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(147, 197, 253, 0.12)',
          boxShadow: '0 2px 8px rgba(147, 197, 253, 0.04)',
          padding: '4px',
        }}
      >
        <ul className="flex justify-center space-x-2 list-none m-0 p-0" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} role="presentation">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full ${
                  activeTab === tab.id ? 'text-white shadow-md' : 'bg-white'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                style={{
                  color: activeTab === tab.id ? '#FFFFFF' : '#4A5568',
                  fontWeight: activeTab === tab.id ? '500' : '400',
                  background:
                    activeTab === tab.id
                      ? 'linear-gradient(135deg, #1b5e20, #2e7d32)'
                      : '#FFFFFF',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }
                }}
              >
                <tab.icon className="h-4 w-4 mr-1.5" />
                {tab.label}
                {tab.badge && (
                  <span
                    className="ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor:
                        activeTab === tab.id
                          ? 'rgba(255, 255, 255, 0.3)'
                          : 'rgba(156, 163, 175, 0.15)',
                      color: activeTab === tab.id ? '#FFFFFF' : '#6B7280',
                      fontSize: '9px',
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};