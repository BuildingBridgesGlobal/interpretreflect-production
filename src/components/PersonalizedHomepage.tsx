import React, { useState, useEffect } from 'react';
import {
  Calendar,
  TrendingUp,
  Heart,
  Battery,
  BookOpen,
  Edit3,
  Eye,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Cloud,
  Target,
  Activity,
  Clock,
  Zap,
  Brain,
  Shield,
  Gauge,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { DailyBurnoutGaugeAccessible } from './DailyBurnoutGaugeAccessible';
import { getSessionToken } from '../services/directSupabaseApi';
import { getDisplayName } from '../config/reflectionTypes';
import { AllReflectionsView } from './AllReflectionsView';
import { ReflectionDetailView } from './ReflectionDetailView';
import { ConfirmationModal } from './ConfirmationModal';
import { useAuth } from '../contexts/AuthContext';

interface RecentReflection {
  id: string;
  date: Date;
  title: string;
  preview: string;
  mood: 'excellent' | 'good' | 'neutral' | 'challenging' | 'difficult';
  tags: string[];
}

interface WellnessStats {
  mood: number; // 1-5 scale
  energy: number; // 1-5 scale
  streakDays: number;
  weeklyProgress: number; // percentage
}

interface PersonalizedHomepageProps {
  onNavigate?: (tab: string) => void;
  reflections?: Array<{
    id: string;
    type: string;
    data: any;
    timestamp: string;
  }>;
  onReflectionDeleted?: (reflectionId: string) => void;
}

export const PersonalizedHomepage: React.FC<PersonalizedHomepageProps> = ({ onNavigate, reflections = [], onReflectionDeleted }) => {
  const { user } = useAuth();
  const [userName] = useState('Sarah');
  const [greeting, setGreeting] = useState('');
  const [dateString, setDateString] = useState('');
  const [showBurnoutGauge, setShowBurnoutGauge] = useState(false);
  const [showAllReflections, setShowAllReflections] = useState(false);
  const [burnoutScore, setBurnoutScore] = useState<number | null>(null);
  const [burnoutLevel, setBurnoutLevel] = useState<'low' | 'moderate' | 'high' | 'severe' | null>(null);
  const [lastAssessmentDate, setLastAssessmentDate] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedReflection, setSelectedReflection] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; reflectionId: string | null }>({
    isOpen: false,
    reflectionId: null
  });
  const [localReflections, setLocalReflections] = useState(reflections);
  
  const [wellnessStats] = useState<WellnessStats>({
    mood: 4,
    energy: 3,
    streakDays: 7,
    weeklyProgress: 65
  });

  // Update local reflections when props change
  useEffect(() => {
    setLocalReflections(reflections);
  }, [reflections]);

  // Delete reflection function
  const handleDeleteReflection = async () => {
    if (!confirmDelete.reflectionId) return;

    const reflectionId = confirmDelete.reflectionId;
    setDeletingId(reflectionId);
    setConfirmDelete({ isOpen: false, reflectionId: null });

    try {
      const accessToken = await getSessionToken();
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/reflection_entries?id=eq.${reflectionId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete reflection');
      }

      // Remove from local state without reloading
      setLocalReflections(prev => prev.filter(r => r.id !== reflectionId));

      // Also update parent state
      if (onReflectionDeleted) {
        onReflectionDeleted(reflectionId);
      }

      console.log('Reflection deleted successfully');
    } catch (error) {
      console.error('Error deleting reflection:', error);
      // You could show an error modal here instead of alert
    } finally {
      setDeletingId(null);
    }
  };

  // Convert passed reflections to the format needed for display
  const recentReflections = React.useMemo<RecentReflection[]>(() => {
    console.log('PersonalizedHomepage - Raw reflections received:', localReflections);

    if (!localReflections || localReflections.length === 0) {
      console.log('PersonalizedHomepage - No reflections to display');
      return [];
    }

    const filtered = localReflections
      .filter(r => r.type && r.type !== 'burnout_assessment') // Filter out burnout assessments
      .slice(0, 5) // Show only the 5 most recent
      .map(reflection => ({
        id: reflection.id,
        date: new Date(reflection.timestamp),
        title: getReflectionTitle(reflection.type, reflection.data),
        preview: getReflectionPreview(reflection.data),
        mood: getReflectionMood(reflection.data),
        tags: getReflectionTags(reflection.type)
      }));

    console.log('PersonalizedHomepage - Processed reflections for display:', filtered);
    return filtered;
  }, [localReflections]);

  // Load saved burnout assessment on mount and check if it's from today
  useEffect(() => {
    const loadSavedAssessment = () => {
      const saved = localStorage.getItem('dailyBurnoutAssessment');
      if (saved) {
        const data = JSON.parse(saved);
        const savedDate = new Date(data.date);
        const today = new Date();
        
        // Check if assessment is from today
        if (savedDate.toDateString() === today.toDateString()) {
          setBurnoutScore(data.score);
          setBurnoutLevel(data.level);
          setLastAssessmentDate(data.date);
        } else {
          // Clear old assessment if it's from a previous day
          localStorage.removeItem('dailyBurnoutAssessment');
          setBurnoutScore(null);
          setBurnoutLevel(null);
          setLastAssessmentDate(null);
        }
      }
    };

    loadSavedAssessment();
    
    // Check every minute if we need to reset (in case user keeps page open overnight)
    const resetInterval = setInterval(loadSavedAssessment, 60000);
    return () => clearInterval(resetInterval);
  }, []);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      const name = userName;
      
      if (hour < 12) {
        setGreeting(`Good morning, ${name}`);
      } else if (hour < 17) {
        setGreeting(`Good afternoon, ${name}`);
      } else {
        setGreeting(`Good evening, ${name}`);
      }

      const today = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setDateString(today.toLocaleDateString('en-US', options));
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, [userName]);


  const getMoodIcon = (mood: number) => {
    if (mood >= 4) return <Sun className="w-4 h-4 text-yellow-500" />;
    if (mood >= 3) return <Cloud className="w-4 h-4 text-blue-400" />;
    return <Moon className="w-4 h-4 text-indigo-400" />;
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      excellent: '#10B981',
      good: '#6EE7B7',
      neutral: '#FCD34D',
      challenging: '#FB923C',
      difficult: '#F87171'
    };
    return colors[mood as keyof typeof colors] || colors.neutral;
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        if (minutes < 5) return 'Just now';
        return `${minutes} minutes ago`;
      }
      if (hours === 1) return '1 hour ago';
      return `${hours} hours ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    // Format as readable date for older reflections
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FAFBFC 0%, #F0F5ED 100%)' }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-sage-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                {greeting}
              </h1>
              <p className="text-gray-600">
                {dateString}
              </p>
            </div>
            
            {/* Tip of the Day */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Wellness Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Wellness Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Your Wellness
              </h2>
              
              <div className="space-y-4">
                {/* Mood */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Today's Mood</span>
                    {getMoodIcon(wellnessStats.mood)}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-sage-500 to-green-500 from-yellow-400 to-yellow-500 transition-all duration-500"
                        style={{ width: `${(wellnessStats.mood / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{wellnessStats.mood}/5</span>
                  </div>
                </div>

                {/* Energy */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Energy Level</span>
                    <Zap className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-sage-500 to-green-500 from-green-400 to-green-500 transition-all duration-500"
                        style={{ width: `${(wellnessStats.energy / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{wellnessStats.energy}/5</span>
                  </div>
                </div>

                {/* Streak */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Reflection Streak</p>
                      <p className="text-2xl font-bold text-gray-900">{wellnessStats.streakDays} days</p>
                    </div>
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                </div>

                {/* Weekly Progress */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Weekly Goal</span>
                    <span className="text-sm font-medium text-gray-900">{wellnessStats.weeklyProgress}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-sage-500 to-green-500 from-sage-400 to-green-400 transition-all duration-500"
                      style={{ width: `${wellnessStats.weeklyProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Burnout Check */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-orange-500" />
                Daily Burnout Check
              </h2>
              
              {burnoutScore !== null ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {burnoutScore}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {burnoutLevel === 'low' && 'Healthy Balance'}
                      {burnoutLevel === 'moderate' && 'Early Warning'}
                      {burnoutLevel === 'high' && 'High Risk'}
                      {burnoutLevel === 'severe' && 'Critical'}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      ✓ Today's assessment complete
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${burnoutScore}%`,
                        background: burnoutLevel === 'low' ? 'linear-gradient(to right, #7A9B6E, #5C7F4F)' : 
                                   burnoutLevel === 'moderate' ? 'linear-gradient(to right, #8FA881, #7A9B6E)' :
                                   burnoutLevel === 'high' ? 'linear-gradient(to right, #C4A57B, #8B7355)' : 
                                   'linear-gradient(to right, #D48B5F, #C87137)'
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => setShowBurnoutGauge(true)}
                    className="w-full px-3 py-2 text-sm text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
                  >
                    Retake Assessment
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Quick 5-question check-in to monitor your burnout risk
                  </p>
                  <button 
                    onClick={() => setShowBurnoutGauge(true)}
                    className="w-full px-4 py-2.5 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
                  >
                    <Gauge className="w-4 h-4" />
                    Take Assessment
                  </button>
                </div>
              )}
            </div>

            {/* Start Reflection CTA */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Ready to reflect?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Take 5 minutes to check in with yourself
              </p>
              <button 
                onClick={() => onNavigate?.('reflection')}
                className="w-full px-4 py-2.5 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
                title="Go to Reflection Studio to create a new reflection"
              >
                <BookOpen className="w-4 h-4" />
                Start New Reflection
              </button>
            </div>
          </div>

          {/* Right Column - Recent Reflections */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-sage-100">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Reflections</h2>
                  <button
                    onClick={() => {
                      if (recentReflections.length > 0 || localReflections.length > 0) {
                        setShowAllReflections(true);
                      }
                    }}
                    disabled={recentReflections.length === 0}
                    className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1 rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90 ${
                      recentReflections.length > 0
                        ? 'text-white cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                    style={{
                      background: recentReflections.length > 0
                        ? 'linear-gradient(135deg, #1b5e20, #2e7d32)'
                        : '#e5e7eb'
                    }}
                    title={recentReflections.length === 0 ? 'No reflections to view yet' : 'View all reflections'}
                  >
                    View all
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {recentReflections.length > 0 ? (
                  recentReflections.map((reflection) => (
                    <div key={reflection.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: getMoodColor(reflection.mood) }}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {reflection.title}
                            </h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(reflection.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // Find the full reflection data from localReflections
                              const fullReflection = localReflections.find(r => r.id === reflection.id);
                              if (fullReflection) {
                                setSelectedReflection(fullReflection);
                              }
                            }}
                            className="p-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
                            title="View reflection"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ isOpen: true, reflectionId: reflection.id })}
                            disabled={deletingId === reflection.id}
                            className={`p-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90 ${
                              deletingId === reflection.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            style={{ background: 'linear-gradient(135deg, #d32f2f, #f44336)' }}
                            title="Delete reflection"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 ml-5">
                        {reflection.preview}
                      </p>

                      <div className="flex flex-wrap gap-1.5 ml-5">
                        {reflection.tags.filter(tag => {
                          // Filter out any timestamps that might have snuck in
                          const isTimestamp = /^\d{4}-\d{2}-\d{2}T/.test(tag);
                          if (isTimestamp) {
                            console.warn('Found timestamp in tags:', tag);
                            return false;
                          }
                          return true;
                        }).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full text-white border border-green-700"
                            style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <h3 className="font-medium text-gray-900 mb-2">No reflections yet</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Start your wellness journey by creating your first reflection
                    </p>
                    <button 
                      onClick={() => onNavigate?.('reflection')}
                      className="px-4 py-2 text-white rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
                    >
                      Create First Reflection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </main>
      
      {/* Burnout Gauge Modal */}
      {showBurnoutGauge && (
        <DailyBurnoutGaugeAccessible
          onComplete={(results) => {
            const scorePercentage = Math.round((results.totalScore / 25) * 100);
            const today = new Date().toISOString();

            // Save to localStorage with today's date
            localStorage.setItem('dailyBurnoutAssessment', JSON.stringify({
              score: scorePercentage,
              level: results.riskLevel,
              date: today,
              totalScore: results.totalScore
            }));

            setBurnoutScore(scorePercentage);
            setBurnoutLevel(results.riskLevel);
            setLastAssessmentDate(today);
            setShowBurnoutGauge(false);
          }}
          onClose={() => setShowBurnoutGauge(false)}
        />
      )}

      {/* All Reflections View Modal */}
      {showAllReflections && user && (
        <AllReflectionsView
          userId={user.id}
          onClose={() => {
            setShowAllReflections(false);
            // No need to reload - state updates automatically
          }}
          initialReflections={localReflections as any}
        />
      )}

      {/* Reflection Detail View Modal */}
      {selectedReflection && (
        <ReflectionDetailView
          reflection={selectedReflection}
          onClose={() => setSelectedReflection(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        title="Delete Reflection"
        message="Are you sure you want to delete this reflection? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteReflection}
        onCancel={() => setConfirmDelete({ isOpen: false, reflectionId: null })}
        isDanger={true}
      />
    </div>
  );
};

// Helper functions for converting reflection data
function getReflectionTitle(type: string, data?: any): string {
  // Use centralized function for consistent naming - pass data to infer type if needed
  return getDisplayName(type, data);
}

function getReflectionPreview(data: any): string {
  // Generate a preview based on the data
  if (data?.notes && typeof data.notes === 'string') {
    return data.notes.substring(0, 100) + (data.notes.length > 100 ? '...' : '');
  }
  if (data?.reflection && typeof data.reflection === 'string') {
    return data.reflection.substring(0, 100) + (data.reflection.length > 100 ? '...' : '');
  }
  if (data?.thoughts && typeof data.thoughts === 'string') {
    return data.thoughts.substring(0, 100) + (data.thoughts.length > 100 ? '...' : '');
  }
  if (data?.summary && typeof data.summary === 'string') {
    return data.summary.substring(0, 100) + (data.summary.length > 100 ? '...' : '');
  }
  // Try to extract any text field from the data
  if (data && typeof data === 'object') {
    const textFields = Object.values(data).find(v => {
      // Check if it's a string and not a timestamp
      if (typeof v === 'string' && v.length > 0) {
        // Skip if it looks like an ISO timestamp
        const isTimestamp = /^\d{4}-\d{2}-\d{2}T/.test(v);
        return !isTimestamp;
      }
      return false;
    });
    if (textFields && typeof textFields === 'string') {
      return textFields.substring(0, 100) + (textFields.length > 100 ? '...' : '');
    }
  }
  return 'Reflection completed';
}

function getReflectionMood(data: any): 'excellent' | 'good' | 'neutral' | 'challenging' | 'difficult' {
  // Extract mood from data
  if (data.mood) {
    const moodValue = typeof data.mood === 'number' ? data.mood : parseInt(data.mood);
    if (moodValue >= 8) return 'excellent';
    if (moodValue >= 6) return 'good';
    if (moodValue >= 4) return 'neutral';
    if (moodValue >= 2) return 'challenging';
    return 'difficult';
  }
  if (data.energyLevel) {
    const energy = typeof data.energyLevel === 'number' ? data.energyLevel : parseInt(data.energyLevel);
    if (energy >= 8) return 'excellent';
    if (energy >= 6) return 'good';
    if (energy >= 4) return 'neutral';
    if (energy >= 2) return 'challenging';
    return 'difficult';
  }
  return 'neutral';
}

function getReflectionTags(type: string): string[] {
  const tagMap: Record<string, string[]> = {
    'wellness_checkin': ['wellness', 'check-in'],
    'wellness_check_in': ['wellness', 'check-in'],
    'post_assignment': ['assignment', 'debrief'],
    'post_assignment_debrief': ['assignment', 'debrief'],
    'pre_assignment': ['assignment', 'preparation'],
    'pre_assignment_prep': ['assignment', 'preparation'],
    'teaming_prep': ['team', 'preparation'],
    'teaming_prep_enhanced': ['team', 'interpreting'],
    'teaming_reflection': ['team', 'reflection'],
    'teaming_reflection_enhanced': ['team', 'reflection'],
    'mentoring_prep': ['mentoring', 'preparation'],
    'mentoring_reflection': ['mentoring', 'reflection'],
    'ethics_meaning': ['ethics', 'meaning'],
    'in_session_self': ['in-session', 'self-check'],
    'in_session_team': ['in-session', 'team'],
    'role_space': ['role', 'space'],
    'direct_communication': ['communication', 'reflection'],
    'direct_communication_reflection': ['communication', 'reflection'],
    'burnout_assessment': ['wellness', 'assessment'],
    'compass_check': ['values', 'alignment'],
    'breathing_practice': ['breathing', 'mindfulness'],
    'body_awareness': ['body', 'awareness']
  };
  return tagMap[type] || ['reflection'];
}

export default PersonalizedHomepage;