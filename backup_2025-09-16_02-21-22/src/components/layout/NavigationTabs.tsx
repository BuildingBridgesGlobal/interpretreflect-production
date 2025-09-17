import React from 'react';
import { Home, BookOpen, RefreshCw, TrendingUp } from 'lucide-react';
import { HeartPulseIcon, NotepadIcon, HourglassPersonIcon, TargetIcon } from '../CustomIcon';

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: HeartPulseIcon },
  { id: 'reflection', label: 'Reflection Studio', icon: NotepadIcon },
  { id: 'stress', label: 'Stress Reset', icon: HourglassPersonIcon },
  { id: 'insights', label: 'Growth Insights', icon: TargetIcon },
];

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-3" style={{ backgroundColor: '#FAFAF8' }}>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="max-w-7xl mx-auto rounded-full"
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          padding: '6px',
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
                className={`flex items-center px-5 py-3 text-base font-medium transition-all duration-300 rounded-full ${
                  activeTab === tab.id ? 'shadow-md' : ''
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                style={{
                  color: activeTab === tab.id ? '#1b5e20' : '#4A5568',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#1b5e20';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#4A5568';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <tab.icon size={48} className="mr-2" />
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