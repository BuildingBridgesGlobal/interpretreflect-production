'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Calendar, Clock, TrendingUp, Users, Globe, Heart, Brain,
  AlertTriangle, CheckCircle, Activity, Target, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface WeeklyMetrics {
  week_start: string;
  assignment_count: number;
  avg_eri: number;
  avg_readiness: number;
  avg_strain: number;
  avg_recovery: number;
  burnout_risk: 'low' | 'medium' | 'high';
}

interface EccDomainData {
  domain: string;
  current_score: number;
  baseline_score: number;
  trend: 'improving' | 'declining' | 'stable';
  color: string;
}

interface AssignmentPattern {
  pattern_type: 'high_performer' | 'at_risk' | 'recovering' | 'consistent';
  description: string;
  recommendations: string[];
  confidence: number;
}

export function PerformanceTrends({ userId }: { userId: string }) {
  const [weeklyMetrics, setWeeklyMetrics] = useState<WeeklyMetrics[]>([]);
  const [eccDomains, setEccDomains] = useState<EccDomainData[]>([]);
  const [assignmentPattern, setAssignmentPattern] = useState<AssignmentPattern | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const loadTrendData = async () => {
    try {
      // Load weekly metrics for the last 8 weeks
      const { data: metrics, error: metricsError } = await supabase
        .from('assignment_eri')
        .select(`
          assignment_date,
          eri_assign_score,
          pre_readiness_score,
          post_strain_score,
          recovery_reflection_score
        `)
        .eq('user_id', userId)
        .gte('assignment_date', new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('assignment_date', { ascending: true });

      if (!metricsError && metrics) {
        // Group by week and calculate averages
        const weeklyData = groupByWeek(metrics);
        setWeeklyMetrics(weeklyData);
      }

      // Load ECC domain data from readiness checks and reflections
      const { data: domainData, error: domainError } = await supabase
        .from('assignment_eri')
        .select(`
          assignment_date,
          pre_emotional_state_score,
          pre_cognitive_readiness_score,
          pre_context_familiarity_score,
          pre_role_clarity_score,
          pre_ai_confidence_score,
          post_emotional_load_score,
          post_cognitive_load_score,
          post_meaning_challenge_score,
          post_rolespace_challenge_score,
          post_cultural_friction_score,
          post_ai_impact_score
        `)
        .eq('user_id', userId)
        .order('assignment_date', { ascending: true });

      if (!domainError && domainData) {
        const domains = calculateEccDomains(domainData);
        setEccDomains(domains);
      }

      // Analyze assignment patterns
      if (metrics && metrics.length >= 5) {
        const pattern = analyzeAssignmentPattern(metrics);
        setAssignmentPattern(pattern);
      }

    } catch (error) {
      console.error('Error loading trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByWeek = (data: any[]): WeeklyMetrics[] => {
    const weeks: { [key: string]: any[] } = {};
    
    data.forEach(item => {
      const date = new Date(item.assignment_date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) weeks[weekKey] = [];
      weeks[weekKey].push(item);
    });

    return Object.entries(weeks).map(([week_start, items]) => {
      const avgEri = items.reduce((sum, item) => sum + item.eri_assign_score, 0) / items.length;
      const avgReadiness = items.reduce((sum, item) => sum + item.pre_readiness_score, 0) / items.length;
      const avgStrain = items.reduce((sum, item) => sum + item.post_strain_score, 0) / items.length;
      const avgRecovery = items.reduce((sum, item) => sum + item.recovery_reflection_score, 0) / items.length;
      
      // Calculate burnout risk based on strain and recovery patterns
      let burnout_risk: 'low' | 'medium' | 'high' = 'low';
      if (avgStrain > 0.7 && avgRecovery < 0.3) burnout_risk = 'high';
      else if (avgStrain > 0.5 && avgRecovery < 0.4) burnout_risk = 'medium';

      return {
        week_start,
        assignment_count: items.length,
        avg_eri: Math.round(avgEri),
        avg_readiness: Math.round(avgReadiness * 100),
        avg_strain: Math.round(avgStrain * 100),
        avg_recovery: Math.round(avgRecovery * 100),
        burnout_risk
      };
    }).sort((a, b) => a.week_start.localeCompare(b.week_start));
  };

  const calculateEccDomains = (data: any[]): EccDomainData[] => {
    const recent = data.slice(-10); // Last 10 assignments
    const baseline = data.slice(0, 5); // First 5 assignments

    const domains = [
      {
        domain: 'Emotional Intelligence',
        current: recent.reduce((sum, item) => sum + (item.pre_emotional_state_score || 0), 0) / recent.length,
        baseline: baseline.reduce((sum, item) => sum + (item.pre_emotional_state_score || 0), 0) / baseline.length,
        color: '#EF4444'
      },
      {
        domain: 'Cognitive Readiness',
        current: recent.reduce((sum, item) => sum + (item.pre_cognitive_readiness_score || 0), 0) / recent.length,
        baseline: baseline.reduce((sum, item) => sum + (item.pre_cognitive_readiness_score || 0), 0) / baseline.length,
        color: '#3B82F6'
      },
      {
        domain: 'Context Familiarity',
        current: recent.reduce((sum, item) => sum + (item.pre_context_familiarity_score || 0), 0) / recent.length,
        baseline: baseline.reduce((sum, item) => sum + (item.pre_context_familiarity_score || 0), 0) / baseline.length,
        color: '#10B981'
      },
      {
        domain: 'Role Clarity',
        current: recent.reduce((sum, item) => sum + (item.pre_role_clarity_score || 0), 0) / recent.length,
        baseline: baseline.reduce((sum, item) => sum + (item.pre_role_clarity_score || 0), 0) / baseline.length,
        color: '#F59E0B'
      },
      {
        domain: 'AI Collaboration',
        current: recent.reduce((sum, item) => sum + (item.pre_ai_confidence_score || 0), 0) / recent.length,
        baseline: baseline.reduce((sum, item) => sum + (item.pre_ai_confidence_score || 0), 0) / baseline.length,
        color: '#8B5CF6'
      },
      {
        domain: 'Cultural Adaptation',
        current: 5 - (recent.reduce((sum, item) => sum + (item.post_cultural_friction_score || 0), 0) / recent.length),
        baseline: 5 - (baseline.reduce((sum, item) => sum + (item.post_cultural_friction_score || 0), 0) / baseline.length),
        color: '#F97316'
      }
    ];

    return domains.map(domain => ({
      ...domain,
      current_score: Math.round(domain.current * 20), // Convert to percentage
      baseline_score: Math.round(domain.baseline * 20),
      trend: domain.current > domain.baseline + 0.3 ? 'improving' :
             domain.current < domain.baseline - 0.3 ? 'declining' : 'stable'
    }));
  };

  const analyzeAssignmentPattern = (data: any[]): AssignmentPattern => {
    const recent = data.slice(-10);
    const avgEri = recent.reduce((sum, item) => sum + item.eri_assign_score, 0) / recent.length;
    const eriTrend = recent.slice(-5).reduce((sum, item, i, arr) => {
      if (i === 0) return 0;
      return sum + (item.eri_assign_score - arr[i-1].eri_assign_score);
    }, 0) / 4;

    const avgStrain = recent.reduce((sum, item) => sum + item.post_strain_score, 0) / recent.length;
    const avgRecovery = recent.reduce((sum, item) => sum + item.recovery_reflection_score, 0) / recent.length;

    if (avgEri >= 80 && eriTrend >= 0) {
      return {
        pattern_type: 'high_performer',
        description: 'Consistently high performance with stable or improving trends',
        recommendations: [
          'Maintain current preparation routines',
          'Consider mentoring other interpreters',
          'Share best practices with the community'
        ],
        confidence: 90
      };
    } else if (avgEri < 60 && eriTrend < 0) {
      return {
        pattern_type: 'at_risk',
        description: 'Low performance with declining trends - immediate attention needed',
        recommendations: [
          'Implement structured recovery protocols',
          'Reduce assignment complexity temporarily',
          'Seek peer support or supervision',
          'Focus on stress management techniques'
        ],
        confidence: 85
      };
    } else if (avgEri < 60 && eriTrend >= 0) {
      return {
        pattern_type: 'recovering',
        description: 'Improving from low baseline - positive trajectory',
        recommendations: [
          'Continue current improvement strategies',
          'Gradually increase assignment complexity',
          'Monitor recovery patterns closely',
          'Celebrate progress milestones'
        ],
        confidence: 80
      };
    } else {
      return {
        pattern_type: 'consistent',
        description: 'Stable performance within normal range',
        recommendations: [
          'Maintain balanced workload',
          'Continue regular reflection practices',
          'Look for optimization opportunities',
          'Consider professional development'
        ],
        confidence: 75
      };
    }
  };

  useEffect(() => {
    loadTrendData();
  }, [userId, supabase]);

  if (loading) {
    return (
      <div className="bg-white rounded-data shadow-card p-8 border border-brand-gray-200">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-electric border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-brand-gray-600">Loading performance trends...</span>
        </div>
      </div>
    );
  }

  if (weeklyMetrics.length === 0) {
    return (
      <div className="bg-white rounded-data shadow-card p-8 border border-brand-gray-200">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-brand-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-primary mb-2">No Trend Data Yet</h3>
          <p className="text-brand-gray-600 mb-4">Complete more assignments to see performance trends.</p>
          <a href="/dashboard/assignments/new" className="inline-block bg-brand-electric text-white px-4 py-2 rounded-data hover:bg-brand-electric-hover transition-colors">
            Start New Assignment
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assignment Pattern Recognition */}
      {assignmentPattern && (
        <div className={`rounded-data shadow-card p-6 border ${
          assignmentPattern.pattern_type === 'high_performer' ? 'bg-green-50 border-green-200' :
          assignmentPattern.pattern_type === 'at_risk' ? 'bg-red-50 border-red-200' :
          assignmentPattern.pattern_type === 'recovering' ? 'bg-blue-50 border-blue-200' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2">
              <Target className="w-6 h-6" />
              Assignment Pattern: {assignmentPattern.pattern_type.replace('_', ' ').toUpperCase()}
            </h3>
            <div className="text-sm text-brand-gray-600">
              Confidence: {assignmentPattern.confidence}%
            </div>
          </div>
          <p className="text-brand-gray-700 mb-4">{assignmentPattern.description}</p>
          <div className="space-y-2">
            <h4 className="font-semibold text-brand-primary">Recommendations:</h4>
            <ul className="space-y-1">
              {assignmentPattern.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-brand-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Weekly Performance Trends */}
      <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
        <h3 className="text-xl font-bold text-brand-primary mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          8-Week Performance Trends
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="week_start" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => `Week of ${new Date(value).toLocaleDateString()}`}
                formatter={(value: number, name: string) => [
                  name === 'avg_eri' ? `${value}% ERI` :
                  name === 'avg_readiness' ? `${value}% Readiness` :
                  name === 'avg_strain' ? `${value}% Strain` :
                  `${value}% Recovery`,
                  name === 'avg_eri' ? 'ERI Score' :
                  name === 'avg_readiness' ? 'Pre-Readiness' :
                  name === 'avg_strain' ? 'Post-Strain' :
                  'Recovery'
                ]}
              />
              <Bar dataKey="avg_eri" fill="#3B82F6" name="avg_eri" />
              <Bar dataKey="avg_readiness" fill="#10B981" name="avg_readiness" />
              <Bar dataKey="avg_strain" fill="#F59E0B" name="avg_strain" />
              <Bar dataKey="avg_recovery" fill="#8B5CF6" name="avg_recovery" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 font-mono">
              {Math.round(weeklyMetrics.reduce((sum, week) => sum + week.avg_eri, 0) / weeklyMetrics.length)}
            </div>
            <div className="text-xs text-brand-gray-600">Avg ERI</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 font-mono">
              {Math.round(weeklyMetrics.reduce((sum, week) => sum + week.avg_readiness, 0) / weeklyMetrics.length)}
            </div>
            <div className="text-xs text-brand-gray-600">Avg Readiness</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600 font-mono">
              {Math.round(weeklyMetrics.reduce((sum, week) => sum + week.avg_strain, 0) / weeklyMetrics.length)}
            </div>
            <div className="text-xs text-brand-gray-600">Avg Strain</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 font-mono">
              {Math.round(weeklyMetrics.reduce((sum, week) => sum + week.avg_recovery, 0) / weeklyMetrics.length)}
            </div>
            <div className="text-xs text-brand-gray-600">Avg Recovery</div>
          </div>
        </div>
      </div>

      {/* ECC Domain Radar Chart */}
      {eccDomains.length > 0 && (
        <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
          <h3 className="text-xl font-bold text-brand-primary mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6" />
            ECC Domain Performance Radar
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={eccDomains}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="domain" 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <Radar 
                  name="Current" 
                  dataKey="current_score" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar 
                  name="Baseline" 
                  dataKey="baseline_score" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name === 'current_score' ? 'Current Score' : 'Baseline Score'
                  ]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-brand-gray-600">Current Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" style={{ opacity: 0.5 }}></div>
              <span className="text-sm text-brand-gray-600">Baseline Performance</span>
            </div>
          </div>
        </div>
      )}

      {/* Burnout Risk Assessment */}
      <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
        <h3 className="text-xl font-bold text-brand-primary mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Burnout Risk Assessment
        </h3>
        <div className="space-y-4">
          {weeklyMetrics.slice(-4).map((week, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              week.burnout_risk === 'high' ? 'bg-red-50 border-red-500' :
              week.burnout_risk === 'medium' ? 'bg-yellow-50 border-yellow-500' :
              'bg-green-50 border-green-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-brand-primary">
                  Week of {new Date(week.week_start).toLocaleDateString()}
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  week.burnout_risk === 'high' ? 'bg-red-100 text-red-700' :
                  week.burnout_risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {week.burnout_risk.toUpperCase()} RISK
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-brand-gray-600">Assignments</div>
                  <div className="font-semibold">{week.assignment_count}</div>
                </div>
                <div>
                  <div className="text-brand-gray-600">ERI</div>
                  <div className="font-semibold">{week.avg_eri}%</div>
                </div>
                <div>
                  <div className="text-brand-gray-600">Strain</div>
                  <div className="font-semibold">{week.avg_strain}%</div>
                </div>
                <div>
                  <div className="text-brand-gray-600">Recovery</div>
                  <div className="font-semibold">{week.avg_recovery}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}