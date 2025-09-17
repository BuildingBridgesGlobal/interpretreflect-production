import React, { useState, useEffect } from 'react';
import {
  Sunrise,
  Sun,
  Moon,
  Cloud,
  Wind,
  MessageCircle,
  Plus,
  X,
  Home,
  PenTool,
  Shield,
  User,
  Award,
  Users,
  Calendar,
  Brain,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LuxuryWellnessDashboardProps {
  userName?: string;
  onTabChange?: (tab: string, category?: string) => void;
}

interface UserProfile {
  id?: string;
  user_id: string;
  full_name?: string;
  pronouns?: string;
  credentials?: string[];
  language_preference?: string;
  high_contrast?: boolean;
  larger_text?: boolean;
  avatar_url?: string;
  updated_at?: string;
  created_at?: string;
}

interface LeaderboardEntry {
  name: string;
  streak: number;
  avatar: string;
}

export const LuxuryWellnessDashboard: React.FC<LuxuryWellnessDashboardProps> = ({
  userName = 'Beautiful Soul',
  onTabChange
}) => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [fabOpen, setFabOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let timeGreeting = '';

      if (hour < 5 || hour >= 21) {
        timeGreeting = 'tonight';
        setTimeOfDay('night');
      } else if (hour < 12) {
        timeGreeting = 'this morning';
        setTimeOfDay('morning');
      } else if (hour < 17) {
        timeGreeting = 'today';
        setTimeOfDay('afternoon');
      } else {
        timeGreeting = 'this evening';
        setTimeOfDay('evening');
      }

      setGreeting(`How are you feeling ${timeGreeting}?`);
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Fetch user data and streak
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setUserProfile(profile);

        // Mock leaderboard data (in real app, this would come from a friends/social system)
        setLeaderboard([
          { name: 'Sarah M.', streak: 15, avatar: 'SM' },
          { name: 'Alex K.', streak: 12, avatar: 'AK' },
          { name: 'Jordan L.', streak: 8, avatar: 'JL' }
        ]);

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  const getTimeIcon = () => {
    switch(timeOfDay) {
      case 'morning': return <Sunrise className="w-7 h-7" />;
      case 'afternoon': return <Sun className="w-7 h-7" />;
      case 'evening': return <Cloud className="w-7 h-7" />;
      case 'night': return <Moon className="w-7 h-7" />;
      default: return <Sun className="w-7 h-7" />;
    }
  };

  const getBackgroundGradient = () => {
    switch(timeOfDay) {
      case 'morning':
        return 'linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 25%, #E2E8F0 50%, #F1F5F9 75%, #FEFCF7 100%)';
      case 'afternoon':
        return 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 30%, #B3E5FC 60%, #E8F5E8 100%)';
      case 'evening':
        return 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 25%, #DDD6FE 50%, #F3F4F6 75%, #FEF7ED 100%)';
      case 'night':
        return 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 30%, #E2E8F0 60%, #F3F4F6 100%)';
      default:
        return 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 30%, #B3E5FC 60%, #E8F5E8 100%)';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: getBackgroundGradient(),
      position: 'relative'
    }}>
      {/* Serene wellness backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft sage green orb */}
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(92, 127, 79, 0.2) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }}
        />
        {/* Gentle sky blue orb */}
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(147, 197, 253, 0.2) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }}
        />
        {/* Soft lavender orb */}
        <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full opacity-12"
          style={{
            background: 'radial-gradient(circle, rgba(196, 181, 253, 0.2) 0%, transparent 70%)',
            filter: 'blur(50px)'
          }}
        />
        {/* Gentle cream accent */}
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-8"
          style={{
            background: 'radial-gradient(circle, rgba(248, 250, 252, 0.4) 0%, transparent 70%)',
            filter: 'blur(30px)'
          }}
        />
        {/* Subtle wellness-inspired shapes */}
        <div className="absolute bottom-1/3 left-1/4 w-96 h-48 opacity-4"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(92, 127, 79, 0.15), transparent)',
            transform: 'rotate(-15deg)',
            filter: 'blur(20px)'
          }}
        />
      </div>
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Skip to main content
      </a>

      {/* Main Content */}
      <div id="main-content" className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-8" role="main" aria-labelledby="dashboard-heading">
        
        {/* Personalized Welcome Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div style={{ color: '#5C7F4F' }}>
                {getTimeIcon()}
              </div>
              <h1 className="text-2xl font-medium" style={{ color: '#2D3748', letterSpacing: '-0.5px' }}>
                {greeting}
              </h1>
            </div>

            {/* Mobile Profile Button */}
            <button
              onClick={() => setProfileExpanded(!profileExpanded)}
              className="md:hidden p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-gray-200 hover:bg-white transition-colors"
            >
              <User className="w-5 h-5 text-gray-700" />
            </button>
          </div>


          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-serif font-bold text-xl" style={{ color: '#5C7F4F' }}>
                <p>Empowering Interpreters.</p>
                <p>Elevating Well-Being.</p>
                <p>InterpretReflect is your sanctuary for growth, resilience, and connection.</p>
              </div>
              <p className="font-sans text-sm mt-2" style={{ color: '#718096' }}>
                Personalized tools. Science-backed reflection. Community support.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <Shield className="w-4 h-4" style={{ color: '#5C7F4F' }} />
              <span className="text-xs" style={{ color: '#718096' }}>Your space is private and secure</span>
            </div>
          </div>

        </header>


        {/* Wellness Tools */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16">
          {/* Daily Check-In Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:bg-white/90 hover:scale-105" style={{
            border: '1px solid rgba(147, 197, 253, 0.08)',
            boxShadow: '0 4px 20px rgba(147, 197, 253, 0.04)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))'
          }}>
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                <Calendar className="w-8 h-8" style={{ color: '#5C7F4F' }} />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-medium" style={{ color: '#2D3748' }}>Daily Check-In</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#718096' }}>A gentle pause to tune into your inner self.</p>
              </div>
              <button
                onClick={() => onTabChange?.('checkin')}
                className="px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: 'rgba(92, 127, 79, 0.15)',
                  color: '#5C7F4F',
                  border: '1px solid rgba(92, 127, 79, 0.2)',
                  minWidth: '80px'
                }}
              >
                Start Now
              </button>
            </div>
          </div>

          {/* Mindful Reflection Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:bg-white/90 hover:scale-105" style={{
            border: '1px solid rgba(165, 180, 252, 0.08)',
            boxShadow: '0 4px 20px rgba(165, 180, 252, 0.04)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))'
          }}>
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(165, 180, 252, 0.1)' }}>
                <Brain className="w-8 h-8" style={{ color: '#6366F1' }} />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-medium" style={{ color: '#2D3748' }}>Mindful Reflection</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#718096' }}>Soft prompts for thoughtful self-discovery.</p>
              </div>
              <button
                onClick={() => onTabChange?.('reflection')}
                className="px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: 'rgba(165, 180, 252, 0.15)',
                  color: '#6366F1',
                  border: '1px solid rgba(165, 180, 252, 0.2)',
                  minWidth: '80px'
                }}
              >
                Explore
              </button>
            </div>
          </div>

          {/* Guided Breathing Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:bg-white/90 hover:scale-105" style={{
            border: '1px solid rgba(196, 181, 253, 0.08)',
            boxShadow: '0 4px 20px rgba(196, 181, 253, 0.04)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))'
          }}>
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(196, 181, 253, 0.1)' }}>
                <Wind className="w-8 h-8" style={{ color: '#8B5CF6' }} />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-medium" style={{ color: '#2D3748' }}>Guided Breathing</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#718096' }}>Simple exercises to restore calm and balance.</p>
              </div>
              <button
                onClick={() => onTabChange?.('breathing')}
                className="px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: 'rgba(196, 181, 253, 0.15)',
                  color: '#8B5CF6',
                  border: '1px solid rgba(196, 181, 253, 0.2)',
                  minWidth: '80px'
                }}
              >
                Breathe Deeply
              </button>
            </div>
          </div>
        </section>

        {/* Mobile Profile Modal */}
        {profileExpanded && (
          <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[80vh] overflow-y-auto">
              {/* Profile Header */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                      {userProfile?.full_name ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('') : userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{userProfile?.full_name || userName}</h3>
                      <p className="text-sm text-gray-600">Professional Interpreter</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileExpanded(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Wellness Focus */}
              <div className="p-4 border-b border-gray-100">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Your Wellness Journey</div>
                  <div className="text-xs text-gray-500">Personal growth through mindful practice</div>
                </div>
              </div>

              {/* Expandable Content */}
              <div className="p-4 space-y-4">
                {/* Recent Badge */}
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Award className="w-8 h-8 text-yellow-600" />
                  <div>
                    <div className="font-medium text-gray-800">Consistency Champion</div>
                    <div className="text-sm text-gray-600">7-day streak milestone</div>
                  </div>
                </div>

                {/* Leaderboard Snippet */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Friends' Streaks</span>
                  </div>
                  <div className="space-y-2">
                    {leaderboard.map((friend, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-bold">
                            {friend.avatar}
                          </div>
                          <span className="text-sm text-gray-700">{friend.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-800">{friend.streak}</span>
                          <span className="text-xs text-gray-500">days</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    View Profile
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button for Quick Access */}
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
          {/* Backdrop overlay when FAB is open */}
          {fabOpen && (
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setFabOpen(false)}
            />
          )}
          
          {/* FAB Menu Items */}
          <div className={`absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300 ${
            fabOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}>
            {/* Chat with Elya */}
            <button
              onClick={() => {
                onTabChange?.('chat');
                setFabOpen(false);
              }}
              className="flex items-center gap-3 bg-white/95 backdrop-blur-lg rounded-full pl-4 pr-6 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ 
                border: '1px solid rgba(99, 102, 241, 0.2)',
                minWidth: '160px'
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))' }}>
                <MessageCircle className="w-5 h-5" style={{ color: '#6366F1' }} />
              </div>
              <div>
                <span className="text-sm font-medium block" style={{ color: '#2D3748' }}>Chat with Elya</span>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>Confidential support</span>
              </div>
              <span className="absolute -top-1 -right-1 flex items-center gap-1 px-1.5 py-0.5 text-xs font-semibold rounded-full" 
                style={{ 
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: 'white',
                  fontSize: '9px'
                }}>
                BETA
              </span>
            </button>
            
            {/* Quick Reflection */}
            <button
              onClick={() => {
                onTabChange?.('reflection', 'affirmations');
                setFabOpen(false);
              }}
              className="flex items-center gap-3 bg-white/95 backdrop-blur-lg rounded-full pl-4 pr-6 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ 
                border: '1px solid rgba(147, 197, 253, 0.2)',
                minWidth: '160px'
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                style={{ backgroundColor: 'rgba(147, 197, 253, 0.1)' }}>
                <PenTool className="w-5 h-5" style={{ color: '#5B8FE3' }} />
              </div>
              <div>
                <span className="text-sm font-medium block" style={{ color: '#2D3748' }}>Quick Reflection</span>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>Private journal</span>
              </div>
            </button>
            
            {/* Breathe */}
            <button
              onClick={() => {
                onTabChange?.('stress');
                setFabOpen(false);
              }}
              className="flex items-center gap-3 bg-white/95 backdrop-blur-lg rounded-full pl-4 pr-6 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ 
                border: '1px solid rgba(147, 197, 253, 0.2)',
                minWidth: '160px'
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                style={{ backgroundColor: 'rgba(147, 197, 253, 0.1)' }}>
                <Wind className="w-5 h-5" style={{ color: '#5B8FE3' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: '#2D3748' }}>Start Reset</span>
            </button>
            
            {/* Home */}
            <button
              onClick={() => {
                onTabChange?.('home');
                setFabOpen(false);
              }}
              className="flex items-center gap-3 bg-white/95 backdrop-blur-lg rounded-full pl-4 pr-6 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ 
                border: '1px solid rgba(147, 197, 253, 0.2)',
                minWidth: '160px'
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                style={{ backgroundColor: 'rgba(147, 197, 253, 0.1)' }}>
                <Home className="w-5 h-5" style={{ color: '#5B8FE3' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: '#2D3748' }}>Home</span>
            </button>
          </div>
          
          {/* Main FAB Button */}
          <button
            onClick={() => setFabOpen(!fabOpen)}
            className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ${
              fabOpen ? 'rotate-45 scale-110' : 'hover:scale-110'
            }`}
            style={{ 
              background: fabOpen 
                ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
            aria-label={fabOpen ? "Close quick access menu" : "Open quick access menu"}
          >
            <div className="flex items-center justify-center">
              {fabOpen ? (
                <X className="w-6 h-6 md:w-7 md:h-7 text-white" />
              ) : (
                <Plus className="w-6 h-6 md:w-7 md:h-7 text-white" />
              )}
            </div>
            
            {/* Pulse animation when closed */}
            {!fabOpen && (
              <div className="absolute inset-0 rounded-full animate-ping"
                style={{ 
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  opacity: 0.3
                }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};