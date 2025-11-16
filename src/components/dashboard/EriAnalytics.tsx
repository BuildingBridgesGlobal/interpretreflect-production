'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Brain, Heart, Globe, Users, Zap, Target, Activity 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface EriData {
  assignment_date: string;
  eri_assign_score: number;
  pre_readiness_score: number;
  post_strain_score: number;
  recovery_reflection_score: number;
  assignment_name: string;
  eri_band: 'stable' | 'watch' | 'at_risk' | 'insufficient_data';
}

interface DomainData {
  domain: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface PatternInsight {
  type: 'strength' | 'risk' | 'trend';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  action?: string;
}

export function EriAnalytics({ userId }: { userId: string }) {
  const [eriHistory, setEriHistory] = useState<EriData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentEri, setCurrentEri] = useState<{ value: number; band: string } | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const loadEriData = async () => {
    try {
      // Load ERI history from assignment_eri view
      const { data: history, error } = await supabase
        .from('assignment_eri')
        .select(`
          assignment_date,
          eri_assign_score,
          pre_readiness_score,
          post_strain_score,
          recovery_reflection_score,
          assignment_name,
          eri_band
        `)
        .eq('user_id', userId)
        .order('assignment_date', { ascending: true })
        .limit(20);

      if (!error && history) {
        setEriHistory(history);
      }

      // Load current ERI from user_eri view
      const { data: current, error: currentError } = await supabase
        .from('user_eri')
        .select('eri_score_rounded, eri_band')
        .eq('user_id', userId)
        .single();

      if (!currentError && current) {
        setCurrentEri({
          value: current.eri_score_rounded,
          band: current.eri_band
        });
      }
    } catch (error) {
      console.error('Error loading ERI data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEriData();
  }, [userId, supabase]);

  const domainData: DomainData[] = useMemo(() => {
    if (eriHistory.length === 0) return [];
    
    const recent = eriHistory.slice(-5); // Last 5 assignments
    const avgReadiness = recent.reduce((sum, item) => sum + item.pre_readiness_score, 0) / recent.length;
    const avgStrain = recent.reduce((sum, item) => sum + item.post_strain_score, 0) / recent.length;
    const avgRecovery = recent.reduce((sum, item) => sum + item.recovery_reflection_score, 0) / recent.length;

    return [
      {
        domain: 'Pre-Assignment Readiness',
        score: Math.round(avgReadiness * 100),
        trend: avgReadiness > 0.7 ? 'up' : avgReadiness < 0.5 ? 'down' : 'stable',
        color: '#10B981'
      },
      {
        domain: 'Post-Assignment Strain',
        score: Math.round((1 - avgStrain) * 100), // Inverted for better visualization
        trend: avgStrain < 0.3 ? 'up' : avgStrain > 0.6 ? 'down' : 'stable',
        color: '#F59E0B'
      },
      {
        domain: 'Recovery & Reflection',
        score: Math.round(avgRecovery * 100),
        trend: avgRecovery > 0.6 ? 'up' : avgRecovery < 0.3 ? 'down' : 'stable',
        color: '#8B5CF6'
      }
    ];
  }, [eriHistory]);

  const patternInsights: PatternInsight[] = useMemo(() => {
    const insights: PatternInsight[] = [];
    
    if (eriHistory.length < 3) return insights;

    const recent = eriHistory.slice(-5);
    const eriScores = recent.map(item => item.eri_assign_score);
    const avgEri = eriScores.reduce((sum, score) => sum + score, 0) / eriScores.length;
    
    // Trend analysis
    const isDeclining = eriScores.length >= 3 && 
      eriScores.slice(-3).every((score, i, arr) => i === 0 || score < arr[i-1]);
    const isImproving = eriScores.length >= 3 && 
      eriScores.slice(-3).every((score, i, arr) => i === 0 || score > arr[i-1]);

    if (isDeclining) {
      insights.push({
        type: 'risk',
        title: 'ERI Declining Trend',
        description: 'Your ECCI Readiness Index has declined over the last 3 assignments. Consider increasing recovery activities.',
        severity: 'high',
        action: 'Focus on post-assignment recovery protocols'
      });
    }

    if (isImproving) {
      insights.push({
        type: 'strength',
        title: 'ERI Improving Trend',
        description: 'Great progress! Your ECCI Readiness Index is trending upward.',
        severity: 'low',
        action: 'Maintain current preparation and recovery practices'
      });
    }

    // High strain pattern
    const highStrainAssignments = recent.filter(item => item.post_strain_score > 0.7);
    if (highStrainAssignments.length >= 2) {
      insights.push({
        type: 'risk',
        title: 'High Strain Pattern',
        description: `${highStrainAssignments.length} recent assignments show high post-assignment strain.`,
        severity: 'medium',
        action: 'Review assignment complexity and consider additional support'
      });
    }

    // Recovery gap
    const lowRecoveryAssignments = recent.filter(item => item.recovery_reflection_score < 0.3);
    if (lowRecoveryAssignments.length >= 2) {
      insights.push({
        type: 'risk',
        title: 'Recovery Gap Identified',
        description: 'Low recovery scores detected. This may impact long-term sustainability.',
        severity: 'medium',
        action: 'Implement structured recovery protocols'
      });
    }

    return insights;
  }, [eriHistory]);

  if (loading) {
    return (
      <div className="bg-white rounded-data shadow-card p-8 border border-brand-gray-200">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-electric border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-brand-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (eriHistory.length === 0) {
    return (
      <div className="bg-white rounded-data shadow-card p-8 border border-brand-gray-200">
        <div className="text-center">
          <Activity className="w-12 h-12 text-brand-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-primary mb-2">No Analytics Data Yet</h3>
          <p className="text-brand-gray-600 mb-4">Complete a few assignments to see your performance analytics.</p>
          <a href="/dashboard/assignments/new" className="inline-block bg-brand-electric text-white px-4 py-2 rounded-data hover:bg-brand-electric-hover transition-colors">
            Start First Assignment
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current ERI Status */}
      {currentEri && (
        <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Current ECCI Readiness Index
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              currentEri.band === 'stable' ? 'bg-green-100 text-green-700' :
              currentEri.band === 'watch' ? 'bg-yellow-100 text-yellow-700' :
              currentEri.band === 'at_risk' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {currentEri.band.replace('_', ' ').toUpperCase()}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-primary font-mono">{currentEri.value}</div>
              <div className="text-sm text-brand-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 font-mono">{eriHistory.length}</div>
              <div className="text-sm text-brand-gray-600">Total Assignments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 font-mono">
                {Math.round(eriHistory.slice(-5).reduce((sum, item) => sum + item.eri_assign_score, 0) / Math.min(5, eriHistory.length))}
              </div>
              <div className="text-sm text-brand-gray-600">5-Avg Score</div>
            </div>
          </div>
        </div>
      )}

      {/* ERI Trend Chart */}
      <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
        <h3 className="text-xl font-bold text-brand-primary mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          ERI Performance Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={eriHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="assignment_date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [
                  Math.round(value),
                  name === 'eri_assign_score' ? 'ERI Score' :
                  name === 'pre_readiness_score' ? 'Pre-Readiness' :
                  name === 'post_strain_score' ? 'Post-Strain' :
                  'Recovery'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="eri_assign_score" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="eri_assign_score"
              />
              <Line 
                type="monotone" 
                dataKey="pre_readiness_score" 
                stroke="#10B981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="pre_readiness_score"
              />
              <Line 
                type="monotone" 
                dataKey="post_strain_score" 
                stroke="#F59E0B" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="post_strain_score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Domain Performance */}
      <div className="grid md:grid-cols-3 gap-6">
        {domainData.map((domain, index) => (
          <div key={index} className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-brand-primary">{domain.domain}</h4>
              <div className={`flex items-center gap-1 ${
                domain.trend === 'up' ? 'text-green-600' :
                domain.trend === 'down' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {domain.trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                 domain.trend === 'down' ? <TrendingDown className="w-4 h-4" /> :
                 <Activity className="w-4 h-4" />}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-brand-gray-600">Score</span>
                <span className="font-mono font-semibold">{domain.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${domain.score}%`,
                    backgroundColor: domain.color
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pattern Recognition Insights */}
      {patternInsights.length > 0 && (
        <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
          <h3 className="text-xl font-bold text-brand-primary mb-4 flex items-center gap-2">
            <Target className="w-6 h-6" />
            AI-Powered Insights
          </h3>
          <div className="space-y-4">
            {patternInsights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'strength' ? 'bg-green-50 border-green-500' :
                insight.type === 'risk' ? 'bg-red-50 border-red-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {insight.type === 'strength' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                     insight.type === 'risk' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
                     <Zap className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-brand-primary mb-1">{insight.title}</h4>
                    <p className="text-brand-gray-700 text-sm mb-2">{insight.description}</p>
                    {insight.action && (
                      <div className="text-xs text-brand-electric font-medium">{insight.action}</div>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    insight.severity === 'high' ? 'bg-red-100 text-red-700' :
                    insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {insight.severity.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}