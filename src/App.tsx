import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import type { BurnoutData, ViewMode } from './types';
import LandingPageEnhanced from './LandingPageEnhanced';
import { Logo } from './components/Logo';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { PrivacyConsent } from './components/PrivacyConsent';
import { SecurityBanner, SessionTimeoutModal } from './components/SecurityBanner';
import { SessionManager } from './utils/security';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Accessibility } from './pages/Accessibility';
import { PricingNew } from './pages/PricingNew';
import { PricingTest } from './pages/PricingTest';
import { HeaderDemo } from './pages/HeaderDemo';
import { SubscriptionManager } from './components/SubscriptionManager';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PreAssignmentPrepAccessible as PreAssignmentPrepEnhanced } from './components/PreAssignmentPrepAccessible';
import { PostAssignmentDebriefAccessible as PostAssignmentDebriefEnhanced } from './components/PostAssignmentDebriefAccessible';
import { TeamingPrepEnhanced } from './components/TeamingPrepEnhanced';
import { WellnessCheckInAccessible } from './components/WellnessCheckInAccessible';
import { EthicsMeaningCheckAccessible } from './components/EthicsMeaningCheckAccessible';
import { BreathingPractice } from './components/BreathingPracticeFriend';
import { BodyCheckInAccessible as BodyCheckIn } from './components/BodyCheckInAccessible';
import { TechnologyFatigueResetAccessible as TechnologyFatigueReset } from './components/TechnologyFatigueResetAccessible';
import { EmotionMappingAccessible as EmotionMapping } from './components/EmotionMappingAccessible';
import { ProfessionalBoundariesResetAccessible as ProfessionalBoundariesReset } from './components/ProfessionalBoundariesResetAccessible';
import { TemperatureExploration } from './components/TemperatureExploration';
import { AssignmentResetAccessible as AssignmentReset } from './components/AssignmentResetAccessible';
import { DailyBurnoutGaugeAccessible as DailyBurnoutGauge } from './components/DailyBurnoutGaugeAccessible';
import { AffirmationStudioAccessible } from './components/AffirmationStudioAccessible';
import { AffirmationReflectionStudio } from './components/AffirmationReflectionStudio';
import { TeamReflectionJourneyAccessible } from './components/TeamReflectionJourneyAccessible';
import { BurnoutGauge } from './components/BurnoutGauge';
import { MentoringPrepAccessible } from './components/MentoringPrepAccessible';
import { MentoringReflectionAccessible } from './components/MentoringReflectionAccessible';
import { ChatWithElya } from './components/ChatWithElya';
import { GrowthInsights } from './components/GrowthInsights';
import { GrowthInsightsDashboard } from './components/GrowthInsightsDashboard';
import { GrowthInsightsEnhanced } from './components/GrowthInsightsEnhanced';
import { ProfileSettings } from './components/ProfileSettings';
import { CustomizePreferences } from './components/CustomizePreferences';
import { ManageSubscription } from './components/ManageSubscription';
import { BillingPlanDetails } from './components/BillingPlanDetails';
import { LuxuryWellnessDashboard } from './components/LuxuryWellnessDashboard';
import { Footer } from './components/Footer';
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
  Eye,
  Languages,
  ArrowLeft,
  Star,
  Activity,
  BarChart3,
  Triangle,
  CheckCircle,
  AlertTriangle,
  Zap,
  ChevronRight,
  Lock,
  Database,
  Settings as SettingsIcon,
  Download,
  X,
} from 'lucide-react';

function App() {
  const { user, loading, signOut, extendSession } = useAuth();
  // Automatically enable dev mode in development environment
  const [devMode, setDevMode] = useState(
    import.meta.env.DEV || // Vite development mode
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  );
  // Load saved tab preference or default to home
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('preferredTab');
    return savedTab || 'home'; // Default to home tab for authenticated users
  });
  const [activeCategory, setActiveCategory] = useState('structured');
  const [insightsTimePeriod, setInsightsTimePeriod] = useState('month');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [techniqueProgress, setTechniqueProgress] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold-in' | 'exhale' | 'hold-out'>(
    'inhale'
  );
  const [breathCycle, setBreathCycle] = useState(0);
  const [bodyPart, setBodyPart] = useState(0); // For body release
  const [bodyAwarenessTime, setBodyAwarenessTime] = useState(60); // Default 1 minute in seconds
  const [bodyAwarenessMethod, setBodyAwarenessMethod] = useState<'move' | 'picture' | 'breathe' | 'touch' | 'still'>('still');
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
  const [showEthicsMeaningCheck, setShowEthicsMeaningCheck] = useState(false);
  const [showBreathingPractice, setShowBreathingPractice] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [breathingMode, setBreathingMode] = useState<'gentle' | 'deep'>('gentle');
  const [showBodyCheckIn, setShowBodyCheckIn] = useState(false);
  const [showBodyCheckInModal, setShowBodyCheckInModal] = useState(false);
  const [bodyCheckInMode, setBodyCheckInMode] = useState<'quick' | 'full'>('quick');
  const [showProfessionalBoundariesReset, setShowProfessionalBoundariesReset] = useState(false);
  const [showTemperatureExploration, setShowTemperatureExploration] = useState(false);
  const [showAssignmentReset, setShowAssignmentReset] = useState(false);
  const [showTechnologyFatigueReset, setShowTechnologyFatigueReset] = useState(false);
  const [showEmotionMapping, setShowEmotionMapping] = useState(false);
  const [showDailyBurnout, setShowDailyBurnout] = useState(false);
  const [showAffirmationStudio, setShowAffirmationStudio] = useState(false);
  const [showFiveZoneModal, setShowFiveZoneModal] = useState(false);
  const [techFatigueMode, setTechFatigueMode] = useState<'quick' | 'deep'>('quick');
  const [showAssignmentResetModal, setShowAssignmentResetModal] = useState(false);
  const [assignmentResetMode, setAssignmentResetMode] = useState<'fast' | 'full'>('fast');
  const [showBoundariesModal, setShowBoundariesModal] = useState(false);
  const [boundariesResetMode, setBoundariesResetMode] = useState<'quick' | 'deeper'>('quick');
  const [showEmotionMappingModal, setShowEmotionMappingModal] = useState(false);
  const [emotionMappingMode, setEmotionMappingMode] = useState<'quick' | 'deeper'>('quick');
  const [savedReflections, setSavedReflections] = useState<Record<string, unknown>[]>([]);
  const [techniqueUsage, setTechniqueUsage] = useState<Record<string, unknown>[]>([]);
  const [currentTechniqueId, setCurrentTechniqueId] = useState<string | null>(null);
  const [recoveryHabits, setRecoveryHabits] = useState<Record<string, unknown>[]>([]);
  const [burnoutData, setBurnoutData] = useState<BurnoutData[]>([]);
  const [showSummaryView, setShowSummaryView] = useState<ViewMode>('daily');
  
  // Security state
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  const sessionManager = SessionManager.getInstance();

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
  
  // Check for privacy consent on mount
  useEffect(() => {
    const checkPrivacyConsent = () => {
      const consent = localStorage.getItem('privacyConsent');
      if (!consent && user) {
        setShowPrivacyConsent(true);
      }
    };
    checkPrivacyConsent();
  }, [user]);
  
  // Listen for session warning events
  useEffect(() => {
    const handleSessionWarning = (event: CustomEvent) => {
      setSessionTimeRemaining(event.detail.timeRemaining);
      setShowSessionWarning(true);
    };

    window.addEventListener('sessionWarning', handleSessionWarning as EventListener);
    return () => {
      window.removeEventListener('sessionWarning', handleSessionWarning as EventListener);
    };
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
              <h2
                id="growth-insights-heading"
                className="text-4xl font-bold mb-2"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}
              >
                Growth Insights
              </h2>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                Past Month: {savedReflections.length} total reflections
              </p>
            </div>

            <nav
              className="flex space-x-2 p-2 rounded-xl"
              role="tablist"
              aria-label="Time period selector"
              style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}
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
                  color: insightsTimePeriod === 'week' ? 'var(--text-inverse)' : 'var(--text-primary)',
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
                  color: insightsTimePeriod === 'month' ? 'var(--text-inverse)' : 'var(--text-primary)',
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
                  color: insightsTimePeriod === '90days' ? 'var(--text-inverse)' : 'var(--text-primary)',
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
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 10px 30px rgba(92, 127, 79, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(92, 127, 79, 0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              id="stress-energy-chart-heading"
              className="text-2xl font-bold"
              style={{ color: 'var(--primary-900)' }}
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
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
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
                      <Activity className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--primary-400)' }} />
                      <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        No stress or energy data yet
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        Complete reflections to see your trends
                      </p>
                    </div>
                  );
                }
                
                // TODO: Implement actual chart rendering when we have data
                return (
                  <div className="text-center">
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
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
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 10px 30px rgba(92, 127, 79, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(92, 127, 79, 0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                id="burnout-trend-heading"
                className="text-2xl font-bold"
                style={{ color: 'var(--primary-900)' }}
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
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
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
              <Lightbulb className="h-5 w-5" aria-hidden="true" style={{ color: '#1A3D26' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#0D3A14' }}>
              Your Reset Toolkit Insights
            </h2>
            <span className="text-sm ml-auto" style={{ color: '#525252' }}>
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
                backgroundColor: 'var(--bg-card)',
                border: '2px solid var(--primary-600)',
                boxShadow: '0 4px 12px rgba(92, 127, 79, 0.2)',
              }}
            >
              <div
                className="flex items-center text-sm font-semibold mb-2"
                style={{ color: 'var(--primary-900)' }}
              >
                <Star className="h-4 w-4 mr-2" aria-hidden="true" style={{ color: '#1A3D26' }} />
                Most Effective
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: '#0D3A14' }}>
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
              <div className="text-sm" style={{ color: '#0D3A14' }}>
                {techniqueUsage.length > 0 ? 'Most used technique' : 'Start using techniques'}
              </div>
            </div>

            <div
              className="rounded-xl p-5 transition-all"
              style={{
                backgroundColor: 'var(--bg-card)',
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
              <div className="text-2xl font-bold mb-1" style={{ color: '#0D3A14' }}>
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
                backgroundColor: 'var(--bg-card)',
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
              <div className="text-2xl font-bold mb-1" style={{ color: '#0D3A14' }}>
                -
              </div>
              <div className="text-sm" style={{ color: '#8B7AA8' }}>
                No stress reset data yet
              </div>
            </div>

            <div
              className="rounded-xl p-5 transition-all"
              style={{
                backgroundColor: 'var(--bg-card)',
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
              <div className="text-2xl font-bold mb-1" style={{ color: '#0D3A14' }}>
                {(() => {
                  const techniques = ['box-breathing', 'body-release', 'temperature-shift', 'sensory-reset', 'expansion-practice', 'tech-fatigue-reset'];
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
              backgroundColor: 'var(--bg-card)',
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
            <div className="text-3xl font-bold mb-2" style={{ color: '#0D3A14' }}>
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
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E8E5E0',
            }}
          >
            <div className="flex items-center mb-2">
              <div
                className="p-2 rounded-lg mr-2"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
              >
                <TrendingUp className="h-4 w-4" aria-hidden="true" style={{ color: '#1A3D26' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#0D3A14' }}>
                Stress Change
              </span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: '#0D3A14' }}>
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
              backgroundColor: 'var(--bg-card)',
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
            <div className="text-3xl font-bold mb-2" style={{ color: '#0D3A14' }}>
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
              backgroundColor: 'var(--bg-card)',
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
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E8E5E0',
            }}
          >
            <div className="flex items-center mb-2">
              <div
                className="p-2 rounded-lg mr-2"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
              >
                <Users className="h-4 w-4" aria-hidden="true" style={{ color: '#1A3D26' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#0D3A14' }}>
                Team Plan Kept
              </span>
            </div>
            <div className="text-3xl font-bold mb-2" style={{ color: '#0D3A14' }}>
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
              backgroundColor: 'var(--bg-card)',
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
            <div className="text-3xl font-bold mb-2" style={{ color: '#0D3A14' }}>
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
              backgroundColor: 'var(--bg-card)',
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
              backgroundColor: 'var(--bg-card)',
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
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E8E5E0',
            }}
          >
            <h3
              id="recovery-habits-heading"
              className="text-lg font-bold mb-5"
              style={{ color: 'var(--primary-900)' }}
            >
              Recovery Habits
            </h3>

            <div className="mb-5">
              <div className="flex justify-between text-sm mb-3">
                <span style={{ color: '#525252' }}>Recovery Balance Index</span>
                <span className="font-bold" style={{ color: '#0D3A14' }}>
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
                    background: 'linear-gradient(90deg, #1A3D26 0%, #0F2818 100%)',
                  }}
                ></div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3" style={{ color: '#0D3A14' }}>
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
                                <CheckCircle className="h-4 w-4 mr-2" style={{ color: '#1A3D26' }} />
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
                        style={{ color: 'var(--primary-800)' }}
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
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E8E5E0',
            }}
          >
            <h3
              id="teamwork-check-heading"
              className="text-lg font-bold mb-5"
              style={{ color: 'var(--primary-900)' }}
            >
              Teamwork Check
            </h3>

            <div className="mb-5">
              <div className="flex justify-between text-sm mb-3">
                <span style={{ color: '#525252' }}>Agreements Fidelity</span>
                <span className="font-bold" style={{ color: '#0D3A14' }}>
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
              <h4 className="font-semibold mb-3" style={{ color: '#0D3A14' }}>
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
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E8E5E0',
            }}
          >
            <h3
              id="values-tough-calls-heading"
              className="text-lg font-bold mb-5"
              style={{ color: 'var(--primary-900)' }}
            >
              Values & Tough Calls
            </h3>

            <div className="mb-5">
              <h4 className="font-semibold mb-3" style={{ color: '#0D3A14' }}>
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
              <h4 className="font-semibold mb-3" style={{ color: '#0D3A14' }}>
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
              border: '2px solid var(--primary-600)',
            }}
          >
            <h3 className="font-bold text-lg mb-4" style={{ color: '#0D3A14' }}>
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
            background: 'linear-gradient(135deg, #1A3D26 0%, #0F2818 100%)',
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

  const renderChatWithElya = () => (
    <div className="h-full flex flex-col overflow-hidden">
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


  const renderStressReset = () => (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      role="main"
      aria-labelledby="stress-reset-heading"
    >
      <header className="text-center mb-12">
        <div
          className="inline-block p-4 rounded-full mb-6"
          style={{ backgroundColor: 'rgba(45, 95, 63, 0.15)' }}
        >
          <RefreshCw className="h-12 w-12" aria-hidden="true" style={{ color: '#0D3A14' }} />
        </div>
        <h1
          id="stress-reset-heading"
          className="text-4xl font-bold mb-4"
          style={{ color: '#1A1A1A', letterSpacing: '-0.5px' }}
        >
          Your Personal Reset Space
        </h1>
        <p className="text-lg mb-2" style={{ color: '#2A2A2A', fontWeight: '400' }}>
          Choose what your body-mind needs right now
        </p>
        <p className="text-sm" style={{ color: '#525252' }}>
          All practices are accessible for every body and mind
        </p>
      </header>

      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        aria-label="Available reset practices"
      >
        {/* Breathing Practice */}
        <section
          className="rounded-xl p-6 transition-all group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-600"
          tabIndex={0}
          role="region"
          aria-labelledby="breathing-practice-title"
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(92, 127, 79, 0.2)';
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
              background: 'radial-gradient(circle, #1A3D26 0%, transparent 70%)',
              transform: 'translate(50%, -50%)',
            }}
          ></div>
          
          <header className="flex justify-end mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBreathingModal(true);
              }}
              className="text-sm px-4 py-3 min-h-[44px] min-w-[44px] rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                backgroundColor: '#F1F8F4',
                color: 'var(--primary-800)',
                border: '2px solid #2E7D32',
              }}
              aria-label="Learn why breathing works"
            >
              Why breathing works?
            </button>
          </header>
          
          <h3 id="breathing-practice-title" className="text-lg font-semibold mb-3" style={{ color: '#0D3A14' }}>
            Breathing Practice
          </h3>
          
          <p className="text-sm mb-4" style={{ color: '#2A2A2A', lineHeight: '1.6' }}>
            <strong>Neuroscience:</strong> Guided breathing activates your body's relaxation response, calming the nervous system after high-pressure interpreting. Research shows slow, intentional breaths balance heart rate and reduce stress hormones.
          </p>
          
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2" style={{ color: '#0D3A14' }}>
              Practice Steps:
            </p>
            <ol className="space-y-1.5 text-sm list-decimal list-inside" style={{ color: '#2A2A2A' }}>
              <li>Settle into a comfortable posture</li>
              <li>Inhale slowly through the nose (4 counts)</li>
              <li>Exhale slowly through the mouth (6 counts)</li>
              <li>Repeat for set cycles or minutes</li>
            </ol>
          </div>
          
          <div className="flex gap-2 mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBreathingMode('gentle');
                setShowBreathingPractice(true);
                const id = trackTechniqueStart('breathing-gentle');
                setCurrentTechniqueId(id);
              }}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-800)',
                border: '2px solid var(--primary-800)',
              }}
              aria-label="Start gentle 2-4 minute breathing practice"
            >
              Gentle Reset (2-4 min)
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBreathingMode('deep');
                setShowBreathingPractice(true);
                const id = trackTechniqueStart('breathing-deep');
                setCurrentTechniqueId(id);
              }}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                background: 'linear-gradient(135deg, var(--primary-800), var(--primary-900))',
                color: '#FFFFFF',
              }}
              aria-label="Start deep 5+ minute breathing practice"
            >
              Deep Reset (5+ min)
            </button>
          </div>
          
          <div className="pt-3 border-t" style={{ borderColor: 'rgba(15, 40, 24, 0.2)' }}>
            <p className="text-sm italic" style={{ color: '#4A4A4A' }}>
              Balances autonomic nervous system
            </p>
          </div>
        </section>

        {/* Body Check-In */}
        <section
          className="rounded-xl p-6 transition-all group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-600"
          tabIndex={0}
          role="region"
          aria-labelledby="body-checkin-title"
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(92, 127, 79, 0.2)';
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
              background: 'radial-gradient(circle, #1A3D26 0%, transparent 70%)',
              transform: 'translate(50%, -50%)',
            }}
          ></div>
          
          <header className="flex justify-end mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBodyCheckInModal(true);
              }}
              className="text-sm px-4 py-3 min-h-[44px] min-w-[44px] rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                backgroundColor: '#F1F8F4',
                color: 'var(--primary-800)',
                border: '2px solid #2E7D32',
              }}
              aria-label="Learn why body check-ins work"
            >
              Why this works?
            </button>
          </header>
          
          <h3 id="body-checkin-title" className="text-lg font-semibold mb-3" style={{ color: '#0D3A14' }}>
            Body Check-In
          </h3>
          
          <p className="text-sm mb-4" style={{ color: '#2A2A2A', lineHeight: '1.6' }}>
            <strong>Neuroscience:</strong> Your body holds tension patterns from interpreting stress. Somatic awareness activates the insula cortex, helping release physical holding and reset your nervous system.
          </p>
          
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2" style={{ color: '#0D3A14' }}>
              Four-Step Process:
            </p>
            <ol className="space-y-1.5 text-sm" style={{ color: '#2A2A2A' }}>
              <li>1. Pause and ground yourself</li>
              <li>2. Scan from head to toe</li>
              <li>3. Release tension points</li>
              <li>4. Breathe into open spaces</li>
            </ol>
          </div>
          
          <div className="flex gap-2 mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBodyCheckInMode('quick');
                setShowBodyCheckIn(true);
                const id = trackTechniqueStart('body-checkin-quick');
                setCurrentTechniqueId(id);
              }}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-800)',
                border: '2px solid var(--primary-800)',
              }}
              aria-label="Start quick 1-2 minute body scan"
            >
              Quick Scan (1-2 min)
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBodyCheckInMode('full');
                setShowBodyCheckIn(true);
                const id = trackTechniqueStart('body-checkin-full');
                setCurrentTechniqueId(id);
              }}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                background: 'linear-gradient(135deg, var(--primary-800), var(--primary-900))',
                color: '#FFFFFF',
              }}
              aria-label="Start full 5 minute body scan"
            >
              Full Scan (5 min)
            </button>
          </div>
          
          <div className="pt-3 border-t" style={{ borderColor: 'rgba(15, 40, 24, 0.2)' }}>
            <p className="text-sm italic" style={{ color: '#4A4A4A' }}>
              Releases interpreter tension patterns
            </p>
          </div>
        </section>

        {/* Emotion Mapping */}
        <article
          className="rounded-xl p-6 transition-all group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-600"
          tabIndex={0}
          role="article"
          aria-labelledby="emotion-mapping-title"
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
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
              background: 'radial-gradient(circle, #1A3D26 0%, transparent 70%)',
              transform: 'translate(50%, -50%)',
            }}
          ></div>

          <h3 id="emotion-mapping-title" className="text-lg font-semibold mb-3" style={{ color: '#0D3A14' }}>
            Emotion Mapping
          </h3>
          
          <p className="text-sm mb-3" style={{ color: '#2A2A2A', lineHeight: '1.6' }}>
            Strengthen resilience by identifying and naming emotions after complex interpreting scenarios.
          </p>
          
          <p className="text-sm mb-4" style={{ color: '#2A2A2A', lineHeight: '1.6' }}>
            <strong style={{ color: '#0D3A14' }}>Neuroscience-backed:</strong> Research shows that recognizing and labeling emotions calms the nervous system, reduces amygdala reactivity by 50%, and improves cognitive performance.
          </p>
          
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2" style={{ color: '#0D3A14' }}>
              Four-step process:
            </p>
            <ol className="text-xs space-y-1 list-decimal list-inside" style={{ color: '#3A3A3A' }}>
              <li><strong>Pause:</strong> Take a mindful breath and check in with yourself</li>
              <li><strong>Name:</strong> Label your emotion (tension, pride, fatigue, etc.)</li>
              <li><strong>Reflect:</strong> Notice triggers - assignment content, technology, environment</li>
              <li><strong>Compassion:</strong> Close with self-kindness and acceptance</li>
            </ol>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEmotionMappingModal(true);
              }}
              className="mt-2 text-xs font-medium underline hover:no-underline transition-all"
              style={{ color: 'var(--primary-800)' }}
              aria-label="Learn the science of emotion mapping for interpreters"
            >
              Why emotion mapping? →
            </button>
          </div>
          
          <div className="flex gap-2 mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEmotionMappingMode('quick');
                setShowEmotionMapping(true);
                const id = trackTechniqueStart('emotion-mapping-quick');
                setCurrentTechniqueId(id);
              }}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-800)',
                border: '2px solid var(--primary-800)',
              }}
              aria-label="Start quick 2-minute emotion mapping"
            >
              Quick Mapping (2 min)
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEmotionMappingMode('deeper');
                setShowEmotionMapping(true);
                const id = trackTechniqueStart('emotion-mapping-deeper');
                setCurrentTechniqueId(id);
              }}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                background: 'linear-gradient(135deg, var(--primary-800), var(--primary-900))',
                color: '#FFFFFF',
              }}
              aria-label="Start deeper 5-minute emotion reflection"
            >
              Deeper Reflection (5 min)
            </button>
          </div>
          
          <div className="pt-3 border-t" style={{ borderColor: 'rgba(15, 40, 24, 0.2)' }}>
            <p className="text-sm italic" style={{ color: '#4A4A4A' }}>
              Regulates stress response & maintains focus
            </p>
          </div>
        </article>

        {/* Professional Boundaries Reset */}
        <article
          className="rounded-xl p-6 transition-all group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-600"
          tabIndex={0}
          role="article"
          aria-labelledby="boundaries-reset-title"
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
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
              background: 'radial-gradient(circle, #1A3D26 0%, transparent 70%)',
              transform: 'translate(50%, -50%)',
            }}
          ></div>

          <h3 id="boundaries-reset-title" className="text-lg font-semibold mb-3" style={{ color: '#0D3A14' }}>
            Professional Boundaries Reset
          </h3>
          
          <p className="text-sm mb-3" style={{ color: '#2A2A2A', lineHeight: '1.6' }}>
            Reinforce healthy boundaries and protect your well-being after emotionally challenging work.
          </p>
          
          <p className="text-sm mb-4" style={{ color: '#2A2A2A', lineHeight: '1.6' }}>
            <strong style={{ color: '#0D3A14' }}>Science-backed:</strong> Behavioral research shows that intentional boundary resets increase resilience, prevent compassion fatigue, and support ethical practice.
          </p>
          
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2" style={{ color: '#0D3A14' }}>
              Three-step process:
            </p>
            <ol className="text-xs space-y-1 list-decimal list-inside" style={{ color: '#3A3A3A' }}>
              <li><strong>Reflect:</strong> Notice lingering thoughts or emotions from the assignment</li>
              <li><strong>Release:</strong> Use breath or gesture to let go of what's not yours</li>
              <li><strong>Affirm:</strong> Reinforce your role, limits, and professional identity</li>
            </ol>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBoundariesModal(true);
              }}
              className="mt-2 text-xs font-medium underline hover:no-underline transition-all"
              style={{ color: 'var(--primary-800)' }}
              aria-label="Learn why professional boundaries matter for interpreters"
            >
              Why boundaries matter? →
            </button>
          </div>
          
          <div className="flex gap-2 mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBoundariesResetMode('quick');
                setShowProfessionalBoundariesReset(true);
                const id = trackTechniqueStart('boundaries-reset-quick');
                setCurrentTechniqueId(id);
              }}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-800)',
                border: '2px solid var(--primary-800)',
              }}
              aria-label="Start quick 2-minute professional boundaries reset"
            >
              Quick Reset (2 min)
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBoundariesResetMode('deeper');
                setShowProfessionalBoundariesReset(true);
                const id = trackTechniqueStart('boundaries-reset-deeper');
                setCurrentTechniqueId(id);
              }}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                background: 'linear-gradient(135deg, var(--primary-800), var(--primary-900))',
                color: '#FFFFFF',
              }}
              aria-label="Start deeper 5-minute professional boundaries reset"
            >
              Deeper Reset (5 min)
            </button>
          </div>
          
          <div className="pt-3 border-t" style={{ borderColor: 'rgba(15, 40, 24, 0.2)' }}>
            <p className="text-sm italic" style={{ color: '#4A4A4A' }}>
              Protects against role conflict & compassion fatigue
            </p>
          </div>
        </article>

        {/* Assignment Reset */}
        <article
          className="rounded-xl p-6 transition-all group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-600"
          tabIndex={0}
          role="article"
          aria-labelledby="assignment-reset-title"
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
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
              background: 'radial-gradient(circle, #1A3D26 0%, transparent 70%)',
              transform: 'translate(50%, -50%)',
            }}
          ></div>

          <h3 id="assignment-reset-title" className="text-lg font-semibold mb-3" style={{ color: '#0D3A14' }}>
            Assignment Reset
          </h3>
          
          <p className="text-sm mb-3" style={{ color: '#2A2A2A', lineHeight: '1.6' }}>
            Transition smoothly between assignments by letting go of stress and restoring focus.
          </p>
          
          <p className="text-sm mb-4" style={{ color: '#2A2A2A', lineHeight: '1.6' }}>
            <strong style={{ color: '#0D3A14' }}>Neuroscience-backed:</strong> Brief, structured pauses help your brain transition out of stress mode and activate your body's natural relaxation response.
          </p>
          
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2" style={{ color: '#0D3A14' }}>
              What's included:
            </p>
            <ul className="text-sm space-y-1.5" style={{ color: '#2A2A2A' }}>
              <li>• Self-awareness check</li>
              <li>• Tension release & grounding</li>
              <li>• Calming breath work</li>
              <li>• Intention setting for next assignment</li>
            </ul>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAssignmentResetModal(true);
              }}
              className="mt-2 text-xs font-medium underline hover:no-underline transition-all"
              style={{ color: 'var(--primary-800)' }}
              aria-label="Learn why the Assignment Reset works"
            >
              Why this works? →
            </button>
          </div>
          
          <div className="flex gap-2 mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAssignmentResetMode('fast');
                setShowAssignmentReset(true);
                const id = trackTechniqueStart('assignment-reset-fast');
                setCurrentTechniqueId(id);
              }}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-800)',
                border: '2px solid var(--primary-800)',
              }}
              aria-label="Start fast 2-minute assignment reset"
            >
              Fast Reset (2 min)
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAssignmentResetMode('full');
                setShowAssignmentReset(true);
                const id = trackTechniqueStart('assignment-reset-full');
                setCurrentTechniqueId(id);
              }}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                background: 'linear-gradient(135deg, var(--primary-800), var(--primary-900))',
                color: '#FFFFFF',
              }}
              aria-label="Start full 5-minute assignment reset"
            >
              Full Reset (5 min)
            </button>
          </div>
          
          <div className="pt-3 border-t" style={{ borderColor: 'rgba(15, 40, 24, 0.2)' }}>
            <p className="text-sm italic" style={{ color: '#4A4A4A' }}>
              Optimized for quick transitions between appointments
            </p>
          </div>
        </article>

        {/* Technology Fatigue Reset */}
        <article
          className="rounded-xl p-6 transition-all group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-600"
          tabIndex={0}
          role="article"
          aria-labelledby="tech-fatigue-title"
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)',
            border: '2px solid transparent',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(0)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
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
              background: 'radial-gradient(circle, #1A3D26 0%, transparent 70%)',
              transform: 'translate(50%, -50%)',
            }}
          ></div>

          <h3 id="tech-fatigue-title" className="text-lg font-semibold mb-3" style={{ color: '#0D3A14' }}>
            Technology Fatigue Reset
          </h3>
          
          <p className="text-sm mb-3" style={{ color: '#2A2A2A', lineHeight: '1.6' }}>
            Restore your mind and body from screen and audio strain.
          </p>
          
          <p className="text-sm mb-4" style={{ color: '#2A2A2A', lineHeight: '1.6' }}>
            <strong style={{ color: '#0D3A14' }}>Neuroscience-backed:</strong> Reduces digital sensory overload and helps restore balance in your nervous system after interpreting online.
          </p>
          
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2" style={{ color: '#0D3A14' }}>
              Five-Zone Recovery Method:
            </p>
            <ul className="text-sm space-y-1.5" style={{ color: '#2A2A2A' }}>
              <li>• Visual rest</li>
              <li>• Posture reset</li>
              <li>• Mindful breathing</li>
              <li>• Auditory pause</li>
              <li>• Cognitive defocus</li>
            </ul>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFiveZoneModal(true);
              }}
              className="mt-2 text-xs font-medium underline hover:no-underline transition-all"
              style={{ color: 'var(--primary-800)' }}
              aria-label="Learn why these five zones help with technology fatigue"
            >
              Why these 5 zones? →
            </button>
          </div>
          
          <div className="flex gap-2 mb-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTechFatigueMode('quick');
                setShowTechnologyFatigueReset(true);
                const id = trackTechniqueStart('tech-fatigue-reset-quick');
                setCurrentTechniqueId(id);
              }}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-800)',
                border: '2px solid var(--primary-800)',
              }}
              aria-label="Start quick 2-minute technology fatigue reset"
            >
              Quick Reset (2 min)
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTechFatigueMode('deep');
                setShowTechnologyFatigueReset(true);
                const id = trackTechniqueStart('tech-fatigue-reset-deep');
                setCurrentTechniqueId(id);
              }}
              className="flex-1 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
              style={{
                background: 'linear-gradient(135deg, var(--primary-800), var(--primary-900))',
                color: '#FFFFFF',
              }}
              aria-label="Start deep 5-minute technology fatigue reset"
            >
              Deep Reset (5 min)
            </button>
          </div>
          
          <div className="pt-3 border-t" style={{ borderColor: 'rgba(15, 40, 24, 0.2)' }}>
            <p className="text-sm italic" style={{ color: '#4A4A4A' }}>
              Evidence-based practice for remote interpreters
            </p>
          </div>
        </article>
      </section>

      {/* Five Zone Modal */}
      {showFiveZoneModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowFiveZoneModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="five-zone-modal-title"
        >
          <div
            className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <header className="mb-6">
                <h2 id="five-zone-modal-title" className="text-2xl font-bold mb-3" style={{ color: '#0D3A14' }}>
                  The Science Behind Five-Zone Recovery
                </h2>
                <p className="text-sm" style={{ color: '#3A3A3A' }}>
                  Based on neuroscience research on sensory processing and cognitive fatigue in remote interpreting
                </p>
              </header>

              <section className="space-y-6">
                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    1. Visual Rest
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Why it works:</strong> Your visual cortex processes 80% of sensory information during VRI. Screen time causes digital eye strain and disrupts your natural blink rate.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    <strong>What to do:</strong> Look away from screens, focus on distant objects, practice the 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds).
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    2. Posture Reset
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Why it works:</strong> Static postures during remote interpreting compress spinal discs and reduce blood flow to the brain by up to 20%.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    <strong>What to do:</strong> Stand, stretch your spine, roll shoulders backward, realign your head over your spine.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    3. Mindful Breathing
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Why it works:</strong> Controlled breathing activates your parasympathetic nervous system, reducing cortisol levels and improving oxygen delivery to the prefrontal cortex.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    <strong>What to do:</strong> Practice 4-7-8 breathing or box breathing to reset your autonomic nervous system.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    4. Auditory Pause
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Why it works:</strong> Continuous audio processing through headphones causes auditory fatigue and increases cognitive load by 40% compared to natural sound.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    <strong>What to do:</strong> Remove headphones, enjoy silence or natural ambient sounds, give your auditory processing centers a break.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    5. Cognitive Defocus
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Why it works:</strong> Your default mode network needs activation to consolidate memories and restore attention. Constant focus depletes glucose in the prefrontal cortex.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    <strong>What to do:</strong> Let your mind wander, engage in a simple non-linguistic task, or practice gentle movement without thinking.
                  </p>
                </article>
              </section>

              <footer className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
                <p className="text-xs mb-4" style={{ color: '#525252' }}>
                  Research sources: Journal of Cognitive Neuroscience, International Journal of Interpreting Research, Neuroscience of Occupational Health
                </p>
                <button
                  onClick={() => setShowFiveZoneModal(false)}
                  className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-800), var(--primary-900))',
                    color: '#FFFFFF',
                  }}
                  aria-label="Close modal and return to reset options"
                >
                  Got it, let's reset!
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Reset Modal */}
      {showAssignmentResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowAssignmentResetModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="assignment-reset-modal-title"
        >
          <div
            className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <header className="mb-6">
                <h2 id="assignment-reset-modal-title" className="text-2xl font-bold mb-3" style={{ color: '#0D3A14' }}>
                  The Science Behind Assignment Reset
                </h2>
                <p className="text-sm" style={{ color: '#3A3A3A' }}>
                  Evidence-based techniques for interpreter recovery between high-demand sessions
                </p>
              </header>

              <section className="space-y-6">
                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Why Brief Resets Matter
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Research shows:</strong> Interpreters who take structured micro-breaks between assignments show 40% less cumulative stress and maintain higher accuracy throughout the day.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    The brain's executive function networks need these pauses to clear working memory, reset attention filters, and prepare for new linguistic contexts.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    The Neurological Impact
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Stress hormone regulation:</strong> Just 2 minutes of structured recovery can reduce cortisol levels by up to 23%, protecting against interpreter burnout.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Your prefrontal cortex—responsible for language switching and emotional regulation—recovers faster with intentional reset practices than with passive rest.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Cognitive Resource Replenishment
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Working memory reset:</strong> Clearing residual content from previous interpretations prevents interference and improves accuracy in subsequent assignments.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Studies show interpreters who practice assignment resets maintain 30% better focus during afternoon sessions compared to those who don't.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Emotional Boundary Protection
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Vicarious trauma prevention:</strong> Structured transitions help interpreters psychologically separate from emotionally charged content.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    The reset process activates the parasympathetic nervous system, creating a protective buffer against secondary trauma accumulation.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Performance Sustainability
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Long-term benefits:</strong> Regular assignment resets contribute to career longevity, with studies showing 50% reduction in interpreter fatigue syndrome.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Interpreters using structured resets report better work-life balance and higher job satisfaction over time.
                  </p>
                </article>
              </section>

              <footer className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
                <p className="text-xs mb-4" style={{ color: '#525252' }}>
                  Research sources: International Journal of Interpreter Education, Journal of Applied Linguistics, Cognitive Science & Interpreting Studies
                </p>
                <button
                  onClick={() => setShowAssignmentResetModal(false)}
                  className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-800), var(--primary-900))',
                    color: '#FFFFFF',
                  }}
                  aria-label="Close modal and return to reset options"
                >
                  Ready to reset between assignments!
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* Professional Boundaries Modal */}
      {showBoundariesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowBoundariesModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="boundaries-modal-title"
        >
          <div
            className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <header className="mb-6">
                <h2 id="boundaries-modal-title" className="text-2xl font-bold mb-3" style={{ color: '#0D3A14' }}>
                  Why Professional Boundaries Matter
                </h2>
                <p className="text-sm" style={{ color: '#3A3A3A' }}>
                  Evidence from behavioral science and interpreter ethics on the importance of boundary maintenance
                </p>
              </header>

              <section className="space-y-6">
                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Protection Against Compassion Fatigue
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Research finding:</strong> Interpreters without clear boundaries show 65% higher rates of compassion fatigue and secondary trauma symptoms.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Boundaries create psychological distance that allows you to witness difficult content without absorbing it as your own experience.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Maintaining Professional Impartiality
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Ethical foundation:</strong> The interpreter's code of ethics requires maintaining impartiality—boundaries are the practical tool that makes this possible.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Clear boundaries help you remain neutral while still being empathetic, protecting both your professional integrity and personal well-being.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Emotional Regulation & Resilience
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Behavioral science:</strong> Boundary-setting activates the prefrontal cortex, improving emotional regulation by up to 40%.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    When you clearly define what belongs to you versus what belongs to others, your brain can process emotional content without becoming overwhelmed.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Preventing Role Confusion
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Professional clarity:</strong> Studies show interpreters with strong boundaries experience 50% less role confusion and maintain clearer professional identity.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    You are the linguistic bridge, not the counselor, advocate, or friend. Boundaries help you stay in your professional lane.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Career Longevity & Satisfaction
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Long-term impact:</strong> Interpreters who practice regular boundary resets report 70% higher job satisfaction and stay in the field 5 years longer on average.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Sustainable practice requires protecting your inner resources. Boundaries are not selfish—they're essential for serving others effectively over time.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    The Neuroscience of Boundaries
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Brain protection:</strong> Boundary-setting reduces amygdala activation (fear response) and increases activity in the anterior cingulate cortex (self-awareness).
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    This neurological shift helps you remain calm and centered even when interpreting highly emotional or traumatic content.
                  </p>
                </article>
              </section>

              <footer className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
                <p className="text-xs mb-4" style={{ color: '#525252' }}>
                  Research sources: Journal of Interpretation, International Medical Interpreters Association, Behavioral Science & Policy, Interpreter Ethics Quarterly
                </p>
                <button
                  onClick={() => setShowBoundariesModal(false)}
                  className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-800), var(--primary-900))',
                    color: '#FFFFFF',
                  }}
                  aria-label="Close modal and return to boundaries reset options"
                >
                  I'm ready to protect my boundaries!
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* Emotion Mapping Modal */}
      {showEmotionMappingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowEmotionMappingModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="emotion-mapping-modal-title"
        >
          <div
            className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <header className="mb-6">
                <h2 id="emotion-mapping-modal-title" className="text-2xl font-bold mb-3" style={{ color: '#0D3A14' }}>
                  The Science of Emotion Mapping
                </h2>
                <p className="text-sm" style={{ color: '#3A3A3A' }}>
                  Understanding how emotional awareness transforms interpreter performance and well-being
                </p>
              </header>

              <section className="space-y-6">
                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    The Naming Effect
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Neuroscience discovery:</strong> UCLA studies show that naming emotions reduces amygdala activity by up to 50% within seconds.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    When interpreters label their emotional states ("I feel overwhelmed"), the brain shifts from reactive to reflective processing, immediately calming the stress response.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Emotional Granularity
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Performance impact:</strong> Interpreters with high emotional granularity (ability to distinguish between similar emotions) show 30% better accuracy in emotionally charged assignments.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Distinguishing between "frustrated" vs. "disappointed" vs. "overwhelmed" helps you respond more precisely to your needs.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Stress Regulation Pathway
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Biological mechanism:</strong> Emotion mapping activates the ventrolateral prefrontal cortex, which directly inhibits the amygdala's fear response.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    This creates a neurological "brake" on stress escalation, preventing the cascade of stress hormones that lead to interpreter fatigue.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Vicarious Trauma Prevention
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Critical for interpreters:</strong> Regular emotion mapping reduces secondary trauma symptoms by 45% in interpreters working with traumatic content.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    By recognizing and processing emotions in real-time, you prevent them from becoming embedded trauma responses.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Cognitive Performance
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Working memory boost:</strong> Emotion mapping frees up cognitive resources, improving working memory capacity by 20-25%.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    When emotions are acknowledged rather than suppressed, your brain has more bandwidth for linguistic processing and accurate interpretation.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Resilience Building
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Long-term benefits:</strong> Interpreters who practice daily emotion mapping develop 60% greater emotional resilience over 6 months.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    This practice literally rewires your brain for better emotional regulation, creating lasting protection against burnout.
                  </p>
                </article>
              </section>

              <footer className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
                <p className="text-xs mb-4" style={{ color: '#525252' }}>
                  Research sources: UCLA Brain Mapping Center, Journal of Cognitive Neuroscience, International Journal of Interpreter Education, Emotion Research Lab
                </p>
                <button
                  onClick={() => setShowEmotionMappingModal(false)}
                  className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-800), var(--primary-900))',
                    color: '#FFFFFF',
                  }}
                  aria-label="Close modal and return to emotion mapping options"
                >
                  Ready to map my emotions!
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* Technique Modal */}
      {selectedTechnique && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div
            className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: '#0D3A14' }}>
                    {selectedTechnique === 'box-breathing' && 'Breathing Practice'}
                    {selectedTechnique === 'body-release' && 'Body Awareness Journey'}
                    {selectedTechnique === 'temperature-shift' && 'Temperature Shift'}
                    {selectedTechnique === 'sensory-reset' && 'Sensory Reset'}
                    {selectedTechnique === 'expansion-practice' && 'Expansion Practice'}
                    {selectedTechnique === 'tech-fatigue-reset' && 'Technology Fatigue Reset'}
                    {selectedTechnique === 'emotion-mapping' && 'Emotion Mapping'}
                  </h2>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    {selectedTechnique === 'box-breathing' && '4 minutes • Find your calming pattern'}
                    {selectedTechnique === 'body-release' && '1 minute • Connect with your physical self'}
                    {selectedTechnique === 'temperature-shift' &&
                      '1 minute • Quick nervous system reset'}
                    {selectedTechnique === 'sensory-reset' && '80 seconds • Gentle sensory break'}
                    {selectedTechnique === 'expansion-practice' &&
                      '2 minutes • Create space in awareness'}
                    {selectedTechnique === 'tech-fatigue-reset' &&
                      '2 minutes • Restore from digital strain'}
                    {selectedTechnique === 'emotion-mapping' &&
                      '3 minutes • Understand your internal landscape'}
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
                  className="p-3 rounded-xl transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: 'var(--bg-card)',
                    border: '2px solid #E5E5E5',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F5F5';
                    e.currentTarget.style.borderColor = '#0A1F12';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#E5E5E5';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#0A1F12';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E5E5E5';
                  }}
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6" style={{ color: '#0D3A14' }} />
                  <span className="sr-only">Close</span>
                </button>
              </div>

              {/* Current Focus Section */}
              <div className="mb-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium mb-1" style={{ color: '#1A3D26' }}>Current Focus:</p>
                  <h3 className="text-xl font-bold" style={{ color: '#0D3A14' }}>
                    {selectedTechnique === 'box-breathing' && (
                      !isTimerActive ? 'Ready to Begin' :
                      breathPhase === 'inhale' ? 'Expanding Phase' :
                      breathPhase === 'hold-in' ? 'Holding Gently' :
                      breathPhase === 'exhale' ? 'Releasing Phase' :
                      'Resting Pause'
                    )}
                    {selectedTechnique === 'body-release' && (
                      !isTimerActive ? 'Check in with your body' :
                      'Moving through your body'
                    )}
                    {selectedTechnique === 'tech-fatigue-reset' && (
                      !isTimerActive ? 'Digital Overload Check' :
                      techniqueProgress < 20 ? 'Visual Rest' :
                      techniqueProgress < 40 ? 'Audio Rest' :
                      techniqueProgress < 60 ? 'Posture Reset' :
                      techniqueProgress < 80 ? 'Distance Check' :
                      'Facial Release'
                    )}
                    {selectedTechnique === 'emotion-mapping' && (
                      !isTimerActive ? 'Neural Check-In' :
                      techniqueProgress < 17 ? 'Internal Scanning' :
                      techniqueProgress < 33 ? 'Naming the State' :
                      techniqueProgress < 50 ? 'Finding Specificity' :
                      techniqueProgress < 67 ? 'Understanding Patterns' :
                      techniqueProgress < 83 ? 'Choosing Support' :
                      'Integration'
                    )}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: '#525252' }}>
                    {selectedTechnique === 'box-breathing' && (
                      !isTimerActive ? 'Press start when ready' :
                      breathPhase === 'inhale' ? 'Let your breath fill you' :
                      breathPhase === 'hold-in' ? 'Rest in fullness' :
                      breathPhase === 'exhale' ? 'Let everything soften' :
                      'Rest in emptiness'
                    )}
                    {selectedTechnique === 'body-release' && (
                      !isTimerActive ? 'Choose your time and begin when ready' :
                      'Notice without needing to change anything'
                    )}
                    {selectedTechnique === 'tech-fatigue-reset' && (
                      !isTimerActive ? 'You are here, in this moment' :
                      techniqueProgress < 20 ? 'Let your eyes soften' :
                      techniqueProgress < 40 ? 'Let sound settle' :
                      techniqueProgress < 60 ? 'Release held patterns' :
                      techniqueProgress < 80 ? 'Find your comfortable distance' :
                      'Let your face soften'
                    )}
                    {selectedTechnique === 'emotion-mapping' && (
                      !isTimerActive ? 'Press start when ready' :
                      techniqueProgress < 17 ? "What's present in your body?" :
                      techniqueProgress < 33 ? 'Name without judgment' :
                      techniqueProgress < 50 ? 'Be precise with your words' :
                      techniqueProgress < 67 ? 'Notice your patterns' :
                      techniqueProgress < 83 ? 'Match strategy to state' :
                      'Document your discovery'
                    )}
                  </p>
                </div>
              </div>

              {/* Practice Content */}
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
                          <p className="text-2xl font-bold mb-2" style={{ color: '#0D3A14' }}>
                            {breathPhase === 'inhale' && 'Inhale'}
                            {breathPhase === 'hold-in' && 'Hold'}
                            {breathPhase === 'exhale' && 'Exhale'}
                            {breathPhase === 'hold-out' && 'Hold'}
                          </p>
                          <p className="text-4xl font-bold" style={{ color: '#1A3D26' }}>
                            {isTimerActive ? 4 - (breathCycle % 4) || 4 : '4'}
                          </p>
                          <p className="text-sm mt-2" style={{ color: '#525252' }}>
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
                          style={{ color: '#525252' }}
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

                    {/* Your Options Section */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3" style={{ color: '#0D3A14' }}>
                        Your Options:
                      </h3>
                      <p className="text-sm mb-4" style={{ color: '#6B7C6B', fontStyle: 'italic' }}>
                        Find what feels supportive right now
                      </p>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.08)' }}>
                          <p className="font-medium text-sm mb-1" style={{ color: '#0D3A14' }}>
                            Counted pace
                          </p>
                          <p className="text-xs" style={{ color: '#525252' }}>
                            Follow a steady 4-count pattern
                          </p>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.08)' }}>
                          <p className="font-medium text-sm mb-1" style={{ color: '#0D3A14' }}>
                            Natural flow
                          </p>
                          <p className="text-xs" style={{ color: '#525252' }}>
                            Let your breath find its way
                          </p>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.08)' }}>
                          <p className="font-medium text-sm mb-1" style={{ color: '#0D3A14' }}>
                            Gentle waves
                          </p>
                          <p className="text-xs" style={{ color: '#525252' }}>
                            Like ocean waves, in and out
                          </p>
                        </div>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.08)' }}>
                          <p className="font-medium text-sm mb-1" style={{ color: '#0D3A14' }}>
                            Belly softening
                          </p>
                          <p className="text-xs" style={{ color: '#525252' }}>
                            Focus on your center expanding
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Why This Supports You */}
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: '#0D3A14' }}>
                        Why This Supports You:
                      </p>
                      <p className="text-xs" style={{ color: '#3A3A3A' }}>
                        Steady breathing activates your vagus nerve, creating a neurological shift from stress activation to restoration.
                      </p>
                    </div>
                    
                    {/* Adapt As Needed */}
                    <div className="mt-4 p-3 rounded-lg border" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#0D3A14' }}>
                        Adapt As Needed:
                      </p>
                      <ul className="text-xs space-y-1" style={{ color: '#525252' }}>
                        <li>• Let pauses happen naturally or skip them</li>
                        <li>• Find your comfortable depth</li>
                        <li>• Allow your body to move with breath</li>
                        <li>• Rest in whatever pattern emerges</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold mb-3" style={{ color: '#0D3A14' }}>
                      How to Practice:
                    </h3>
                    <div className="space-y-2">
                      {selectedTechnique === 'body-release' && (
                        <>
                          {/* Body Awareness Journey - New Accessible Design */}
                          {!isTimerActive ? (
                            // Initial Setup Screen
                            <div className="space-y-6">
                              {/* Time Selection */}
                              <div>
                                <h3 className="font-semibold mb-3" style={{ color: '#0D3A14' }}>
                                  How long:
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                  {[30, 60, 120, 180].map((seconds) => (
                                    <button
                                      key={seconds}
                                      onClick={() => setBodyAwarenessTime(seconds)}
                                      className="px-3 py-3 rounded-lg text-sm font-medium transition-all"
                                      style={{
                                        backgroundColor: bodyAwarenessTime === seconds ? '#5C7F4F' : 'rgba(92, 127, 79, 0.1)',
                                        color: bodyAwarenessTime === seconds ? '#FFFFFF' : '#2D5F3F',
                                        border: bodyAwarenessTime === seconds ? '2px solid #5C7F4F' : '2px solid transparent'
                                      }}
                                    >
                                      {seconds === 30 ? '30 seconds' : 
                                       seconds === 60 ? '1 minute' :
                                       seconds === 120 ? '2 minutes' : '3 minutes'}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Practice Method Selection */}
                              <div>
                                <h3 className="font-semibold mb-3" style={{ color: '#0D3A14' }}>
                                  Choose how to practice:
                                </h3>
                                <div className="space-y-2">
                                  {[
                                    { id: 'move', label: 'Move', desc: 'Adjust, rock, or stretch parts of your body' },
                                    { id: 'picture', label: 'Picture', desc: 'Imagine warmth or light in each area' },
                                    { id: 'breathe', label: 'Breathe', desc: 'Send your breath to different areas' },
                                    { id: 'touch', label: 'Touch', desc: 'Press or tap on your body if you want' },
                                    { id: 'still', label: 'Stay still', desc: 'Just notice without moving' }
                                  ].map(method => (
                                    <button
                                      key={method.id}
                                      onClick={() => setBodyAwarenessMethod(method.id as ('move' | 'picture' | 'breathe' | 'touch' | 'still'))}
                                      className="w-full text-left p-3 rounded-lg transition-all"
                                      style={{
                                        backgroundColor: bodyAwarenessMethod === method.id ? 'rgba(92, 127, 79, 0.15)' : 'rgba(92, 127, 79, 0.05)',
                                        border: bodyAwarenessMethod === method.id ? '2px solid #5C7F4F' : '2px solid transparent'
                                      }}
                                    >
                                      <div className="font-medium text-sm" style={{ color: '#0D3A14' }}>
                                        {method.label}
                                      </div>
                                      <div className="text-xs mt-1" style={{ color: '#525252' }}>
                                        {method.desc}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Why This Helps */}
                              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                                <h4 className="font-semibold mb-2 text-sm" style={{ color: '#0D3A14' }}>
                                  Why this helps:
                                </h4>
                                <p className="text-xs" style={{ color: '#3A3A3A', lineHeight: '1.6' }}>
                                  Paying attention to your body helps your brain get better at noticing feelings and managing stress.
                                </p>
                              </div>
                            </div>
                          ) : (
                            // Practice Screen
                            <div className="space-y-6">
                              {/* Body Check-in Instructions */}
                              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.05)' }}>
                                <h3 className="font-semibold mb-3" style={{ color: '#0D3A14' }}>
                                  Check each part of your body:
                                </h3>
                                <ul className="space-y-2 text-sm" style={{ color: '#3A3A3A' }}>
                                  <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Notice your head and face - relax them if it feels good</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Check your shoulders - move or adjust them if you want</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Feel your chest area - breathe in a comfortable way</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Notice your belly - let it be soft if that's okay</span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>Feel your legs and feet - relax them or keep them as they are</span>
                                  </li>
                                </ul>
                              </div>

                              {/* Current Practice Method Reminder */}
                              <div className="p-3 rounded-lg text-center" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>
                                  {bodyAwarenessMethod === 'move' && 'Moving & Adjusting'}
                                  {bodyAwarenessMethod === 'picture' && 'Imagining Warmth'}
                                  {bodyAwarenessMethod === 'breathe' && 'Breathing Into Areas'}
                                  {bodyAwarenessMethod === 'touch' && 'Using Touch'}
                                  {bodyAwarenessMethod === 'still' && 'Staying Still & Noticing'}
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  {bodyAwarenessMethod === 'move' && 'Adjust, rock, or stretch as feels good'}
                                  {bodyAwarenessMethod === 'picture' && 'Imagine warmth or light in each area'}
                                  {bodyAwarenessMethod === 'breathe' && 'Send breath to different body parts'}
                                  {bodyAwarenessMethod === 'touch' && 'Press or tap gently on your body'}
                                  {bodyAwarenessMethod === 'still' && 'Just notice without needing to change'}
                                </p>
                              </div>

                              {/* Progress Indicator */}
                              <div className="w-full">
                                <div className="flex justify-between text-xs mb-2" style={{ color: '#525252' }}>
                                  <span>Progress</span>
                                  <span>{Math.round((techniqueProgress / 100) * bodyAwarenessTime)} / {bodyAwarenessTime} seconds</span>
                                </div>
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

                              {/* Adaptation Reminders */}
                              <div className="space-y-3">
                                <div className="p-3 rounded-lg border" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
                                  <h4 className="text-xs font-semibold mb-2" style={{ color: '#0D3A14' }}>
                                    If you need to change something:
                                  </h4>
                                  <ul className="text-xs space-y-1" style={{ color: '#525252' }}>
                                    <li>• Can't move some areas? Just think about them</li>
                                    <li>• Have pain? Don't try to change it - just notice</li>
                                    <li>• Need to move around? That's okay</li>
                                    <li>• Want to skip parts? Go ahead</li>
                                    <li>• Like to rock or fidget? That can be part of this</li>
                                  </ul>
                                </div>

                                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.05)' }}>
                                  <h4 className="text-xs font-semibold mb-2" style={{ color: '#0D3A14' }}>
                                    Good to know:
                                  </h4>
                                  <ul className="text-xs space-y-1" style={{ color: '#525252' }}>
                                    <li>• Keep any tension that helps you feel safe</li>
                                    <li>• Skip any body part you don't want to think about</li>
                                    <li>• Sometimes being tense is helpful - that's okay</li>
                                    <li>• Your body knows what it needs</li>
                                    <li>• Stop anytime you want</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      {selectedTechnique === 'temperature-shift' && (
                        <>
                          {/* Temperature Shift Animation */}
                          <div className="flex flex-col items-center mb-6">
                            {/* Status Text Above Animation */}
                            <div className="text-center mb-4">
                              <p className="text-2xl font-bold" style={{ color: '#0D3A14' }}>
                                {isTimerActive ? 'Cooling Phase' : 'Warming Phase'}
                              </p>
                              <p className="text-sm mt-1" style={{ color: '#525252' }}>
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
                            style={{ color: 'var(--primary-900)' }}
                          >
                            How Temperature Shift Works:
                          </h3>
                          
                          {/* What it does */}
                          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                            <p className="text-sm font-medium mb-1" style={{ color: '#0D3A14' }}>
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
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>
                                  Get Cold Water Ready
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  Fill a bowl with cold water or go to a sink. Colder is better - add ice if available.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                2
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>
                                  Press Start & Apply Cold
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  Splash cold water on your face, focusing on temples and forehead. Or hold your wrists under cold running water.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                3
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>
                                  Breathe Deeply
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
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
                    </div>
                    <div className="space-y-2">
                      {selectedTechnique === 'sensory-reset' && (
                        <>
                          {/* Sensory Reset Animation */}
                          <div className="flex flex-col items-center mb-6">
                            {/* Status Text Above Animation */}
                            <div className="text-center mb-4">
                              <p className="text-2xl font-bold" style={{ color: '#0D3A14' }}>
                                {senseCount === 0 && 'Ready to Ground'}
                                {senseCount === 1 && '4 Things You See'}
                                {senseCount === 2 && '3 Things You Touch'}
                                {senseCount === 3 && '2 Things You Smell'}
                                {senseCount === 4 && '1 Thing You Taste'}
                              </p>
                              <p className="text-sm mt-1" style={{ color: '#525252' }}>
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
                            style={{ color: 'var(--primary-900)' }}
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
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>See</p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  Look around and name 4 things you can see. Be specific - "blue coffee mug" not just "mug"
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="font-bold text-blue-600">3</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>Touch</p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  Notice 3 things you can physically feel - your feet on floor, chair against back, air on skin
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="font-bold text-green-600">2</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>Smell</p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  Identify 2 scents - coffee, fresh air, hand lotion, or just "neutral air"
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="font-bold text-red-600">1</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>Taste</p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  Notice 1 taste - sip water, chew gum, or just notice your mouth's current taste
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Why This Works */}
                          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: '#0D3A14' }}>
                              Why This Works:
                            </p>
                            <p className="text-xs" style={{ color: '#3A3A3A' }}>
                              The 4-3-2-1 technique interrupts anxiety loops by engaging multiple sensory channels simultaneously. This grounds you in the present moment, reducing rumination by 60%.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      {selectedTechnique === 'expansion-practice' && (
                        <>
                          {/* Expansion Practice Animation */}
                          <div className="flex flex-col items-center mb-6">
                            {/* Status Text Above Animation */}
                            <div className="text-center mb-4">
                              <p className="text-2xl font-bold" style={{ color: '#0D3A14' }}>
                                {!isTimerActive && 'Ready to Expand'}
                                {isTimerActive && expansionLevel < 0.33 && 'Noticing Tension'}
                                {isTimerActive && expansionLevel >= 0.33 && expansionLevel < 0.66 && 'Creating Space'}
                                {isTimerActive && expansionLevel >= 0.66 && 'Full Expansion'}
                              </p>
                              <p className="text-sm mt-1" style={{ color: '#525252' }}>
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
                            style={{ color: 'var(--primary-900)' }}
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
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>
                                  Scan Your Body
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  Notice where you're holding tension - shoulders, jaw, chest, belly
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                2
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>
                                  Breathe Into Tension
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  Imagine your breath flowing directly to those tight areas, creating space
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                3
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>
                                  Expand Awareness
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  Let your awareness grow beyond your body, sensing the space around you
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Tips */}
                          <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: '#0D3A14' }}>
                              Pro Tip:
                            </p>
                            <p className="text-xs" style={{ color: '#3A3A3A' }}>
                              This technique creates psychological space when feeling overwhelmed. The physical expansion helps your mind feel less cramped and stressed.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      {selectedTechnique === 'tech-fatigue-reset' && (
                        <>
                          {/* Technology Fatigue Reset Animation */}
                          <div className="flex flex-col items-center mb-6">
                            {/* Status Text Above Animation */}
                            <div className="text-center mb-4">
                              <p className="text-2xl font-bold" style={{ color: '#0D3A14' }}>
                                {!isTimerActive && 'Digital Overload Check'}
                                {isTimerActive && techniqueProgress < 20 && 'Zone 1: Eye Relief'}
                                {isTimerActive && techniqueProgress >= 20 && techniqueProgress < 40 && 'Zone 2: Audio Recovery'}
                                {isTimerActive && techniqueProgress >= 40 && techniqueProgress < 60 && 'Zone 3: Posture Restoration'}
                                {isTimerActive && techniqueProgress >= 60 && techniqueProgress < 80 && 'Zone 4: Screen Distance'}
                                {isTimerActive && techniqueProgress >= 80 && 'Zone 5: Facial Tension Release'}
                              </p>
                              <p className="text-sm mt-1" style={{ color: '#525252' }}>
                                {isTimerActive ? 'Your eyes, ears, and body need relief' : 'Press start for tech recovery'}
                              </p>
                            </div>
                            
                            {/* Tech Fatigue Recovery Visualization */}
                            <div className="relative w-64 h-64 flex items-center justify-center">
                              {/* Background Gradient */}
                              <div 
                                className="absolute inset-0 rounded-full"
                                style={{
                                  background: isTimerActive 
                                    ? `radial-gradient(circle, rgba(92, 127, 79, ${0.05 + techniqueProgress * 0.002}) 0%, transparent 70%)`
                                    : 'none',
                                  animation: isTimerActive ? 'pulse 4s ease-in-out infinite' : 'none'
                                }}
                              />
                              
                              {/* Tech Fatigue Recovery Visualization */}
                              <svg width="250" height="250" viewBox="0 0 250 250" className="relative z-10">
                                {/* Five Recovery Zones */}
                                <g transform="translate(125, 125)">
                                  {/* Zone indicators - 5 segments */}
                                  {[0, 72, 144, 216, 288].map((angle, i) => {
                                    const zones = ['Eyes', 'Ears', 'Body', 'Screen', 'Face'];
                                    const isActive = techniqueProgress >= i * 20 && techniqueProgress < (i + 1) * 20;
                                    const isComplete = techniqueProgress >= (i + 1) * 20;
                                    
                                    return (
                                      <g key={i} transform={`rotate(${angle})`}>
                                        {/* Zone segment */}
                                        <path
                                          d={`M 0,0 L 0,-80 A 80,80 0 0,1 ${80 * Math.sin(72 * Math.PI / 180)},${-80 * Math.cos(72 * Math.PI / 180)} Z`}
                                          fill={isComplete ? '#5C7F4F' : isActive ? '#8FA681' : '#E5E7EB'}
                                          opacity={isActive ? 0.8 : isComplete ? 0.6 : 0.3}
                                          className="transition-all duration-500"
                                        />
                                        
                                        {/* Zone icon */}
                                        <g transform={`rotate(${-angle + 36}) translate(0, -50)`}>
                                          <circle 
                                            r="18" 
                                            fill="white" 
                                            opacity={isActive || isComplete ? 1 : 0.7}
                                          />
                                          <text 
                                            y="5" 
                                            textAnchor="middle" 
                                            fontSize="10" 
                                            fontWeight="bold"
                                            fill={isActive || isComplete ? '#2D5F3F' : '#9CA3AF'}
                                          >
                                            {zones[i]}
                                          </text>
                                        </g>
                                        
                                        {/* Pulse effect for active zone */}
                                        {isActive && (
                                          <circle r="25" fill="none" stroke="#5C7F4F" strokeWidth="2" opacity="0.5">
                                            <animate
                                              attributeName="r"
                                              values="25;35;25"
                                              dur="2s"
                                              repeatCount="indefinite"
                                            />
                                            <animate
                                              attributeName="opacity"
                                              values="0.5;0.2;0.5"
                                              dur="2s"
                                              repeatCount="indefinite"
                                            />
                                          </circle>
                                        )}
                                      </g>
                                    );
                                  })}
                                  
                                  {/* Center status */}
                                  <circle r="35" fill="#FFFFFF" stroke="#5C7F4F" strokeWidth="2" />
                                  
                                  {/* Zone-specific icons in center */}
                                  {techniqueProgress < 20 && (
                                    <g>
                                      <text y="-5" textAnchor="middle" fontSize="24">👁️</text>
                                      <text y="15" textAnchor="middle" fontSize="10" fill="#2D5F3F">Eye Relief</text>
                                    </g>
                                  )}
                                  {techniqueProgress >= 20 && techniqueProgress < 40 && (
                                    <g>
                                      <text y="-5" textAnchor="middle" fontSize="24">🎧</text>
                                      <text y="15" textAnchor="middle" fontSize="10" fill="#2D5F3F">Audio Rest</text>
                                    </g>
                                  )}
                                  {techniqueProgress >= 40 && techniqueProgress < 60 && (
                                    <g>
                                      <text y="-5" textAnchor="middle" fontSize="24">🧘</text>
                                      <text y="15" textAnchor="middle" fontSize="10" fill="#2D5F3F">Posture</text>
                                    </g>
                                  )}
                                  {techniqueProgress >= 60 && techniqueProgress < 80 && (
                                    <g>
                                      <text y="-5" textAnchor="middle" fontSize="24">💻</text>
                                      <text y="15" textAnchor="middle" fontSize="10" fill="#2D5F3F">Distance</text>
                                    </g>
                                  )}
                                  {techniqueProgress >= 80 && (
                                    <g>
                                      <text y="-5" textAnchor="middle" fontSize="24">😌</text>
                                      <text y="15" textAnchor="middle" fontSize="10" fill="#2D5F3F">Face Relax</text>
                                    </g>
                                  )}
                                </g>
                                
                                {/* Progress Arc */}
                                <circle
                                  cx="125"
                                  cy="125"
                                  r="100"
                                  fill="none"
                                  stroke="#E5E7EB"
                                  strokeWidth="3"
                                />
                                <circle
                                  cx="125"
                                  cy="125"
                                  r="100"
                                  fill="none"
                                  stroke="#5C7F4F"
                                  strokeWidth="3"
                                  strokeDasharray={`${2 * Math.PI * 100} ${2 * Math.PI * 100}`}
                                  strokeDashoffset={2 * Math.PI * 100 * (1 - techniqueProgress / 100)}
                                  transform="rotate(-90 125 125)"
                                  strokeLinecap="round"
                                  className="transition-all duration-1000"
                                />
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
                            style={{ color: 'var(--primary-900)' }}
                          >
                            Five-Zone Recovery System:
                          </h3>
                          
                          {/* Step by step instructions */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                👁️
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>
                                  Zone 1: Eye Relief (30s)
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  20-20-20 rule: Look 20+ feet away for 20 seconds. Blink 10 times. Palm press over closed eyes.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                🎧
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>
                                  Zone 2: Audio Recovery (30s)
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  Remove headphones. Massage ear cartilage. Pull earlobes gently. 15 seconds of silence.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                🧘
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>
                                  Zone 3: Posture Reset (30s)
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  Stand up if possible. Shoulder rolls back 3x. Neck stretches. Squeeze shoulder blades.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                💻
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>
                                  Zone 4: Screen Distance (20s)
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  Arm's length test. Screen top at eye level. Reduce glare. Lean back to increase distance.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-red-500 text-white text-xs flex items-center justify-center mr-3 flex-shrink-0">
                                😌
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: '#0D3A14' }}>
                                  Zone 5: Facial Tension (40s)
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#525252' }}>
                                  Temple massage. Jaw release. Forehead smooth. Eye squeeze then wide. Reset facial muscles.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Why This Works */}
                          <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: '#0D3A14' }}>
                              Why This Works:
                            </p>
                            <p className="text-xs" style={{ color: '#3A3A3A' }}>
                              VRI/remote interpreting creates unique physical strain. This systematic approach addresses all five zones of tech fatigue, preventing occupational injuries and maintaining interpretation accuracy.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      {selectedTechnique === 'emotion-mapping' && (
                        <>
                          {/* Modern Emotion Mapping Interface */}
                          <div className="flex flex-col items-center mb-6">
                            {/* Clean Header with Progress */}
                            <div className="w-full max-w-md mb-6">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold" style={{ color: '#0D3A14' }}>
                                  Emotion Mapping Journey
                                </h3>
                                <span className="text-sm px-3 py-1 rounded-full" style={{ 
                                  backgroundColor: isTimerActive ? 'rgba(147, 51, 234, 0.1)' : 'rgba(92, 127, 79, 0.1)',
                                  color: isTimerActive ? '#9333EA' : '#5C7F4F'
                                }}>
                                  {Math.floor(techniqueProgress)}% Complete
                                </span>
                              </div>
                              
                              {/* Sleek Progress Bar */}
                              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-500 ease-out rounded-full"
                                  style={{
                                    width: `${techniqueProgress}%`,
                                    background: 'linear-gradient(90deg, #9333EA 0%, #7C3AED 100%)'
                                  }}
                                />
                              </div>
                            </div>
                            
                            {/* Modern Card-Based Visualization */}
                            <div className="w-full max-w-md">
                              {/* Active Step Card */}
                              <div className="bg-white rounded-xl shadow-lg p-6 mb-6" style={{ 
                                borderLeft: '4px solid #9333EA',
                                background: 'linear-gradient(to right, rgba(147, 51, 234, 0.03) 0%, white 100%)'
                              }}>
                                <div className="flex items-center mb-4">
                                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ 
                                    backgroundColor: 'rgba(147, 51, 234, 0.1)' 
                                  }}>
                                    <span className="text-lg font-bold" style={{ color: '#9333EA' }}>
                                      {!isTimerActive ? '?' :
                                       techniqueProgress < 17 ? '1' :
                                       techniqueProgress < 33 ? '2' :
                                       techniqueProgress < 50 ? '3' :
                                       techniqueProgress < 67 ? '4' :
                                       techniqueProgress < 83 ? '5' : '6'}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-lg font-bold" style={{ color: '#1F2937' }}>
                                      {!isTimerActive ? 'Ready to Map Your Emotions' :
                                       techniqueProgress < 17 ? 'Body Scanning' :
                                       techniqueProgress < 33 ? 'Naming Neural State' :
                                       techniqueProgress < 50 ? 'Emotional Granularity' :
                                       techniqueProgress < 67 ? 'Understanding Triggers' :
                                       techniqueProgress < 83 ? 'Regulation Strategy' : 'Integration'}
                                    </h4>
                                    <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                                      {!isTimerActive ? 'Begin your post-interpretation check-in' :
                                       techniqueProgress < 17 ? 'Notice: chest, stomach, jaw, shoulders' :
                                       techniqueProgress < 33 ? 'High alert? Empathy overload? Dissociation?' :
                                       techniqueProgress < 50 ? 'Be specific about what you\'re feeling' :
                                       techniqueProgress < 67 ? 'What activated you during interpretation?' :
                                       techniqueProgress < 83 ? 'Choose your regulation technique' : 
                                       'Document and integrate your insights'}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Quick Tips for Current Step */}
                                {isTimerActive && (
                                  <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(147, 51, 234, 0.05)' }}>
                                    <p className="text-xs font-medium mb-1" style={{ color: '#7C3AED' }}>Quick Tip:</p>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>
                                      {techniqueProgress < 17 ? 'Your body holds the emotional residue of what you just interpreted.' :
                                       techniqueProgress < 33 ? 'Naming reduces amygdala activation by up to 50%.' :
                                       techniqueProgress < 50 ? 'Precision in naming emotions calms your limbic system.' :
                                       techniqueProgress < 67 ? 'Mirror neurons make you experience content as if it\'s yours.' :
                                       techniqueProgress < 83 ? 'Match your strategy to your current state for best results.' : 
                                       'Regular mapping builds professional resilience over time.'}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Brain and Emotion Visualization */}
                              <svg width="250" height="250" viewBox="0 0 250 250" className="relative z-10">
                                {/* Brain Outline */}
                                <g transform="translate(125, 125)">
                                  {/* Brain shape */}
                                  <ellipse 
                                    cx="0" 
                                    cy="-10" 
                                    rx="60" 
                                    ry="50" 
                                    fill="none" 
                                    stroke="#9333EA" 
                                    strokeWidth="2"
                                    opacity="0.3"
                                  />
                                  
                                  {/* Neural activity zones */}
                                  {techniqueProgress < 17 && isTimerActive && (
                                    <g opacity="0.8">
                                      {/* Body scan indicators */}
                                      {[
                                        { x: 0, y: -30, label: 'Head' },
                                        { x: -20, y: 0, label: 'Chest' },
                                        { x: 20, y: 0, label: 'Stomach' },
                                        { x: 0, y: 30, label: 'Hands' }
                                      ].map((pos, i) => (
                                        <g key={i}>
                                          <circle 
                                            cx={pos.x} 
                                            cy={pos.y} 
                                            r="15" 
                                            fill="#F59E0B" 
                                            opacity="0.5"
                                          >
                                            <animate
                                              attributeName="r"
                                              values="15;20;15"
                                              dur={`${2 + i * 0.3}s`}
                                              repeatCount="indefinite"
                                            />
                                          </circle>
                                        </g>
                                      ))}
                                    </g>
                                  )}
                                  
                                  {techniqueProgress >= 17 && techniqueProgress < 33 && isTimerActive && (
                                    <g opacity="0.8">
                                      {/* Neural state naming */}
                                      <circle cx="0" cy="-10" r="40" fill="#3B82F6" opacity="0.4">
                                        <animate
                                          attributeName="r"
                                          values="40;45;40"
                                          dur="3s"
                                          repeatCount="indefinite"
                                        />
                                      </circle>
                                      <text y="-5" textAnchor="middle" fontSize="12" fill="#1E40AF">
                                        Naming
                                      </text>
                                    </g>
                                  )}
                                  
                                  {techniqueProgress >= 33 && techniqueProgress < 50 && isTimerActive && (
                                    <g opacity="0.8">
                                      {/* Emotional granularity */}
                                      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                                        <circle
                                          key={i}
                                          cx={Math.cos(angle * Math.PI / 180) * 35}
                                          cy={Math.sin(angle * Math.PI / 180) * 35 - 10}
                                          r="8"
                                          fill="#8B5CF6"
                                          opacity="0.6"
                                        >
                                          <animate
                                            attributeName="r"
                                            values="8;12;8"
                                            dur={`${2 + i * 0.2}s`}
                                            repeatCount="indefinite"
                                          />
                                        </circle>
                                      ))}
                                    </g>
                                  )}
                                  
                                  {techniqueProgress >= 50 && techniqueProgress < 67 && isTimerActive && (
                                    <g opacity="0.8">
                                      {/* Trigger identification */}
                                      <rect x="-40" y="-30" width="80" height="40" rx="20" fill="#DC2626" opacity="0.3" />
                                      <text y="-5" textAnchor="middle" fontSize="12" fill="#991B1B">
                                        Triggers
                                      </text>
                                    </g>
                                  )}
                                  
                                  {techniqueProgress >= 67 && techniqueProgress < 83 && isTimerActive && (
                                    <g opacity="0.8">
                                      {/* Regulation strategy */}
                                      <circle cx="0" cy="-10" r="45" fill="#10B981" opacity="0.4">
                                        <animate
                                          attributeName="r"
                                          values="45;50;45"
                                          dur="3s"
                                          repeatCount="indefinite"
                                        />
                                      </circle>
                                      <text y="-5" textAnchor="middle" fontSize="12" fill="#047857">
                                        Regulate
                                      </text>
                                    </g>
                                  )}
                                  
                                  {techniqueProgress >= 83 && isTimerActive && (
                                    <g opacity="0.8">
                                      {/* Integration */}
                                      <circle cx="0" cy="-10" r="50" fill="#5C7F4F" opacity="0.5" />
                                      <path 
                                        d="M -20,-20 Q -20,0 0,5 Q 20,0 20,-20 Q 0,-15 -20,-20 Z"
                                        fill="#2D5F3F"
                                        opacity="0.7"
                                      />
                                      <text y="-5" textAnchor="middle" fontSize="12" fill="white">
                                        Integrated
                                      </text>
                                    </g>
                                  )}
                                </g>
                                
                                {/* Progress Arc */}
                                <circle
                                  cx="125"
                                  cy="125"
                                  r="100"
                                  fill="none"
                                  stroke="#E5E7EB"
                                  strokeWidth="3"
                                />
                                <circle
                                  cx="125"
                                  cy="125"
                                  r="100"
                                  fill="none"
                                  stroke="#9333EA"
                                  strokeWidth="3"
                                  strokeDasharray={`${2 * Math.PI * 100} ${2 * Math.PI * 100}`}
                                  strokeDashoffset={2 * Math.PI * 100 * (1 - techniqueProgress / 100)}
                                  transform="rotate(-90 125 125)"
                                  strokeLinecap="round"
                                  className="transition-all duration-1000"
                                />
                                
                                {/* Step indicators */}
                                <text x="125" y="20" textAnchor="middle" fontSize="10" fill={techniqueProgress < 17 ? '#9333EA' : '#9CA3AF'}>
                                  Body Scan
                                </text>
                                <text x="220" y="75" textAnchor="middle" fontSize="10" fill={techniqueProgress >= 17 && techniqueProgress < 33 ? '#9333EA' : '#9CA3AF'}>
                                  Name
                                </text>
                                <text x="220" y="175" textAnchor="middle" fontSize="10" fill={techniqueProgress >= 33 && techniqueProgress < 50 ? '#9333EA' : '#9CA3AF'}>
                                  Specify
                                </text>
                                <text x="125" y="230" textAnchor="middle" fontSize="10" fill={techniqueProgress >= 50 && techniqueProgress < 67 ? '#9333EA' : '#9CA3AF'}>
                                  Triggers
                                </text>
                                <text x="30" y="175" textAnchor="middle" fontSize="10" fill={techniqueProgress >= 67 && techniqueProgress < 83 ? '#9333EA' : '#9CA3AF'}>
                                  Regulate
                                </text>
                                <text x="30" y="75" textAnchor="middle" fontSize="10" fill={techniqueProgress >= 83 ? '#9333EA' : '#9CA3AF'}>
                                  Integrate
                                </text>
                              </svg>
                              
                              {/* Progress Bar */}
                              <div className="absolute bottom-0 left-0 right-0">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full transition-all duration-1000"
                                    style={{
                                      width: `${techniqueProgress}%`,
                                      backgroundColor: '#9333EA'
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <h3
                            className="font-semibold mb-3 text-center"
                            style={{ color: 'var(--primary-900)' }}
                          >
                            Interpreter's Emotion Map:
                          </h3>
                          
                          {/* Friendly Step-by-Step Guide Card */}
                          <div className="bg-white rounded-xl shadow-md p-5 mb-4" style={{
                            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.03) 0%, rgba(124, 58, 237, 0.01) 100%)',
                            border: '1px solid rgba(147, 51, 234, 0.1)'
                          }}>
                            {!isTimerActive ? (
                              // Welcome message when not started
                              <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ 
                                  backgroundColor: 'rgba(147, 51, 234, 0.1)' 
                                }}>
                                  <span className="text-2xl">💜</span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                                  Ready for Your Emotional Check-In?
                                </h3>
                                <p className="text-sm mb-3" style={{ color: '#6B7280' }}>
                                  Hey there! Let's take a moment to understand what you're feeling after that interpretation session. 
                                  This is your time to process and reset.
                                </p>
                                <p className="text-xs italic" style={{ color: '#9333EA' }}>
                                  Remember: You just did important work. Your emotions are valid data.
                                </p>
                              </div>
                            ) : (
                              // Step-specific content
                              <div>
                                <div className="flex items-start mb-3">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{ 
                                    backgroundColor: techniqueProgress < 17 ? '#F97316' :
                                                     techniqueProgress < 33 ? '#3B82F6' :
                                                     techniqueProgress < 50 ? '#8B5CF6' :
                                                     techniqueProgress < 67 ? '#EF4444' :
                                                     techniqueProgress < 83 ? '#10B981' : '#6366F1',
                                    color: 'white'
                                  }}>
                                    <span className="text-sm font-bold">
                                      {techniqueProgress < 17 ? '1' :
                                       techniqueProgress < 33 ? '2' :
                                       techniqueProgress < 50 ? '3' :
                                       techniqueProgress < 67 ? '4' :
                                       techniqueProgress < 83 ? '5' : '6'}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-base font-semibold mb-1" style={{ color: '#1F2937' }}>
                                      {techniqueProgress < 17 ? 'Let\'s Check In With Your Body' :
                                       techniqueProgress < 33 ? 'Now, Name What You\'re Experiencing' :
                                       techniqueProgress < 50 ? 'Get Specific About Your Emotions' :
                                       techniqueProgress < 67 ? 'What Triggered This Response?' :
                                       techniqueProgress < 83 ? 'Choose Your Recovery Strategy' : 
                                       'Integrate and Document'}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      {techniqueProgress < 17 ? '30 seconds' :
                                       techniqueProgress < 33 ? '30 seconds' :
                                       techniqueProgress < 50 ? '40 seconds' :
                                       techniqueProgress < 67 ? '40 seconds' :
                                       techniqueProgress < 83 ? '30 seconds' : '30 seconds'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="pl-13">
                                  <p className="text-sm mb-3" style={{ color: '#4B5563', lineHeight: '1.6' }}>
                                    {techniqueProgress < 17 ? 
                                      'Take a gentle moment to scan your body. Start with your chest - is it tight or relaxed? How about your stomach - any butterflies or tension? Check your jaw and shoulders too. These physical sensations are telling you something important about what you just experienced.' :
                                     techniqueProgress < 33 ? 
                                      'Okay, based on what you\'re feeling in your body, let\'s put a name to it. Are you in high alert mode? Feeling overwhelmed by empathy? Maybe a bit disconnected or containing some anger? Just naming it helps - it actually reduces your amygdala activation by up to 50%!' :
                                     techniqueProgress < 50 ? 
                                      'Let\'s get more precise here. Instead of just "upset," can you say "frustrated by the injustice I interpreted"? Or instead of "sad," maybe it\'s "grieving for the family\'s loss"? The more specific you are, the more your limbic system calms down. It\'s like your brain goes "Oh, we understand this now!"' :
                                     techniqueProgress < 67 ? 
                                      'Think about what specifically activated you during that session. Was it personal resonance - did it remind you of your own experiences? Was it a clash with your values? Or maybe the power dynamics in the situation? Understanding your triggers helps you prepare for next time.' :
                                     techniqueProgress < 83 ? 
                                      'Based on what you\'re feeling, let\'s pick the right tool. If you\'re in high alert, try some long, slow exhales - they activate your parasympathetic nervous system. Feeling dissociated? Ground yourself by naming 5 things you can see right now. Match your strategy to your state for best results.' : 
                                      'Great work! Now let\'s capture this insight. Try completing this: "When I interpret [medical/legal/emotional] content, my [chest/jaw/shoulders] activates, signaling [specific emotion], and I need [grounding/breathing/movement]." This becomes your personal roadmap for resilience.'}
                                  </p>
                                  
                                  {/* Helpful prompts for each step */}
                                  <div className="bg-purple-50 rounded-lg p-3 mb-3">
                                    <p className="text-xs font-medium mb-2" style={{ color: '#7C3AED' }}>
                                      {techniqueProgress < 17 ? '💭 Try this:' :
                                       techniqueProgress < 33 ? '💭 Ask yourself:' :
                                       techniqueProgress < 50 ? '💭 Consider:' :
                                       techniqueProgress < 67 ? '💭 Reflect:' :
                                       techniqueProgress < 83 ? '💭 Options:' : '💭 Remember:'}
                                    </p>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>
                                      {techniqueProgress < 17 ? 
                                        'Place one hand on your chest and one on your stomach. Which moves more when you breathe? That\'s where you\'re holding tension.' :
                                       techniqueProgress < 33 ? 
                                        '"If I had to describe this feeling to a friend, what would I say?" Sometimes the first word that comes is the right one.' :
                                       techniqueProgress < 50 ? 
                                        'What would a therapist call this feeling? Being precise isn\'t about being fancy - it\'s about being accurate to YOUR experience.' :
                                       techniqueProgress < 67 ? 
                                        'No judgment here - triggers are information, not weaknesses. They show where you care deeply or where you need support.' :
                                       techniqueProgress < 83 ? 
                                        'You know yourself best. What has worked before? What does your body need right now? Trust your instincts.' : 
                                        'This pattern recognition makes you a stronger interpreter. You\'re building emotional intelligence that protects both you and your work quality.'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Why This Works */}
                          <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: '#0D3A14' }}>
                              The Neuroscience:
                            </p>
                            <p className="text-xs" style={{ color: '#3A3A3A' }}>
                              Your mirror neurons fire as if experiencing the content yourself. Your brain can't distinguish between interpreting trauma and experiencing it. Understanding your patterns builds professional resilience.
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
                {/* Manual Navigation Controls */}
                {!isTimerActive ? (
                  <button
                    onClick={() => {
                      // Start the practice in manual mode
                      setIsTimerActive(true);
                      setTechniqueProgress(0);
                      setBreathPhase('inhale');
                      setBreathCycle(0);
                      setBodyPart(0);
                      setSenseCount(0);
                      setExpansionLevel(0);
                    }}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
                    style={{
                      background: 'linear-gradient(145deg, #1A3D26 0%, #0F2818 100%)',
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
                    Begin Practice
                  </button>
                ) : (
                  <div className="flex gap-3 w-full">
                    {techniqueProgress > 0 && (
                      <button
                        onClick={() => {
                          // Go to previous step
                          if (selectedTechnique === 'emotion-mapping') {
                            const currentStep = Math.floor(techniqueProgress / 16.67);
                            setTechniqueProgress(Math.max(0, (currentStep - 1) * 16.67));
                          } else if (selectedTechnique === 'body-release') {
                            setBodyPart(Math.max(0, bodyPart - 1));
                            setTechniqueProgress(bodyPart * 20);
                          } else if (selectedTechnique === 'box-breathing') {
                            const phases = ['inhale', 'hold-in', 'exhale', 'hold-out'];
                            const currentIndex = phases.indexOf(breathPhase);
                            const prevIndex = currentIndex > 0 ? currentIndex - 1 : 3;
                            setBreathPhase(phases[prevIndex] as ('inhale' | 'hold-in' | 'exhale' | 'hold-out'));
                          } else if (selectedTechnique === 'tech-fatigue-reset') {
                            setTechniqueProgress(Math.max(0, techniqueProgress - 20));
                          } else {
                            setTechniqueProgress(Math.max(0, techniqueProgress - 25));
                          }
                        }}
                        className="px-4 py-3 rounded-xl font-medium transition-all"
                        style={{
                          backgroundColor: 'rgba(107, 114, 128, 0.1)',
                          color: '#4B5563',
                          border: '2px solid #E5E7EB'
                        }}
                      >
                        ← Previous
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        // Go to next step or complete
                        if (selectedTechnique === 'emotion-mapping') {
                          const nextProgress = Math.min(100, techniqueProgress + 16.67);
                          setTechniqueProgress(nextProgress);
                          if (nextProgress >= 100) {
                            setIsTimerActive(false);
                          }
                        } else if (selectedTechnique === 'body-release') {
                          if (bodyPart < 4) {
                            setBodyPart(bodyPart + 1);
                            setTechniqueProgress((bodyPart + 1) * 20);
                          } else {
                            setTechniqueProgress(100);
                            setIsTimerActive(false);
                          }
                        } else if (selectedTechnique === 'box-breathing') {
                          const phases = ['inhale', 'hold-in', 'exhale', 'hold-out'];
                          const currentIndex = phases.indexOf(breathPhase);
                          const nextIndex = (currentIndex + 1) % 4;
                          setBreathPhase(phases[nextIndex] as ('inhale' | 'hold-in' | 'exhale' | 'hold-out'));
                          setBreathCycle(breathCycle + 1);
                        } else if (selectedTechnique === 'tech-fatigue-reset') {
                          const nextProgress = Math.min(100, techniqueProgress + 20);
                          setTechniqueProgress(nextProgress);
                          if (nextProgress >= 100) {
                            setIsTimerActive(false);
                          }
                        } else if (selectedTechnique === 'sensory-reset') {
                          if (senseCount < 4) {
                            setSenseCount(senseCount + 1);
                            setTechniqueProgress((senseCount + 1) * 25);
                          } else {
                            setTechniqueProgress(100);
                            setIsTimerActive(false);
                          }
                        } else {
                          const nextProgress = Math.min(100, techniqueProgress + 25);
                          setTechniqueProgress(nextProgress);
                          if (nextProgress >= 100) {
                            setIsTimerActive(false);
                          }
                        }
                      }}
                      className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
                      style={{
                        background: techniqueProgress >= 83 
                          ? 'linear-gradient(145deg, #10B981 0%, #059669 100%)' 
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
                      {techniqueProgress >= 83 ? 'Complete' : 'Next Step →'}
                    </button>
                    
                    <button
                      onClick={() => {
                        // End practice
                        setIsTimerActive(false);
                        setTechniqueProgress(0);
                        setBreathPhase('inhale');
                        setBreathCycle(0);
                        setBodyPart(0);
                        setSenseCount(0);
                        setExpansionLevel(0);
                      }}
                      className="px-4 py-3 rounded-xl font-medium transition-all"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        border: '2px solid #EF4444'
                      }}
                    >
                      End
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );


  const renderBurnoutGauge = () => (
    <section aria-labelledby="burnout-gauge-heading">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            id="burnout-gauge-heading"
            className="text-3xl font-bold mb-3"
            style={{ color: '#0D3A14' }}
          >
            Daily Burnout Gauge
          </h2>
          <p className="text-base" style={{ color: '#3A3A3A' }}>
            Quick check-in on your energy and stress levels
          </p>
        </div>
        <div className="p-4 rounded-full" style={{ backgroundColor: 'rgba(45, 95, 63, 0.15)' }}>
          <Gauge className="h-10 w-10" aria-hidden="true" style={{ color: '#0D3A14' }} />
        </div>
      </div>

      <div className="text-center py-8">
        <button
          onClick={() => setShowDailyBurnout(true)}
          className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all"
          style={{
            background: 'linear-gradient(145deg, #1A3D26 0%, #0F2818 100%)',
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
        <p className="text-sm mt-4" style={{ color: '#3A3A3A' }}>
          Complete wellness check with personalized recommendations
        </p>
        
        {/* Show last assessment if available */}
        {localStorage.getItem('todaysBurnoutAssessment') && (
          <div className="mt-6 inline-block p-4 rounded-lg" style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}>
            <p className="text-sm font-semibold" style={{ color: '#0D3A14' }}>
              ✓ Today's assessment completed
            </p>
          </div>
        )}
      </div>
    </section>
  );

  const renderDashboardHome = () => (
    <main id="dashboard-main" aria-labelledby="reflection-dashboard-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 id="reflection-dashboard-heading" className="text-4xl font-bold mb-2" style={{ color: '#1A1A1A', letterSpacing: '-0.5px' }}>
          Interpreter Wellbeing & Growth Hub
        </h1>
        <p className="text-lg" style={{ color: '#3A3A3A', fontWeight: '400' }}>
          Your daily companion for professional wellness and reflection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Burnout Gauge (Sticky) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4">
            <BurnoutGauge 
              onTakeGauge={() => {
                setShowDailyBurnout(true);
              }}
              lastScore={savedReflections.find(r => r.type === 'Daily Burnout Gauge')?.data?.overall_wellbeing || null}
              lastDate={savedReflections.find(r => r.type === 'Daily Burnout Gauge')?.timestamp || null}
            />

            {/* Quick Tools Bar - Desktop Only */}
            <aside id="quick-tools-bar" aria-label="Quick Tools" className="hidden lg:block mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Quick Tools</h3>
              <button
                onClick={() => setShowWellnessCheckIn(true)}
                className="w-full text-left px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium"
                style={{ minHeight: '44px' }}
              >
                Wellness Check-In
              </button>
              <button
                onClick={() => setShowAffirmationStudio(true)}
                className="w-full text-left px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-sm font-medium"
                style={{ minHeight: '44px' }}
              >
                Affirmation Studio
              </button>
              <button
                onClick={() => setShowBreathingPractice(true)}
                className="w-full text-left px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all text-sm font-medium"
                style={{ minHeight: '44px' }}
              >
                Breathing Practice
              </button>
              <button
                onClick={() => setShowBodyCheckIn(true)}
                className="w-full text-left px-4 py-3 bg-white rounded-lg border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-sm font-medium"
                style={{ minHeight: '44px' }}
              >
                Body Check-In
              </button>
            </aside>
          </div>
        </div>

        {/* Main Content - Reflections Area */}
        <div className="lg:col-span-2 space-y-8">

          {/* Structured Reflections Area */}
          <section
            id="structured-reflections-area"
            className="rounded-2xl p-8"
            aria-labelledby="structured-reflections-heading"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAFAF8 100%)',
              boxShadow: '0 10px 30px rgba(92, 127, 79, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 id="structured-reflections-heading" className="text-2xl font-bold mb-3" style={{ color: '#0D3A14' }}>
                  Structured Reflections & Journals
                </h2>
                <p className="text-base" style={{ color: '#3A3A3A', lineHeight: '1.6' }}>
                  Tactical, emotional, and ethical tools for every stage of your interpreting work
                </p>
              </div>
              <div
                className="p-4 rounded-full"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.15)' }}
              >
                <BookOpen className="h-10 w-10" style={{ color: '#1A3D26' }} />
              </div>
            </div>

            {/* Reflection Navigation */}
            <nav aria-label="Structured Reflections">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li>
                  <button
                    onClick={() => setShowPreAssignmentPrep(true)}
                    className="w-full card reflection-link rounded-xl p-5 text-left transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid rgba(92, 127, 79, 0.3)',
                      transform: 'translateY(0)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
                      e.currentTarget.style.backgroundColor = '#F8FBF6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(92, 127, 79, 0.3)';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <h3 className="font-bold mb-2 text-base" style={{ color: '#0D3A14' }}>
                      Pre-Assignment Prep
                    </h3>
                    <p className="text-sm" style={{ color: '#3A3A3A' }}>
                      Tactical, emotional, and ethical readiness
                    </p>
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => setShowPostAssignmentDebrief(true)}
                    className="w-full card reflection-link rounded-xl p-5 text-left transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid rgba(92, 127, 79, 0.3)',
                      transform: 'translateY(0)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
                      e.currentTarget.style.backgroundColor = '#F8FBF6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(92, 127, 79, 0.3)';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <h3 className="font-bold mb-2 text-base" style={{ color: '#0D3A14' }}>
                      Post-Assignment Debrief
                    </h3>
                    <p className="text-sm" style={{ color: '#3A3A3A' }}>
                      Consolidate growth and reset after interpreting
                    </p>
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => setShowTeamingPrep(true)}
                    className="w-full card reflection-link rounded-xl p-5 text-left transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid rgba(92, 127, 79, 0.3)',
                      transform: 'translateY(0)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
                      e.currentTarget.style.backgroundColor = '#F8FBF6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(92, 127, 79, 0.3)';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <h3 className="font-bold mb-2 text-base" style={{ color: '#0D3A14' }}>
                      Teaming Prep
                    </h3>
                    <p className="text-sm" style={{ color: '#3A3A3A' }}>
                      Prepare for smooth collaboration and handoffs
                    </p>
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => setShowTeamingReflection(true)}
                    className="w-full card reflection-link rounded-xl p-5 text-left transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid rgba(92, 127, 79, 0.3)',
                      transform: 'translateY(0)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
                      e.currentTarget.style.backgroundColor = '#F8FBF6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(92, 127, 79, 0.3)';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <h3 className="font-bold mb-2 text-base" style={{ color: '#0D3A14' }}>
                      Team Reflection
                    </h3>
                    <p className="text-sm" style={{ color: '#3A3A3A' }}>
                      Process team dynamics and collaboration
                    </p>
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => setShowMentoringPrep(true)}
                    className="w-full card reflection-link rounded-xl p-5 text-left transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid rgba(92, 127, 79, 0.3)',
                      transform: 'translateY(0)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
                      e.currentTarget.style.backgroundColor = '#F8FBF6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(92, 127, 79, 0.3)';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <h3 className="font-bold mb-2 text-base" style={{ color: '#0D3A14' }}>
                      Mentoring Prep
                    </h3>
                    <p className="text-sm" style={{ color: '#3A3A3A' }}>
                      Structure your mentoring approach
                    </p>
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => setShowEthicsMeaningCheck(true)}
                    className="w-full card reflection-link rounded-xl p-5 text-left transition-all hover:shadow-lg"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid rgba(92, 127, 79, 0.3)',
                      transform: 'translateY(0)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
                      e.currentTarget.style.backgroundColor = '#F8FBF6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(92, 127, 79, 0.3)';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <h3 className="font-bold mb-2 text-base" style={{ color: '#0D3A14' }}>
                      Ethics & Meaning Check
                    </h3>
                    <p className="text-sm" style={{ color: '#3A3A3A' }}>
                      Reflect on boundaries and professional purpose
                    </p>
                  </button>
                </li>
              </ul>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => setActiveTab('reflection')}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View All Reflection Tools →
                </button>
              </div>
            </nav>
          </section>

          {/* Recent Reflections */}
          <section
            className="rounded-2xl p-8"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 10px 30px rgba(92, 127, 79, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="recent-reflections-heading" className="text-2xl font-bold" style={{ color: '#0D3A14' }}>
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
                        e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
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
                          <h4 className="font-semibold mb-2" style={{ color: '#0D3A14' }}>
                            {reflection.type}
                          </h4>
                          <p className="text-sm mb-2" style={{ color: '#3A3A3A' }}>
                            {getReflectionSummary(reflection)}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {timeAgo}
                          </p>
                        </div>
                        <ChevronDown 
                          className="h-5 w-5 rotate-[-90deg] opacity-0 group-hover:opacity-100 transition-opacity" 
                          style={{ color: 'var(--primary-800)' }} 
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
                      e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
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
                <p className="mb-6 text-lg" style={{ color: '#3A3A3A' }}>
                  No reflections yet
                </p>
                <button
                  onClick={() => setActiveTab('reflection')}
                  className="px-8 py-3 rounded-xl font-semibold transition-all flex items-center mx-auto"
                  style={{
                    background: 'linear-gradient(145deg, #1A3D26 0%, #0F2818 100%)',
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
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Tools */}
          <section
            className="rounded-2xl p-6"
            aria-labelledby="quick-tools-heading"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 8px 20px rgba(92, 127, 79, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(92, 127, 79, 0.2)',
            }}
          >
            <h3 id="quick-tools-heading" className="text-lg font-bold mb-5" style={{ color: '#0D3A14' }}>
              Quick Tools
            </h3>
            <div className="space-y-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab('chat');
                }}
                className="w-full flex items-center p-4 rounded-xl transition-all text-left group"
                style={{
                  backgroundColor: 'rgba(92, 127, 79, 0.08)',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.15)';
                  e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
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
                  <MessageCircle className="h-5 w-5" style={{ color: '#1A3D26' }} />
                </div>
                <span className="font-medium" style={{ color: '#0D3A14' }}>
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
                  e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
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
                  <TrendingUp className="h-5 w-5" style={{ color: '#1A3D26' }} />
                </div>
                <span className="font-medium" style={{ color: '#0D3A14' }}>
                  Growth Insights
                </span>
              </button>
            </div>
          </section>

          {/* Today's Insight */}
          <section
            className="rounded-2xl p-6"
            aria-labelledby="insight-heading"
            aria-live="polite"
            style={{
              background: 'linear-gradient(145deg, #1A3D26 0%, #0F2818 100%)',
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
              <h3 id="insight-heading" className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
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
          </section>

          {/* Subscription Manager */}
          <SubscriptionManager />
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
          <h2
            id="reflection-studio-heading"
            className="text-4xl font-bold mb-3"
            style={{ color: '#1A1A1A', letterSpacing: '-0.5px' }}
          >
            Good morning, dev
          </h2>
          <p className="text-lg" style={{ color: '#3A3A3A', fontWeight: '400' }}>
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
                <h2 className="text-3xl font-bold mb-3" style={{ color: '#0D3A14' }}>
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
                <BookOpen className="h-10 w-10" style={{ color: '#1A3D26' }} />
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
                    backgroundColor: 'var(--bg-card)',
                    border: '2px solid transparent',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(0)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-800)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)';
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
                    } else if (card.title === 'Wellness Check-in') {
                      setShowWellnessCheckIn(true);
                    } else if (card.title === 'Compass Check') {
                      setShowEthicsMeaningCheck(true);
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
                      } else if (card.title === 'Wellness Check-in') {
                        setShowWellnessCheckIn(true);
                      } else if (card.title === 'Compass Check') {
                        setShowEthicsMeaningCheck(true);
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
                      style={{ color: 'var(--primary-900)' }}
                    />
                  </div>

                  <h3 className="text-lg font-bold mb-3" style={{ color: '#0D3A14' }}>
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
            <AffirmationStudioAccessible />
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
        <TeamReflectionJourneyAccessible
          onComplete={(data) => {
            console.log('Team Reflection Results:', data);
            // Data is automatically saved to local storage in the component
            setShowTeamingReflection(false);
          }}
          onClose={() => setShowTeamingReflection(false)}
          // TODO: Pass preAssignmentData when we have teaming prep data available
        />
      )}

      {/* Mentoring Prep Modal */}
      {showMentoringPrep && (
        <MentoringPrepAccessible
          onComplete={(data) => {
            console.log('Mentoring Prep Results:', data);
            // Data is automatically saved to local storage in the component
            setShowMentoringPrep(false);
          }}
          onClose={() => setShowMentoringPrep(false)}
        />
      )}

      {/* Mentoring Reflection Modal */}
      {showMentoringReflection && (
        <MentoringReflectionAccessible
          onComplete={(results) => {
            console.log('Mentoring Reflection Results:', results);
            // Data is automatically saved to local storage in the component
            setShowMentoringReflection(false);
          }}
          onClose={() => setShowMentoringReflection(false)}
          // TODO: Pass prepData when we have mentoring prep data available for comparison
        />
      )}

      {/* Wellness Check-In Modal */}
      {showWellnessCheckIn && (
        <WellnessCheckInAccessible
          onComplete={(results) => {
            // Save reflection
            saveReflection('Wellness Check-in', results);
            setShowWellnessCheckIn(false);
          }}
          onClose={() => setShowWellnessCheckIn(false)}
        />
      )}

      {/* Ethics & Meaning Check Modal */}
      {showEthicsMeaningCheck && (
        <EthicsMeaningCheckAccessible
          onComplete={(results) => {
            // Save reflection
            saveReflection('Ethics & Meaning Check-In', results);
            setShowEthicsMeaningCheck(false);
          }}
          onClose={() => setShowEthicsMeaningCheck(false)}
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

  // Show landing page if not authenticated and not in dev mode
  if (!devMode && !user && !loading) {
    return (
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/pricing" element={<PricingNew />} />
        <Route path="/landing" element={<LandingPageEnhanced onGetStarted={() => setDevMode(true)} />} />
        <Route path="*" element={
          <>
            <LandingPageEnhanced onGetStarted={() => setDevMode(true)} />
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
    <>
      {/* Security Components */}
      <PrivacyConsent 
        isOpen={showPrivacyConsent} 
        onAccept={() => setShowPrivacyConsent(false)}
        onDecline={() => setShowPrivacyConsent(false)}
      />
      
      <SessionTimeoutModal 
        isOpen={showSessionWarning}
        timeRemaining={sessionTimeRemaining}
        onExtend={() => {
          extendSession();
          setShowSessionWarning(false);
        }}
        onLogout={async () => {
          await signOut();
          setShowSessionWarning(false);
        }}
      />
      
      {/* Security Banner for authenticated users */}
      {user && <SecurityBanner type="info" />}
      
      <Routes>
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/accessibility" element={<Accessibility />} />
      <Route path="/pricing" element={<PricingNew />} />
      <Route path="/pricing-test" element={<PricingTest />} />
      <Route path="/header-demo" element={<HeaderDemo />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/landing" element={<LandingPageEnhanced onGetStarted={() => setDevMode(true)} />} />
      <Route path="/growth-insights" element={<GrowthInsights />} />
      <Route path="/growth-dashboard" element={<GrowthInsightsDashboard />} />
      <Route path="/profile-settings" element={<ProfileSettings />} />
      <Route path="/customize-preferences" element={<CustomizePreferences />} />
      <Route path="/manage-subscription" element={<ManageSubscription />} />
      <Route path="/billing-plan-details" element={<BillingPlanDetails />} />
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
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ focusRingColor: '#5C7F4F' }}
      >
        Skip to main content
      </a>
      {/* DEV MODE INDICATOR */}
      {devMode && (
        <div className="fixed top-0 left-0 right-0 text-center py-1 text-xs font-medium z-50" 
             style={{ backgroundColor: '#FEF3C7', color: '#92400E', borderBottom: '1px solid #FDE68A' }}>
          Development Mode - Authentication Bypassed
        </div>
      )}
      
      {/* Header with proper semantic structure */}
      <header
        className="border-b"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottomColor: 'rgba(92, 127, 79, 0.15)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Greeting */}
            <div className="flex items-center space-x-8">
              <Logo 
                size="md" 
                variant="default"
                linkToHome={false}
              />
              <div className="hidden md:block">
                <p className="text-lg font-medium" style={{ color: '#2D3A31' }}>
                  Welcome back, {devMode ? 'Dev Mode' : user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-sm" style={{ color: '#5C6A60' }}>
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
                  className="flex items-center space-x-2 rounded-lg px-3 py-2 transition-all"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(92, 127, 79, 0.3)',
                  }}
                  aria-label="User menu"
                  aria-expanded={showUserDropdown}
                  aria-haspopup="true"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(92, 127, 79, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(92, 127, 79, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(92, 127, 79, 0.3)';
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: '#5C7F4F',
                      color: '#FFFFFF',
                    }}
                  >
                    <span className="text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
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
                              backgroundColor: '#5C7F4F',
                            }}
                          >
                            <span className="text-base font-medium" style={{ color: '#FFFFFF' }}>
                              {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-base" style={{ color: '#1A1F1C' }}>
                              {devMode ? 'Dev Mode' : user?.email?.split('@')[0] || 'User'}
                            </div>
                            <div className="text-sm" style={{ color: '#5C6A60' }}>
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
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all text-left"
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
                          <User className="h-5 w-5" style={{ color: '#1A3D26' }} />
                          <div className="flex-grow">
                            <div className="font-medium text-sm" style={{ color: '#1A1F1C' }}>
                              Profile Settings
                            </div>
                          </div>
                          <ChevronRight
                            className="h-4 w-4"
                            style={{ color: '#748278' }}
                          />
                        </button>

                        <button
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all text-left"
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
                            <Settings className="h-5 w-5" style={{ color: '#1A3D26' }} />
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
                          onClick={() => {
                            setShowUserDropdown(false);
                            window.location.href = '/pricing';
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
                            style={{ backgroundColor: 'rgba(147, 51, 234, 0.15)' }}
                          >
                            <Zap className="h-5 w-5" style={{ color: '#9333ea' }} />
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium" style={{ color: '#FFFFFF' }}>
                              Upgrade Plan
                            </div>
                            <div className="text-xs" style={{ color: '#8A8A8A' }}>
                              View pricing & features
                            </div>
                          </div>
                          <ChevronRight
                            className="h-4 w-4 opacity-60"
                            style={{ color: '#6A6A6A' }}
                          />
                        </button>

                        <button
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all text-left"
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
                            <Shield className="h-5 w-5" style={{ color: '#1A3D26' }} />
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

      {/* Navigation Tabs with proper semantic structure */}
      <div className="px-4 sm:px-6 lg:px-8 py-3" style={{ backgroundColor: '#FAFAF8' }}>
        <nav
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
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'reflection', label: 'Reflection Studio', icon: BookOpen },
              { id: 'stress', label: 'Stress Reset', icon: RefreshCw },
              { id: 'chat', label: 'Chat with Elya', icon: MessageCircle, badge: 'BETA' },
              { id: 'insights', label: 'Growth Insights', icon: TrendingUp },
            ].map((tab) => (
              <li key={tab.id} role="presentation">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveTab(tab.id);
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium transition-all rounded-full"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                style={{
                  color: activeTab === tab.id ? '#FFFFFF' : '#4A5568',
                  backgroundColor: activeTab === tab.id ? '#5B8FE3' : 'transparent',
                  fontWeight: activeTab === tab.id ? '500' : '400',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(147, 197, 253, 0.08)';
                    e.currentTarget.style.color = '#2D3748';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#4A5568';
                  }
                }}
              >
                <tab.icon className="h-4 w-4 mr-1.5" />
                {tab.label}
                {tab.badge && (
                  <span 
                    className="ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded-full"
                    style={{ 
                      backgroundColor: activeTab === tab.id ? 'rgba(255, 255, 255, 0.3)' : 'rgba(92, 127, 79, 0.15)', 
                      color: activeTab === tab.id ? '#FFFFFF' : '#5C7F4F',
                      fontSize: '9px'
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

      {/* Main content area with proper semantic structure */}
      <main id="main-content" role="main" className="flex-1">
        <div role="tabpanel" id={`${activeTab}-panel`} aria-labelledby={activeTab}>
          {activeTab === 'reflection' && renderReflectionStudio()}
          {activeTab === 'home' && <LuxuryWellnessDashboard userName={user?.email?.split('@')[0] || 'there'} onTabChange={(tab, category) => {
            setActiveTab(tab);
            if (category) {
              setActiveCategory(category);
            }
          }} />}
          {activeTab === 'stress' && renderStressReset()}
          {activeTab === 'chat' && renderChatWithElya()}
          {activeTab === 'insights' && renderGrowthInsights()}
        </div>
      </main>



      {/* Breathing Practice Modal */}
      {showBreathingPractice && (
        <BreathingPractice
          mode={breathingMode}
          onClose={() => {
            setShowBreathingPractice(false);
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
          }}
          onComplete={() => {
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
            setShowBreathingPractice(false);
          }}
        />
      )}
      
      {/* Breathing Practice Why It Works Modal */}
      {showBreathingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowBreathingModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="breathing-modal-title"
        >
          <div
            className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <header className="mb-6">
                <h2 id="breathing-modal-title" className="text-2xl font-bold mb-3" style={{ color: '#0D3A14' }}>
                  Why Breathing Works
                </h2>
                <p className="text-sm" style={{ color: '#3A3A3A' }}>
                  The neuroscience behind controlled breathing for interpreter recovery
                </p>
              </header>

              <section className="space-y-6">
                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Vagus Nerve Activation
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Direct nervous system control:</strong> Slow, deep breathing stimulates the vagus nerve, which directly signals your body to shift from stress response to relaxation mode.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    This is particularly crucial for interpreters who experience rapid stress spikes during challenging assignments. The 4-6 breathing ratio optimizes this vagal response.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Heart Rate Variability (HRV)
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Resilience indicator:</strong> Controlled breathing increases HRV, a key marker of stress resilience and cognitive flexibility—both essential for interpreting performance.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Studies show that interpreters with higher HRV maintain better accuracy and experience less fatigue during consecutive interpreting sessions.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Prefrontal Cortex Regulation
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Executive function boost:</strong> Rhythmic breathing enhances blood flow to the prefrontal cortex, improving decision-making, language processing, and emotional regulation.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    This helps interpreters maintain cognitive clarity even after emotionally charged or technically complex assignments.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Cortisol Reduction
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Stress hormone management:</strong> Just 2-4 minutes of controlled breathing can reduce cortisol levels by up to 30%, preventing the accumulation of stress throughout your workday.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Regular breathing practices help interpreters maintain lower baseline stress levels, improving overall well-being and career longevity.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Oxygen Efficiency
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Brain fuel optimization:</strong> The 4-6 breathing pattern maximizes oxygen exchange and CO2 balance, ensuring optimal brain function for language processing.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    This is especially important for remote interpreters who may unconsciously hold their breath or breathe shallowly during intense concentration.
                  </p>
                </article>
              </section>

              <footer className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
                <p className="text-xs mb-4" style={{ color: '#525252' }}>
                  Research sources: Frontiers in Psychology, International Journal of Psychophysiology, Neuroscience & Biobehavioral Reviews
                </p>
                <button
                  onClick={() => setShowBreathingModal(false)}
                  className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-800), var(--primary-900))',
                    color: '#FFFFFF',
                  }}
                  aria-label="Close modal and return to breathing practice options"
                >
                  Ready to breathe and reset!
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* Affirmation & Reflection Studio Modal */}
      {showAffirmationStudio && (
        <AffirmationReflectionStudio
          onClose={() => setShowAffirmationStudio(false)}
        />
      )}

      {/* Body Check-In Modal */}
      {showBodyCheckIn && (
        <BodyCheckIn
          mode={bodyCheckInMode}
          onClose={() => {
            setShowBodyCheckIn(false);
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
          }}
          onComplete={(data) => {
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
            setShowBodyCheckIn(false);
            console.log('Body Check-In completed:', data);
          }}
        />
      )}
      
      {/* Body Check-In Why It Works Modal */}
      {showBodyCheckInModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowBodyCheckInModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="body-checkin-modal-title"
        >
          <div
            className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <header className="mb-6">
                <h2 id="body-checkin-modal-title" className="text-2xl font-bold mb-3" style={{ color: '#0D3A14' }}>
                  Why a Body Check-In?
                </h2>
                <p className="text-sm" style={{ color: '#3A3A3A' }}>
                  Understanding the neuroscience of somatic awareness for interpreters
                </p>
              </header>

              <section className="space-y-6">
                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    The Interpreter's Physical Load
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Research shows:</strong> Interpreters maintain heightened muscle tension throughout sessions, with neck and shoulder tension increasing by up to 47% during complex interpretations.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    This chronic tension creates feedback loops that amplify stress responses and reduce cognitive performance over time.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    The Insula Connection
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Brain science:</strong> Body scanning activates your insula cortex, the brain region that integrates physical sensations with emotional awareness.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Regular body check-ins strengthen interoception—your ability to sense internal signals—improving both stress management and decision-making.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Nervous System Reset
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Autonomic regulation:</strong> Progressive body scanning shifts your nervous system from sympathetic (fight-or-flight) to parasympathetic (rest-and-digest) dominance.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    This shift reduces cortisol, lowers heart rate, and improves vagal tone—essential for sustained cognitive performance.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Breaking the Tension-Fatigue Cycle
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Physical release:</strong> Conscious tension release prevents the accumulation of "muscle memory" from stressful interpretations.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Studies show interpreters who practice regular body scanning report 35% less physical fatigue and 40% fewer tension headaches.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#0D3A14' }}>
                    Embodied Professionalism
                  </h3>
                  <p className="text-sm mb-2" style={{ color: '#2A2A2A' }}>
                    <strong>Performance enhancement:</strong> Body awareness improves your professional presence, voice quality, and non-verbal communication.
                  </p>
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Interpreters with strong somatic awareness maintain better posture, clearer articulation, and more sustainable energy throughout long assignments.
                  </p>
                </article>
              </section>

              <footer className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(92, 127, 79, 0.2)' }}>
                <p className="text-xs mb-4" style={{ color: '#525252' }}>
                  Research sources: Journal of Psychosomatic Research, International Journal of Clinical and Health Psychology, Embodied Cognition Studies
                </p>
                <button
                  onClick={() => setShowBodyCheckInModal(false)}
                  className="w-full px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-800), var(--primary-900))',
                    color: '#FFFFFF',
                  }}
                  aria-label="Close modal and return to body check-in options"
                >
                  Ready to check in with my body!
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* Professional Boundaries Reset Modal */}
      {showProfessionalBoundariesReset && (
        <ProfessionalBoundariesReset
          mode={boundariesResetMode}
          onClose={() => {
            setShowProfessionalBoundariesReset(false);
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
          }}
          onComplete={(data) => {
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
            setShowProfessionalBoundariesReset(false);
            console.log('Professional Boundaries Reset completed:', data);
          }}
        />
      )}
      {/* Temperature Exploration Modal */}
      {showTemperatureExploration && (
        <TemperatureExploration
          onClose={() => {
            setShowTemperatureExploration(false);
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
          }}
          onComplete={(data) => {
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
            setShowTemperatureExploration(false);
            console.log('Temperature Exploration completed:', data);
          }}
        />
      )}
      {/* Assignment Reset Modal */}
      {showAssignmentReset && (
        <AssignmentReset
          mode={assignmentResetMode}
          onClose={() => {
            setShowAssignmentReset(false);
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
          }}
          onComplete={(data) => {
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
            setShowAssignmentReset(false);
            console.log('Assignment Reset completed:', data);
          }}
        />
      )}
      {/* Technology Fatigue Reset Modal */}
      {showTechnologyFatigueReset && (
        <TechnologyFatigueReset
          mode={techFatigueMode}
          onClose={() => {
            setShowTechnologyFatigueReset(false);
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
          }}
          onComplete={(data) => {
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
            setShowTechnologyFatigueReset(false);
            console.log('Technology Fatigue Reset completed:', data);
          }}
        />
      )}
      {/* Emotion Mapping Modal */}
      {showEmotionMapping && (
        <EmotionMapping
          mode={emotionMappingMode}
          onClose={() => {
            setShowEmotionMapping(false);
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
          }}
          onComplete={(data) => {
            if (currentTechniqueId) {
              trackTechniqueEnd(currentTechniqueId, 'completed');
              setCurrentTechniqueId(null);
            }
            setShowEmotionMapping(false);
            console.log('Emotion Mapping completed:', data);
          }}
        />
      )}
      
      <Footer />
    </div>
        }
      />
    </Routes>
    </>
  );
}

export default App;
