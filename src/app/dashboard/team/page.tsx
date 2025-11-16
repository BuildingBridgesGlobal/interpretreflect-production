'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.next';
import { TeamManagementDashboard } from '@/components/dashboard/TeamManagementDashboard';
import { 
  Users, Shield, Settings, Mail, UserPlus, BarChart3,
  Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';

export default function TeamManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'analytics' | 'settings'>('overview');
  const [userRole, setUserRole] = useState<'supervisor' | 'admin' | 'interpreter'>('interpreter');

  useEffect(() => {
    // Determine user role from metadata
    if (user) {
      const role = (user.user_metadata?.role as string) || 'interpreter';
      setUserRole(role as 'supervisor' | 'admin' | 'interpreter');
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-electric border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-gray-600">Loading team management...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-brand-primary mb-2">Access Required</h2>
          <p className="text-brand-gray-600 mb-4">Please sign in to access team management features.</p>
          <a href="/login" className="inline-block bg-brand-electric text-white px-6 py-3 rounded-lg hover:bg-brand-electric-hover transition-colors">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (userRole === 'interpreter') {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Shield className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-brand-primary mb-2">Access Restricted</h2>
          <p className="text-brand-gray-600 mb-4">
            Team management features are only available for supervisors and administrators.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">Interested in Team Features?</h3>
            <p className="text-blue-700 text-sm mb-3">
              Contact your administrator to request supervisor access for team management capabilities.
            </p>
          </div>
          <a href="/dashboard" className="inline-block bg-brand-electric text-white px-6 py-3 rounded-lg hover:bg-brand-electric-hover transition-colors">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-brand-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-primary font-sans">
                Team Management
              </h1>
              <p className="text-brand-gray-600 mt-1 font-body">
                {userRole === 'admin' ? 'Manage your entire organization' : 'Supervise and support your team'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-brand-gray-600">
                <Shield className="w-4 h-4" />
                <span className="capitalize">{userRole}</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-brand-electric text-white rounded-lg hover:bg-brand-electric-hover transition-colors">
                <UserPlus className="w-4 h-4" />
                Invite Member
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-brand-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-brand-electric text-brand-electric'
                  : 'border-transparent text-brand-gray-600 hover:text-brand-primary'
              }`}
            >
              <Users className="w-4 h-4" />
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'members'
                  ? 'border-brand-electric text-brand-electric'
                  : 'border-transparent text-brand-gray-600 hover:text-brand-primary'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Team Members
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'border-brand-electric text-brand-electric'
                  : 'border-transparent text-brand-gray-600 hover:text-brand-primary'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'border-brand-electric text-brand-electric'
                  : 'border-transparent text-brand-gray-600 hover:text-brand-primary'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-slate rounded-data shadow-card p-8 text-white border border-brand-electric/20">
              <div className="flex items-center gap-4 mb-4">
                <Users className="w-12 h-12 text-brand-electric" />
                <div>
                  <h2 className="text-2xl font-bold font-sans">Welcome to Team Management</h2>
                  <p className="text-white/90 font-body">
                    {userRole === 'admin' 
                      ? 'Oversee your entire organization with comprehensive analytics and management tools.'
                      : 'Support and guide your team with data-driven insights and performance monitoring.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-gray-600">Total Team Size</p>
                    <p className="text-2xl font-bold text-brand-primary">--</p>
                  </div>
                  <Users className="w-8 h-8 text-brand-electric" />
                </div>
              </div>

              <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-gray-600">Active Interpreters</p>
                    <p className="text-2xl font-bold text-brand-primary">--</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-gray-600">At Risk Members</p>
                    <p className="text-2xl font-bold text-brand-primary">--</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-gray-600">Avg ERI Score</p>
                    <p className="text-2xl font-bold text-brand-primary">--</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <h3 className="text-lg font-semibold text-brand-primary mb-4">Getting Started</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-medium text-brand-primary">Invite Team Members</h4>
                      <p className="text-sm text-brand-gray-600">Add interpreters and supervisors to your team.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-medium text-brand-primary">Monitor Performance</h4>
                      <p className="text-sm text-brand-gray-600">Track ERI scores and identify at-risk members.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-medium text-brand-primary">Provide Support</h4>
                      <p className="text-sm text-brand-gray-600">Offer guidance and resources to team members.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">4</div>
                    <div>
                      <h4 className="font-medium text-brand-primary">Generate Reports</h4>
                      <p className="text-sm text-brand-gray-600">Export analytics and performance data.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && user && (
          <TeamManagementDashboard userId={user.id} userRole={userRole} />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-brand-primary mb-2">Team Analytics</h2>
              <p className="text-brand-gray-600 mb-4">Advanced team analytics and reporting features coming soon.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <h3 className="font-semibold text-blue-900 mb-2">Planned Features</h3>
                <ul className="text-blue-700 text-sm space-y-1 text-left">
                  <li>• Team performance trends</li>
                  <li>• Burnout prediction models</li>
                  <li>• Assignment optimization</li>
                  <li>• Resource allocation insights</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <h2 className="text-xl font-bold text-brand-primary mb-4">Team Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-brand-primary mb-2">Notification Preferences</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-brand-gray-700">Email alerts for at-risk interpreters</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-brand-gray-700">Weekly team performance summaries</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-brand-gray-700">Assignment completion notifications</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-brand-primary mb-2">Risk Thresholds</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-brand-gray-700 mb-1">ERI Alert Threshold</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-electric focus:border-transparent">
                        <option value="60">Below 60 (At Risk)</option>
                        <option value="65">Below 65</option>
                        <option value="70">Below 70</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-brand-gray-700 mb-1">Burnout Risk Threshold</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-electric focus:border-transparent">
                        <option value="high">High Risk Only</option>
                        <option value="medium">Medium & High Risk</option>
                        <option value="all">All Risk Levels</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button className="px-4 py-2 bg-brand-electric text-white rounded-lg hover:bg-brand-electric-hover transition-colors">
                    Save Settings
                  </button>
                  <button className="px-4 py-2 bg-brand-gray-100 text-brand-primary rounded-lg hover:bg-brand-gray-200 transition-colors">
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}