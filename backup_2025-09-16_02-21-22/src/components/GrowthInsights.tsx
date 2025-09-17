import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Calendar, 
  Brain, 
  Heart, 
  Target,
  BarChart3,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Clock,
  Award,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  Users,
  Shield
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// ========== DATA TYPES ==========
interface GrowthMetrics {
  totalReflections: number;
  lastWeekReflections: number;
  lastMonthReflections: number;
  reflectionTrend: 'up' | 'down' | 'stable';
  
  averageBurnoutScore: number;
  burnoutTrend: Array<{ date: string; score: number }>;
  
  stressResetCounts: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  
  teamworkEvents: number;
  valuesConflicts: number;
  boundariesSet: number;
  
  lastActivity: string;
  lastActivityTime: string;
}

interface ActivityEvent {
  id: string;
  type: 'reflection' | 'stress_reset' | 'wellness_check' | 'elya_chat';
  title: string;
  timestamp: string;
  summary?: string;
  metrics?: Record<string, any>;
}

// ========== MAIN COMPONENT ==========
export const GrowthInsights: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // ========== DATA FETCHING ==========
  
  /**
   * Fetch all user metrics from Supabase
   * This aggregates data from multiple tables to build comprehensive insights
   */
  useEffect(() => {
    if (!user) return;
    
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        // === FETCH REFLECTIONS DATA ===
        // Query: Get all reflection entries for the logged-in user
        const { data: reflections, error: reflectionError } = await supabase
          .from('reflection_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (reflectionError) throw reflectionError;

        // === CALCULATE REFLECTION METRICS ===
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const totalReflections = reflections?.length || 0;
        const lastWeekReflections = reflections?.filter(r => 
          new Date(r.created_at) >= oneWeekAgo
        ).length || 0;
        const lastMonthReflections = reflections?.filter(r => 
          new Date(r.created_at) >= oneMonthAgo
        ).length || 0;

        // Determine trend
        const previousWeekReflections = reflections?.filter(r => {
          const date = new Date(r.created_at);
          return date < oneWeekAgo && date >= new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
        }).length || 0;

        const reflectionTrend = lastWeekReflections > previousWeekReflections ? 'up' : 
                                lastWeekReflections < previousWeekReflections ? 'down' : 'stable';

        // === FETCH BURNOUT/STRESS DATA ===
        // Query: Get wellness check-ins and extract burnout metrics
        const { data: wellnessData, error: wellnessError } = await supabase
          .from('reflection_entries')
          .select('data, created_at')
          .eq('user_id', user.id)
          .eq('entry_kind', 'wellness_checkin')
          .order('created_at', { ascending: false })
          .limit(30);

        if (wellnessError) console.error('Wellness fetch error:', wellnessError);

        // Calculate average burnout score and trend
        const burnoutScores = wellnessData?.map(w => ({
          date: new Date(w.created_at).toLocaleDateString(),
          score: (w.data as any)?.overall_wellbeing || 5
        })) || [];

        const averageBurnoutScore = burnoutScores.length > 0 
          ? burnoutScores.reduce((acc, curr) => acc + curr.score, 0) / burnoutScores.length
          : 5;

        // === FETCH STRESS RESET ACTIVITIES ===
        // Query: Get all stress reset tool usage
        const { data: stressResets, error: stressError } = await supabase
          .from('stress_reset_logs')
          .select('tool_type, created_at')
          .eq('user_id', user.id)
          .gte('created_at', oneMonthAgo.toISOString());

        if (stressError) console.error('Stress reset fetch error:', stressError);

        // Count by tool type
        const stressResetCounts: Record<string, number> = {};
        stressResets?.forEach(reset => {
          const toolType = reset.tool_type || 'unknown';
          stressResetCounts[toolType] = (stressResetCounts[toolType] || 0) + 1;
        });

        // === CALCULATE STREAKS ===
        // Query: Get daily activity to calculate streaks
        const { data: dailyActivity, error: streakError } = await supabase
          .from('daily_activity')
          .select('activity_date')
          .eq('user_id', user.id)
          .order('activity_date', { ascending: false })
          .limit(365);

        if (streakError) console.error('Streak fetch error:', streakError);

        // Calculate current and longest streak
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        if (dailyActivity && dailyActivity.length > 0) {
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          
          for (let i = 0; i < dailyActivity.length; i++) {
            const activityDate = new Date(dailyActivity[i].activity_date).toDateString();
            
            if (i === 0 && (activityDate === today || activityDate === yesterday)) {
              currentStreak = 1;
              tempStreak = 1;
            } else if (tempStreak > 0) {
              const prevDate = new Date(dailyActivity[i - 1].activity_date);
              const currDate = new Date(dailyActivity[i].activity_date);
              const dayDiff = (prevDate.getTime() - currDate.getTime()) / 86400000;
              
              if (dayDiff === 1) {
                tempStreak++;
                if (i === 0 || (i === 1 && activityDate === yesterday)) {
                  currentStreak = tempStreak;
                }
              } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 0;
              }
            }
          }
          longestStreak = Math.max(longestStreak, tempStreak);
        }

        // === FETCH TEAMWORK & VALUES DATA ===
        // Query: Get teaming sessions and ethics checks
        const { data: teamingSessions } = await supabase
          .from('reflection_entries')
          .select('id')
          .eq('user_id', user.id)
          .in('entry_kind', ['teaming_prep', 'teaming_reflection'])
          .gte('created_at', oneMonthAgo.toISOString());

        const { data: ethicsChecks } = await supabase
          .from('reflection_entries')
          .select('data')
          .eq('user_id', user.id)
          .eq('entry_kind', 'compass_check')
          .gte('created_at', oneMonthAgo.toISOString());

        const teamworkEvents = teamingSessions?.length || 0;
        const valuesConflicts = ethicsChecks?.filter((e: any) => 
          e.data?.values_conflict_present === true
        ).length || 0;
        const boundariesSet = ethicsChecks?.filter((e: any) => 
          e.data?.boundaries_to_set?.length > 0
        ).length || 0;

        // === GET LAST ACTIVITY ===
        const lastReflection = reflections?.[0];
        const lastActivity = lastReflection?.entry_kind || 'None';
        const lastActivityTime = lastReflection?.created_at || '';

        // Set all metrics
        setMetrics({
          totalReflections,
          lastWeekReflections,
          lastMonthReflections,
          reflectionTrend,
          averageBurnoutScore,
          burnoutTrend: burnoutScores.slice(0, 7).reverse(),
          stressResetCounts,
          currentStreak,
          longestStreak,
          teamworkEvents,
          valuesConflicts,
          boundariesSet,
          lastActivity,
          lastActivityTime
        });

        // === FETCH RECENT ACTIVITIES FOR TIMELINE ===
        const { data: recentActivities } = await supabase
          .from('reflection_entries')
          .select('id, entry_kind, created_at, data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        const formattedActivities: ActivityEvent[] = recentActivities?.map(activity => ({
          id: activity.id,
          type: mapEntryKindToType(activity.entry_kind),
          title: formatActivityTitle(activity.entry_kind),
          timestamp: activity.created_at,
          summary: extractActivitySummary(activity.data),
          metrics: extractActivityMetrics(activity.data)
        })) || [];

        setActivities(formattedActivities);

      } catch (err) {
        console.error('Error fetching growth metrics:', err);
        setError('Failed to load growth insights. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user, selectedTimeRange]);

  // ========== HELPER FUNCTIONS ==========
  
  const mapEntryKindToType = (entryKind: string): ActivityEvent['type'] => {
    if (entryKind.includes('wellness')) return 'wellness_check';
    if (entryKind.includes('stress') || entryKind.includes('reset')) return 'stress_reset';
    if (entryKind === 'elya_chat') return 'elya_chat';
    return 'reflection';
  };

  const formatActivityTitle = (entryKind: string): string => {
    const titles: Record<string, string> = {
      'wellness_checkin': 'Wellness Check-In',
      'pre_assignment_prep': 'Pre-Assignment Prep',
      'post_assignment_debrief': 'Post-Assignment Debrief',
      'teaming_prep': 'Teaming Preparation',
      'teaming_reflection': 'Teaming Reflection',
      'compass_check': 'Ethics & Values Check',
      'breathing_practice': 'Breathing Practice',
      'body_awareness': 'Body Awareness Journey'
    };
    return titles[entryKind] || 'Reflection Activity';
  };

  const extractActivitySummary = (data: any): string => {
    if (data?.one_word_feeling) return `Feeling: ${data.one_word_feeling}`;
    if (data?.overall_feeling) return `Overall: ${data.overall_feeling}/10`;
    if (data?.current_state_word) return data.current_state_word;
    return '';
  };

  const extractActivityMetrics = (data: any): Record<string, any> => {
    return {
      confidence: data?.confidence_rating,
      stress: data?.stress_level_post,
      wellbeing: data?.overall_wellbeing
    };
  };

  // ========== ACTION HANDLERS ==========
  
  /**
   * Handle CTA button clicks
   * TODO: Replace alerts with actual navigation/modal triggers
   */
  const handleStartReflection = () => {
    // TODO: Navigate to Reflection Studio or open modal
    console.log('[ACTION] Start Guided Reflection clicked');
    alert('Opening Reflection Studio...');
    // Example: navigate('/reflection-studio');
    // Or: setShowReflectionModal(true);
  };

  const handleQuickStressReset = () => {
    // TODO: Open Stress Reset activities modal
    console.log('[ACTION] Quick Stress Reset clicked');
    alert('Opening Stress Reset Activities...');
    // Example: setShowStressResetModal(true);
  };

  const handleChatWithElya = () => {
    // TODO: Trigger Elya support chat
    console.log('[ACTION] Chat with Elya clicked');
    alert('Connecting with Elya...');
    // Example: openElyaChat();
  };

  // ========== RENDER FUNCTIONS ==========
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center" role="status" aria-live="polite">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" aria-hidden="true" />
          <p className="text-gray-600">Loading your growth insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg" role="alert">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-4" aria-hidden="true" />
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Reload page"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ========== HEADER ========== */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Growth Insights
              </h1>
              <p className="text-gray-600 mt-2">
                Track your wellness journey and professional development
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex gap-2" role="group" aria-label="Time range selector">
              {(['7d', '30d', '90d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTimeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-pressed={selectedTimeRange === range}
                >
                  {range === '7d' ? 'Week' : range === '30d' ? 'Month' : 'Quarter'}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ========== TOP METRICS CARDS ========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Reflections Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm" role="region" aria-labelledby="reflections-heading">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" aria-hidden="true" />
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                metrics?.reflectionTrend === 'up' ? 'bg-green-100 text-green-700' :
                metrics?.reflectionTrend === 'down' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {metrics?.reflectionTrend === 'up' ? '↑' : 
                 metrics?.reflectionTrend === 'down' ? '↓' : '→'}
                {' '}{metrics?.lastWeekReflections} this week
              </span>
            </div>
            <h2 id="reflections-heading" className="text-2xl font-bold text-gray-900">
              {metrics?.totalReflections || 0}
            </h2>
            <p className="text-gray-600 text-sm mt-1">Total Reflections</p>
            <p className="text-xs text-gray-500 mt-2">
              {metrics?.lastMonthReflections || 0} in last 30 days
            </p>
          </div>

          {/* Burnout Trend Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm" role="region" aria-labelledby="burnout-heading">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Activity className="w-6 h-6 text-amber-600" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                Avg: {metrics?.averageBurnoutScore.toFixed(1) || '5.0'}/10
              </span>
            </div>
            <h2 id="burnout-heading" className="text-lg font-semibold text-gray-900 mb-2">
              Wellness Score
            </h2>
            {/* Mini Chart */}
            {metrics?.burnoutTrend && metrics.burnoutTrend.length > 0 && (
              <ResponsiveContainer width="100%" height={60}>
                <AreaChart data={metrics.burnoutTrend}>
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#f59e0b" 
                    fill="#fef3c7" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Current Streak Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm" role="region" aria-labelledby="streak-heading">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                Best: {metrics?.longestStreak || 0} days
              </span>
            </div>
            <h2 id="streak-heading" className="text-2xl font-bold text-gray-900">
              {metrics?.currentStreak || 0} days
            </h2>
            <p className="text-gray-600 text-sm mt-1">Current Streak</p>
            <div className="mt-2 flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < (metrics?.currentStreak || 0) ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          {/* Team & Values Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm" role="region" aria-labelledby="team-values-heading">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" aria-hidden="true" />
              </div>
            </div>
            <h2 id="team-values-heading" className="text-lg font-semibold text-gray-900 mb-3">
              Professional Growth
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Team Sessions</span>
                <span className="font-medium">{metrics?.teamworkEvents || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Values Aligned</span>
                <span className="font-medium">{metrics?.valuesConflicts || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Boundaries Set</span>
                <span className="font-medium">{metrics?.boundariesSet || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========== ACTION BUTTONS ========== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleStartReflection}
            className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Start a guided reflection session"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Start Guided Reflection</span>
            </div>
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={handleQuickStressReset}
            className="flex items-center justify-between p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Do a quick stress reset activity"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Quick Stress Reset</span>
            </div>
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            onClick={handleChatWithElya}
            className="flex items-center justify-between p-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Start a chat with Elya support"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">Chat with Elya</span>
            </div>
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* ========== STRESS RESET TOOLS USAGE ========== */}
        {metrics?.stressResetCounts && Object.keys(metrics.stressResetCounts).length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8" role="region" aria-labelledby="stress-tools-heading">
            <h2 id="stress-tools-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Stress Reset Tools Usage
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(metrics.stressResetCounts).map(([tool, count]) => (
                <div key={tool} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{tool.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== ACTIVITY TIMELINE ========== */}
        <div className="bg-white rounded-xl p-6 shadow-sm" role="region" aria-labelledby="timeline-heading">
          <h2 id="timeline-heading" className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity Timeline
          </h2>
          
          {activities.length > 0 ? (
            <div className="space-y-4" role="list">
              {activities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex gap-4 pb-4 border-b last:border-b-0"
                  role="listitem"
                >
                  {/* Activity Icon */}
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    activity.type === 'reflection' ? 'bg-blue-100' :
                    activity.type === 'stress_reset' ? 'bg-green-100' :
                    activity.type === 'wellness_check' ? 'bg-amber-100' :
                    'bg-purple-100'
                  }`}>
                    {activity.type === 'reflection' && <BookOpen className="w-5 h-5 text-blue-600" aria-hidden="true" />}
                    {activity.type === 'stress_reset' && <RefreshCw className="w-5 h-5 text-green-600" aria-hidden="true" />}
                    {activity.type === 'wellness_check' && <Heart className="w-5 h-5 text-amber-600" aria-hidden="true" />}
                    {activity.type === 'elya_chat' && <MessageCircle className="w-5 h-5 text-purple-600" aria-hidden="true" />}
                  </div>
                  
                  {/* Activity Details */}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    {activity.summary && (
                      <p className="text-sm text-gray-600 mt-1">{activity.summary}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" aria-hidden="true" />
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                      {activity.metrics?.confidence && (
                        <span className="text-xs text-gray-500">
                          Confidence: {activity.metrics.confidence}/10
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No recent activities. Start a reflection to begin tracking your growth!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== QA TEST PLAN ==========
/**
 * MANUAL TEST PLAN FOR GROWTH INSIGHTS DASHBOARD
 * 
 * 1. AUTHENTICATION TESTS:
 *    - [ ] Verify dashboard only loads when user is logged in
 *    - [ ] Check that data is specific to logged-in user
 *    - [ ] Test logout/login flow preserves correct data
 * 
 * 2. METRICS DISPLAY TESTS:
 *    - [ ] Verify total reflections count matches database
 *    - [ ] Check week/month trends calculate correctly
 *    - [ ] Confirm burnout score average is accurate
 *    - [ ] Test streak calculations (current and longest)
 *    - [ ] Verify team/values metrics display
 * 
 * 3. TIME RANGE TESTS:
 *    - [ ] Switch between Week/Month/Quarter views
 *    - [ ] Verify data updates accordingly
 *    - [ ] Check loading states during switches
 * 
 * 4. CTA BUTTON TESTS:
 *    - [ ] Click "Start Guided Reflection" - verify action logs
 *    - [ ] Click "Quick Stress Reset" - verify action logs
 *    - [ ] Click "Chat with Elya" - verify action logs
 *    - [ ] Test keyboard navigation for all buttons
 * 
 * 5. ACTIVITY TIMELINE TESTS:
 *    - [ ] Verify recent activities display in correct order
 *    - [ ] Check activity icons match activity types
 *    - [ ] Confirm timestamps are formatted correctly
 *    - [ ] Test empty state when no activities exist
 * 
 * 6. ACCESSIBILITY TESTS:
 *    - [ ] Navigate entire dashboard with keyboard only
 *    - [ ] Test with screen reader (NVDA/JAWS)
 *    - [ ] Verify all images have alt text
 *    - [ ] Check color contrast meets WCAG AA
 *    - [ ] Test focus indicators are visible
 *    - [ ] Verify aria-labels and roles are present
 * 
 * 7. ERROR HANDLING TESTS:
 *    - [ ] Test with network offline
 *    - [ ] Verify error messages are helpful
 *    - [ ] Check retry functionality works
 * 
 * 8. PERFORMANCE TESTS:
 *    - [ ] Dashboard loads within 3 seconds
 *    - [ ] Charts render smoothly
 *    - [ ] No memory leaks on repeated navigation
 * 
 * 9. RESPONSIVE DESIGN TESTS:
 *    - [ ] Test on mobile (375px width)
 *    - [ ] Test on tablet (768px width)
 *    - [ ] Test on desktop (1440px width)
 *    - [ ] Verify layout adapts properly
 * 
 * 10. DATA ACCURACY TESTS:
 *     - [ ] Create new reflection, verify metrics update
 *     - [ ] Complete wellness check, confirm score changes
 *     - [ ] Use stress reset tool, check count increases
 *     - [ ] Verify streak updates daily
 */

export default GrowthInsights;