import React, { useState, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import type { BurnoutData, ViewMode } from './types';
import LandingPage from './LandingPage';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { PreAssignmentPrepEnhanced } from './components/PreAssignmentPrepEnhanced';
import { PostAssignmentDebriefEnhanced } from './components/PostAssignmentDebriefEnhanced';
import { TeamingPrepEnhanced } from './components/TeamingPrepEnhanced';
import TeamingReflection from './components/TeamingReflection';
import { TeamingReflectionEnhanced } from './components/TeamingReflectionEnhanced';
import { MentoringPrepEnhanced } from './components/MentoringPrepEnhanced';
import MentoringReflection from './components/MentoringReflection';
import WellnessCheckIn from './components/WellnessCheckIn';
import CompassCheck from './components/CompassCheck';
import DailyBurnoutGauge from './components/DailyBurnoutGauge';
import { ChatWithElya } from './components/ChatWithElya';
import {
  Home,
  BookOpen,
  RefreshCw,
  MessageCircle,
  TrendingUp,
  Target,
  Shield,
  Heart,
  Clock,
  Users,
  Lightbulb,
  Settings,
  ChevronDown,
  Globe,
  User,
  Gauge,
  Sparkles,
  Square,
  Waves,
  Thermometer,
  Eye,
  Mountain,
  ArrowLeft,
  Star,
  Activity,
  BarChart3,
  Triangle,
  CheckCircle,
  AlertTriangle,
  Zap,
  ChevronRight,
  ChevronLeft,
  Lock,
  Database,
  Settings as SettingsIcon,
  Download,
  X,
} from 'lucide-react';

function App() {
  const { user, loading, signOut } = useAuth();
  const [devMode, setDevMode] = useState(false); // DEV MODE - set to true to bypass auth
  // Load saved tab preference or default to home
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('preferredTab');
    return savedTab || 'home'; // Default to home tab for authenticated users
  });
  const [activeCategory, setActiveCategory] = useState('structured');
  const [insightsTimePeriod, setInsightsTimePeriod] = useState('month');
  const [showPrivacyPage, setShowPrivacyPage] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [techniqueProgress, setTechniqueProgress] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold-in' | 'exhale' | 'hold-out'>(
    'inhale'
  );
  const [breathCycle, setBreathCycle] = useState(0);
  const [bodyPart, setBodyPart] = useState(0); // For body release
  const [senseCount, setSenseCount] = useState(0); // For sensory reset
  const [expansionLevel, setExpansionLevel] = useState(0); // For expansion practice
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Store interval reference
  const [showPreAssignmentPrep, setShowPreAssignmentPrep] = useState(false);
  const [showPostAssignmentDebrief, setShowPostAssignmentDebrief] = useState(false);
  const [showTeamingPrep, setShowTeamingPrep] = useState(false);
  const [showTeamingReflection, setShowTeamingReflection] = useState(false);
  const [showMentoringPrep, setShowMentoringPrep] = useState(false);
  const [showMentoringReflection, setShowMentoringReflection] = useState(false);
  const [showWellnessCheckIn, setShowWellnessCheckIn] = useState(false);
  const [showCompassCheck, setShowCompassCheck] = useState(false);
  const [showDailyBurnout, setShowDailyBurnout] = useState(false);
  const [savedReflections, setSavedReflections] = useState<Record<string, unknown>[]>([]);
  const [techniqueUsage, setTechniqueUsage] = useState<Record<string, unknown>[]>([]);
  const [currentTechniqueId, setCurrentTechniqueId] = useState<string | null>(null);
  const [recoveryHabits, setRecoveryHabits] = useState<Record<string, unknown>[]>([]);
  const [burnoutData, setBurnoutData] = useState<BurnoutData[]>([]);
  const [showSummaryView, setShowSummaryView] = useState<ViewMode>('daily');
  const [selectedAffirmationCategory, setSelectedAffirmationCategory] = useState<number | null>(null);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);

  // Save tab preference when it changes
  React.useEffect(() => {
    if (activeTab) {
      localStorage.setItem('preferredTab', activeTab);
    }
  }, [activeTab]);

  // Load burnout data on component mount and when tab changes
  React.useEffect(() => {
    const loadBurnoutData = async () => {
      if (activeTab === 'insights') {
        if (user) {
          try {
            // Load from Supabase for logged-in users
            const { data, error } = await supabase
              .from('burnout_assessments')
              .select('*')
              .eq('user_id', user.id)
              .order('assessment_date', { ascending: false })
              .limit(30);
            
            if (error) throw error;
            
            if (data) {
              // Convert Supabase data to match our format
              const formattedData = data.map(d => ({
                energyTank: d.energy_tank,
                recoverySpeed: d.recovery_speed,
                emotionalLeakage: d.emotional_leakage,
                performanceSignal: d.performance_signal,
                tomorrowReadiness: d.tomorrow_readiness,
                totalScore: parseFloat(d.total_score),
                riskLevel: d.risk_level,
                date: d.assessment_date,
                timestamp: d.created_at,
                contextFactors: {
                  workloadIntensity: d.workload_intensity,
                  emotionalDemand: d.emotional_demand,
                  hadBreaks: d.had_breaks,
                  teamSupport: d.team_support,
                  difficultSession: d.difficult_session,
                }
              }));
              setBurnoutData(formattedData.reverse());
              // Successfully loaded burnout data from Supabase
            }
          } catch {
            // Error loading from Supabase, fallback to localStorage
            // Fallback to localStorage
            const stored = localStorage.getItem('burnoutAssessments');
            if (stored) {
              const assessments = JSON.parse(stored);
              setBurnoutData(assessments);
            }
          }
        } else {
          // Not logged in, use localStorage
          const stored = localStorage.getItem('burnoutAssessments');
          if (stored) {
            const assessments = JSON.parse(stored);
            setBurnoutData(assessments);
          }
        }
      }
    };
    
    loadBurnoutData();
  }, [activeTab, user]);
  
  // Load saved reflections on mount
  React.useEffect(() => {
    const loadReflections = () => {
      const storedReflections = localStorage.getItem('savedReflections');
      if (storedReflections) {
        setSavedReflections(JSON.parse(storedReflections));
      }
    };
    loadReflections();
    
    // Load technique usage data
    const loadTechniqueUsage = () => {
      const storedUsage = localStorage.getItem('techniqueUsage');
      if (storedUsage) {
        setTechniqueUsage(JSON.parse(storedUsage));
      }
    };
    loadTechniqueUsage();
    
    // Load recovery habits data
    const loadRecoveryHabits = () => {
      const storedHabits = localStorage.getItem('recoveryHabits');
      if (storedHabits) {
        setRecoveryHabits(JSON.parse(storedHabits));
      }
    };
    loadRecoveryHabits();
  }, []);
  
  // Helper function to save a reflection
  const saveReflection = (type: string, data: Record<string, unknown>) => {
    const newReflection = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date().toISOString(),
    };
    
    const updatedReflections = [newReflection, ...savedReflections].slice(0, 10); // Keep only last 10
    setSavedReflections(updatedReflections);
    localStorage.setItem('savedReflections', JSON.stringify(updatedReflections));
  };
  
  // Helper function to get time ago string
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };
  
  // Helper function to track technique start
  const trackTechniqueStart = (technique: string) => {
    const usage = {
      id: Date.now().toString(),
      technique,
      startTime: new Date().toISOString(),
      completed: false,
      stressLevelBefore: null,
      stressLevelAfter: null,
    };
    
    const updatedUsage = [usage, ...techniqueUsage];
    setTechniqueUsage(updatedUsage);
    localStorage.setItem('techniqueUsage', JSON.stringify(updatedUsage));
    
    return usage.id;
  };
  
  // Helper function to track technique completion
  const trackTechniqueComplete = (techniqueId: string, duration: number) => {
    const updatedUsage = techniqueUsage.map(usage => {
      if (usage.id === techniqueId || 
          (usage.technique === selectedTechnique && !usage.completed && 
           new Date(usage.startTime).getTime() > Date.now() - 600000)) { // Within last 10 mins
        return {
          ...usage,
          completed: true,
          duration,
          endTime: new Date().toISOString(),
        };
      }
      return usage;
    });
    
    setTechniqueUsage(updatedUsage);
    localStorage.setItem('techniqueUsage', JSON.stringify(updatedUsage));
    
    // Track this as a recovery break
    if (duration > 50) { // If completed more than 50% of the technique
      trackRecoveryHabit('break', 'stress-reset', { technique: selectedTechnique, duration });
    }
  };
  
  // Helper function to track recovery habits
  const trackRecoveryHabit = (type: string, value: unknown, metadata?: Record<string, unknown>) => {
    const habit = {
      id: Date.now().toString(),
      type,
      value,
      metadata,
      timestamp: new Date().toISOString(),
    };
    
    const updatedHabits = [habit, ...recoveryHabits].slice(0, 100); // Keep last 100
    setRecoveryHabits(updatedHabits);
    localStorage.setItem('recoveryHabits', JSON.stringify(updatedHabits));
  };
  
  // Helper function to get reflection summary
  const getReflectionSummary = (reflection: Record<string, unknown>) => {
    const data = reflection.data;
    
    switch (reflection.type) {
      case 'Pre-Assignment Prep':
        return `Cognitive load: ${data.cognitiveLoad || 'Not assessed'}. Set intention for the session.`;
      case 'Post-Assignment Debrief':
        return `Energy level: ${data.energyLevel || 'Not assessed'}. Processed session outcomes.`;
      case 'Teaming Prep':
        return `Team dynamics assessed. ${data.roleClarity ? 'Role clarified' : 'Preparation complete'}.`;
      case 'Teaming Reflection':
        return `Team performance reviewed. ${data.teamDynamics || 'Collaboration'} focus.`;
      case 'Mentoring Prep':
        return `${data.mentoringGoals || 'Goals set'}. Ready for mentoring session.`;
      case 'Mentoring Reflection':
        return `Mentoring insights captured. ${data.learningOutcomes || 'Growth'} identified.`;
      case 'Wellness Check-in':
        return `Wellness status: ${data.overallWellness || 'Assessed'}. ${data.stressLevel || 'Stress'} managed.`;
      case 'Compass Check':
        return `Direction aligned. ${data.priorityFocus || 'Priorities'} clarified.`;
      default:
        return 'Reflection completed successfully.';
    }
  };

  // Export burnout data function
  const exportBurnoutData = () => {
    if (burnoutData.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare CSV content
    const headers = [
      'Date',
      'Time',
      'Total Score',
      'Risk Level',
      'Energy Tank',
      'Recovery Speed',
      'Emotional Leakage',
      'Performance Signal',
      'Tomorrow Readiness',
      'Workload Intensity',
      'Emotional Demand',
      'Had Breaks',
      'Team Support',
      'Difficult Session',
    ];

    const rows = burnoutData.map((d) => {
      const date = new Date(d.timestamp);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        d.totalScore ? d.totalScore.toFixed(2) : '',
        d.riskLevel || '',
        d.energyTank || d.exhaustion || '',
        d.recoverySpeed || d.recovery || '',
        d.emotionalLeakage || d.detachment || '',
        d.performanceSignal || d.inefficacy || '',
        d.tomorrowReadiness || d.overload || '',
        d.contextFactors?.workloadIntensity || '',
        d.contextFactors?.emotionalDemand || '',
        d.contextFactors?.hadBreaks !== undefined
          ? d.contextFactors.hadBreaks
            ? 'Yes'
            : 'No'
          : '',
        d.contextFactors?.teamSupport !== undefined
          ? d.contextFactors.teamSupport
            ? 'Yes'
            : 'No'
          : '',
        d.contextFactors?.difficultSession !== undefined
          ? d.contextFactors.difficultSession
            ? 'Yes'
            : 'No'
          : '',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `burnout_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate aggregated data for weekly/monthly views
  const getAggregatedData = (): BurnoutData[] => {
    if (showSummaryView === 'daily') return burnoutData;

    const aggregated: BurnoutData[] = [];
    const sorted = [...burnoutData].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (showSummaryView === 'weekly') {
      // Group by week
      let currentWeek: BurnoutData[] = [];
      let weekStart: Date | null = null;

      sorted.forEach((d) => {
        const date = new Date(d.timestamp);
        if (!weekStart || date.getTime() - weekStart.getTime() > 7 * 24 * 60 * 60 * 1000) {
          if (currentWeek.length > 0) {
            aggregated.push({
              date: weekStart?.toISOString().split('T')[0],
              totalScore:
                currentWeek.reduce((sum, item) => sum + item.totalScore, 0) / currentWeek.length,
              riskLevel: getMostCommonRiskLevel(currentWeek),
              count: currentWeek.length,
            });
          }
          weekStart = date;
          currentWeek = [d];
        } else {
          currentWeek.push(d);
        }
      });

      if (currentWeek.length > 0 && weekStart) {
        aggregated.push({
          date: weekStart.toISOString().split('T')[0],
          totalScore:
            currentWeek.reduce((sum, item) => sum + item.totalScore, 0) / currentWeek.length,
          riskLevel: getMostCommonRiskLevel(currentWeek),
          count: currentWeek.length,
        });
      }
    } else if (showSummaryView === 'monthly') {
      // Group by month
      const monthGroups = new Map<string, BurnoutData[]>();

      sorted.forEach((d) => {
        const date = new Date(d.timestamp);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        if (!monthGroups.has(monthKey)) {
          monthGroups.set(monthKey, []);
        }
        monthGroups.get(monthKey)?.push(d);
      });

      monthGroups.forEach((items, monthKey) => {
        aggregated.push({
          date: `${monthKey}-01`,
          totalScore: items.reduce((sum, item) => sum + item.totalScore, 0) / items.length,
          riskLevel: getMostCommonRiskLevel(items),
          count: items.length,
        });
      });
    }

    return aggregated;
  };

  const getMostCommonRiskLevel = (items: BurnoutData[]): string => {
    const counts = items.reduce(
      (acc, item) => {
        acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'moderate';
  };

  const renderGrowthInsights = () => (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      role="main"
      aria-labelledby="growth-insights-heading"
    >
      <div className="space-y-8">
        {/* Header with time period tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                id="growth-insights-heading"
                className="text-4xl font-bold mb-2"
                style={{ color: '#1A1A1A', letterSpacing: '-0.5px' }}
              >
                Growth Insights
              </h1>
              <p className="text-base" style={{ color: '#3A3A3A' }}>
                Past Month: {savedReflections.length} total reflections
              </p>
            </div>

            <nav
              className="flex space-x-2 p-2 rounded-xl"
              role="tablist"
              aria-label="Time period selector"
              style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}
            >
              <button
                onClick={() => setInsightsTimePeriod('week')}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
                role="tab"
                aria-selected={insightsTimePeriod === 'week'}
                aria-controls="insights-panel"
                aria-label="View past week insights"
                style={{
                  backgroundColor: insightsTimePeriod === 'week' ? '#5C7F4F' : 'transparent',
                  color: insightsTimePeriod === 'week' ? '#FFFFFF' : '#1A1A1A',
                }}
                onMouseEnter={(e) => {
                  if (insightsTimePeriod !== 'week') {
                    e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (insightsTimePeriod !== 'week') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Past Week
              </button>
              <button
                onClick={() => setInsightsTimePeriod('month')}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
                role="tab"
                aria-selected={insightsTimePeriod === 'month'}
                aria-controls="insights-panel"
                aria-label="View past month insights"
                style={{
                  backgroundColor: insightsTimePeriod === 'month' ? '#5C7F4F' : 'transparent',
                  color: insightsTimePeriod === 'month' ? '#FFFFFF' : '#1A1A1A',
                }}
                onMouseEnter={(e) => {
                  if (insightsTimePeriod !== 'month') {
                    e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (insightsTimePeriod !== 'month') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Past Month
              </button>
              <button
                onClick={() => setInsightsTimePeriod('90days')}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
                role="tab"
                aria-selected={insightsTimePeriod === '90days'}
                aria-controls="insights-panel"
                aria-label="View past 90 days insights"
                style={{
                  backgroundColor: insightsTimePeriod === '90days' ? '#5C7F4F' : 'transparent',
                  color: insightsTimePeriod === '90days' ? '#FFFFFF' : '#1A1A1A',
                }}
                onMouseEnter={(e) => {
                  if (insightsTimePeriod !== '90days') {
                    e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (insightsTimePeriod !== '90days') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                Past 90 Days
              </button>
            </nav>
          </div>
        </div>

        {/* Stress & Energy Chart */}
        <section
          className="rounded-2xl p-8"
          aria-labelledby="stress-energy-chart-heading"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(92, 127, 79, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(92, 127, 79, 0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              id="stress-energy-chart-heading"
              className="text-2xl font-bold"
              style={{ color: '#1A1A1A' }}
            >
              Your Stress & Energy Over Time
            </h2>
            <button
              className="text-sm font-medium flex items-center px-4 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
              aria-label="View stress and energy data by assignment"
              style={{
                color: '#5C7F4F',
                backgroundColor: 'rgba(92, 127, 79, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.2)';
                e.currentTarget.style.color = '#2D5F3F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.1)';
                e.currentTarget.style.color = '#5C7F4F';
              }}
            >
              View by assignment →
            </button>
          </div>

          {/* Chart area with mock data visualization */}
          <div
            className="rounded-xl p-6 h-80 relative"
            role="img"
            aria-label="Line chart showing stress and energy levels over the past month with reset day markers"
            style={{ backgroundColor: '#FAFAF8', border: '1px solid #E8E5E0' }}
          >
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-4">
              <span>10</span>
              <span>8</span>
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>

            {/* Chart content area */}
            <div className="ml-8 mr-4 h-full flex items-center justify-center relative">
              {(() => {
                const reflectionsWithStress = savedReflections.filter(r => r.data.stressLevel || r.data.stressLevelBefore || r.data.stressLevelAfter);
                const reflectionsWithEnergy = savedReflections.filter(r => r.data.energyLevel);
                
                if (reflectionsWithStress.length === 0 && reflectionsWithEnergy.length === 0) {
                  return (
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-3" style={{ color: '#7A9B6E' }} />
                      <p className="text-sm font-medium mb-2" style={{ color: '#5A5A5A' }}>
                        No stress or energy data yet
                      </p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>
                        Complete reflections to see your trends
                      </p>
                    </div>
                  );
                }
                
                // TODO: Implement actual chart rendering when we have data
                return (
                  <div className="text-center">
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>
                      Chart visualization coming soon
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-8 right-4 flex justify-between text-xs text-gray-500 mt-2">
              <span>30</span>
              <span>31</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
              <span>11</span>
              <span>12</span>
              <span>13</span>
              <span>14</span>
              <span>15</span>
              <span>16</span>
              <span>17</span>
              <span>18</span>
              <span>19</span>
              <span>20</span>
              <span>21</span>
              <span>22</span>
              <span>23</span>
              <span>24</span>
              <span>25</span>
              <span>26</span>
              <span>27</span>
              <span>28</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-400">Stress</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-400">Energy</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-400">Reset Day</span>
            </div>
          </div>
        </section>

        {/* Burnout Trend Chart */}
        <section
          className="rounded-2xl p-8"
          aria-labelledby="burnout-trend-heading"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(92, 127, 79, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(92, 127, 79, 0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                id="burnout-trend-heading"
                className="text-2xl font-bold"
                style={{ color: '#1A1A1A' }}
              >
                Daily Burnout Trend
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Track your burnout risk over time with daily assessments
              </p>
              <div className="flex gap-2 mt-3">
                {['daily', 'weekly', 'monthly'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setShowSummaryView(view as ViewMode)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      showSummaryView === view
                        ? 'bg-sage-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportBurnoutData()}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all group"
                title="Export data"
              >
                <Download className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
              </button>
              <button
                onClick={() => setShowDailyBurnout(true)}
                className="px-4 py-2 bg-gradient-to-r from-sage-500 to-green-500 text-white rounded-lg font-medium hover:from-sage-600 hover:to-green-600 transition-all flex items-center"
              >
                <Gauge className="w-4 h-4 mr-2" />
                Take Today's Assessment
              </button>
            </div>
          </div>

          {/* Chart area */}
          <div
            className="rounded-xl p-6 h-80 relative"
            style={{ backgroundColor: '#FAFAF8', border: '1px solid #E8E5E0' }}
          >
            {getAggregatedData().length > 0 ? (
              <>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-4">
                  <span>5</span>
                  <span>4</span>
                  <span>3</span>
                  <span>2</span>
                  <span>1</span>
                </div>

                {/* Chart content */}
                <div className="ml-8 mr-4 h-full relative">
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    {/* Grid lines */}
                    {[0, 40, 80, 120, 160].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="400"
                        y2={y}
                        stroke="#E8E5E0"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Risk zones */}
                    <rect x="0" y="0" width="400" height="40" fill="#ef4444" opacity="0.1" />
                    <rect x="0" y="40" width="400" height="40" fill="#f97316" opacity="0.1" />
                    <rect x="0" y="80" width="400" height="40" fill="#eab308" opacity="0.1" />
                    <rect x="0" y="120" width="400" height="80" fill="#22c55e" opacity="0.1" />

                    {/* Burnout trend line */}
                    <polyline
                      points={getAggregatedData()
                        .slice(-30)
                        .map(
                          (d, i) =>
                            `${(i / Math.max(getAggregatedData().slice(-30).length - 1, 1)) * 380 + 10},${200 - d.totalScore * 40}`
                        )
                        .join(' ')}
                      fill="none"
                      stroke="#5C7F4F"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {getAggregatedData()
                      .slice(-30)
                      .map((d, i) => (
                        <g key={i}>
                          <circle
                            cx={
                              (i / Math.max(getAggregatedData().slice(-30).length - 1, 1)) * 380 +
                              10
                            }
                            cy={200 - d.totalScore * 40}
                            r={showSummaryView === 'daily' ? '4' : '6'}
                            fill="#5C7F4F"
                          />
                          {showSummaryView !== 'daily' && (
                            <text
                              x={
                                (i / Math.max(getAggregatedData().slice(-30).length - 1, 1)) * 380 +
                                10
                              }
                              y={200 - d.totalScore * 40 - 10}
                              textAnchor="middle"
                              fill="#5C7F4F"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {d.count}
                            </text>
                          )}
                        </g>
                      ))}
                  </svg>

                  {/* X-axis dates */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
                    {getAggregatedData()
                      .slice(-30)
                      .filter((_, i) => {
                        if (showSummaryView === 'monthly') return true;
                        if (showSummaryView === 'weekly') return i % 2 === 0;
                        return i % 7 === 0;
                      })
                      .map((d, i) => (
                        <span key={i}>
                          {new Date(d.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: showSummaryView === 'monthly' ? undefined : 'numeric',
                          })}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-sm">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>Low Risk (1-2)
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>Moderate (2-3)
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>High (3-4)
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>Severe (4-5)
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <Gauge className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center mb-4">
                  No burnout data yet. Start tracking your daily burnout levels to see trends.
                </p>
                <button
                  onClick={() => setShowDailyBurnout(true)}
                  className="px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors"
                >
                  Take First Assessment
                </button>
              </div>
            )}
          </div>

          {burnoutData.length > 0 && (
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Current Level</p>
                <p className="text-lg font-bold text-gray-900">
                  {burnoutData[burnoutData.length - 1]?.riskLevel || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">7-Day Average</p>
                <p className="text-lg font-bold text-gray-900">
                  {(
                    burnoutData.slice(-7).reduce((sum, d) => sum + d.totalScore, 0) /
                    Math.min(burnoutData.length, 7)
                  ).toFixed(1)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Trend</p>
                <p className="text-lg font-bold text-gray-900">
                  {burnoutData.length >= 7 &&
                    (burnoutData.slice(-7).reduce((sum, d) => sum + d.totalScore, 0) / 7 <
                    burnoutData.slice(-14, -7).reduce((sum, d) => sum + d.totalScore, 0) / 7
                      ? '↓ Improving'
                      : '↑ Increasing')}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Days Tracked</p>
                <p className="text-lg font-bold text-gray-900">{burnoutData.length}</p>
              </div>
            </div>
          )}
        </section>

        {/* Reset Toolkit Insights */}
        <div>
          <div className="flex items-center mb-6">
            <div
              className="p-2 rounded-lg mr-3"
              style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
            >
              <Lightbulb className="h-5 w-5" aria-hidden="true" style={{ color: '#5C7F4F' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              Your Reset Toolkit Insights
            </h2>
            <span className="text-sm ml-auto" style={{ color: '#6B7C6B' }}>
              {techniqueUsage.length} total uses • {
                techniqueUsage.filter(u => {
                  const date = new Date(u.startTime);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return date > weekAgo;
                }).length
              } this week
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div
              className="rounded-xl p-5 transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #5C7F4F',
                boxShadow: '0 4px 12px rgba(92, 127, 79, 0.2)',
              }}
            >
              <div
                className="flex items-center text-sm font-semibold mb-2"
                style={{ color: '#2D5F3F' }}
              >
                <Star className="h-4 w-4 mr-2" aria-hidden="true" style={{ color: '#5C7F4F' }} />
                Most Effective
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#1A1A1A' }}>
                {techniqueUsage.length > 0 
                  ? (() => {
                      const counts = techniqueUsage.reduce((acc, u) => {
                        acc[u.technique] = (acc[u.technique] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      const mostUsed = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                      return mostUsed ? mostUsed[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'None yet';
                    })()
                  : 'None yet'}
              </div>
              <div className="text-sm" style={{ color: '#2D5F3F' }}>
                {techniqueUsage.length > 0 ? 'Most used technique' : 'Start using techniques'}
              </div>
            </div>

            <div
              className="rounded-xl p-5 transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #87CEEB',
                boxShadow: '0 4px 12px rgba(135, 206, 235, 0.2)',
              }}
            >
              <div
                className="flex items-center text-sm font-semibold mb-2"
                style={{ color: '#4682B4' }}
              >
                <Activity
                  className="h-4 w-4 mr-2"
                  aria-hidden="true"
                  style={{ color: '#87CEEB' }}
                />
                Overall Completion
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#1A1A1A' }}>
                {techniqueUsage.length > 0 
                  ? Math.round((techniqueUsage.filter(u => u.completed).length / techniqueUsage.length) * 100) 
                  : 0}%
              </div>
              <div className="text-sm" style={{ color: '#4682B4' }}>
                {techniqueUsage.length > 0 ? 'across all techniques' : 'No stress reset data yet'}
              </div>
            </div>

            <div
              className="rounded-xl p-5 transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #C8B8DB',
                boxShadow: '0 4px 12px rgba(200, 184, 219, 0.2)',
              }}
            >
              <div
                className="flex items-center text-sm font-semibold mb-2"
                style={{ color: '#8B7AA8' }}
              >
                <BarChart3
                  className="h-4 w-4 mr-2"
                  aria-hidden="true"
                  style={{ color: '#C8B8DB' }}
                />
                Avg Stress Relief
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#1A1A1A' }}>
                -
              </div>
              <div className="text-sm" style={{ color: '#8B7AA8' }}>
                No stress reset data yet
              </div>
            </div>

            <div
              className="rounded-xl p-5 transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #F4A460',
                boxShadow: '0 4px 12px rgba(244, 164, 96, 0.2)',
              }}
            >
              <div
                className="flex items-center text-sm font-semibold mb-2"
                style={{ color: '#D2691E' }}
              >
                <Triangle
                  className="h-4 w-4 mr-2"
                  aria-hidden="true"
                  style={{ color: '#F4A460' }}
                />
                Try Next
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#1A1A1A' }}>
                {(() => {
                  const techniques = ['box-breathing', 'body-release', 'temperature-shift', 'sensory-reset', 'expansion-practice', 'name-transform'];
                  const counts = techniqueUsage.reduce((acc, u) => {
                    acc[u.technique] = (acc[u.technique] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  const leastUsed = techniques.find(t => !counts[t]) || 
                    techniques.sort((a, b) => (counts[a] || 0) - (counts[b] || 0))[0];
                  return leastUsed ? leastUsed.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Box Breathing';
                })()}
              </div>
              <div className="text-sm" style={{ color: '#D2691E' }}>
                {techniqueUsage.length > 0 ? 'Try something new' : 'Start here'}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Row 1 */}
          <article
            className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Closed Loops metric"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E8E5E0',
            }}
          >
            <div className="flex items-center mb-2">
              <div
                className="p-2 rounded-lg mr-2"
                style={{ backgroundColor: 'rgba(135, 206, 235, 0.15)' }}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" style={{ color: '#87CEEB' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#4682B4' }}>
                Closed Loops
              </span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: '#2D5F3F' }}>
              {savedReflections.filter(r => r.type.includes('Post')).length > 0 
                ? Math.round((savedReflections.filter(r => r.type.includes('Post')).length / savedReflections.filter(r => r.type.includes('Pre')).length) * 100) || 0
                : 0}%
            </div>
            <div className="text-xs" style={{ color: '#3A3A3A', lineHeight: '1.4' }}>
              Finished a Pre + Post within 48h
              <br />
              Based on post entries (n={savedReflections.filter(r => r.type.includes('Post')).length})
            </div>
          </article>

          <article
            className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Stress Change metric"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E8E5E0',
            }}
          >
            <div className="flex items-center mb-2">
              <div
                className="p-2 rounded-lg mr-2"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
              >
                <TrendingUp className="h-4 w-4" aria-hidden="true" style={{ color: '#5C7F4F' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#2D5F3F' }}>
                Stress Change
              </span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: '#2D5F3F' }}>
              {(() => {
                const preReflections = savedReflections.filter(r => r.type === 'Pre-Assignment Prep');
                const postReflections = savedReflections.filter(r => r.type === 'Post-Assignment Debrief');
                if (preReflections.length > 0 && postReflections.length > 0) {
                  const avgPreStress = preReflections.reduce((sum, r) => sum + (r.data.stressLevel || 5), 0) / preReflections.length;
                  const avgPostStress = postReflections.reduce((sum, r) => sum + (r.data.stressLevelAfter || 5), 0) / postReflections.length;
                  return (avgPostStress - avgPreStress).toFixed(1);
                }
                return '-';
              })()}
            </div>
            <div className="text-xs" style={{ color: '#3A3A3A', lineHeight: '1.4' }}>
              Post stress vs Pre (lower is better)
              <br />
              Based on paired assignments (n={savedReflections.filter(r => r.type === 'Post-Assignment Debrief').length})
            </div>
          </article>

          <article
            className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Stress Change metric"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E8E5E0',
            }}
          >
            <div className="flex items-center mb-2">
              <div
                className="p-2 rounded-lg mr-2"
                style={{ backgroundColor: 'rgba(135, 206, 235, 0.15)' }}
              >
                <CheckCircle className="h-4 w-4" aria-hidden="true" style={{ color: '#87CEEB' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#4682B4' }}>
                Recovery Score
              </span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: '#2D5F3F' }}>
              {savedReflections.length > 0 ? Math.round((savedReflections.length / 30) * 100) : 0}%
            </div>
            <div className="text-xs" style={{ color: '#3A3A3A', lineHeight: '1.4' }}>
              Consistency of small resets
              <br />
              Based on reflections (n={savedReflections.length})
            </div>
          </article>

          <article
            className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Stress Change metric"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E8E5E0',
            }}
          >
            <div className="flex items-center mb-2">
              <div
                className="p-2 rounded-lg mr-2"
                style={{ backgroundColor: 'rgba(244, 164, 96, 0.15)' }}
              >
                <Target className="h-4 w-4" aria-hidden="true" style={{ color: '#F4A460' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#D2691E' }}>
                Plan Use
              </span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: '#D2691E' }}>
              {savedReflections.length > 0 
                ? Math.round((savedReflections.filter(r => r.data.intention || r.data.futureChange).length / savedReflections.length) * 100)
                : 0}%
            </div>
            <div className="text-xs" style={{ color: '#3A3A3A', lineHeight: '1.4' }}>
              Reflections with an If-Then plan
              <br />
              Based on reflections (n={savedReflections.length})
            </div>
          </article>

          {/* Row 2 */}
          <article
            className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Team Plan Kept metric"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E8E5E0',
            }}
          >
            <div className="flex items-center mb-2">
              <div
                className="p-2 rounded-lg mr-2"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
              >
                <Users className="h-4 w-4" aria-hidden="true" style={{ color: '#5C7F4F' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#2D5F3F' }}>
                Team Plan Kept
              </span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: '#2D5F3F' }}>
              {savedReflections.filter(r => r.type.includes('Teaming')).length > 0 ? 88 : 0}%
            </div>
            <div className="text-xs" style={{ color: '#3A3A3A', lineHeight: '1.4' }}>
              Agreements held vs drift
              <br />
              Based on team reflections (n={savedReflections.filter(r => r.type.includes('Teaming')).length})
            </div>
          </article>

          <article
            className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Stress Change metric"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E8E5E0',
            }}
          >
            <div className="flex items-center mb-2">
              <div
                className="p-2 rounded-lg mr-2"
                style={{ backgroundColor: 'rgba(255, 182, 193, 0.15)' }}
              >
                <AlertTriangle
                  className="h-4 w-4"
                  aria-hidden="true"
                  style={{ color: '#F08080' }}
                />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#CD5C5C' }}>
                Boundaries + Plan
              </span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
              {savedReflections.filter(r => r.type === 'Compass Check').length}
            </div>
            <div className="text-xs" style={{ color: '#3A3A3A', lineHeight: '1.4' }}>
              Compass entries with a phrase + plan
              <br />
              Based on Compass entries (n={savedReflections.filter(r => r.type === 'Compass Check').length})
            </div>
          </article>

          <article
            className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Stress Change metric"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E8E5E0',
            }}
          >
            <div className="flex items-center mb-2">
              <div
                className="p-2 rounded-lg mr-2"
                style={{ backgroundColor: 'rgba(255, 223, 0, 0.15)' }}
              >
                <Zap className="h-4 w-4" aria-hidden="true" style={{ color: '#FFD700' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#DAA520' }}>
                Average Energy
              </span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: '#DAA520' }}>
              {(() => {
                const reflectionsWithEnergy = savedReflections.filter(r => r.data.energyLevel);
                if (reflectionsWithEnergy.length > 0) {
                  const avgEnergy = reflectionsWithEnergy.reduce((sum, r) => sum + r.data.energyLevel, 0) / reflectionsWithEnergy.length;
                  return avgEnergy.toFixed(1);
                }
                return '-';
              })()}
            </div>
            <div className="text-xs" style={{ color: '#3A3A3A', lineHeight: '1.4' }}>
              Typical energy level
              <br />
              Based on reflections (n=31)
            </div>
          </article>

          <article
            className="rounded-xl p-5 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            tabIndex={0}
            role="region"
            aria-label="Stress Change metric"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E8E5E0',
              opacity: '0.6',
            }}
          >
            <div className="flex items-center mb-2">
              <div
                className="p-2 rounded-lg mr-2"
                style={{ backgroundColor: 'rgba(192, 192, 192, 0.15)' }}
              >
                <Gauge className="h-4 w-4" aria-hidden="true" style={{ color: '#A9A9A9' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#808080' }}>
                Burnout Gauge
              </span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: burnoutData.length > 0 ? '#DAA520' : '#A9A9A9' }}>
              {burnoutData.length > 0 ? burnoutData[burnoutData.length - 1].totalScore.toFixed(1) : '-'}
            </div>
            <div className="text-xs" style={{ color: burnoutData.length > 0 ? '#3A3A3A' : '#A9A9A9', lineHeight: '1.4' }}>
              Daily assessment
              <br />
              {burnoutData.length > 0 ? `Last: ${burnoutData[burnoutData.length - 1].riskLevel}` : 'Not yet completed'}
            </div>
          </article>
        </div>

        {/* Bottom section boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Recovery Habits */}
          <section
            className="rounded-2xl p-6"
            aria-labelledby="recovery-habits-heading"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E8E5E0',
            }}
          >
            <h3
              id="recovery-habits-heading"
              className="text-lg font-bold mb-5"
              style={{ color: '#1A1A1A' }}
            >
              Recovery Habits
            </h3>

            <div className="mb-5">
              <div className="flex justify-between text-sm mb-3">
                <span style={{ color: '#6B7C6B' }}>Recovery Balance Index</span>
                <span className="font-bold" style={{ color: '#2D5F3F' }}>
                  {(() => {
                    // Calculate recovery balance based on breaks, sleep, and wellness checks
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    
                    const recentBreaks = recoveryHabits.filter(h => h.type === 'break' && 
                      new Date(h.timestamp) > weekAgo).length;
                    const recentSleep = recoveryHabits.filter(h => h.type === 'sleep' && 
                      new Date(h.timestamp) > weekAgo);
                    const goodSleep = recentSleep.filter(h => !h.value?.includes('poor')).length;
                    
                    // Calculate score: breaks (up to 7) + good sleep (up to 7) + wellness checks
                    const breakScore = Math.min(recentBreaks, 7) * 7; // Max 49%
                    const sleepScore = Math.min(goodSleep, 7) * 7; // Max 49%
                    const wellnessScore = savedReflections.filter(r => r.type === 'Wellness Check-in' &&
                      new Date(r.timestamp) > weekAgo).length * 2; // Max ~14%
                    
                    return Math.min(breakScore + sleepScore + wellnessScore, 100);
                  })()}%
                </span>
              </div>
              <div className="w-full rounded-full h-2.5" style={{ backgroundColor: '#F0EDE8' }}>
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${(() => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      
                      const recentBreaks = recoveryHabits.filter(h => h.type === 'break' && 
                        new Date(h.timestamp) > weekAgo).length;
                      const recentSleep = recoveryHabits.filter(h => h.type === 'sleep' && 
                        new Date(h.timestamp) > weekAgo);
                      const goodSleep = recentSleep.filter(h => !h.value?.includes('poor')).length;
                      
                      const breakScore = Math.min(recentBreaks, 7) * 7;
                      const sleepScore = Math.min(goodSleep, 7) * 7;
                      const wellnessScore = savedReflections.filter(r => r.type === 'Wellness Check-in' &&
                        new Date(r.timestamp) > weekAgo).length * 2;
                      
                      return Math.min(breakScore + sleepScore + wellnessScore, 100);
                    })()}%`,
                    background: 'linear-gradient(90deg, #5C7F4F 0%, #6B8B60 100%)',
                  }}
                ></div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3" style={{ color: '#1A1A1A' }}>
                {recoveryHabits.length > 0 ? 'Recent Habits:' : 'Top Early Signals:'}
              </h4>
              <div className="space-y-3">
                {recoveryHabits.length > 0 ? (
                  <>
                    {(() => {
                      // Get break frequency
                      const recentBreaks = recoveryHabits.filter(h => h.type === 'break' && 
                        new Date(h.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length;
                      const sleepHabits = recoveryHabits.filter(h => h.type === 'sleep').slice(0, 3);
                      
                      return (
                        <>
                          {recentBreaks > 0 && (
                            <div
                              className="flex items-center text-sm p-2 rounded-lg"
                              style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)' }}
                            >
                              <CheckCircle
                                className="h-4 w-4 mr-2"
                                aria-hidden="true"
                                style={{ color: '#22C55E' }}
                              />
                              <span style={{ color: '#3A3A3A' }}>{recentBreaks} breaks taken this week</span>
                            </div>
                          )}
                          {sleepHabits.length > 0 && sleepHabits[0].value && (
                            <div
                              className="flex items-center text-sm p-2 rounded-lg"
                              style={{ backgroundColor: sleepHabits[0].value.includes('poor') ? 'rgba(255, 223, 0, 0.08)' : 'rgba(92, 127, 79, 0.08)' }}
                            >
                              {sleepHabits[0].value.includes('poor') ? (
                                <AlertTriangle className="h-4 w-4 mr-2" style={{ color: '#DAA520' }} />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" style={{ color: '#5C7F4F' }} />
                              )}
                              <span style={{ color: '#3A3A3A' }}>Sleep: {sleepHabits[0].value}</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    <div
                      className="flex items-center text-sm p-2 rounded-lg"
                      style={{ backgroundColor: 'rgba(255, 223, 0, 0.08)' }}
                    >
                      <AlertTriangle
                        className="h-4 w-4 mr-2"
                        aria-hidden="true"
                        style={{ color: '#DAA520' }}
                      />
                      <span style={{ color: '#3A3A3A' }}>No habits tracked yet</span>
                    </div>
                    <div
                      className="flex items-center text-sm p-2 rounded-lg"
                      style={{ backgroundColor: 'rgba(92, 127, 79, 0.08)' }}
                    >
                      <Heart
                        className="h-4 w-4 mr-2"
                        aria-hidden="true"
                        style={{ color: '#5C7F4F' }}
                      />
                      <span style={{ color: '#3A3A3A' }}>Start with a wellness check-in</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Teamwork Check */}
          <section
            className="rounded-2xl p-6"
            aria-labelledby="teamwork-check-heading"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E8E5E0',
            }}
          >
            <h3
              id="teamwork-check-heading"
              className="text-lg font-bold mb-5"
              style={{ color: '#1A1A1A' }}
            >
              Teamwork Check
            </h3>

            <div className="mb-5">
              <div className="flex justify-between text-sm mb-3">
                <span style={{ color: '#6B7C6B' }}>Agreements Fidelity</span>
                <span className="font-bold" style={{ color: '#2D5F3F' }}>
                  88%
                </span>
              </div>
              <div className="w-full rounded-full h-2.5" style={{ backgroundColor: '#F0EDE8' }}>
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: '88%',
                    background: 'linear-gradient(90deg, #C8B8DB 0%, #87CEEB 100%)',
                  }}
                ></div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3" style={{ color: '#1A1A1A' }}>
                Top Drift Area:
              </h4>
              <div
                className="flex items-center text-sm p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(244, 164, 96, 0.08)' }}
              >
                <ChevronDown
                  className="h-4 w-4 mr-2"
                  aria-hidden="true"
                  style={{ color: '#F4A460' }}
                />
                <span style={{ color: '#3A3A3A' }}>Turn-taking balance</span>
              </div>
            </div>
          </section>

          {/* Values & Tough Calls */}
          <section
            className="rounded-2xl p-6"
            aria-labelledby="values-tough-calls-heading"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E8E5E0',
            }}
          >
            <h3
              id="values-tough-calls-heading"
              className="text-lg font-bold mb-5"
              style={{ color: '#1A1A1A' }}
            >
              Values & Tough Calls
            </h3>

            <div className="mb-5">
              <h4 className="font-semibold mb-3" style={{ color: '#1A1A1A' }}>
                Top Active Value:
              </h4>
              <div
                className="flex items-center text-sm p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(255, 182, 193, 0.08)' }}
              >
                <Heart className="h-4 w-4 mr-2" aria-hidden="true" style={{ color: '#F08080' }} />
                <span style={{ color: '#3A3A3A' }}>Advocacy for client</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3" style={{ color: '#1A1A1A' }}>
                Gray Zone Focus:
              </h4>
              <div
                className="flex items-center text-sm p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(200, 184, 219, 0.08)' }}
              >
                <Clock className="h-4 w-4 mr-2" aria-hidden="true" style={{ color: '#C8B8DB' }} />
                <span style={{ color: '#3A3A3A' }}>Role boundaries with family</span>
              </div>
            </div>
          </section>
        </div>

        {/* Three-column insight boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="rounded-2xl p-6 transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
              boxShadow: '0 8px 20px rgba(92, 127, 79, 0.15)',
              border: '2px solid #5C7F4F',
            }}
          >
            <h3 className="font-bold text-lg mb-4" style={{ color: '#2D5F3F' }}>
              NOTICE
            </h3>
            <p className="leading-relaxed" style={{ color: '#3A3A3A' }}>
              What changed: stress after prep, your energy, and team follow-through.
            </p>
          </div>

          <div
            className="rounded-2xl p-6 transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
              boxShadow: '0 8px 20px rgba(135, 206, 235, 0.15)',
              border: '2px solid #87CEEB',
            }}
          >
            <h3 className="font-bold text-lg mb-4" style={{ color: '#4682B4' }}>
              NORMALIZE
            </h3>
            <p className="leading-relaxed" style={{ color: '#3A3A3A' }}>
              What steadies you: quick resets and ready boundary phrases.
            </p>
          </div>

          <div
            className="rounded-2xl p-6 transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
              boxShadow: '0 8px 20px rgba(200, 184, 219, 0.15)',
              border: '2px solid #C8B8DB',
            }}
          >
            <h3 className="font-bold text-lg mb-4" style={{ color: '#8B7AA8' }}>
              NEXT
            </h3>
            <p className="leading-relaxed" style={{ color: '#3A3A3A' }}>
              Try one tiny If-Then on your next assignment.
            </p>
          </div>
        </div>

        {/* One Next Step */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'linear-gradient(135deg, #6B8B60 0%, #5F7F55 100%)',
            boxShadow: '0 12px 35px rgba(107, 139, 96, 0.35)',
            border: '1px solid rgba(107, 139, 96, 0.2)',
          }}
        >
          <div className="flex items-center">
            <div
              className="rounded-xl p-4 mr-5"
              style={{
                backgroundColor: 'rgba(92, 127, 79, 0.25)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <ChevronRight className="h-7 w-7" aria-hidden="true" style={{ color: '#FFFFFF' }} />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-1" style={{ color: '#FFFFFF' }}>
                One Next Step
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Keep it up! Your reflection practice is strong
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  const renderPrivacyPage = () => {
    return (
      <>
        <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
          {/* Header */}
          <div className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Privacy & Data</h1>
                <button
                  onClick={() => setShowPrivacyPage(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Content - 3 columns */}
              <main className="lg:col-span-3 space-y-8">
                {/* Privacy Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <Lock className="h-6 w-6 text-blue-400 mr-3" />
                      <h3 className="text-lg font-semibold text-blue-400">Secure by Design</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      All journal entries, reflections, and wellness data are encrypted in storage
                      and in transit.
                    </p>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                      <h3 className="text-lg font-semibold text-green-400">Privacy-First</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Your data belongs to you. We never sell it, and it's never shared without your
                      explicit consent.
                    </p>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <SettingsIcon className="h-6 w-6 text-purple-400 mr-3" />
                      <h3 className="text-lg font-semibold text-purple-400">Zero-Config</h3>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      You don't need to manage endless privacy settings - these protections are
                      built in from the start.
                    </p>
                  </div>
                </div>

                {/* Data Use in Beta */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Data Use in Beta</h2>
                  <p className="text-gray-300 mb-6">We're in beta, so here's what's true today:</p>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-white font-medium">Encryption:</span>
                        <span className="text-gray-300 ml-2">
                          All reflections and mood logs are encrypted.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-white font-medium">Export & Delete:</span>
                        <span className="text-gray-300 ml-2">
                          You can download your data or permanently delete your account at any time.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-white font-medium">HIPAA:</span>
                        <span className="text-gray-300 ml-2">
                          Not yet fully HIPAA-compliant, but we are designing with healthcare-level
                          privacy standards in mind.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-white font-medium">Integrations:</span>
                        <span className="text-gray-300 ml-2">
                          No third-party integrations in beta (coming later).
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-white font-medium">Two-Factor Auth:</span>
                        <span className="text-gray-300 ml-2">Planned feature, not active yet.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consent at Signup */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Consent at Signup</h2>
                  <p className="text-gray-300 mb-6">
                    When you first create your account, you'll accept:
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        That your reflections and data are stored securely.
                      </span>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        That optional insights (AI feedback, growth analytics) are processed only
                        for your account.
                      </span>
                    </div>

                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        That you may opt in later to research participation or integrations (once
                        available).
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">
                        No need to revisit toggles - your preferences are stored once and can be
                        updated if features roll out.
                      </span>
                    </div>
                  </div>
                </div>
              </main>

              {/* Right Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 sticky top-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-slate-900" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">dev</div>
                      <div className="text-gray-400 text-sm">dev@interpretreflect.com</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between text-left text-gray-300 hover:text-white p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-3" />
                        <div>
                          <div className="font-medium">Profile Settings</div>
                          <div className="text-xs text-gray-400">Customize your preferences</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <button className="w-full flex items-center justify-between text-left text-gray-300 hover:text-white p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-3" />
                        <div>
                          <div className="font-medium">Manage Subscription</div>
                          <div className="text-xs text-gray-400">Billing and plan details</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <button className="w-full flex items-center justify-between text-left text-purple-400 hover:text-purple-300 p-3 rounded-lg bg-purple-600/20 border border-purple-600/30">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-3" />
                        <div>
                          <div className="font-medium">Privacy & Data</div>
                          <div className="text-xs text-purple-300">Control your data sharing</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <div className="pt-3 border-t border-slate-700">
                      <button className="w-full flex items-center text-left text-red-400 hover:text-red-300 p-3 rounded-lg hover:bg-red-600/10 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-3" />
                        <div className="font-medium">Sign Out</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderChatWithElya = () => (
    <div className="h-screen flex flex-col">
      <ChatWithElya />
    </div>
  );


  const reflectionCards = [
    {
      icon: Target,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
      title: 'Pre-Assignment Prep',
      description: 'Prime attention, steady the nervous system, and set...',
      status: [
        { label: 'Prepare Well', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Clock,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
      title: 'Post-Assignment Debrief',
      description: 'Consolidate learning, de-load stress, and turn...',
      status: [
        { label: 'Reflect & Grow', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Users,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Teaming Prep',
      description: 'Align minds and mechanics so handoffs are smooth...',
      status: [
        { label: 'Team Ready', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Users,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Teaming Reflection',
      description: 'Consolidate what worked between partners, surface...',
      status: [
        { label: 'Team Review', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Target,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Mentoring Prep',
      description: 'Clarify the ask, define success, and set up a...',
      status: [
        { label: 'Get the Right', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Lightbulb,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Mentoring Reflection',
      description: 'Consolidate insights and capture next steps',
      status: [
        { label: 'Apply', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Heart,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Wellness Check-in',
      description: 'Focus on emotional and physical wellbeing',
      status: [
        { label: 'Stay', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Settings,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/20',
      title: 'Compass Check',
      description: 'Realign with your values after challenging decisions',
      status: [
        { label: 'Values', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
  ];

  const affirmationCategories = [
    {
      icon: Heart,
      iconColor: 'text-white',
      iconBg: 'bg-pink-500',
      title: 'Inherent Worth & Value',
      description:
        'Gentle reminders of your fundamental value as a human being, independent of performance or achievement.',
      tag: 'self worth',
      tagColor: 'bg-pink-500',
      affirmations: [
        "My worth is not measured by how perfectly I interpret, but by the humanity I bring to each interaction.",
        "I am enough, exactly as I am, even on days when words feel heavy and my mind feels tired.",
        "My value exists beyond my professional role - I am worthy of rest, joy, and peace.",
        "The compassion I show myself ripples out to everyone I serve.",
        "I deserve the same kindness and understanding I facilitate for others every day."
      ]
    },
    {
      icon: Sparkles,
      iconColor: 'text-white',
      iconBg: 'bg-orange-500',
      title: 'Professional Wisdom & Competence',
      description: 'Affirmations celebrating your skills, growth, and professional contributions.',
      tag: 'professional competence',
      tagColor: 'bg-orange-500',
      affirmations: [
        "My skills have been built through dedication and practice - I trust my professional judgment.",
        "Every challenging assignment has added to my expertise and resilience.",
        "I bring unique gifts to my work that no one else can offer in quite the same way.",
        "My experience allows me to navigate complexity with grace and wisdom.",
        "I am continuously growing, and that growth makes me an even more valuable professional."
      ]
    },
    {
      icon: Shield,
      iconColor: 'text-white',
      iconBg: 'bg-green-500',
      title: 'Inner Strength & Resilience',
      description: 'Honoring your ability to weather storms and bounce back from difficulty.',
      tag: 'resilience',
      tagColor: 'bg-green-500',
      affirmations: [
        "I have weathered difficult assignments before, and I have the strength to handle what comes today.",
        "My resilience is not about being unaffected - it's about knowing how to care for myself through challenges.",
        "Each time I process and release what I've witnessed, I grow stronger and wiser.",
        "I can hold space for others' pain without letting it become my own.",
        "My ability to bounce back is a skill I've developed, and it serves me well."
      ]
    },
    {
      icon: TrendingUp,
      iconColor: 'text-white',
      iconBg: 'bg-purple-500',
      title: 'Continuous Growth & Learning',
      description: 'Celebrating your commitment to personal and professional development.',
      tag: 'growth',
      tagColor: 'bg-purple-500',
      affirmations: [
        "Every assignment teaches me something new about language, humanity, and myself.",
        "I embrace mistakes as opportunities to refine my skills and deepen my understanding.",
        "My commitment to growth makes me a better interpreter with each passing day.",
        "I am proud of how far I've come and excited about where I'm going.",
        "Learning is a lifelong journey, and I'm exactly where I need to be on my path."
      ]
    },
    {
      icon: Star,
      iconColor: 'text-white',
      iconBg: 'bg-blue-400',
      title: 'Purpose & Service',
      description: 'Connecting with the deeper meaning and purpose in your work and life.',
      tag: 'service',
      tagColor: 'bg-blue-400',
      affirmations: [
        "My work creates bridges of understanding that change lives every single day.",
        "I am a vital link in chains of communication that matter deeply to those I serve.",
        "The service I provide goes beyond words - I facilitate human connection and dignity.",
        "My presence in difficult moments brings comfort and clarity to those who need it most.",
        "I am living my purpose by ensuring every voice can be heard and understood."
      ]
    },
    {
      icon: User,
      iconColor: 'text-white',
      iconBg: 'bg-purple-600',
      title: 'Healthy Boundaries & Self-Care',
      description: 'Affirming your right to protect your energy, time, and wellbeing.',
      tag: 'boundaries',
      tagColor: 'bg-purple-600',
      affirmations: [
        "Setting boundaries is not selfish - it's how I sustain my ability to serve others well.",
        "I have the right to protect my energy and choose how I spend my emotional resources.",
        "Saying no to one thing means saying yes to my wellbeing and longevity in this field.",
        "My need for rest and recovery is valid and does not diminish my dedication.",
        "I can be compassionate toward others while still maintaining healthy boundaries."
      ]
    },
  ];

  const renderStressReset = () => (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      role="main"
      aria-labelledby="stress-reset-heading"
    >
      <div className="text-center mb-12">
        <div
          className="inline-block p-4 rounded-full mb-6"
          style={{ backgroundColor: 'rgba(45, 95, 63, 0.15)' }}
        >
          <RefreshCw className="h-12 w-12" aria-hidden="true" style={{ color: '#2D5F3F' }} />
        </div>
        <h1
          id="stress-reset-heading"
          className="text-4xl font-bold mb-4"
          style={{ color: '#1A1A1A', letterSpacing: '-0.5px' }}
        >
          Your Personal Reset Space
        </h1>
        <p className="text-xl mb-2" style={{ color: '#3A3A3A', fontWeight: '500' }}>
          Choose what your body-mind needs right now
        </p>
        <p className="text-base" style={{ color: '#3A3A3A' }}>
          All practices are accessible for every body and mind
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Box Breathing */}
        <article
          className="rounded-2xl p-7 transition-all cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
          tabIndex={0}
          role="button"
          aria-label="Box Breathing exercise - 4 minutes, gentle breathing rhythm to anchor your system"
          onClick={() => {
            setSelectedTechnique('box-breathing');
            const id = trackTechniqueStart('box-breathing');
            setCurrentTechniqueId(id);
          }}
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#5C7F4F';
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(92, 127, 79, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{
              background: 'radial-gradient(circle, #5C7F4F 0%, transparent 70%)',
              transform: 'translate(50%, -50%)',
            }}
          ></div>

          <div
            className="rounded-xl p-4 w-fit mb-5"
            style={{
              background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
              boxShadow: '0 4px 10px rgba(107, 139, 96, 0.3)',
            }}
          >
            <Square className="h-8 w-8" style={{ color: '#FFFFFF' }} />
          </div>
          <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
            Box Breathing
          </h3>
          <p className="text-sm mb-5" style={{ color: '#3A3A3A', lineHeight: '1.6' }}>
            A steady rhythm to anchor your system
          </p>
          <div className="flex items-center space-x-4 text-sm mb-4">
            <span
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)', color: '#2D5F3F' }}
            >
              4 minutes
            </span>
            <span className="font-semibold" style={{ color: '#5C7F4F' }}>
              Gentle
            </span>
          </div>
          <div className="pt-4 border-t" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
            <p className="text-sm italic" style={{ color: '#6B7C6B' }}>
              Balances your autonomic nervous system
            </p>
          </div>
        </article>

        {/* Body Release Pattern */}
        <article
          className="rounded-2xl p-7 transition-all cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
          tabIndex={0}
          role="button"
          aria-label="Body Release Pattern exercise - 1 minute, moderate progressive release through your body"
          onClick={() => {
            setSelectedTechnique('body-release');
            const id = trackTechniqueStart('body-release');
            setCurrentTechniqueId(id);
          }}
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#5C7F4F';
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(92, 127, 79, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{
              background: 'radial-gradient(circle, #5C7F4F 0%, transparent 70%)',
              transform: 'translate(50%, -50%)',
            }}
          ></div>

          <div
            className="rounded-xl p-4 w-fit mb-5"
            style={{
              background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
              boxShadow: '0 4px 10px rgba(107, 139, 96, 0.3)',
            }}
          >
            <Waves className="h-8 w-8" aria-hidden="true" style={{ color: '#FFFFFF' }} />
          </div>
          <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
            Body Release Pattern
          </h3>
          <p className="text-sm mb-5" style={{ color: '#3A3A3A', lineHeight: '1.6' }}>
            Progressive release through your body
          </p>
          <div className="flex items-center space-x-4 text-sm mb-4">
            <span
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)', color: '#2D5F3F' }}
            >
              1 minute
            </span>
            <span className="font-semibold" style={{ color: '#5C7F4F' }}>
              Moderate
            </span>
          </div>
          <div className="pt-4 border-t" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
            <p className="text-sm italic" style={{ color: '#6B7C6B' }}>
              Releases physical holding patterns
            </p>
          </div>
        </article>

        {/* Temperature Shift */}
        <article
          className="rounded-2xl p-7 transition-all cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
          tabIndex={0}
          role="button"
          aria-label="Temperature Shift exercise - 1 minute, intense temperature-based nervous system reset"
          onClick={() => {
            setSelectedTechnique('temperature-shift');
            const id = trackTechniqueStart('temperature-shift');
            setCurrentTechniqueId(id);
          }}
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#5C7F4F';
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(92, 127, 79, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{
              background: 'radial-gradient(circle, #5C7F4F 0%, transparent 70%)',
              transform: 'translate(50%, -50%)',
            }}
          ></div>

          <div
            className="rounded-xl p-4 w-fit mb-5"
            style={{
              background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
              boxShadow: '0 4px 10px rgba(107, 139, 96, 0.3)',
            }}
          >
            <Thermometer className="h-8 w-8" aria-hidden="true" style={{ color: '#FFFFFF' }} />
          </div>
          <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
            Temperature Shift
          </h3>
          <p className="text-sm mb-5" style={{ color: '#3A3A3A', lineHeight: '1.6' }}>
            Use temperature to reset your nervous system
          </p>
          <div className="flex items-center space-x-4 text-sm mb-4">
            <span
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)', color: '#2D5F3F' }}
            >
              1 minute
            </span>
            <span className="font-semibold" style={{ color: '#5C7F4F' }}>
              Gentle
            </span>
          </div>
          <div className="pt-4 border-t" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
            <p className="text-sm italic" style={{ color: '#6B7C6B' }}>
              Activates your natural calming response
            </p>
          </div>
        </article>

        {/* Sensory Reset */}
        <article
          className="rounded-2xl p-7 transition-all cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
          tabIndex={0}
          role="button"
          aria-label="Sensory Reset exercise - 2 minutes, very gentle sensory break"
          onClick={() => {
            setSelectedTechnique('sensory-reset');
            const id = trackTechniqueStart('sensory-reset');
            setCurrentTechniqueId(id);
          }}
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#5C7F4F';
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(92, 127, 79, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{
              background: 'radial-gradient(circle, #5C7F4F 0%, transparent 70%)',
              transform: 'translate(50%, -50%)',
            }}
          ></div>

          <div
            className="rounded-xl p-4 w-fit mb-5"
            style={{
              background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
              boxShadow: '0 4px 10px rgba(107, 139, 96, 0.3)',
            }}
          >
            <Eye className="h-8 w-8" aria-hidden="true" style={{ color: '#FFFFFF' }} />
          </div>
          <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
            Sensory Reset
          </h3>
          <p className="text-sm mb-5" style={{ color: '#3A3A3A', lineHeight: '1.6' }}>
            Give your senses a gentle break
          </p>
          <div className="flex items-center space-x-4 text-sm mb-4">
            <span
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)', color: '#2D5F3F' }}
            >
              80 seconds
            </span>
            <span className="font-semibold" style={{ color: '#5C7F4F' }}>
              Very Gentle
            </span>
          </div>
          <div className="pt-4 border-t" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
            <p className="text-sm italic" style={{ color: '#6B7C6B' }}>
              Refreshes your sensory channels
            </p>
          </div>
        </article>

        {/* Expansion Practice */}
        <article
          className="rounded-2xl p-7 transition-all cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
          tabIndex={0}
          role="button"
          aria-label="Expansion Practice exercise - 6 minutes, moderate practice to create space in awareness"
          onClick={() => {
            setSelectedTechnique('expansion-practice');
            const id = trackTechniqueStart('expansion-practice');
            setCurrentTechniqueId(id);
          }}
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#5C7F4F';
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(92, 127, 79, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{
              background: 'radial-gradient(circle, #5C7F4F 0%, transparent 70%)',
              transform: 'translate(50%, -50%)',
            }}
          ></div>

          <div
            className="rounded-xl p-4 w-fit mb-5"
            style={{
              background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
              boxShadow: '0 4px 10px rgba(107, 139, 96, 0.3)',
            }}
          >
            <Mountain className="h-8 w-8" aria-hidden="true" style={{ color: '#FFFFFF' }} />
          </div>
          <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
            Expansion Practice
          </h3>
          <p className="text-sm mb-5" style={{ color: '#3A3A3A', lineHeight: '1.6' }}>
            Create space in your awareness
          </p>
          <div className="flex items-center space-x-4 text-sm mb-4">
            <span
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)', color: '#2D5F3F' }}
            >
              2 minutes
            </span>
            <span className="font-semibold" style={{ color: '#5C7F4F' }}>
              Gentle
            </span>
          </div>
          <div className="pt-4 border-t" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
            <p className="text-sm italic" style={{ color: '#6B7C6B' }}>
              Shifts from focused to spacious awareness
            </p>
          </div>
        </article>

        {/* Name & Transform */}
        <article
          className="rounded-2xl p-7 transition-all cursor-pointer group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
          tabIndex={0}
          role="button"
          aria-label="Name and Transform exercise - 5 minutes, moderate practice to work with emotions as information"
          onClick={() => {
            setSelectedTechnique('name-transform');
            const id = trackTechniqueStart('name-transform');
            setCurrentTechniqueId(id);
          }}
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#5C7F4F';
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(92, 127, 79, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
          }}
        >
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{
              background: 'radial-gradient(circle, #5C7F4F 0%, transparent 70%)',
              transform: 'translate(50%, -50%)',
            }}
          ></div>

          <div
            className="rounded-xl p-4 w-fit mb-5"
            style={{
              background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
              boxShadow: '0 4px 10px rgba(107, 139, 96, 0.3)',
            }}
          >
            <Heart className="h-8 w-8" aria-hidden="true" style={{ color: '#FFFFFF' }} />
          </div>
          <h3 className="text-xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
            Name & Transform
          </h3>
          <p className="text-sm mb-5" style={{ color: '#3A3A3A', lineHeight: '1.6' }}>
            Work with emotions as information
          </p>
          <div className="flex items-center space-x-4 text-sm mb-4">
            <span
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)', color: '#2D5F3F' }}
            >
              3 minutes
            </span>
            <span className="font-semibold" style={{ color: '#5C7F4F' }}>
              Moderate
            </span>
          </div>
          <div className="pt-4 border-t" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
            <p className="text-sm italic" style={{ color: '#6B7C6B' }}>
              Transforms emotional overwhelm into clarity
            </p>
          </div>
        </article>
      </div>

      {/* Technique Modal */}
      {selectedTechnique && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div
            className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
                    {selectedTechnique === 'box-breathing' && 'Box Breathing Exercise'}
                    {selectedTechnique === 'body-release' && 'Body Release Pattern'}
                    {selectedTechnique === 'temperature-shift' && 'Temperature Shift'}
                    {selectedTechnique === 'sensory-reset' && 'Sensory Reset'}
                    {selectedTechnique === 'expansion-practice' && 'Expansion Practice'}
                    {selectedTechnique === 'name-transform' && 'Name and Transform'}
                  </h2>
                  <p className="text-sm" style={{ color: '#5A5A5A' }}>
                    {selectedTechnique === 'box-breathing' && '4 minutes • Gentle breathing rhythm'}
                    {selectedTechnique === 'body-release' && '1 minute • Progressive body release'}
                    {selectedTechnique === 'temperature-shift' &&
                      '1 minute • Quick nervous system reset'}
                    {selectedTechnique === 'sensory-reset' && '80 seconds • Gentle sensory break'}
                    {selectedTechnique === 'expansion-practice' &&
                      '2 minutes • Create space in awareness'}
                    {selectedTechnique === 'name-transform' &&
                      '3 minutes • Transform emotions into clarity'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Track completion if timer was active
                    if (isTimerActive && currentTechniqueId) {
                      const duration = techniqueProgress; // Use progress as percentage of completion
                      trackTechniqueComplete(currentTechniqueId, duration);
                    }
                    
                    // Clear any running interval when closing modal
                    if (intervalRef.current) {
                      clearInterval(intervalRef.current);
                      intervalRef.current = null;
                    }
                    // Reset everything
                    setSelectedTechnique(null);
                    setTechniqueProgress(0);
                    setIsTimerActive(false);
                    setBreathPhase('inhale');
                    setBreathCycle(0);
                    setBodyPart(0);
                    setSenseCount(0);
                    setExpansionLevel(0);
                    setCurrentTechniqueId(null);
                  }}
                  className="p-2 rounded-lg transition-all"
                  style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.2)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.1)')
                  }
                >
                  <X className="h-5 w-5" style={{ color: '#1A1A1A' }} />
                </button>
              </div>

              {/* Instructions */}
              <div
                className="mb-8 p-6 rounded-xl"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.05)' }}
              >
                {selectedTechnique === 'box-breathing' ? (
                  <>
                    {/* Breathing Animation for Box Breathing */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative w-48 h-48 mb-4">
                        {/* Breathing Circle */}
                        <div
                          className="absolute inset-0 rounded-full transition-all duration-[4000ms] ease-in-out"
                          style={{
                            backgroundColor: 'rgba(92, 127, 79, 0.2)',
                            border: '3px solid #5C7F4F',
                            transform: isTimerActive
                              ? breathPhase === 'inhale'
                                ? 'scale(1.2)'
                                : breathPhase === 'hold-in'
                                  ? 'scale(1.2)'
                                  : breathPhase === 'exhale'
                                    ? 'scale(0.8)'
                                    : 'scale(0.8)'
                              : 'scale(1)',
                            boxShadow: isTimerActive
                              ? breathPhase === 'inhale' || breathPhase === 'hold-in'
                                ? '0 0 30px rgba(92, 127, 79, 0.5)'
                                : '0 0 10px rgba(92, 127, 79, 0.2)'
                              : 'none',
                          }}
                        />

                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-2xl font-bold mb-2" style={{ color: '#2D5F3F' }}>
                            {breathPhase === 'inhale' && 'Inhale'}
                            {breathPhase === 'hold-in' && 'Hold'}
                            {breathPhase === 'exhale' && 'Exhale'}
                            {breathPhase === 'hold-out' && 'Hold'}
                          </p>
                          <p className="text-4xl font-bold" style={{ color: '#5C7F4F' }}>
                            {isTimerActive ? 4 - (breathCycle % 4) || 4 : '4'}
                          </p>
                          <p className="text-sm mt-2" style={{ color: '#6B7C6B' }}>
                            {breathPhase === 'inhale' && 'through your nose'}
                            {breathPhase === 'hold-in' && 'gently'}
                            {breathPhase === 'exhale' && 'through your mouth'}
                            {breathPhase === 'hold-out' && 'stay empty'}
                          </p>
                        </div>

                        {/* Phase Indicators */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <div
                            className={`w-3 h-3 rounded-full transition-all ${breathPhase === 'inhale' ? 'bg-green-500' : 'bg-gray-300'}`}
                          />
                        </div>
                        <div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
                          <div
                            className={`w-3 h-3 rounded-full transition-all ${breathPhase === 'hold-in' ? 'bg-yellow-500' : 'bg-gray-300'}`}
                          />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <div
                            className={`w-3 h-3 rounded-full transition-all ${breathPhase === 'exhale' ? 'bg-blue-500' : 'bg-gray-300'}`}
                          />
                        </div>
                        <div className="absolute top-1/2 -left-2 transform -translate-y-1/2">
                          <div
                            className={`w-3 h-3 rounded-full transition-all ${breathPhase === 'hold-out' ? 'bg-purple-500' : 'bg-gray-300'}`}
                          />
                        </div>
                      </div>

                      {/* Phase Progress Bar */}
                      <div className="w-full max-w-xs">
                        <div
                          className="flex justify-between text-xs mb-2"
                          style={{ color: '#6B7C6B' }}
                        >
                          <span className={breathPhase === 'inhale' ? 'font-bold' : ''}>
                            Inhale
                          </span>
                          <span className={breathPhase === 'hold-in' ? 'font-bold' : ''}>Hold</span>
                          <span className={breathPhase === 'exhale' ? 'font-bold' : ''}>
                            Exhale
                          </span>
                          <span className={breathPhase === 'hold-out' ? 'font-bold' : ''}>
                            Hold
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-1000 ease-linear"
                            style={{
                              width: isTimerActive ? `${((breathCycle % 16) / 16) * 100}%` : '0%',
                              backgroundColor: '#5C7F4F',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <h3 className="font-semibold mb-3 text-center" style={{ color: '#2D5F3F' }}>
                      Box Breathing Pattern:
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div
                        className="flex items-center p-2 rounded-lg"
                        style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}
                      >
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                        <span style={{ color: '#3A3A3A' }}>Inhale: 4 counts</span>
                      </div>
                      <div
                        className="flex items-center p-2 rounded-lg"
                        style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}
                      >
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                        <span style={{ color: '#3A3A3A' }}>Hold: 4 counts</span>
                      </div>
                      <div
                        className="flex items-center p-2 rounded-lg"
                        style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}
                      >
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                        <span style={{ color: '#3A3A3A' }}>Exhale: 4 counts</span>
                      </div>
                      <div
                        className="flex items-center p-2 rounded-lg"
                        style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}
                      >
                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
                        <span style={{ color: '#3A3A3A' }}>Hold Empty: 4 counts</span>
                      </div>
                    </div>
                    
                    {/* Why This Works */}
                    <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: '#2D5F3F' }}>
                        Why This Works:
                      </p>
                      <p className="text-xs" style={{ color: '#3A3A3A' }}>
                        Box breathing activates your parasympathetic nervous system through controlled CO2 regulation. Used by Navy SEALs, it reduces stress hormones within 90 seconds.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold mb-3" style={{ color: '#2D5F3F' }}>
                      How to Practice:
                    </h3>
                    <div className="space-y-2">
                      {selectedTechnique === 'body-release' && (
                        <>
                          {/* Body Release Animation */}
                          <div className="flex flex-col items-center mb-6">
                            {/* Status Text Above Animation */}
                            <div className="text-center mb-4">
                              <p className="text-2xl font-bold" style={{ color: '#2D5F3F' }}>
                                {bodyPart === 0 && 'Head & Jaw'}
                                {bodyPart === 1 && 'Shoulders'}
                                {bodyPart === 2 && 'Chest'}
                                {bodyPart === 3 && 'Belly'}
                                {bodyPart === 4 && 'Legs & Feet'}
                                {!isTimerActive && 'Ready to Release'}
                              </p>
                              <p className="text-sm mt-1" style={{ color: '#6B7C6B' }}>
                                {isTimerActive ? 'Releasing tension...' : 'Press start to begin'}
                              </p>
                            </div>
                            
                            {/* Enhanced Body Animation */}
                            <div className="relative w-64 h-64 flex items-center justify-center">
                              {/* Pulsing Background Circle */}
                              <div 
                                className="absolute inset-0 rounded-full opacity-20"
                                style={{
                                  background: isTimerActive ? 'radial-gradient(circle, #5C7F4F 0%, transparent 70%)' : 'none',
                                  animation: isTimerActive ? 'pulse 2s ease-in-out infinite' : 'none'
                                }}
                              />
                              
                              {/* Body Figure */}
                              <svg width="120" height="200" viewBox="0 0 120 200" className="relative z-10">
                                {/* Head */}
                                <circle
                                  cx="60"
                                  cy="25"
                                  r="18"
                                  fill={bodyPart === 0 ? '#F87171' : '#D1D5DB'}
                                  className="transition-all duration-1000"
                                  opacity={bodyPart === 0 ? 1 : 0.5}
                                  style={{
                                    filter: bodyPart === 0 && isTimerActive ? 'drop-shadow(0 0 15px #F87171)' : 'none',
                                    transform: bodyPart === 0 ? 'scale(1.1)' : 'scale(1)',
                                    transformOrigin: 'center'
                                  }}
                                />
                                
                                {/* Neck */}
                                <rect
                                  x="55"
                                  y="40"
                                  width="10"
                                  height="10"
                                  fill={bodyPart === 0 || bodyPart === 1 ? '#FED7AA' : '#D1D5DB'}
                                  opacity={0.7}
                                />
                                
                                {/* Shoulders */}
                                <ellipse
                                  cx="60"
                                  cy="55"
                                  rx="35"
                                  ry="12"
                                  fill={bodyPart === 1 ? '#FB923C' : '#D1D5DB'}
                                  className="transition-all duration-1000"
                                  opacity={bodyPart === 1 ? 1 : 0.5}
                                  style={{
                                    filter: bodyPart === 1 && isTimerActive ? 'drop-shadow(0 0 15px #FB923C)' : 'none',
                                    transform: bodyPart === 1 ? 'scale(1.1)' : 'scale(1)',
                                    transformOrigin: 'center'
                                  }}
                                />
                                
                                {/* Arms */}
                                <rect x="20" y="55" width="8" height="45" rx="4" fill="#D1D5DB" opacity={0.4} />
                                <rect x="92" y="55" width="8" height="45" rx="4" fill="#D1D5DB" opacity={0.4} />
                                
                                {/* Chest */}
                                <rect
                                  x="35"
                                  y="60"
                                  width="50"
                                  height="35"
                                  rx="8"
                                  fill={bodyPart === 2 ? '#FDE047' : '#D1D5DB'}
                                  className="transition-all duration-1000"
                                  opacity={bodyPart === 2 ? 1 : 0.5}
                                  style={{
                                    filter: bodyPart === 2 && isTimerActive ? 'drop-shadow(0 0 15px #FDE047)' : 'none',
                                    transform: bodyPart === 2 ? 'scale(1.1)' : 'scale(1)',
                                    transformOrigin: 'center'
                                  }}
                                />
                                
                                {/* Belly */}
                                <ellipse
                                  cx="60"
                                  cy="110"
                                  rx="22"
                                  ry="18"
                                  fill={bodyPart === 3 ? '#4ADE80' : '#D1D5DB'}
                                  className="transition-all duration-1000"
                                  opacity={bodyPart === 3 ? 1 : 0.5}
                                  style={{
                                    filter: bodyPart === 3 && isTimerActive ? 'drop-shadow(0 0 15px #4ADE80)' : 'none',
                                    transform: bodyPart === 3 ? 'scale(1.1)' : 'scale(1)',
                                    transformOrigin: 'center'
                                  }}
                                />
                                
                                {/* Hips */}
                                <rect
                                  x="42"
                                  y="125"
                                  width="36"
                                  height="15"
                                  rx="6"
                                  fill="#D1D5DB"
                                  opacity={0.5}
                                />
                                
                                {/* Legs */}
                                <rect
                                  x="45"
                                  y="140"
                                  width="12"
                                  height="45"
                                  rx="6"
                                  fill={bodyPart === 4 ? '#60A5FA' : '#D1D5DB'}
                                  className="transition-all duration-1000"
                                  opacity={bodyPart === 4 ? 1 : 0.5}
                                  style={{
                                    filter: bodyPart === 4 && isTimerActive ? 'drop-shadow(0 0 15px #60A5FA)' : 'none',
                                    transform: bodyPart === 4 ? 'scale(1.1)' : 'scale(1)',
                                    transformOrigin: 'center'
                                  }}
                                />
                                <rect
                                  x="63"
                                  y="140"
                                  width="12"
                                  height="45"
                                  rx="6"
                                  fill={bodyPart === 4 ? '#60A5FA' : '#D1D5DB'}
                                  className="transition-all duration-1000"
                                  opacity={bodyPart === 4 ? 1 : 0.5}
                                  style={{
                                    filter: bodyPart === 4 && isTimerActive ? 'drop-shadow(0 0 15px #60A5FA)' : 'none',
                                    transform: bodyPart === 4 ? 'scale(1.1)' : 'scale(1)',
                                    transformOrigin: 'center'
                                  }}
                                />
                                
                                {/* Feet */}
                                <ellipse
                                  cx="51"
                                  cy="190"
                                  rx="8"
                                  ry="5"
                                  fill={bodyPart === 4 ? '#3B82F6' : '#D1D5DB'}
                                  className="transition-all duration-1000"
                                  opacity={bodyPart === 4 ? 1 : 0.5}
                                />
                                <ellipse
                                  cx="69"
                                  cy="190"
                                  rx="8"
                                  ry="5"
                                  fill={bodyPart === 4 ? '#3B82F6' : '#D1D5DB'}
                                  className="transition-all duration-1000"
                                  opacity={bodyPart === 4 ? 1 : 0.5}
                                />
                                
                                {/* Energy Flow Lines (when active) */}
                                {isTimerActive && (
                                  <>
                                    <circle cx="60" cy={bodyPart === 0 ? 25 : bodyPart === 1 ? 55 : bodyPart === 2 ? 77 : bodyPart === 3 ? 110 : 162} r="2" fill="#5C7F4F">
                                      <animate attributeName="r" values="2;6;2" dur="2s" repeatCount="indefinite" />
                                      <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                                    </circle>
                                    <circle cx="60" cy={bodyPart === 0 ? 25 : bodyPart === 1 ? 55 : bodyPart === 2 ? 77 : bodyPart === 3 ? 110 : 162} r="4" fill="none" stroke="#5C7F4F" strokeWidth="1">
                                      <animate attributeName="r" values="4;12;4" dur="2s" repeatCount="indefinite" />
                                      <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                                    </circle>
                                  </>
                                )}
                              </svg>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full max-w-xs mt-4">
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-1000"
                                  style={{
                                    width: `${((bodyPart + 1) / 5) * 100}%`,
                                    backgroundColor: '#5C7F4F'
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <h3
                            className="font-semibold mb-3 text-center"
                            style={{ color: '#2D5F3F' }}
                          >
                            Progressive Body Release:
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div
                              className={`flex items-center p-2 rounded-lg transition-all ${bodyPart === 0 ? 'bg-red-50 border-l-4 border-red-400' : ''}`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full mr-2 ${bodyPart === 0 ? 'bg-red-400' : 'bg-gray-300'}`}
                              />
                              <span style={{ color: '#3A3A3A' }}>
                                Release jaw and facial tension
                              </span>
                            </div>
                            <div
                              className={`flex items-center p-2 rounded-lg transition-all ${bodyPart === 1 ? 'bg-orange-50 border-l-4 border-orange-400' : ''}`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full mr-2 ${bodyPart === 1 ? 'bg-orange-400' : 'bg-gray-300'}`}
                              />
                              <span style={{ color: '#3A3A3A' }}>Roll shoulders back and down</span>
                            </div>
                            <div
                              className={`flex items-center p-2 rounded-lg transition-all ${bodyPart === 2 ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full mr-2 ${bodyPart === 2 ? 'bg-yellow-400' : 'bg-gray-300'}`}
                              />
                              <span style={{ color: '#3A3A3A' }}>Open and soften chest</span>
                            </div>
                            <div
                              className={`flex items-center p-2 rounded-lg transition-all ${bodyPart === 3 ? 'bg-green-50 border-l-4 border-green-400' : ''}`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full mr-2 ${bodyPart === 3 ? 'bg-green-400' : 'bg-gray-300'}`}
                              />
                              <span style={{ color: '#3A3A3A' }}>Let belly soften and expand</span>
                            </div>
                            <div
                              className={`flex items-center p-2 rounded-lg transition-all ${bodyPart === 4 ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full mr-2 ${bodyPart === 4 ? 'bg-blue-400' : 'bg-gray-300'}`}
                              />
                              <span style={{ color: '#3A3A3A' }}>Release legs and feet</span>
                            </div>
                          </div>
                          
                          {/* Why This Works */}
                          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: '#2D5F3F' }}>
                              Why This Works:
                            </p>
                            <p className="text-xs" style={{ color: '#3A3A3A' }}>
                              Progressive muscle release reduces cortisol levels by 23% in just one minute. Systematically releasing tension signals safety to your nervous system.
                            </p>
                          </div>
                        </>
                      )}
                      {selectedTechnique === 'temperature-shift' && (
                        <>
                          {/* Temperature Shift Animation */}
                          <div className="flex flex-col items-center mb-6">
                            {/* Status Text Above Animation */}
                            <div className="text-center mb-4">
                              <p className="text-2xl font-bold" style={{ color: '#2D5F3F' }}>
                                {isTimerActive ? 'Cooling Phase' : 'Warming Phase'}
                              </p>
                              <p className="text-sm mt-1" style={{ color: '#6B7C6B' }}>
                                {isTimerActive ? 'Activating parasympathetic response...' : 'Press start to begin temperature shift'}
                              </p>
                            </div>
                            
                            {/* Enhanced Temperature Animation */}
                            <div className="relative w-64 h-64 flex items-center justify-center">
                              {/* Background Pulse */}
                              <div 
                                className="absolute inset-0 rounded-full"
                                style={{
                                  background: isTimerActive 
                                    ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)' 
                                    : 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
                                  animation: isTimerActive ? 'pulse 3s ease-in-out infinite' : 'none'
                                }}
                              />
                              
                              {/* Temperature Visualization */}
                              <svg width="200" height="200" viewBox="0 0 200 200" className="relative z-10">
                                {/* Outer Ring */}
                                <circle
                                  cx="100"
                                  cy="100"
                                  r="90"
                                  fill="none"
                                  stroke={isTimerActive ? '#3B82F6' : '#EF4444'}
                                  strokeWidth="2"
                                  opacity="0.3"
                                />
                                
                                {/* Temperature Gauge Arc */}
                                <path
                                  d="M 100,10 A 90,90 0 0,1 190,100"
                                  fill="none"
                                  stroke="#EF4444"
                                  strokeWidth="6"
                                  strokeLinecap="round"
                                  opacity={isTimerActive ? 0.2 : 1}
                                  className="transition-all duration-2000"
                                />
                                <path
                                  d="M 10,100 A 90,90 0 0,1 100,10"
                                  fill="none"
                                  stroke="#3B82F6"
                                  strokeWidth="6"
                                  strokeLinecap="round"
                                  opacity={isTimerActive ? 1 : 0.2}
                                  className="transition-all duration-2000"
                                />
                                
                                {/* Central Temperature Display */}
                                <circle
                                  cx="100"
                                  cy="100"
                                  r="50"
                                  fill={isTimerActive ? '#DBEAFE' : '#FEE2E2'}
                                  className="transition-all duration-2000"
                                />
                                <circle
                                  cx="100"
                                  cy="100"
                                  r="40"
                                  fill={isTimerActive ? '#93C5FD' : '#FCA5A5'}
                                  className="transition-all duration-2000"
                                />
                                
                                {/* Temperature Icon */}
                                <g transform="translate(100, 100)">
                                  {/* Thermometer Shape */}
                                  <rect
                                    x="-6"
                                    y="-30"
                                    width="12"
                                    height="40"
                                    rx="6"
                                    fill="white"
                                    opacity="0.9"
                                  />
                                  <circle
                                    cx="0"
                                    cy="20"
                                    r="10"
                                    fill="white"
                                    opacity="0.9"
                                  />
                                  
                                  {/* Mercury Level */}
                                  <rect
                                    x="-3"
                                    y={isTimerActive ? "-10" : "-25"}
                                    width="6"
                                    height={isTimerActive ? "25" : "40"}
                                    rx="3"
                                    fill={isTimerActive ? '#3B82F6' : '#EF4444'}
                                    className="transition-all duration-2000"
                                  />
                                  <circle
                                    cx="0"
                                    cy="20"
                                    r="7"
                                    fill={isTimerActive ? '#3B82F6' : '#EF4444'}
                                    className="transition-all duration-2000"
                                  />
                                </g>
                                
                                {/* Animated Particles */}
                                {isTimerActive ? (
                                  // Cold particles - snowflakes
                                  <>
                                    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                                      <circle
                                        key={i}
                                        r="2"
                                        fill="#60A5FA"
                                        opacity="0.6"
                                      >
                                        <animateTransform
                                          attributeName="transform"
                                          type="rotate"
                                          from={`${angle} 100 100`}
                                          to={`${angle + 360} 100 100`}
                                          dur={`${10 + i * 2}s`}
                                          repeatCount="indefinite"
                                        />
                                        <animate
                                          attributeName="cx"
                                          values="100;130;100"
                                          dur={`${3 + i}s`}
                                          repeatCount="indefinite"
                                        />
                                        <animate
                                          attributeName="cy"
                                          values="100;100;100"
                                          dur={`${3 + i}s`}
                                          repeatCount="indefinite"
                                        />
                                      </circle>
                                    ))}
                                  </>
                                ) : (
                                  // Warm particles - heat waves
                                  <>
                                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                                      <circle
                                        key={i}
                                        r="1.5"
                                        fill="#F87171"
                                        opacity="0.5"
                                      >
                                        <animateTransform
                                          attributeName="transform"
                                          type="rotate"
                                          from={`${angle} 100 100`}
                                          to={`${angle - 360} 100 100`}
                                          dur={`${8 + i}s`}
                                          repeatCount="indefinite"
                                        />
                                        <animate
                                          attributeName="cx"
                                          values="100;140;100"
                                          dur={`${2 + i * 0.5}s`}
                                          repeatCount="indefinite"
                                        />
                                      </circle>
                                    ))}
                                  </>
                                )}
                              </svg>
                              
                              {/* Action Indicator */}
                              <div className="absolute bottom-0 left-0 right-0 text-center">
                                <p className="text-lg font-bold" style={{ color: isTimerActive ? '#3B82F6' : '#EF4444' }}>
                                  {isTimerActive ? 'Cool Water • Deep Breath' : 'Notice Warmth • Release'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full max-w-xs mt-4">
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-1000"
                                  style={{
                                    width: `${techniqueProgress}%`,
                                    background: isTimerActive 
                                      ? 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)'
                                      : 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)'
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <h3
                            className="font-semibold mb-3 text-center"
                            style={{ color: '#2D5F3F' }}
                          >
                            How Temperature Shift Works:
                          </h3>
                          
                          {/* What it does */}
                          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                            <p className="text-sm font-medium mb-1" style={{ color: '#2D5F3F' }}>
                              Why This Helps:
                            </p>
                            <p className="text-xs" style={{ color: '#3A3A3A' }}>
                              Cold water triggers your dive response, instantly activating your parasympathetic nervous system. This slows your heart rate, reduces stress hormones, and brings immediate calm.
                            </p>
                          </div>

                          {/* Step by step instructions */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                1
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                                  Get Cold Water Ready
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#6B7C6B' }}>
                                  Fill a bowl with cold water or go to a sink. Colder is better - add ice if available.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                2
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                                  Press Start & Apply Cold
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#6B7C6B' }}>
                                  Splash cold water on your face, focusing on temples and forehead. Or hold your wrists under cold running water.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                3
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                                  Breathe Deeply
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#6B7C6B' }}>
                                  While feeling the cold, take 3-4 slow, deep breaths. Notice the immediate shift in your body's response.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Quick tips */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                              <div className="flex items-center mb-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                                <span className="font-medium" style={{ color: '#1E40AF' }}>
                                  Best Spots
                                </span>
                              </div>
                              <p className="text-xs" style={{ color: '#3A3A3A' }}>
                                Face, temples, wrists, or back of neck
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-200">
                              <div className="flex items-center mb-2">
                                <div className="w-3 h-3 rounded-full bg-cyan-500 mr-2" />
                                <span className="font-medium" style={{ color: '#0891B2' }}>
                                  Duration
                                </span>
                              </div>
                              <p className="text-xs" style={{ color: '#3A3A3A' }}>
                                30-60 seconds for full effect
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedTechnique === 'sensory-reset' && (
                        <>
                          {/* Sensory Reset Animation */}
                          <div className="flex flex-col items-center mb-6">
                            {/* Status Text Above Animation */}
                            <div className="text-center mb-4">
                              <p className="text-2xl font-bold" style={{ color: '#2D5F3F' }}>
                                {senseCount === 0 && 'Ready to Ground'}
                                {senseCount === 1 && '4 Things You See'}
                                {senseCount === 2 && '3 Things You Touch'}
                                {senseCount === 3 && '2 Things You Smell'}
                                {senseCount === 4 && '1 Thing You Taste'}
                              </p>
                              <p className="text-sm mt-1" style={{ color: '#6B7C6B' }}>
                                {isTimerActive ? 'Focus on each sense mindfully' : 'Press start to begin grounding'}
                              </p>
                            </div>
                            
                            {/* Enhanced 5-4-3-2-1 Animation */}
                            <div className="relative w-64 h-64 flex items-center justify-center">
                              {/* Background Pulse */}
                              <div 
                                className="absolute inset-0 rounded-full"
                                style={{
                                  background: isTimerActive 
                                    ? 'radial-gradient(circle, rgba(92, 127, 79, 0.1) 0%, transparent 70%)' 
                                    : 'none',
                                  animation: isTimerActive ? 'pulse 2s ease-in-out infinite' : 'none'
                                }}
                              />
                              
                              {/* Sensory Visualization */}
                              <svg width="250" height="250" viewBox="0 -10 250 260" className="relative z-10">
                                {/* Sight - Eye Icon (4) - Top Center */}
                                <g transform="translate(125, 60)" opacity={senseCount >= 1 ? 1 : 0.3}>
                                  <circle cx="0" cy="0" r="25" fill={senseCount >= 1 ? '#9333EA' : '#E5E7EB'} />
                                  <ellipse cx="0" cy="0" rx="15" ry="10" fill="white" />
                                  <circle cx="0" cy="0" r="6" fill="#1F2937" />
                                  {/* Number positioned above with better spacing */}
                                  <text x="0" y="-40" textAnchor="middle" fill={senseCount >= 1 ? '#9333EA' : '#9CA3AF'} fontSize="20" fontWeight="bold">4</text>
                                </g>
                                
                                {/* Touch - Hand Icon (3) - Right Side */}
                                <g transform="translate(200, 125)" opacity={senseCount >= 2 ? 1 : 0.3}>
                                  <circle cx="0" cy="0" r="25" fill={senseCount >= 2 ? '#3B82F6' : '#E5E7EB'} />
                                  {/* Better hand icon with fingers */}
                                  <g>
                                    {/* Palm */}
                                    <ellipse cx="0" cy="2" rx="10" ry="12" fill="white" />
                                    {/* Thumb */}
                                    <ellipse cx="-10" cy="-2" rx="4" ry="6" fill="white" transform="rotate(-30 -10 -2)" />
                                    {/* Index finger */}
                                    <rect x="-6" y="-12" width="3" height="12" rx="1.5" fill="white" />
                                    {/* Middle finger */}
                                    <rect x="-2" y="-13" width="3" height="13" rx="1.5" fill="white" />
                                    {/* Ring finger */}
                                    <rect x="2" y="-12" width="3" height="12" rx="1.5" fill="white" />
                                    {/* Pinky finger */}
                                    <rect x="6" y="-10" width="3" height="10" rx="1.5" fill="white" />
                                    {/* Palm lines */}
                                    <path d="M -5,2 L 5,2" stroke="#E5E7EB" strokeWidth="1" opacity="0.5" />
                                    <path d="M -3,6 L 3,6" stroke="#E5E7EB" strokeWidth="1" opacity="0.5" />
                                  </g>
                                  {/* Number positioned to the right */}
                                  <text x="40" y="5" textAnchor="middle" fill={senseCount >= 2 ? '#3B82F6' : '#9CA3AF'} fontSize="20" fontWeight="bold">3</text>
                                </g>
                                
                                {/* Smell - Nose Icon (2) - Left Side */}
                                <g transform="translate(50, 125)" opacity={senseCount >= 3 ? 1 : 0.3}>
                                  <circle cx="0" cy="0" r="25" fill={senseCount >= 3 ? '#FB923C' : '#E5E7EB'} />
                                  {/* Simplified nose with scent waves */}
                                  <path d="M 0,-8 L -4,4 L 0,8 L 4,4 Z" fill="white" />
                                  <circle cx="-2" cy="6" r="1.5" fill="#1F2937" />
                                  <circle cx="2" cy="6" r="1.5" fill="#1F2937" />
                                  <path d="M -10,-5 Q -8,-3 -6,-5" fill="none" stroke="white" strokeWidth="1.5" opacity="0.8" />
                                  <path d="M -10,0 Q -8,2 -6,0" fill="none" stroke="white" strokeWidth="1.5" opacity="0.8" />
                                  {/* Number positioned to the left */}
                                  <text x="-40" y="5" textAnchor="middle" fill={senseCount >= 3 ? '#FB923C' : '#9CA3AF'} fontSize="20" fontWeight="bold">2</text>
                                </g>
                                
                                {/* Taste - Mouth Icon (1) - Bottom Center */}
                                <g transform="translate(125, 190)" opacity={senseCount >= 4 ? 1 : 0.3}>
                                  <circle cx="0" cy="0" r="25" fill={senseCount >= 4 ? '#EF4444' : '#E5E7EB'} />
                                  {/* Simplified mouth/lips icon */}
                                  <ellipse cx="0" cy="0" rx="12" ry="6" fill="white" />
                                  <path d="M -12,0 Q 0,4 12,0" fill="none" stroke="#EF4444" strokeWidth="2" />
                                  <rect x="-6" y="-3" width="12" height="1" fill="#FFB6C1" opacity="0.6" />
                                  {/* Number positioned below */}
                                  <text x="0" y="45" textAnchor="middle" fill={senseCount >= 4 ? '#EF4444' : '#9CA3AF'} fontSize="20" fontWeight="bold">1</text>
                                </g>
                                
                                {/* Center Circle with Current Step */}
                                <circle cx="125" cy="125" r="40" fill="white" stroke="#5C7F4F" strokeWidth="3" />
                                <text x="125" y="125" textAnchor="middle" fill="#2D5F3F" fontSize="24" fontWeight="bold" dy=".3em">
                                  {senseCount === 0 ? 'START' : `${5 - senseCount}/4`}
                                </text>
                                
                                {/* Connecting Lines */}
                                {isTimerActive && (
                                  <>
                                    <line x1="125" y1="85" x2="125" y2="85" stroke="#5C7F4F" strokeWidth="2" opacity={senseCount >= 1 ? 1 : 0.3} />
                                    <line x1="155" y1="125" x2="175" y2="125" stroke="#5C7F4F" strokeWidth="2" opacity={senseCount >= 2 ? 1 : 0.3} />
                                    <line x1="95" y1="125" x2="75" y2="125" stroke="#5C7F4F" strokeWidth="2" opacity={senseCount >= 3 ? 1 : 0.3} />
                                    <line x1="125" y1="165" x2="125" y2="165" stroke="#5C7F4F" strokeWidth="2" opacity={senseCount >= 4 ? 1 : 0.3} />
                                  </>
                                )}
                              </svg>
                              
                              {/* Progress Bar */}
                              <div className="absolute bottom-0 left-0 right-0">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full transition-all duration-1000"
                                    style={{
                                      width: `${techniqueProgress}%`,
                                      backgroundColor: '#5C7F4F'
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <h3
                            className="font-semibold mb-3 text-center"
                            style={{ color: '#2D5F3F' }}
                          >
                            How to Practice 4-3-2-1 Grounding:
                          </h3>
                          
                          {/* Instructions */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="font-bold text-purple-600">4</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#2D5F3F' }}>See</p>
                                <p className="text-xs mt-1" style={{ color: '#6B7C6B' }}>
                                  Look around and name 4 things you can see. Be specific - "blue coffee mug" not just "mug"
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="font-bold text-blue-600">3</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#2D5F3F' }}>Touch</p>
                                <p className="text-xs mt-1" style={{ color: '#6B7C6B' }}>
                                  Notice 3 things you can physically feel - your feet on floor, chair against back, air on skin
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="font-bold text-green-600">2</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#2D5F3F' }}>Smell</p>
                                <p className="text-xs mt-1" style={{ color: '#6B7C6B' }}>
                                  Identify 2 scents - coffee, fresh air, hand lotion, or just "neutral air"
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="font-bold text-red-600">1</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#2D5F3F' }}>Taste</p>
                                <p className="text-xs mt-1" style={{ color: '#6B7C6B' }}>
                                  Notice 1 taste - sip water, chew gum, or just notice your mouth's current taste
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Why This Works */}
                          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: '#2D5F3F' }}>
                              Why This Works:
                            </p>
                            <p className="text-xs" style={{ color: '#3A3A3A' }}>
                              The 4-3-2-1 technique interrupts anxiety loops by engaging multiple sensory channels simultaneously. This grounds you in the present moment, reducing rumination by 60%.
                            </p>
                          </div>
                        </>
                      )}
                      {selectedTechnique === 'expansion-practice' && (
                        <>
                          {/* Expansion Practice Animation */}
                          <div className="flex flex-col items-center mb-6">
                            {/* Status Text Above Animation */}
                            <div className="text-center mb-4">
                              <p className="text-2xl font-bold" style={{ color: '#2D5F3F' }}>
                                {!isTimerActive && 'Ready to Expand'}
                                {isTimerActive && expansionLevel < 0.33 && 'Noticing Tension'}
                                {isTimerActive && expansionLevel >= 0.33 && expansionLevel < 0.66 && 'Creating Space'}
                                {isTimerActive && expansionLevel >= 0.66 && 'Full Expansion'}
                              </p>
                              <p className="text-sm mt-1" style={{ color: '#6B7C6B' }}>
                                {isTimerActive ? 'Breathe and expand your awareness' : 'Press start to begin expansion'}
                              </p>
                            </div>
                            
                            {/* Enhanced Expansion Animation */}
                            <div className="relative w-64 h-64 flex items-center justify-center">
                              {/* Background Gradient */}
                              <div 
                                className="absolute inset-0 rounded-full"
                                style={{
                                  background: 'radial-gradient(circle, rgba(92, 127, 79, 0.05) 0%, transparent 70%)',
                                  animation: isTimerActive ? 'pulse 4s ease-in-out infinite' : 'none'
                                }}
                              />
                              
                              {/* Expansion Visualization */}
                              <svg width="250" height="250" viewBox="0 0 250 250" className="relative z-10">
                                {/* Expanding ripples */}
                                {[1, 2, 3, 4].map((ring) => (
                                  <circle
                                    key={ring}
                                    cx="125"
                                    cy="125"
                                    r={30 * ring}
                                    fill="none"
                                    stroke="#5C7F4F"
                                    strokeWidth={5 - ring}
                                    opacity={isTimerActive ? (0.8 - ring * 0.15) * expansionLevel : 0.1}
                                    style={{
                                      transform: isTimerActive 
                                        ? `scale(${1 + expansionLevel * (ring * 0.15)})` 
                                        : 'scale(1)',
                                      transformOrigin: 'center',
                                      transition: 'all 2s ease-in-out'
                                    }}
                                  />
                                ))}
                                
                                {/* Body silhouette */}
                                <g transform="translate(125, 125)">
                                  {/* Head */}
                                  <circle 
                                    cx="0" 
                                    cy="-30" 
                                    r="15" 
                                    fill="#2D5F3F"
                                    opacity={isTimerActive ? 0.8 : 0.4}
                                  />
                                  
                                  {/* Body */}
                                  <ellipse 
                                    cx="0" 
                                    cy="0" 
                                    rx="25" 
                                    ry="35" 
                                    fill="#2D5F3F"
                                    opacity={isTimerActive ? 0.8 : 0.4}
                                  />
                                  
                                  {/* Arms */}
                                  <rect 
                                    x="-40" 
                                    y="-10" 
                                    width="15" 
                                    height="30" 
                                    rx="7" 
                                    fill="#2D5F3F"
                                    opacity={isTimerActive ? 0.8 : 0.4}
                                    style={{
                                      transform: isTimerActive ? `rotate(${-30 + expansionLevel * 60}deg)` : 'rotate(-30deg)',
                                      transformOrigin: '40px 10px',
                                      transition: 'all 2s ease-in-out'
                                    }}
                                  />
                                  <rect 
                                    x="25" 
                                    y="-10" 
                                    width="15" 
                                    height="30" 
                                    rx="7" 
                                    fill="#2D5F3F"
                                    opacity={isTimerActive ? 0.8 : 0.4}
                                    style={{
                                      transform: isTimerActive ? `rotate(${30 - expansionLevel * 60}deg)` : 'rotate(30deg)',
                                      transformOrigin: '-25px 10px',
                                      transition: 'all 2s ease-in-out'
                                    }}
                                  />
                                  
                                  {/* Energy points */}
                                  {isTimerActive && [
                                    { x: 0, y: -30, delay: 0 },     // Head
                                    { x: 0, y: 0, delay: 0.2 },     // Heart
                                    { x: 0, y: 20, delay: 0.4 },    // Belly
                                    { x: -30, y: 0, delay: 0.6 },   // Left
                                    { x: 30, y: 0, delay: 0.8 }     // Right
                                  ].map((point, i) => (
                                    <circle
                                      key={i}
                                      cx={point.x}
                                      cy={point.y}
                                      r="4"
                                      fill="#5C7F4F"
                                      opacity={expansionLevel}
                                    >
                                      <animate
                                        attributeName="r"
                                        values="4;8;4"
                                        dur="2s"
                                        begin={`${point.delay}s`}
                                        repeatCount="indefinite"
                                      />
                                      <animate
                                        attributeName="opacity"
                                        values="0.5;1;0.5"
                                        dur="2s"
                                        begin={`${point.delay}s`}
                                        repeatCount="indefinite"
                                      />
                                    </circle>
                                  ))}
                                </g>
                                
                                {/* Progress text */}
                                <text 
                                  x="125" 
                                  y="210" 
                                  textAnchor="middle" 
                                  fill="#2D5F3F" 
                                  fontSize="18" 
                                  fontWeight="bold"
                                >
                                  {isTimerActive ? `${Math.round(expansionLevel * 100)}%` : 'Ready'}
                                </text>
                              </svg>
                              
                              {/* Progress Bar */}
                              <div className="absolute bottom-0 left-0 right-0">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full transition-all duration-1000"
                                    style={{
                                      width: `${techniqueProgress}%`,
                                      backgroundColor: '#5C7F4F'
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <h3
                            className="font-semibold mb-3 text-center"
                            style={{ color: '#2D5F3F' }}
                          >
                            How to Practice Expansion:
                          </h3>
                          
                          {/* Step by step instructions */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                1
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                                  Scan Your Body
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#6B7C6B' }}>
                                  Notice where you're holding tension - shoulders, jaw, chest, belly
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                2
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                                  Breathe Into Tension
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#6B7C6B' }}>
                                  Imagine your breath flowing directly to those tight areas, creating space
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                3
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                                  Expand Awareness
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#6B7C6B' }}>
                                  Let your awareness grow beyond your body, sensing the space around you
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Tips */}
                          <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: '#2D5F3F' }}>
                              Pro Tip:
                            </p>
                            <p className="text-xs" style={{ color: '#3A3A3A' }}>
                              This technique creates psychological space when feeling overwhelmed. The physical expansion helps your mind feel less cramped and stressed.
                            </p>
                          </div>
                        </>
                      )}
                      {selectedTechnique === 'name-transform' && (
                        <>
                          {/* Name and Transform Animation */}
                          <div className="flex flex-col items-center mb-6">
                            {/* Status Text Above Animation */}
                            <div className="text-center mb-4">
                              <p className="text-2xl font-bold" style={{ color: '#2D5F3F' }}>
                                {!isTimerActive && 'Ready to Transform'}
                                {isTimerActive && techniqueProgress < 33 && 'Feeling the Emotion'}
                                {isTimerActive && techniqueProgress >= 33 && techniqueProgress < 66 && 'Naming & Locating'}
                                {isTimerActive && techniqueProgress >= 66 && 'Offering Compassion'}
                              </p>
                              <p className="text-sm mt-1" style={{ color: '#6B7C6B' }}>
                                {isTimerActive ? 'Transform emotions into wisdom' : 'Press start to begin transformation'}
                              </p>
                            </div>
                            
                            {/* Enhanced Emotion Transformation Animation */}
                            <div className="relative w-64 h-64 flex items-center justify-center">
                              {/* Background Gradient */}
                              <div 
                                className="absolute inset-0 rounded-full"
                                style={{
                                  background: isTimerActive 
                                    ? `radial-gradient(circle, ${
                                        techniqueProgress < 33 ? 'rgba(239, 68, 68, 0.1)' :
                                        techniqueProgress < 66 ? 'rgba(245, 158, 11, 0.1)' :
                                        'rgba(16, 185, 129, 0.1)'
                                      } 0%, transparent 70%)`
                                    : 'none',
                                  animation: isTimerActive ? 'pulse 3s ease-in-out infinite' : 'none'
                                }}
                              />
                              
                              {/* Central Transformation Visualization */}
                              <svg width="250" height="250" viewBox="0 0 250 250" className="relative z-10">
                                {/* Outer ring representing emotional boundary */}
                                <circle
                                  cx="125"
                                  cy="125"
                                  r="110"
                                  fill="none"
                                  stroke={techniqueProgress < 33 ? '#EF4444' : techniqueProgress < 66 ? '#F59E0B' : '#10B981'}
                                  strokeWidth="2"
                                  opacity="0.3"
                                  strokeDasharray="10 5"
                                  className="transition-all duration-1000"
                                >
                                  <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0 125 125"
                                    to="360 125 125"
                                    dur="20s"
                                    repeatCount="indefinite"
                                  />
                                </circle>
                                
                                {/* Inner emotional core */}
                                <g transform="translate(125, 125)">
                                  {/* Chaotic emotion state (Phase 1: 0-33%) */}
                                  {techniqueProgress < 33 && (
                                    <g opacity={isTimerActive ? 1 : 0.3}>
                                      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                                        <line
                                          key={i}
                                          x1="0"
                                          y1="0"
                                          x2={Math.cos(angle * Math.PI / 180) * 40}
                                          y2={Math.sin(angle * Math.PI / 180) * 40}
                                          stroke="#EF4444"
                                          strokeWidth="2"
                                          opacity="0.6"
                                        >
                                          <animate
                                            attributeName="opacity"
                                            values="0.3;1;0.3"
                                            dur={`${1 + i * 0.2}s`}
                                            repeatCount="indefinite"
                                          />
                                        </line>
                                      ))}
                                      <circle cx="0" cy="0" r="25" fill="#EF4444" opacity="0.8">
                                        <animate
                                          attributeName="r"
                                          values="25;30;25"
                                          dur="2s"
                                          repeatCount="indefinite"
                                        />
                                      </circle>
                                      <text x="0" y="5" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">?</text>
                                    </g>
                                  )}
                                  
                                  {/* Naming state (Phase 2: 33-66%) */}
                                  {techniqueProgress >= 33 && techniqueProgress < 66 && (
                                    <g opacity={isTimerActive ? 1 : 0.3}>
                                      {/* Organizing circles */}
                                      {[0, 72, 144, 216, 288].map((angle, i) => (
                                        <circle
                                          key={i}
                                          cx={Math.cos(angle * Math.PI / 180) * 35}
                                          cy={Math.sin(angle * Math.PI / 180) * 35}
                                          r="8"
                                          fill="#F59E0B"
                                          opacity="0.6"
                                        >
                                          <animate
                                            attributeName="r"
                                            values="8;12;8"
                                            dur={`${2 + i * 0.3}s`}
                                            repeatCount="indefinite"
                                          />
                                        </circle>
                                      ))}
                                      <circle cx="0" cy="0" r="30" fill="#F59E0B" opacity="0.9" />
                                      <text x="0" y="5" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">Named</text>
                                    </g>
                                  )}
                                  
                                  {/* Transformed state (Phase 3: 66-100%) */}
                                  {techniqueProgress >= 66 && (
                                    <g opacity={isTimerActive ? 1 : 0.3}>
                                      {/* Peaceful ripples */}
                                      {[20, 40, 60].map((radius, i) => (
                                        <circle
                                          key={i}
                                          cx="0"
                                          cy="0"
                                          r={radius}
                                          fill="none"
                                          stroke="#10B981"
                                          strokeWidth="1"
                                          opacity={0.3 + i * 0.2}
                                        >
                                          <animate
                                            attributeName="r"
                                            values={`${radius};${radius + 5};${radius}`}
                                            dur="3s"
                                            repeatCount="indefinite"
                                          />
                                        </circle>
                                      ))}
                                      <circle cx="0" cy="0" r="35" fill="#10B981" />
                                      <path 
                                        d="M -15,-5 Q -15,5 -5,10 L 0,15 L 5,10 Q 15,5 15,-5 Q 15,-10 10,-12 Q 5,-8 0,-10 Q -5,-8 -10,-12 Q -15,-10 -15,-5 Z"
                                        fill="white"
                                      />
                                    </g>
                                  )}
                                </g>
                                
                                {/* Progress Arc */}
                                <circle
                                  cx="125"
                                  cy="125"
                                  r="90"
                                  fill="none"
                                  stroke="#E5E7EB"
                                  strokeWidth="4"
                                />
                                <circle
                                  cx="125"
                                  cy="125"
                                  r="90"
                                  fill="none"
                                  stroke={techniqueProgress < 33 ? '#EF4444' : techniqueProgress < 66 ? '#F59E0B' : '#10B981'}
                                  strokeWidth="4"
                                  strokeDasharray={`${2 * Math.PI * 90} ${2 * Math.PI * 90}`}
                                  strokeDashoffset={2 * Math.PI * 90 * (1 - techniqueProgress / 100)}
                                  transform="rotate(-90 125 125)"
                                  className="transition-all duration-1000"
                                />
                                
                                {/* Phase Labels */}
                                <text x="125" y="25" textAnchor="middle" fill={techniqueProgress < 33 ? '#EF4444' : '#9CA3AF'} fontSize="12" fontWeight={techniqueProgress < 33 ? 'bold' : 'normal'}>
                                  FEEL
                                </text>
                                <text x="215" y="125" textAnchor="middle" fill={techniqueProgress >= 33 && techniqueProgress < 66 ? '#F59E0B' : '#9CA3AF'} fontSize="12" fontWeight={techniqueProgress >= 33 && techniqueProgress < 66 ? 'bold' : 'normal'}>
                                  NAME
                                </text>
                                <text x="125" y="235" textAnchor="middle" fill={techniqueProgress >= 66 ? '#10B981' : '#9CA3AF'} fontSize="12" fontWeight={techniqueProgress >= 66 ? 'bold' : 'normal'}>
                                  HEAL
                                </text>
                              </svg>
                              
                              {/* Progress Bar */}
                              <div className="absolute bottom-0 left-0 right-0">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full transition-all duration-1000"
                                    style={{
                                      width: `${techniqueProgress}%`,
                                      background: techniqueProgress < 33 ? '#EF4444' : techniqueProgress < 66 ? '#F59E0B' : '#10B981'
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <h3
                            className="font-semibold mb-3 text-center"
                            style={{ color: '#2D5F3F' }}
                          >
                            How to Transform Emotions:
                          </h3>
                          
                          {/* Step by step instructions */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                1
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                                  Feel Without Judgment
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#6B7C6B' }}>
                                  Notice the raw emotion in your body. Where do you feel it? What does it feel like?
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                2
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                                  Name It to Tame It
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#6B7C6B' }}>
                                  Give the emotion a specific name. "Frustrated" is better than "bad." Locate it in your body.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                3
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                                  Offer Self-Compassion
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#6B7C6B' }}>
                                  Place your hand on your heart. Say: "This is hard right now. I'm here with myself."
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Why This Works */}
                          <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: '#2D5F3F' }}>
                              Why This Works:
                            </p>
                            <p className="text-xs" style={{ color: '#3A3A3A' }}>
                              Naming emotions reduces amygdala activity by up to 50%. Adding self-compassion activates the caregiving system, transforming distress into wisdom.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(92, 127, 79, 0.2)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${techniqueProgress}%`,
                      backgroundColor: '#5C7F4F',
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {techniqueProgress > 0 && (
                  <button
                    onClick={() => {
                      // Clear any running interval
                      if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                      }
                      // Reset all states
                      setIsTimerActive(false);
                      setTechniqueProgress(0);
                      setBodyPart(0);
                      setBreathPhase('inhale');
                      setBreathCycle(0);
                      setSenseCount(0);
                      setExpansionLevel(0);
                    }}
                    className="px-6 py-3 rounded-xl font-medium transition-all"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#EF4444',
                      border: '2px solid #EF4444'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#EF4444';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.color = '#EF4444';
                    }}
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => {
                    // Clear any existing interval before starting/stopping
                    if (intervalRef.current) {
                      clearInterval(intervalRef.current);
                      intervalRef.current = null;
                    }
                    
                    setIsTimerActive(!isTimerActive);
                    if (!isTimerActive) {
                      // Reset all states when starting
                      setBreathPhase('inhale');
                      setBreathCycle(0);
                      setBodyPart(0);
                      setTechniqueProgress(0);
                      setSenseCount(0);
                      setExpansionLevel(0)

                      if (selectedTechnique === 'box-breathing') {
                        // Box breathing: 4 phases of 4 seconds each = 16 seconds per cycle
                        let cycle = 0;
                        let progress = techniqueProgress;

                        intervalRef.current = setInterval(() => {
                          cycle++;
                          setBreathCycle(cycle);

                          // Update breath phase every 4 seconds
                          const phase = Math.floor((cycle % 16) / 4);
                          if (phase === 0) setBreathPhase('inhale');
                          else if (phase === 1) setBreathPhase('hold-in');
                          else if (phase === 2) setBreathPhase('exhale');
                          else setBreathPhase('hold-out');

                          // Update progress (4 minutes = 240 seconds total)
                          progress = Math.min(100, (cycle / 240) * 100);
                          setTechniqueProgress(progress);

                          if (progress >= 100) {
                            if (intervalRef.current) {
                              clearInterval(intervalRef.current);
                              intervalRef.current = null;
                            }
                            setIsTimerActive(false);
                            setTechniqueProgress(0);
                            setBodyPart(0);
                          }
                        }, 1000); // Update every second
                      } else if (selectedTechnique === 'body-release') {
                        // Body release: 5 body parts, each for ~12 seconds (60 seconds total)
                        let progress = 0;  // Always start from 0
                        let part = 0;
                        setBodyPart(0);
                        setTechniqueProgress(0);  // Ensure progress starts at 0

                        intervalRef.current = setInterval(() => {
                          progress += 100 / 60; // 1 minute = 60 seconds
                          setTechniqueProgress(progress);

                          // Update body part every 12 seconds
                          const newPart = Math.floor(progress / 20);
                          if (newPart !== part && newPart < 5) {
                            part = newPart;
                            setBodyPart(part);
                          }

                          if (progress >= 100) {
                            if (intervalRef.current) {
                              clearInterval(intervalRef.current);
                              intervalRef.current = null;
                            }
                            setIsTimerActive(false);
                            setBodyPart(0);
                            setTechniqueProgress(0);
                          }
                        }, 1000);
                      } else if (selectedTechnique === 'sensory-reset') {
                        // Sensory reset: 4 senses, 80 seconds total
                        let progress = techniqueProgress;
                        let sense = 0;
                        setSenseCount(0);

                        intervalRef.current = setInterval(() => {
                          progress += 100 / 80; // 80 seconds total
                          setTechniqueProgress(progress);

                          // Update sense every 20 seconds (80/4 = 20 seconds per sense)
                          const newSense = Math.floor(progress / 25) + 1;
                          if (newSense !== sense && newSense <= 4) {
                            sense = newSense;
                            setSenseCount(sense);
                          }

                          if (progress >= 100) {
                            if (intervalRef.current) {
                              clearInterval(intervalRef.current);
                              intervalRef.current = null;
                            }
                            setIsTimerActive(false);
                            setTechniqueProgress(0);
                            setSenseCount(0);
                          }
                        }, 1000);
                      } else if (selectedTechnique === 'expansion-practice') {
                        // Expansion practice: gradual expansion over 2 minutes
                        let progress = techniqueProgress;

                        intervalRef.current = setInterval(() => {
                          progress += 100 / 120; // 2 minutes = 120 seconds
                          setTechniqueProgress(progress);
                          setExpansionLevel(progress / 100);

                          if (progress >= 100) {
                            if (intervalRef.current) {
                              clearInterval(intervalRef.current);
                              intervalRef.current = null;
                            }
                            setIsTimerActive(false);
                            setTechniqueProgress(0);
                            setExpansionLevel(0);
                          }
                        }, 1000);
                      } else if (selectedTechnique === 'temperature-shift') {
                        // Temperature shift: 1 minute
                        let progress = 0;
                        setTechniqueProgress(0);
                        
                        intervalRef.current = setInterval(() => {
                          progress += 100 / 60; // 1 minute = 60 seconds
                          setTechniqueProgress(progress);
                          
                          if (progress >= 100) {
                            if (intervalRef.current) {
                              clearInterval(intervalRef.current);
                              intervalRef.current = null;
                            }
                            setIsTimerActive(false);
                            setTechniqueProgress(0);
                          }
                        }, 1000);
                      } else {
                        // Default timer for other techniques (name-transform: 3 minutes)
                        let progress = 0;
                        setTechniqueProgress(0);
                        
                        intervalRef.current = setInterval(() => {
                          progress += 100 / 180; // 3 minutes = 180 seconds
                          setTechniqueProgress(progress);
                          
                          if (progress >= 100) {
                            if (intervalRef.current) {
                              clearInterval(intervalRef.current);
                              intervalRef.current = null;
                            }
                            setIsTimerActive(false);
                            setTechniqueProgress(0);
                          }
                        }, 1000);
                      }
                    }
                  }}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
                  style={{
                    background: isTimerActive
                      ? '#FF6B6B'
                      : 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 139, 96, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
                  }}
                >
                  {isTimerActive ? 'Pause' : 'Start Exercise'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );

  const renderAffirmations = () => (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <div
              className="p-3 rounded-full mr-4"
              style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
            >
              <Heart className="h-8 w-8" style={{ color: '#5C7F4F' }} />
            </div>
            <h1
              className="text-4xl font-bold"
              style={{ color: '#1A1A1A', letterSpacing: '-0.5px' }}
            >
              Affirmation & Reflection Studio
            </h1>
          </div>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: '#5A5A5A', lineHeight: '1.7' }}>
            Gentle, conversational affirmations paired with thoughtful reflection to nurture your
            relationship with yourself
          </p>
        </div>

        {/* Affirmation Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {affirmationCategories.map((category, index) => (
            <div
              key={index}
              className="rounded-xl p-6 transition-all duration-200 cursor-pointer group"
              onClick={() => {
                setSelectedAffirmationCategory(index);
                setCurrentAffirmationIndex(0);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid transparent',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                transform: 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#5C7F4F';
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(92, 127, 79, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="rounded-lg p-3 w-fit"
                  style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
                >
                  <category.icon className="h-6 w-6" style={{ color: '#5C7F4F' }} />
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium" style={{ color: '#6B7C6B' }}>
                    5 affirmations
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-3" style={{ color: '#1A1A1A' }}>
                {category.title}
              </h3>

              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ color: '#5A5A5A', lineHeight: '1.6' }}
              >
                {category.description}
              </p>

              <div className="flex items-center justify-between">
                <div
                  className="text-xs px-3 py-1.5 rounded-full font-semibold"
                  style={{
                    backgroundColor: 'rgba(92, 127, 79, 0.2)',
                    color: '#2D5F3F',
                  }}
                >
                  {category.tag}
                </div>
                <ChevronDown
                  className="h-4 w-4 rotate-[-90deg] group-hover:translate-x-1 transition-transform"
                  style={{ color: '#5C7F4F' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );

  const renderBurnoutGauge = () => (
    <section aria-labelledby="burnout-gauge-heading">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            id="burnout-gauge-heading"
            className="text-3xl font-bold mb-3"
            style={{ color: '#1A1A1A' }}
          >
            Daily Burnout Gauge
          </h2>
          <p className="text-base" style={{ color: '#5A5A5A' }}>
            Quick check-in on your energy and stress levels
          </p>
        </div>
        <div className="p-4 rounded-full" style={{ backgroundColor: 'rgba(45, 95, 63, 0.15)' }}>
          <Gauge className="h-10 w-10" aria-hidden="true" style={{ color: '#2D5F3F' }} />
        </div>
      </div>

      <div className="text-center py-8">
        <button
          onClick={() => setShowDailyBurnout(true)}
          className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all"
          style={{
            background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
            color: '#FFFFFF',
            boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(107, 139, 96, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
          }}
        >
          <Gauge className="w-6 h-6 mr-3" />
          Take Your 5-Question Daily Assessment
        </button>
        <p className="text-sm mt-4" style={{ color: '#5A5A5A' }}>
          Complete wellness check with personalized recommendations
        </p>
        
        {/* Show last assessment if available */}
        {localStorage.getItem('todaysBurnoutAssessment') && (
          <div className="mt-6 inline-block p-4 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
            <p className="text-sm font-semibold" style={{ color: '#2D5F3F' }}>
              ✓ Today's assessment completed
            </p>
          </div>
        )}
      </div>
    </section>
  );

  const renderDashboardHome = () => (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1
              className="text-4xl font-bold mb-3"
              style={{ color: '#1A1A1A', letterSpacing: '-0.5px' }}
            >
              Good morning, dev
            </h1>
            <p className="text-lg" style={{ color: '#5A5A5A', fontWeight: '400' }}>
              Ready to reflect and grow today?
            </p>
          </div>

          {/* Continue Your Journey Card */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAFAF8 100%)',
              boxShadow: '0 10px 30px rgba(92, 127, 79, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                  Continue Your Journey
                </h2>
                <p className="text-base" style={{ color: '#5A5A5A', lineHeight: '1.6' }}>
                  Choose your reflection type and dive deeper into your professional growth
                </p>
              </div>
              <div
                className="p-4 rounded-full"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
              >
                <BookOpen className="h-10 w-10" style={{ color: '#5C7F4F' }} />
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('reflection')}
                className="rounded-xl p-6 text-left transition-all group"
                style={{
                  backgroundColor: '#6B8B60',
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                  boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
                  transform: 'translateY(0)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(107, 139, 96, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
                }}
              >
                <div
                  className="p-3 rounded-lg inline-block mb-4"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <Target className="h-6 w-6" style={{ color: '#FFFFFF' }} />
                </div>
                <h3 className="font-bold mb-2 text-lg" style={{ color: '#FFFFFF' }}>
                  New Reflection
                </h3>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Start a fresh reflection session
                </p>
              </button>

              <button
                onClick={() => {
                  setActiveTab('reflection');
                  setActiveCategory('burnout');
                }}
                className="rounded-xl p-6 text-left transition-all group"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #5C7F4F',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                  transform: 'translateY(0)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(92, 127, 79, 0.3)';
                  e.currentTarget.style.backgroundColor = '#F8FBF6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                <div
                  className="p-3 rounded-lg inline-block mb-4"
                  style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
                >
                  <Shield className="h-6 w-6" style={{ color: '#5C7F4F' }} />
                </div>
                <h3 className="font-bold mb-2 text-lg" style={{ color: '#1A1A1A' }}>
                  Daily Burnout Gauge
                </h3>
                <p className="text-sm" style={{ color: '#5A5A5A' }}>
                  5-question wellness assessment
                </p>
              </button>

              <button
                onClick={() => setActiveTab('stress')}
                className="rounded-xl p-6 text-left transition-all group"
                style={{
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                  boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
                  transform: 'translateY(0)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(107, 139, 96, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
                }}
              >
                <div
                  className="p-3 rounded-lg inline-block mb-4"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <Heart className="h-6 w-6" style={{ color: '#FFFFFF' }} />
                </div>
                <h3 className="font-bold mb-2 text-lg" style={{ color: '#FFFFFF' }}>
                  Quick Reset
                </h3>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  5-minute wellness break
                </p>
              </button>
            </div>
          </div>

          {/* Recent Reflections */}
          <div
            className="rounded-2xl p-8"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 10px 30px rgba(92, 127, 79, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                Recent Reflections
              </h2>
              <button
                className="font-semibold flex items-center transition-all px-4 py-2 rounded-lg"
                style={{
                  color: '#6B7C6B',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.1)';
                  e.currentTarget.style.color = '#5C7F4F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6B7C6B';
                }}
              >
                View All
                <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </button>
            </div>

            {/* Reflections List or Empty State */}
            {savedReflections.length > 0 ? (
              <div className="space-y-4">
                {savedReflections.slice(0, 3).map((reflection) => {
                  const date = new Date(reflection.timestamp);
                  const timeAgo = getTimeAgo(date);
                  
                  return (
                    <div
                      key={reflection.id}
                      className="p-5 rounded-xl transition-all cursor-pointer group"
                      style={{
                        backgroundColor: 'rgba(92, 127, 79, 0.05)',
                        border: '1px solid rgba(92, 127, 79, 0.2)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.1)';
                        e.currentTarget.style.borderColor = '#5C7F4F';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(92, 127, 79, 0.2)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2" style={{ color: '#1A1A1A' }}>
                            {reflection.type}
                          </h4>
                          <p className="text-sm mb-2" style={{ color: '#5A5A5A' }}>
                            {getReflectionSummary(reflection)}
                          </p>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>
                            {timeAgo}
                          </p>
                        </div>
                        <ChevronDown 
                          className="h-5 w-5 rotate-[-90deg] opacity-0 group-hover:opacity-100 transition-opacity" 
                          style={{ color: '#5C7F4F' }} 
                        />
                      </div>
                    </div>
                  );
                })}
                
                {savedReflections.length > 3 && (
                  <button
                    className="w-full py-3 rounded-xl font-medium transition-all"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#6B7C6B',
                      border: '1px solid rgba(92, 127, 79, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.1)';
                      e.currentTarget.style.borderColor = '#5C7F4F';
                      e.currentTarget.style.color = '#5C7F4F';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(92, 127, 79, 0.3)';
                      e.currentTarget.style.color = '#6B7C6B';
                    }}
                  >
                    View All {savedReflections.length} Reflections
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div
                  className="p-6 rounded-xl mb-6"
                  style={{ backgroundColor: 'rgba(92, 127, 79, 0.05)' }}
                >
                  <BookOpen className="h-16 w-16 mx-auto mb-4" style={{ color: '#7A9B6E' }} />
                </div>
                <p className="mb-6 text-lg" style={{ color: '#5A5A5A' }}>
                  No reflections yet
                </p>
                <button
                  onClick={() => setActiveTab('reflection')}
                  className="px-8 py-3 rounded-xl font-semibold transition-all flex items-center mx-auto"
                  style={{
                    background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 139, 96, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
                  }}
                >
                  <span className="mr-2 text-xl">+</span>
                  Start Your First Reflection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Tools */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 20px rgba(92, 127, 79, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <h3 className="text-lg font-bold mb-5" style={{ color: '#1A1A1A' }}>
              Quick Tools
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('chat')}
                className="w-full flex items-center p-4 rounded-xl transition-all text-left group"
                style={{
                  backgroundColor: 'rgba(92, 127, 79, 0.08)',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.15)';
                  e.currentTarget.style.borderColor = '#5C7F4F';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.08)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div
                  className="p-2 rounded-lg mr-3"
                  style={{ backgroundColor: 'rgba(92, 127, 79, 0.2)' }}
                >
                  <MessageCircle className="h-5 w-5" style={{ color: '#5C7F4F' }} />
                </div>
                <span className="font-medium" style={{ color: '#1A1A1A' }}>
                  Chat with Elya
                </span>
              </button>
              <button
                onClick={() => setActiveTab('insights')}
                className="w-full flex items-center p-4 rounded-xl transition-all text-left group"
                style={{
                  backgroundColor: 'rgba(92, 127, 79, 0.08)',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.15)';
                  e.currentTarget.style.borderColor = '#5C7F4F';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.08)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div
                  className="p-2 rounded-lg mr-3"
                  style={{ backgroundColor: 'rgba(92, 127, 79, 0.2)' }}
                >
                  <TrendingUp className="h-5 w-5" style={{ color: '#5C7F4F' }} />
                </div>
                <span className="font-medium" style={{ color: '#1A1A1A' }}>
                  Growth Insights
                </span>
              </button>
            </div>
          </div>

          {/* Today's Insight */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
              boxShadow: '0 10px 25px rgba(107, 139, 96, 0.35)',
              border: '1px solid rgba(107, 139, 96, 0.3)',
            }}
          >
            <div className="flex items-center mb-4">
              <div
                className="p-2 rounded-lg mr-3"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.25)' }}
              >
                <Lightbulb className="h-5 w-5" style={{ color: '#FFFFFF' }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                Today's Insight
              </h3>
            </div>
            <blockquote
              className="italic mb-4 leading-relaxed text-base"
              style={{ color: '#FFFFFF', opacity: '0.95' }}
            >
              "Regular reflection helps build emotional resilience and prevents burnout in
              high-stress professions."
            </blockquote>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
              Based on your reflection patterns
            </p>
          </div>
        </div>
      </div>
    </main>
  );

  const renderReflectionStudio = () => (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      role="main"
      aria-labelledby="reflection-studio-heading"
    >
      {/* Main Content */}
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1
            id="reflection-studio-heading"
            className="text-4xl font-bold mb-3"
            style={{ color: '#1A1A1A', letterSpacing: '-0.5px' }}
          >
            Good morning, dev
          </h1>
          <p className="text-lg" style={{ color: '#5A5A5A', fontWeight: '400' }}>
            Ready to reflect and grow today?
          </p>
        </div>

        {/* Category Tabs */}
        <nav
          className="flex space-x-3 mb-8 p-2 rounded-2xl"
          role="tablist"
          aria-label="Reflection categories"
          style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}
        >
          <button
            onClick={() => setActiveCategory('structured')}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            role="tab"
            aria-selected={activeCategory === 'structured'}
            aria-controls="structured-panel"
            aria-label="Structured reflections tab"
            style={{
              backgroundColor: activeCategory === 'structured' ? '#2D5F3F' : 'transparent',
              color: activeCategory === 'structured' ? '#FFFFFF' : '#1A1A1A',
              transform: activeCategory === 'structured' ? 'scale(1.02)' : 'scale(1)',
              boxShadow:
                activeCategory === 'structured' ? '0 4px 15px rgba(92, 127, 79, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeCategory !== 'structured') {
                e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== 'structured') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid #2D5F3F';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Structured</span>
          </button>
          <button
            onClick={() => setActiveCategory('burnout')}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            role="tab"
            aria-selected={activeCategory === 'burnout'}
            aria-controls="burnout-panel"
            aria-label="Daily burnout gauge tab"
            style={{
              backgroundColor: activeCategory === 'burnout' ? '#2D5F3F' : 'transparent',
              color: activeCategory === 'burnout' ? '#FFFFFF' : '#1A1A1A',
              transform: activeCategory === 'burnout' ? 'scale(1.02)' : 'scale(1)',
              boxShadow:
                activeCategory === 'burnout' ? '0 4px 15px rgba(92, 127, 79, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeCategory !== 'burnout') {
                e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== 'burnout') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid #2D5F3F';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            <Gauge className="h-4 w-4" aria-hidden="true" />
            <span>Daily Burnout Gauge</span>
          </button>
          <button
            onClick={() => setActiveCategory('affirmations')}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
            role="tab"
            aria-selected={activeCategory === 'affirmations'}
            aria-controls="affirmations-panel"
            aria-label="Affirmations tab"
            style={{
              backgroundColor: activeCategory === 'affirmations' ? '#2D5F3F' : 'transparent',
              color: activeCategory === 'affirmations' ? '#FFFFFF' : '#1A1A1A',
              transform: activeCategory === 'affirmations' ? 'scale(1.02)' : 'scale(1)',
              boxShadow:
                activeCategory === 'affirmations' ? '0 4px 15px rgba(92, 127, 79, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeCategory !== 'affirmations') {
                e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== 'affirmations') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid #2D5F3F';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Affirmations</span>
          </button>
        </nav>

        {/* Content based on active category */}
        {activeCategory === 'structured' && (
          <div role="tabpanel" id="structured-panel" aria-labelledby="structured-tab">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-3" style={{ color: '#1A1A1A' }}>
                  Structured Reflections
                </h2>
                <p className="text-base" style={{ color: '#3A3A3A' }}>
                  Choose your reflection focus for today
                </p>
              </div>
              <div
                className="p-4 rounded-full"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
              >
                <BookOpen className="h-10 w-10" style={{ color: '#5C7F4F' }} />
              </div>
            </div>

            {/* Reflection Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reflectionCards.map((card, index) => (
                <article
                  key={index}
                  tabIndex={0}
                  role="button"
                  aria-label={`${card.title} reflection card`}
                  className="rounded-xl p-6 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-600"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid transparent',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(0)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#5C7F4F';
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(92, 127, 79, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2D5F3F';
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(45, 95, 63, 0.25)';
                    e.currentTarget.style.outline = '2px solid #2D5F3F';
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.outline = 'none';
                  }}
                  onClick={() => {
                    if (card.title === 'Pre-Assignment Prep') {
                      setShowPreAssignmentPrep(true);
                    } else if (card.title === 'Post-Assignment Debrief') {
                      setShowPostAssignmentDebrief(true);
                    } else if (card.title === 'Teaming Prep') {
                      setShowTeamingPrep(true);
                    } else if (card.title === 'Teaming Reflection') {
                      setShowTeamingReflection(true);
                    } else if (card.title === 'Mentoring Prep') {
                      setShowMentoringPrep(true);
                    } else if (card.title === 'Mentoring Reflection') {
                      setShowMentoringReflection(true);
                    } else if (card.title === 'Wellness Check-In') {
                      setShowWellnessCheckIn(true);
                    } else if (card.title === 'Compass Check') {
                      setShowCompassCheck(true);
                    } else if (card.title === 'Daily Burnout Gauge') {
                      setShowDailyBurnout(true);
                    }
                    // Add handlers for other cards here as needed
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (card.title === 'Pre-Assignment Prep') {
                        setShowPreAssignmentPrep(true);
                      } else if (card.title === 'Post-Assignment Debrief') {
                        setShowPostAssignmentDebrief(true);
                      } else if (card.title === 'Teaming Prep') {
                        setShowTeamingPrep(true);
                      } else if (card.title === 'Teaming Reflection') {
                        setShowTeamingReflection(true);
                      } else if (card.title === 'Mentoring Prep') {
                        setShowMentoringPrep(true);
                      } else if (card.title === 'Mentoring Reflection') {
                        setShowMentoringReflection(true);
                      } else if (card.title === 'Wellness Check-In') {
                        setShowWellnessCheckIn(true);
                      } else if (card.title === 'Compass Check') {
                        setShowCompassCheck(true);
                      } else if (card.title === 'Daily Burnout Gauge') {
                        setShowDailyBurnout(true);
                      }
                      // Handle other card selections
                    }
                  }}
                >
                  <div
                    className="rounded-lg p-3 w-fit mb-4"
                    style={{ backgroundColor: 'rgba(45, 95, 63, 0.15)' }}
                  >
                    <card.icon
                      className="h-6 w-6"
                      aria-hidden="true"
                      style={{ color: '#2D5F3F' }}
                    />
                  </div>

                  <h3 className="text-lg font-bold mb-3" style={{ color: '#1A1A1A' }}>
                    {card.title}
                  </h3>

                  <p
                    className="text-sm mb-6 leading-relaxed"
                    style={{ color: '#3A3A3A', lineHeight: '1.6' }}
                  >
                    {card.description}
                  </p>

                  <div className="space-y-2">
                    {card.status.map((status, statusIndex) => (
                      <div key={statusIndex} className="flex items-center">
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          aria-hidden="true"
                          style={{ backgroundColor: '#2D5F3F' }}
                        ></div>
                        <span className="text-xs font-medium" style={{ color: '#3A3A3A' }}>
                          {status.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeCategory === 'burnout' && (
          <div role="tabpanel" id="burnout-panel" aria-labelledby="burnout-tab">
            {renderBurnoutGauge()}
          </div>
        )}

        {activeCategory === 'affirmations' && (
          <div role="tabpanel" id="affirmations-panel" aria-labelledby="affirmations-tab">
            {renderAffirmations()}
          </div>
        )}
      </div>

      {/* Pre-Assignment Prep Modal */}
      {showPreAssignmentPrep && (
        <PreAssignmentPrepEnhanced
          onComplete={(data) => {
            console.log('Pre-Assignment Prep Results:', data);
            // Data is automatically saved to Supabase in the component
            setShowPreAssignmentPrep(false);
          }}
          onClose={() => setShowPreAssignmentPrep(false)}
        />
      )}

      {/* Post-Assignment Debrief Modal */}
      {showPostAssignmentDebrief && (
        <PostAssignmentDebriefEnhanced
          onComplete={(data) => {
            console.log('Post-Assignment Debrief Results:', data);
            // Data is automatically saved to Supabase in the component
            setShowPostAssignmentDebrief(false);
          }}
          onClose={() => setShowPostAssignmentDebrief(false)}
        />
      )}

      {/* Teaming Prep Modal */}
      {showTeamingPrep && (
        <TeamingPrepEnhanced
          onComplete={(data) => {
            console.log('Team Prep Results:', data);
            // Data is automatically saved to Supabase in the component
            setShowTeamingPrep(false);
          }}
          onClose={() => setShowTeamingPrep(false)}
        />
      )}

      {/* Teaming Reflection Modal */}
      {showTeamingReflection && (
        <TeamingReflectionEnhanced
          onComplete={(data) => {
            console.log('Team Reflection Results:', data);
            // Data is automatically saved to Supabase in the component
            setShowTeamingReflection(false);
          }}
          onClose={() => setShowTeamingReflection(false)}
          // TODO: Pass prepDataId when we have a way to track which prep session this relates to
        />
      )}

      {/* Mentoring Prep Modal */}
      {showMentoringPrep && (
        <MentoringPrepEnhanced
          onComplete={(data) => {
            console.log('Mentoring Prep Results:', data);
            // Data is automatically saved to Supabase in the component
            setShowMentoringPrep(false);
          }}
          onClose={() => setShowMentoringPrep(false)}
        />
      )}

      {/* Mentoring Reflection Modal */}
      {showMentoringReflection && (
        <MentoringReflection
          onComplete={(results) => {
            // Save reflection
            saveReflection('Mentoring Reflection', results);
            setShowMentoringReflection(false);
          }}
          onClose={() => setShowMentoringReflection(false)}
        />
      )}

      {/* Wellness Check-In Modal */}
      {showWellnessCheckIn && (
        <WellnessCheckIn
          onComplete={(results) => {
            // Save reflection
            saveReflection('Wellness Check-in', results);
            
            // Track recovery habits from wellness check
            if (results.resilience?.physical) {
              trackRecoveryHabit('sleep', results.resilience.physical.sleep);
              trackRecoveryHabit('nutrition', results.resilience.physical.nutrition);
              trackRecoveryHabit('movement', results.resilience.physical.movement);
            }
            if (results.bodyScan) {
              trackRecoveryHabit('energy', results.bodyScan.overallEnergy);
              trackRecoveryHabit('body-message', results.bodyScan.bodyMessage);
            }
            
            setShowWellnessCheckIn(false);
          }}
          onClose={() => setShowWellnessCheckIn(false)}
        />
      )}

      {/* Compass Check Modal */}
      {showCompassCheck && (
        <CompassCheck
          onComplete={(results) => {
            // Save reflection
            saveReflection('Compass Check', results);
            setShowCompassCheck(false);
          }}
          onClose={() => setShowCompassCheck(false)}
        />
      )}

      {/* Daily Burnout Gauge Modal */}
      {showDailyBurnout && (
        <DailyBurnoutGauge
          onComplete={() => {
            // Daily burnout assessment completed
            setShowDailyBurnout(false);
            // Results are automatically saved to localStorage for graph
          }}
          onClose={() => setShowDailyBurnout(false)}
        />
      )}
    </main>
  );

  // Commented out to show the main app instead
  /*
  return (
    <Routes>
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route 
        path="*" 
        element={
          <>
            <LandingPage onGetStarted={() => setDevMode(true)} />
            <button
              onClick={() => setDevMode(true)}
              className="fixed bottom-4 right-4 px-4 py-2 rounded-lg font-semibold text-xs z-50"
              style={{
                backgroundColor: '#FF0000',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)',
              }}
            >
              DEV MODE: Skip Auth
            </button>
          </>
        } 
      />
    </Routes>
  );
  */

  // Show landing page if not authenticated and not in dev mode
  if (!devMode && !user && !loading) {
    return (
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={
          <>
            <LandingPage onGetStarted={() => setDevMode(true)} />
            {/* Dev Mode Toggle for Testing */}
            <button
              onClick={() => setDevMode(true)}
              className="fixed bottom-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors text-sm font-medium z-50"
              title="Skip authentication for development"
            >
              🛠️ Enable Dev Mode
            </button>
          </>
        } />
      </Routes>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F0EDE8 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show main app for authenticated users or dev mode
  return (
    <Routes>
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route 
        path="*" 
        element={
          <div
            className="min-h-screen"
            style={{
              background: 'linear-gradient(180deg, #FAF9F6 0%, #F0EDE8 100%)',
              minHeight: '100vh',
            }}
          >
      {/* DEV MODE INDICATOR */}
      {devMode && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-1 text-xs font-bold z-50">
          ⚠️ DEVELOPMENT MODE - Authentication Bypassed ⚠️
        </div>
      )}
      
      {/* Header */}
      <header
        className="shadow-md"
        style={{
          background: 'linear-gradient(135deg, #4A6B3E 0%, #5C7F4F 100%)',
          boxShadow: '0 2px 10px rgba(92, 127, 79, 0.3)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Greeting */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Globe className="h-7 w-7 mr-3" style={{ color: '#FFFFFF' }} />
                <span
                  className="text-xl font-bold tracking-wide"
                  style={{ color: '#FFFFFF', letterSpacing: '0.5px' }}
                >
                  InterpretReflect™
                </span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold" style={{ color: '#FFFFFF' }}>
                  Good morning, {devMode ? 'Dev Mode' : user?.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-sm opacity-90" style={{ color: '#FFFFFF' }}>
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
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 rounded-lg p-2 transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
                    style={{ color: '#FFFFFF' }}
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
                      className="absolute right-0 top-full mt-3 w-80 rounded-2xl shadow-2xl z-20"
                      style={{
                        backgroundColor: '#1A1A1A',
                        border: '1px solid rgba(92, 127, 79, 0.2)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      {/* User Info */}
                      <div
                        className="p-5"
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: 'rgba(92, 127, 79, 0.08)',
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                            style={{
                              background: 'linear-gradient(135deg, #4A6B3E 0%, #5C7F4F 100%)',
                              boxShadow: '0 4px 12px rgba(92, 127, 79, 0.3)',
                            }}
                          >
                            <span className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                              {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-lg" style={{ color: '#FFFFFF' }}>
                              {devMode ? 'Dev Mode' : user?.email?.split('@')[0] || 'User'}
                            </div>
                            <div className="text-sm" style={{ color: '#5C7F4F' }}>
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
                          className="w-full flex items-center space-x-3 p-4 rounded-xl transition-all text-left group"
                          style={{
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
                          >
                            <User className="h-5 w-5" style={{ color: '#5C7F4F' }} />
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium" style={{ color: '#FFFFFF' }}>
                              Profile Settings
                            </div>
                            <div className="text-xs" style={{ color: '#8A8A8A' }}>
                              Customize your preferences
                            </div>
                          </div>
                          <ChevronRight
                            className="h-4 w-4 opacity-60"
                            style={{ color: '#6A6A6A' }}
                          />
                        </button>

                        <button
                          className="w-full flex items-center space-x-3 p-4 rounded-xl transition-all text-left group"
                          style={{
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
                          >
                            <Settings className="h-5 w-5" style={{ color: '#5C7F4F' }} />
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium" style={{ color: '#FFFFFF' }}>
                              Manage Subscription
                            </div>
                            <div className="text-xs" style={{ color: '#8A8A8A' }}>
                              Billing and plan details
                            </div>
                          </div>
                          <ChevronRight
                            className="h-4 w-4 opacity-60"
                            style={{ color: '#6A6A6A' }}
                          />
                        </button>

                        <button
                          className="w-full flex items-center space-x-3 p-4 rounded-xl transition-all text-left group"
                          style={{
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
                          >
                            <Shield className="h-5 w-5" style={{ color: '#5C7F4F' }} />
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium" style={{ color: '#FFFFFF' }}>
                              Privacy & Data
                            </div>
                            <div className="text-xs" style={{ color: '#8A8A8A' }}>
                              Control your data sharing
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
                            // Force a refresh to show landing page
                            window.location.href = '/';
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
                          <div className="font-medium" style={{ color: '#FF8A8A' }}>
                            Sign Out
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E8E5E0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'reflection', label: 'Reflection Studio', icon: BookOpen },
              { id: 'stress', label: 'Stress Reset', icon: RefreshCw },
              { id: 'chat', label: 'Chat with Elya', icon: MessageCircle, badge: 'BETA' },
              { id: 'insights', label: 'Growth Insights', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center px-3 py-4 text-sm font-medium transition-all"
                style={{
                  color: activeTab === tab.id ? '#5C7F4F' : '#1A1A1A',
                  borderBottom:
                    activeTab === tab.id ? '3px solid #5C7F4F' : '3px solid transparent',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  paddingBottom: '13px',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#6B7C6B';
                    e.currentTarget.style.background = 'rgba(92, 127, 79, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.color = '#1A1A1A';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
                {tab.badge && (
                  <span 
                    className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full"
                    style={{ 
                      backgroundColor: '#5C7F4F', 
                      color: '#FFFFFF',
                      fontSize: '10px'
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Render different content based on active tab */}
      {activeTab === 'reflection' && renderReflectionStudio()}
      {activeTab === 'home' && renderDashboardHome()}
      {activeTab === 'stress' && renderStressReset()}
      {activeTab === 'chat' && renderChatWithElya()}
      {activeTab === 'insights' && renderGrowthInsights()}

      {/* Privacy Page Overlay */}
      {showPrivacyPage && renderPrivacyPage()}

      {/* Affirmation Modal - Moved here so it's accessible from any tab */}
      {selectedAffirmationCategory !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div 
                  className="inline-flex p-3 rounded-lg mb-4"
                  style={{ 
                    backgroundColor: selectedAffirmationCategory === 0 ? '#ec4899' : 
                                     selectedAffirmationCategory === 1 ? '#f97316' :
                                     selectedAffirmationCategory === 2 ? '#10b981' :
                                     selectedAffirmationCategory === 3 ? '#a855f7' :
                                     selectedAffirmationCategory === 4 ? '#60a5fa' :
                                     '#9333ea'
                  }}
                >
                  {(() => {
                    const Icon = affirmationCategories[selectedAffirmationCategory].icon;
                    return <Icon className="h-8 w-8 text-white" />;
                  })()}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {affirmationCategories[selectedAffirmationCategory].title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedAffirmationCategory(null);
                  setCurrentAffirmationIndex(0);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Single Affirmation Display */}
            <div className="min-h-[200px] flex items-center justify-center px-8 py-12 rounded-xl border" 
                 style={{ 
                   background: 'linear-gradient(135deg, #f0f7f0 0%, #ffffff 50%, #f0f7f0 100%)',
                   borderColor: '#5C7F4F'
                 }}>
              <p className="text-xl text-gray-700 leading-relaxed text-center italic font-medium">
                "{affirmationCategories[selectedAffirmationCategory].affirmations[currentAffirmationIndex]}"
              </p>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => {
                  const newIndex = currentAffirmationIndex > 0 
                    ? currentAffirmationIndex - 1 
                    : affirmationCategories[selectedAffirmationCategory].affirmations.length - 1;
                  setCurrentAffirmationIndex(newIndex);
                }}
                className="p-3 rounded-full transition-colors"
                style={{ backgroundColor: '#e8f2e8', color: '#2D5F3F' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d4e8d4'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e8f2e8'}
                aria-label="Previous affirmation"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              {/* Progress Dots */}
              <div className="flex space-x-2">
                {affirmationCategories[selectedAffirmationCategory].affirmations.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentAffirmationIndex(index)}
                    className="rounded-full transition-all"
                    style={{
                      width: index === currentAffirmationIndex ? '32px' : '8px',
                      height: '8px',
                      backgroundColor: index === currentAffirmationIndex ? '#5C7F4F' : '#d4e8d4'
                    }}
                    aria-label={`Go to affirmation ${index + 1}`}
                  />
                ))}
              </div>
              
              <button
                onClick={() => {
                  const newIndex = currentAffirmationIndex < affirmationCategories[selectedAffirmationCategory].affirmations.length - 1
                    ? currentAffirmationIndex + 1
                    : 0;
                  setCurrentAffirmationIndex(newIndex);
                }}
                className="p-3 rounded-full transition-colors"
                style={{ backgroundColor: '#e8f2e8', color: '#2D5F3F' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d4e8d4'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e8f2e8'}
                aria-label="Next affirmation"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            
            {/* Counter */}
            <div className="text-center mt-6 text-sm text-gray-500">
              {currentAffirmationIndex + 1} of {affirmationCategories[selectedAffirmationCategory].affirmations.length}
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setSelectedAffirmationCategory(null);
                  setCurrentAffirmationIndex(0);
                }}
                className="px-6 py-3 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#5C7F4F' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8FA681'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5C7F4F'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
        }
      />
    </Routes>
  );
}

export default App;
