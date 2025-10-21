/**
 * Growth Insights with Supabase Integration
 * Displays comprehensive reflection data and insights from Supabase
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserReflections, 
  getReflectionStats, 
  getReflectionInsights,
  prepareDataForElya,
  ReflectionStats 
} from '../services/reflectionService';
import { 
  TrendingUp, 
  Calendar, 
  Activity, 
  Target, 
  Award,
  Brain,
  Heart,
  Users,
  ChevronRight,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react';

interface InsightData {
  patterns: string[];
  recommendations: string[];
  achievements: string[];
  areasOfGrowth: string[];
}

export const GrowthInsightsSupabase: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | '90days'>('month');
  const [stats, setStats] = useState<ReflectionStats | null>(null);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [elyaReady, setElyaReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch reflection statistics
      const statsResult = await getReflectionStats(user.id);
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }

      // Fetch insights based on time period
      const insightsResult = await getReflectionInsights(user.id, timePeriod);
      if (insightsResult.success && insightsResult.insights) {
        setInsights(insightsResult.insights);
      }

      // Check if Elya integration is available
      const elyaData = await prepareDataForElya(user.id, timePeriod);
      setElyaReady(elyaData.success);
    } catch (error) {
      console.error('Error fetching growth insights:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and refresh on time period change
  useEffect(() => {
    fetchData();
  }, [user, timePeriod]);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Connect with Elya
  const connectWithElya = async () => {
    if (!user) return;
    
    const elyaData = await prepareDataForElya(user.id, timePeriod);
    if (elyaData.success && elyaData.elyaData) {
      // In a real implementation, this would send data to Elya's API
      console.log('Elya Integration Data:', elyaData.elyaData);
      
      // Show success message
      alert(`Elya Integration Ready!
      
Your reflection data has been prepared for Elya analysis:
- ${elyaData.elyaData.reflectionSummary.totalCount} reflections analyzed
- ${elyaData.elyaData.keyThemes.length} key themes identified
- ${elyaData.elyaData.emotionalPatterns.length} emotional patterns detected

Elya can now provide personalized guidance based on your reflection history.`);
    }
  };

  // Export data
  const exportData = () => {
    if (!stats || !insights) return;
    
    const exportData = {
      exportDate: new Date().toISOString(),
      timePeriod,
      statistics: stats,
      insights: insights,
      user: user?.email
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growth-insights-${timePeriod}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-sage-600" />
          <p className="text-gray-600">Loading your growth insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Growth Insights</h2>
          <p className="text-gray-600 mt-1">Powered by your reflection data from Supabase</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={exportData}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          {elyaReady && (
            <button
              onClick={connectWithElya}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              Connect with Elya
            </button>
          )}
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        {(['week', 'month', '90days'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timePeriod === period
                ? 'bg-white text-sage-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {period === 'week' ? 'Past Week' : period === 'month' ? 'Past Month' : 'Past 90 Days'}
          </button>
        ))}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Activity className="w-5 h-5" />}
            label="Total Reflections"
            value={stats.totalReflections}
            color="blue"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5" />}
            label="Weekly Average"
            value={Math.round(stats.weeklyReflections / 7 * 10) / 10}
            suffix="/day"
            color="green"
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Current Streak"
            value={stats.streakDays}
            suffix="days"
            color="orange"
          />
          <StatCard
            icon={<Award className="w-5 h-5" />}
            label="This Month"
            value={stats.monthlyReflections}
            color="purple"
          />
        </div>
      )}

      {/* Insights Sections */}
      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patterns & Themes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-sage-600" />
              Patterns & Themes
            </h3>
            <div className="space-y-2">
              {insights.patterns.map((pattern, index) => (
                <div key={index} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-700">{pattern}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Achievements
            </h3>
            <div className="space-y-2">
              {insights.achievements.length > 0 ? (
                insights.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-yellow-500">✨</span>
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Complete more reflections to unlock achievements</p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-sage-600">•</span>
                  <span className="text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Areas of Growth */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Areas of Growth
            </h3>
            <div className="space-y-2">
              {insights.areasOfGrowth.map((area, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-green-600">→</span>
                  <span className="text-gray-700">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Reflection Types */}
      {stats && stats.topReflectionTypes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-sage-600" />
            Your Reflection Practice
          </h3>
          <div className="space-y-3">
            {stats.topReflectionTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{type.type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-sage-600 h-2 rounded-full"
                      style={{ 
                        width: `${(type.count / stats.totalReflections) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{type.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elya Integration Teaser */}
      {!elyaReady && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-start gap-4">
            <Brain className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Elya AI Integration Coming Soon
              </h3>
              <p className="text-gray-700 mb-3">
                Connect your reflection data with Elya, your AI wellness companion, for:
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Personalized wellness recommendations</li>
                <li>• Deep pattern analysis and insights</li>
                <li>• Guided reflection prompts</li>
                <li>• 24/7 support and guidance</li>
              </ul>
              <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                Learn More About Elya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Statistics Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}> = ({ icon, label, value, suffix, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-[rgba(107,130,104,0.05)] text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="text-2xl font-bold">
        {value}
        {suffix && <span className="text-lg font-normal ml-1">{suffix}</span>}
      </div>
    </div>
  );
};

export default GrowthInsightsSupabase;