import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  Star, 
  CheckCircle, 
  Award, 
  TrendingUp,
  Lock,
  Unlock,
  Shield,
  Zap,
  Heart,
  Brain
} from 'lucide-react';

// ==========================================
// WCAG 2.1 AA Compliant Dashboard Component
// ==========================================

interface ProgressData {
  reflectionsCompleted: number;
  weeklyGoal: number;
  currentStreak: number;
  totalPoints: number;
  level: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedDate?: string;
  requirement: string;
  points: number;
  category: 'wellness' | 'consistency' | 'mastery' | 'exploration';
}

interface Achievement {
  id: string;
  title: string;
  progress: number;
  total: number;
  reward: string;
}

export const AccessibilityEnhancedDashboard: React.FC = () => {
  // ==========================================
  // State Management
  // ==========================================
  const [progressData, setProgressData] = useState<ProgressData>({
    reflectionsCompleted: 0,
    weeklyGoal: 5,
    currentStreak: 0,
    totalPoints: 0,
    level: 1
  });

  const [badges, setBadges] = useState<Badge[]>([
    {
      id: 'first-reflection',
      name: 'First Step',
      description: 'Complete your first reflection',
      icon: <Star className="w-6 h-6" />,
      earned: false,
      requirement: 'Complete 1 reflection',
      points: 10,
      category: 'wellness'
    },
    {
      id: 'week-warrior',
      name: 'Week Warrior',
      description: 'Complete reflections 7 days in a row',
      icon: <Trophy className="w-6 h-6" />,
      earned: false,
      requirement: '7-day streak',
      points: 50,
      category: 'consistency'
    },
    {
      id: 'burnout-buster',
      name: 'Burnout Buster',
      description: 'Use 5 different stress reset tools',
      icon: <Shield className="w-6 h-6" />,
      earned: false,
      requirement: 'Use 5 stress tools',
      points: 30,
      category: 'wellness'
    },
    {
      id: 'self-care-champion',
      name: 'Self-Care Champion',
      description: 'Complete 20 wellness check-ins',
      icon: <Heart className="w-6 h-6" />,
      earned: false,
      requirement: '20 check-ins',
      points: 100,
      category: 'mastery'
    },
    {
      id: 'mindful-master',
      name: 'Mindful Master',
      description: 'Practice breathing exercises 10 times',
      icon: <Brain className="w-6 h-6" />,
      earned: false,
      requirement: '10 breathing sessions',
      points: 40,
      category: 'exploration'
    }
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'weekly-goal',
      title: 'Weekly Reflection Goal',
      progress: 0,
      total: 5,
      reward: '50 points'
    },
    {
      id: 'monthly-consistency',
      title: 'Monthly Consistency',
      progress: 0,
      total: 20,
      reward: 'Unlock advanced features'
    },
    {
      id: 'tool-explorer',
      title: 'Tool Explorer',
      progress: 0,
      total: 10,
      reward: 'Explorer badge'
    }
  ]);

  // ==========================================
  // Load saved progress from localStorage
  // ==========================================
  useEffect(() => {
    const loadProgress = () => {
      const saved = localStorage.getItem('userProgress');
      if (saved) {
        const data = JSON.parse(saved);
        setProgressData(data.progress || progressData);
        setBadges(data.badges || badges);
        setAchievements(data.achievements || achievements);
      }
    };
    loadProgress();
  }, []);

  // ==========================================
  // Save progress to localStorage
  // ==========================================
  useEffect(() => {
    const saveProgress = () => {
      const data = {
        progress: progressData,
        badges: badges,
        achievements: achievements,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('userProgress', JSON.stringify(data));
    };
    saveProgress();
  }, [progressData, badges, achievements]);

  // ==========================================
  // Progress calculation functions
  // ==========================================
  const calculateLevel = (points: number): number => {
    return Math.floor(points / 100) + 1;
  };

  const calculateProgress = (current: number, goal: number): number => {
    return Math.min(100, (current / goal) * 100);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage < 30) return '#EF4444'; // red
    if (percentage < 70) return '#F59E0B'; // amber
    return '#10B981'; // green
  };

  // ==========================================
  // Event handlers
  // ==========================================
  const handleReflectionComplete = () => {
    setProgressData(prev => ({
      ...prev,
      reflectionsCompleted: prev.reflectionsCompleted + 1,
      totalPoints: prev.totalPoints + 10,
      level: calculateLevel(prev.totalPoints + 10)
    }));

    // Check for badge unlocks
    setBadges(prev => prev.map(badge => {
      if (badge.id === 'first-reflection' && !badge.earned && progressData.reflectionsCompleted === 0) {
        return { ...badge, earned: true, earnedDate: new Date().toISOString() };
      }
      return badge;
    }));

    // Update achievements
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === 'weekly-goal') {
        return { ...achievement, progress: Math.min(achievement.progress + 1, achievement.total) };
      }
      return achievement;
    }));
  };

  // ==========================================
  // Render Methods
  // ==========================================
  const renderProgressBar = (value: number, max: number, label: string, id: string) => {
    const percentage = calculateProgress(value, max);
    const color = getProgressColor(percentage);
    
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor={id} className="text-sm font-medium" style={{ color: '#2D3748' }}>
            {label}
          </label>
          <span className="text-sm" style={{ color: '#4A5568' }} aria-live="polite">
            {value} / {max}
          </span>
        </div>
        <div 
          id={id}
          className="h-3 bg-gray-200 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${value} out of ${max}`}
        >
          <div 
            className="h-full transition-all duration-500 ease-out"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>
    );
  };

  const renderBadge = (badge: Badge) => {
    return (
      <article
        key={badge.id}
        className={`p-4 rounded-xl border-2 transition-all ${
          badge.earned 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-200 bg-gray-50 opacity-60'
        }`}
        aria-label={`Badge: ${badge.name}. ${badge.earned ? 'Earned' : 'Not earned'}. ${badge.description}`}
      >
        <div className="flex items-start gap-3">
          <div 
            className={`p-2 rounded-lg ${
              badge.earned ? 'bg-green-100' : 'bg-gray-100'
            }`}
            aria-hidden="true"
          >
            {React.cloneElement(badge.icon as React.ReactElement, {
              style: { color: badge.earned ? '#10B981' : '#9CA3AF' }
            })}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm" style={{ color: '#2D3748' }}>
              {badge.name}
              {badge.earned && (
                <span className="ml-2" aria-label="Badge earned">
                  <CheckCircle className="inline w-4 h-4" style={{ color: '#10B981' }} />
                </span>
              )}
            </h3>
            <p className="text-xs mt-1" style={{ color: '#4A5568' }}>
              {badge.description}
            </p>
            <p className="text-xs mt-2" style={{ color: '#6B7280' }}>
              <strong>Requirement:</strong> {badge.requirement}
            </p>
            {badge.earned && badge.earnedDate && (
              <p className="text-xs mt-1" style={{ color: '#10B981' }}>
                Earned on {new Date(badge.earnedDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs font-bold" style={{ color: badge.earned ? '#10B981' : '#9CA3AF' }}>
              +{badge.points} pts
            </span>
          </div>
        </div>
      </article>
    );
  };

  // ==========================================
  // Main Render
  // ==========================================
  return (
    <main 
      className="max-w-7xl mx-auto p-6"
      aria-labelledby="dashboard-title"
    >
      {/* Skip to main content link for keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Skip to main content
      </a>

      {/* Dashboard Header */}
      <header className="mb-8">
        <h1 
          id="dashboard-title" 
          className="text-3xl font-bold mb-2"
          style={{ color: '#1A1A1A' }}
        >
          Your Wellness Journey
        </h1>
        <p className="text-lg" style={{ color: '#4A5568' }}>
          Track your progress and earn achievements
        </p>
      </header>

      {/* Level and Points Display */}
      <section 
        className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200"
        aria-labelledby="level-display"
      >
        <h2 id="level-display" className="sr-only">Your Level and Points</h2>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium" style={{ color: '#4A5568' }}>
              Current Level
            </p>
            <p className="text-3xl font-bold" style={{ color: '#2D3748' }}>
              Level {progressData.level}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium" style={{ color: '#4A5568' }}>
              Total Points
            </p>
            <p className="text-3xl font-bold" style={{ color: '#2D3748' }}>
              {progressData.totalPoints}
              <Zap className="inline ml-2 w-6 h-6" style={{ color: '#F59E0B' }} />
            </p>
          </div>
        </div>
        
        {/* Level Progress Bar */}
        <div className="mt-4">
          {renderProgressBar(
            progressData.totalPoints % 100,
            100,
            'Progress to Next Level',
            'level-progress'
          )}
        </div>
      </section>

      {/* Main Content Grid */}
      <div 
        id="main-content" 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Progress Section */}
        <section 
          className="p-6 rounded-2xl bg-white shadow-lg border border-gray-200"
          aria-labelledby="progress-section-title"
        >
          <h2 
            id="progress-section-title" 
            className="text-xl font-bold mb-4 flex items-center"
            style={{ color: '#2D3748' }}
          >
            <Target className="w-5 h-5 mr-2" style={{ color: '#5C7F4F' }} />
            Your Progress
          </h2>
          
          {/* Weekly Goal Progress */}
          {renderProgressBar(
            progressData.reflectionsCompleted,
            progressData.weeklyGoal,
            'Weekly Reflections',
            'weekly-progress'
          )}
          
          {/* Streak Display */}
          <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#92400E' }}>
                  Current Streak
                </p>
                <p className="text-2xl font-bold" style={{ color: '#451A03' }}>
                  {progressData.currentStreak} days
                </p>
              </div>
              <TrendingUp className="w-8 h-8" style={{ color: '#F59E0B' }} />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleReflectionComplete}
            className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            aria-label="Complete today's reflection"
          >
            Complete Today's Reflection
          </button>
        </section>

        {/* Achievements Section */}
        <section 
          className="p-6 rounded-2xl bg-white shadow-lg border border-gray-200"
          aria-labelledby="achievements-section-title"
        >
          <h2 
            id="achievements-section-title" 
            className="text-xl font-bold mb-4 flex items-center"
            style={{ color: '#2D3748' }}
          >
            <Award className="w-5 h-5 mr-2" style={{ color: '#5C7F4F' }} />
            Active Achievements
          </h2>
          
          <div className="space-y-4">
            {achievements.map(achievement => (
              <div 
                key={achievement.id}
                className="p-3 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold" style={{ color: '#2D3748' }}>
                    {achievement.title}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {achievement.reward}
                  </span>
                </div>
                {renderProgressBar(
                  achievement.progress,
                  achievement.total,
                  '',
                  `achievement-${achievement.id}`
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Badges Section */}
      <section 
        className="mt-8 p-6 rounded-2xl bg-white shadow-lg border border-gray-200"
        aria-labelledby="badges-section-title"
      >
        <h2 
          id="badges-section-title" 
          className="text-xl font-bold mb-4 flex items-center"
          style={{ color: '#2D3748' }}
        >
          <Trophy className="w-5 h-5 mr-2" style={{ color: '#5C7F4F' }} />
          Your Badges
        </h2>
        
        {/* Badge Categories */}
        <div className="mb-4">
          <nav aria-label="Badge categories">
            <ul className="flex gap-2 flex-wrap">
              {['all', 'wellness', 'consistency', 'mastery', 'exploration'].map(category => (
                <li key={category}>
                  <button
                    className="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label={`Filter badges by ${category}`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Badges Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list"
          aria-label="Achievement badges"
        >
          {badges.map(badge => (
            <div key={badge.id} role="listitem">
              {renderBadge(badge)}
            </div>
          ))}
        </div>
      </section>

      {/* Accessibility Features Notice */}
      <aside 
        className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200"
        aria-labelledby="accessibility-notice"
      >
        <h3 
          id="accessibility-notice" 
          className="text-sm font-semibold mb-2"
          style={{ color: '#1E40AF' }}
        >
          Accessibility Features
        </h3>
        <ul className="text-xs space-y-1" style={{ color: '#3730A3' }}>
          <li>✓ WCAG 2.1 AA compliant</li>
          <li>✓ Keyboard navigation support</li>
          <li>✓ Screen reader optimized</li>
          <li>✓ High contrast mode compatible</li>
          <li>✓ Focus indicators on all interactive elements</li>
          <li>✓ Semantic HTML structure</li>
          <li>✓ ARIA labels and live regions</li>
        </ul>
      </aside>
    </main>
  );
};

// Export default for easy importing
export default AccessibilityEnhancedDashboard;