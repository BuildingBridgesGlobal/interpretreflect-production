import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Heart,
  Users,
  RefreshCw,
  MessageCircle,
  TrendingUp,
  Shield,
  Clock,
  BookOpen,
  Activity,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface DashboardProps {
  userName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userName = 'there' }) => {
  const [recentActivities] = useState([
    { id: 1, type: 'assessment', title: 'Burnout Assessment', date: '2 hours ago', status: 'completed' },
    { id: 2, type: 'reflection', title: 'Morning Reflection', date: 'Yesterday', status: 'completed' },
    { id: 3, type: 'chat', title: 'Chat with Elya', date: '3 days ago', status: 'completed' },
  ]);

  const [upcomingReminders] = useState([
    { id: 1, title: 'Weekly Team Reflection', time: 'Tomorrow at 3:00 PM', icon: Users },
    { id: 2, title: 'Burnout Check-in', time: 'Friday at 10:00 AM', icon: Activity },
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFBFA' }}>
      {/* SINGLE H1 - Main page title with proper hierarchy */}
      <header className="section-lg" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A2821' }}>
            Welcome back, {userName}!
          </h1>
          <p className="text-lg" style={{ color: '#3A4742' }}>
            Your wellness journey continues here
          </p>
        </div>
      </header>

      {/* Main Content Container with increased spacing */}
      <main className="max-w-7xl mx-auto px-6" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        
        {/* Quick Actions Section - Primary CTAs */}
        <section className="mb-section" aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="text-2xl font-semibold mb-6" style={{ color: '#1A2821' }}>
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Primary Action Button - Burnout Gauge */}
            <Link
              to="/burnout-gauge"
              className="flex flex-col items-center justify-center text-center rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-4"
              style={{
                minHeight: '120px',
                padding: '1.25rem',
                backgroundColor: '#2D5A3D',
                color: '#FFFFFF',
                border: '2px solid #2D5A3D',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                textDecoration: 'none'
              }}
              aria-label="Take Daily Burnout Assessment"
            >
              <Activity className="w-8 h-8 mb-3" style={{ color: '#FFFFFF' }} />
              <span className="font-semibold text-lg">Take Burnout Assessment</span>
              <span className="text-sm mt-1 opacity-90">2 min check-in</span>
            </Link>

            {/* Secondary Action - Start Reflection */}
            <Link
              to="/reflection-studio"
              className="flex flex-col items-center justify-center text-center rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-4"
              style={{
                minHeight: '120px',
                padding: '1.25rem',
                backgroundColor: '#FFFFFF',
                color: '#2D5A3D',
                border: '2px solid #2D5A3D',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                textDecoration: 'none'
              }}
              aria-label="Start New Reflection Session"
            >
              <BookOpen className="w-8 h-8 mb-3" style={{ color: '#2D5A3D' }} />
              <span className="font-semibold text-lg">Start Reflection</span>
              <span className="text-sm mt-1" style={{ color: '#546660' }}>
                Begin journaling
              </span>
            </Link>

            {/* Chat with Elya */}
            <Link
              to="/chat-elya"
              className="flex flex-col items-center justify-center text-center rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-4"
              style={{
                minHeight: '120px',
                padding: '1.25rem',
                backgroundColor: '#FFFFFF',
                color: '#3B6B7C',
                border: '2px solid #3B6B7C',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                textDecoration: 'none'
              }}
              aria-label="Chat with Elya AI Assistant"
            >
              <MessageCircle className="w-8 h-8 mb-3" style={{ color: '#3B6B7C' }} />
              <span className="font-semibold text-lg">Chat with Elya</span>
              <span className="text-sm mt-1" style={{ color: '#546660' }}>
                AI wellness guide
              </span>
            </Link>

            {/* View Insights */}
            <Link
              to="/insights"
              className="flex flex-col items-center justify-center text-center rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-4"
              style={{
                minHeight: '120px',
                padding: '1.25rem',
                backgroundColor: '#FFFFFF',
                color: '#3A6B48',
                border: '2px solid #3A6B48',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                textDecoration: 'none'
              }}
              aria-label="View Your Wellness Insights"
            >
              <TrendingUp className="w-8 h-8 mb-3" style={{ color: '#3A6B48' }} />
              <span className="font-semibold text-lg">View Insights</span>
              <span className="text-sm mt-1" style={{ color: '#546660' }}>
                Track progress
              </span>
            </Link>
          </div>
        </section>

        {/* Two Column Layout for Activity and Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity - Left Column (2/3 width) */}
          <section className="lg:col-span-2" aria-labelledby="recent-activity-heading">
            <div 
              className="rounded-lg p-comfortable"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 6px rgba(26, 40, 33, 0.08)',
              }}
            >
              <h2 id="recent-activity-heading" className="text-xl font-semibold mb-5" style={{ color: '#1A2821' }}>
                Recent Activity
              </h2>
              
              {recentActivities.length > 0 ? (
                <ul className="space-y-4" role="list">
                  {recentActivities.map((activity) => (
                    <li 
                      key={activity.id}
                      className="flex items-center justify-between p-4 rounded-lg transition-colors"
                      style={{
                        backgroundColor: '#F4F6F5',
                        borderLeft: '4px solid #3A6B48',
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <CheckCircle className="w-5 h-5" style={{ color: '#3A6B48' }} />
                        <div>
                          <p className="font-medium" style={{ color: '#1A2821' }}>
                            {activity.title}
                          </p>
                          <p className="text-sm" style={{ color: '#546660' }}>
                            {activity.date}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/activity/${activity.id}`}
                        className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-2 py-1"
                        style={{ color: '#2D5A3D' }}
                        aria-label={`View details for ${activity.title}`}
                      >
                        View Details
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div 
                  className="text-center py-12 rounded-lg"
                  style={{ backgroundColor: '#F4F6F5' }}
                >
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#546660' }} />
                  <p className="text-lg mb-4" style={{ color: '#3A4742' }}>
                    No activities yet. Start your wellness journey now!
                  </p>
                  <Link
                    to="/burnout-gauge"
                    className="btn-primary inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-4"
                  >
                    Take Your First Assessment
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="space-y-8">
            
            {/* Wellness Tools Card */}
            <section aria-labelledby="wellness-tools-heading">
              <div 
                className="rounded-lg p-comfortable"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 6px rgba(26, 40, 33, 0.08)',
                }}
              >
                <h2 id="wellness-tools-heading" className="text-xl font-semibold mb-5" style={{ color: '#1A2821' }}>
                  Wellness Tools
                </h2>
                
                <nav aria-label="Wellness tools navigation">
                  <ul className="space-y-3" role="list">
                    <li>
                      <Link
                        to="/breathing-practice"
                        className="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-102 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: '#F4F6F5',
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Heart className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                          <span style={{ color: '#1A2821' }}>Breathing Practice</span>
                        </div>
                        <ChevronRight className="w-4 h-4" style={{ color: '#546660' }} />
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/body-checkin"
                        className="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-102 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: '#F4F6F5',
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                          <span style={{ color: '#1A2821' }}>Body Check-in</span>
                        </div>
                        <ChevronRight className="w-4 h-4" style={{ color: '#546660' }} />
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/boundaries-reset"
                        className="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-102 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: '#F4F6F5',
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <RefreshCw className="w-5 h-5" style={{ color: '#3A6B48' }} />
                          <span style={{ color: '#1A2821' }}>Boundaries Reset</span>
                        </div>
                        <ChevronRight className="w-4 h-4" style={{ color: '#546660' }} />
                      </Link>
                    </li>
                  </ul>
                </nav>
                
                <Link
                  to="/all-tools"
                  className="inline-flex items-center mt-4 text-sm font-medium hover:underline focus:outline-none focus:ring-2 rounded px-2 py-1"
                  style={{ color: '#2D5A3D' }}
                  aria-label="View all wellness tools"
                >
                  View All Tools
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </section>

            {/* Upcoming Reminders */}
            <section aria-labelledby="reminders-heading">
              <div 
                className="rounded-lg p-comfortable"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 6px rgba(26, 40, 33, 0.08)',
                }}
              >
                <h2 id="reminders-heading" className="text-xl font-semibold mb-5" style={{ color: '#1A2821' }}>
                  Upcoming Reminders
                </h2>
                
                {upcomingReminders.length > 0 ? (
                  <ul className="space-y-3" role="list">
                    {upcomingReminders.map((reminder) => {
                      const Icon = reminder.icon;
                      return (
                        <li 
                          key={reminder.id}
                          className="flex items-start space-x-3 p-3 rounded-lg"
                          style={{ backgroundColor: '#F4F6F5' }}
                        >
                          <Icon className="w-5 h-5 mt-0.5" style={{ color: '#8B6914' }} />
                          <div>
                            <p className="font-medium text-sm" style={{ color: '#1A2821' }}>
                              {reminder.title}
                            </p>
                            <p className="text-sm" style={{ color: '#546660' }}>
                              {reminder.time}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-center py-4" style={{ color: '#546660' }}>
                    No upcoming reminders
                  </p>
                )}
                
                <Link
                  to="/schedule"
                  className="inline-flex items-center mt-4 text-sm font-medium hover:underline focus:outline-none focus:ring-2 rounded px-2 py-1"
                  style={{ color: '#2D5A3D' }}
                  aria-label="Manage your wellness schedule"
                >
                  Manage Schedule
                  <Calendar className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </section>

            {/* Achievement Spotlight */}
            <section aria-labelledby="achievement-heading">
              <div 
                className="rounded-lg p-comfortable text-center"
                style={{
                  background: 'linear-gradient(135deg, #E8F5EC, #E6F0FF)',
                  boxShadow: '0 4px 6px rgba(26, 40, 33, 0.08)',
                }}
              >
                <Sparkles className="w-10 h-10 mx-auto mb-3" style={{ color: '#3A6B48' }} />
                <h3 id="achievement-heading" className="text-lg font-semibold mb-2" style={{ color: '#1A2821' }}>
                  7-Day Streak!
                </h3>
                <p className="text-sm" style={{ color: '#3A4742' }}>
                  You've checked in daily for a week. Keep it up!
                </p>
              </div>
            </section>
            
          </aside>
        </div>

        {/* Growth Progress Section - Full Width */}
        <section className="mt-section" aria-labelledby="growth-heading">
          <div 
            className="rounded-lg p-comfortable"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 6px rgba(26, 40, 33, 0.08)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="growth-heading" className="text-xl font-semibold" style={{ color: '#1A2821' }}>
                Your Growth Journey
              </h2>
              <Link
                to="/insights/detailed"
                className="inline-flex items-center text-sm font-medium hover:underline focus:outline-none focus:ring-2 rounded px-2 py-1"
                style={{ color: '#2D5A3D' }}
                aria-label="View detailed growth insights"
              >
                View Detailed Insights
                <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Wellness Score */}
              <div 
                className="text-center p-6 rounded-lg"
                style={{ backgroundColor: '#F4F6F5' }}
              >
                <div className="flex items-center justify-center mb-3">
                  <Star className="w-8 h-8" style={{ color: '#8B6914' }} />
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: '#1A2821' }}>
                  82%
                </p>
                <p className="text-sm" style={{ color: '#3A4742' }}>
                  Wellness Score
                </p>
                <p className="text-xs mt-2" style={{ color: '#3A6B48' }}>
                  ↑ 5% from last week
                </p>
              </div>
              
              {/* Sessions Completed */}
              <div 
                className="text-center p-6 rounded-lg"
                style={{ backgroundColor: '#F4F6F5' }}
              >
                <div className="flex items-center justify-center mb-3">
                  <CheckCircle className="w-8 h-8" style={{ color: '#3A6B48' }} />
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: '#1A2821' }}>
                  24
                </p>
                <p className="text-sm" style={{ color: '#3A4742' }}>
                  Sessions Completed
                </p>
                <p className="text-xs mt-2" style={{ color: '#546660' }}>
                  This month
                </p>
              </div>
              
              {/* Reflection Time */}
              <div 
                className="text-center p-6 rounded-lg"
                style={{ backgroundColor: '#F4F6F5' }}
              >
                <div className="flex items-center justify-center mb-3">
                  <Clock className="w-8 h-8" style={{ color: '#3A5F8A' }} />
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: '#1A2821' }}>
                  3.5h
                </p>
                <p className="text-sm" style={{ color: '#3A4742' }}>
                  Reflection Time
                </p>
                <p className="text-xs mt-2" style={{ color: '#546660' }}>
                  This week
                </p>
              </div>
            </div>
          </div>
        </section>
        
      </main>
    </div>
  );
};