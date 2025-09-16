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
  AlertCircle
} from 'lucide-react';
import { DailyBurnoutGaugeAccessible } from './DailyBurnoutGaugeAccessible';

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
}

export const PersonalizedHomepage: React.FC<PersonalizedHomepageProps> = ({ onNavigate, reflections = [] }) => {
  const [userName] = useState('Sarah');
  const [greeting, setGreeting] = useState('');
  const [dateString, setDateString] = useState('');
  const [showBurnoutGauge, setShowBurnoutGauge] = useState(false);
  const [burnoutScore, setBurnoutScore] = useState<number | null>(null);
  const [burnoutLevel, setBurnoutLevel] = useState<'low' | 'moderate' | 'high' | 'severe' | null>(null);
  const [lastAssessmentDate, setLastAssessmentDate] = useState<string | null>(null);
  
  const [wellnessStats] = useState<WellnessStats>({
    mood: 4,
    energy: 3,
    streakDays: 7,
    weeklyProgress: 65
  });

  // Convert passed reflections to the format needed for display
  const recentReflections = React.useMemo<RecentReflection[]>(() => {
    console.log('PersonalizedHomepage - Raw reflections received:', reflections);
    
    if (!reflections || reflections.length === 0) {
      console.log('PersonalizedHomepage - No reflections to display');
      return [];
    }
    
    const filtered = reflections
      .filter(r => r.type && r.type !== 'burnout_assessment') // Filter out burnout assessments
      .slice(0, 5) // Show only the 5 most recent
      .map(reflection => ({
        id: reflection.id,
        date: new Date(reflection.timestamp),
        title: getReflectionTitle(reflection.type),
        preview: getReflectionPreview(reflection.data),
        mood: getReflectionMood(reflection.data),
        tags: getReflectionTags(reflection.type)
      }));
    
    console.log('PersonalizedHomepage - Processed reflections for display:', filtered);
    return filtered;
  }, [reflections]);

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
      if (hours === 0) return 'Just now';
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
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
                      // In a real app, this would navigate to a dedicated "All Reflections" page
                      // For now, we'll show an alert if there are reflections
                      if (recentReflections.length > 0) {
                        alert('All Reflections view coming soon!');
                      }
                    }}
                    disabled={recentReflections.length === 0}
                    className={`text-sm font-medium flex items-center gap-1 transition-all ${
                      recentReflections.length > 0 
                        ? 'bg-gradient-to-r from-sage-500 to-green-500 bg-clip-text text-transparent hover:from-sage-600 hover:to-green-600 cursor-pointer' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    title={recentReflections.length === 0 ? 'No reflections to view yet' : 'View all reflections'}
                  >
                    View all
                    <ChevronRight className={`w-4 h-4 ${recentReflections.length > 0 ? 'text-sage-500' : 'text-gray-400'}`} />
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
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(reflection.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              onNavigate?.('reflection');
                              // In a real app, this would open the specific reflection
                            }}
                            className="p-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
                            title="View reflection"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              onNavigate?.('reflection');
                              // In a real app, this would open the reflection in edit mode
                            }}
                            className="p-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
                            title="Edit reflection"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 ml-5">
                        {reflection.preview}
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 ml-5">
                        {reflection.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full bg-gradient-to-r from-sage-500 to-green-500 from-sage-50 to-green-50 text-sage-700 border border-sage-200"
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
    </div>
  );
};

// Helper functions for converting reflection data
function getReflectionTitle(type: string): string {
  const titleMap: Record<string, string> = {
    'wellness_checkin': 'Wellness Check-in',
    'post_assignment': 'Post-Assignment Debrief',
    'pre_assignment': 'Pre-Assignment Prep',
    'teaming_prep': 'Teaming Preparation',
    'teaming_reflection': 'Teaming Reflection',
    'mentoring_prep': 'Mentoring Preparation',
    'mentoring_reflection': 'Mentoring Reflection',
    'ethics_meaning': 'Ethics & Meaning Check',
    'in_session_self': 'In-Session Self Check',
    'in_session_team': 'In-Session Team Sync',
    'role_space': 'Role Space Reflection',
    'direct_communication': 'Direct Communication Reflection'
  };
  return titleMap[type] || 'Reflection';
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
    const textFields = Object.values(data).find(v => typeof v === 'string' && v.length > 0);
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
    'post_assignment': ['assignment', 'debrief'],
    'pre_assignment': ['assignment', 'preparation'],
    'teaming_prep': ['team', 'preparation'],
    'teaming_reflection': ['team', 'reflection'],
    'mentoring_prep': ['mentoring', 'preparation'],
    'mentoring_reflection': ['mentoring', 'reflection'],
    'ethics_meaning': ['ethics', 'meaning'],
    'in_session_self': ['in-session', 'self-check'],
    'in_session_team': ['in-session', 'team'],
    'role_space': ['role', 'space'],
    'direct_communication': ['communication', 'reflection']
  };
  return tagMap[type] || ['reflection'];
}

export default PersonalizedHomepage;