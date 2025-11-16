'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, Target,
  Activity, Clock, Calendar, BarChart3, Eye, Filter, Download, RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

interface PatternInsight {
  id: string;
  type: 'burnout_risk' | 'performance_decline' | 'recovery_gap' | 'overwork_pattern' | 'skill_gap' | 'growth_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  evidence: string[];
  recommendations: string[];
  predicted_impact: string;
  timeframe: string;
  related_metrics: { name: string; value: number; trend: 'up' | 'down' | 'stable' }[];
}

interface TrendAnalysis {
  metric: string;
  current_value: number;
  trend_direction: 'improving' | 'declining' | 'stable';
  trend_strength: number; // 0-100
  volatility: number; // 0-100
  change_rate: number; // percentage change per week
  prediction_next_week: number;
  prediction_confidence: number;
}

interface BurnoutPrediction {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100
  contributing_factors: string[];
  protective_factors: string[];
  timeline_weeks: number;
  early_warning_signs: string[];
  intervention_recommendations: string[];
}

export function AdvancedPatternRecognition({ userId }: { userId: string }) {
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [burnoutPredictions, setBurnoutPredictions] = useState<BurnoutPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<PatternInsight | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'4w' | '8w' | '12w' | '6m'>('8w');
  const supabase = useMemo(() => createClient(), []);

  const loadPatternData = async () => {
    try {
      setLoading(true);
      
      // Load assignment data for pattern analysis
      const weeksBack = timeRange === '4w' ? 4 : timeRange === '8w' ? 8 : timeRange === '12w' ? 12 : 26;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - weeksBack * 7);

      const { data: assignments, error } = await supabase
        .from('assignment_eri')
        .select(`
          assignment_date,
          eri_assign_score,
          pre_readiness_score,
          post_strain_score,
          recovery_reflection_score,
          pre_emotional_state_score,
          pre_cognitive_readiness_score,
          pre_context_familiarity_score,
          pre_role_clarity_score,
          post_emotional_load_score,
          post_cognitive_load_score,
          post_meaning_challenge_score,
          post_rolespace_challenge_score,
          post_cultural_friction_score,
          post_recovery_actions,
          post_reflection_depth_self_score
        `)
        .eq('user_id', userId)
        .gte('assignment_date', startDate.toISOString())
        .order('assignment_date', { ascending: true });

      if (!error && assignments && assignments.length > 0) {
        // Generate pattern insights
        const generatedInsights = generatePatternInsights(assignments);
        setInsights(generatedInsights);

        // Analyze trends
        const trendAnalysis = analyzeTrends(assignments);
        setTrends(trendAnalysis);

        // Predict burnout risk
        const burnoutAnalysis = predictBurnoutRisk(assignments);
        setBurnoutPredictions(burnoutAnalysis);
      }
    } catch (error) {
      console.error('Error loading pattern data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePatternInsights = (data: any[]): PatternInsight[] => {
    const insights: PatternInsight[] = [];

    // Pattern 1: Burnout Risk Detection
    const recentAssignments = data.slice(-10);
    const avgStrain = recentAssignments.reduce((sum, item) => sum + item.post_strain_score, 0) / recentAssignments.length;
    const avgRecovery = recentAssignments.reduce((sum, item) => sum + item.recovery_reflection_score, 0) / recentAssignments.length;
    const strainTrend = recentAssignments.slice(-5).reduce((sum, item, i, arr) => {
      if (i === 0) return 0;
      return sum + (item.post_strain_score - arr[i-1].post_strain_score);
    }, 0) / 4;

    if (avgStrain > 0.7 && avgRecovery < 0.3 && strainTrend > 0) {
      insights.push({
        id: 'burnout_risk_001',
        type: 'burnout_risk',
        severity: 'high',
        title: 'High Burnout Risk Detected',
        description: 'Recent assignments show high strain with low recovery, indicating potential burnout risk.',
        confidence: 85,
        evidence: [
          `Average strain score: ${(avgStrain * 100).toFixed(1)}% (High)`,
          `Average recovery: ${(avgRecovery * 100).toFixed(1)}% (Low)`,
          `Strain trend: ${strainTrend > 0 ? 'Increasing' : 'Stable'}`,
          `${recentAssignments.filter(a => a.post_strain_score > 0.7).length} of last 10 assignments with high strain`
        ],
        recommendations: [
          'Implement immediate stress reduction protocols',
          'Reduce assignment complexity temporarily',
          'Increase recovery activities between assignments',
          'Consider professional support or counseling',
          'Monitor closely for next 2-3 weeks'
        ],
        predicted_impact: 'Without intervention, burnout risk may increase to critical levels within 3-4 weeks',
        timeframe: 'Immediate action recommended',
        related_metrics: [
          { name: 'Avg Strain', value: avgStrain * 100, trend: strainTrend > 0 ? 'up' : 'down' },
          { name: 'Avg Recovery', value: avgRecovery * 100, trend: 'down' },
          { name: 'High Strain Assignments', value: (recentAssignments.filter(a => a.post_strain_score > 0.7).length / recentAssignments.length) * 100, trend: 'up' }
        ]
      });
    }

    // Pattern 2: Performance Decline
    const eriScores = data.map(item => item.eri_assign_score);
    const recentEri = eriScores.slice(-8);
    const earlierEri = eriScores.slice(-16, -8);
    
    if (recentEri.length >= 5 && earlierEri.length >= 5) {
      const recentAvg = recentEri.reduce((sum, score) => sum + score, 0) / recentEri.length;
      const earlierAvg = earlierEri.reduce((sum, score) => sum + score, 0) / earlierEri.length;
      const declineRate = ((earlierAvg - recentAvg) / earlierAvg) * 100;

      if (declineRate > 10) {
        insights.push({
          id: 'performance_decline_001',
          type: 'performance_decline',
          severity: declineRate > 20 ? 'high' : 'medium',
          title: 'Performance Decline Detected',
          description: `ERI scores have declined by ${declineRate.toFixed(1)}% over the past ${recentEri.length} assignments.`,
          confidence: Math.min(90, declineRate * 3),
          evidence: [
            `Previous 8-week average: ${earlierAvg.toFixed(1)}`,
            `Recent 8-week average: ${recentAvg.toFixed(1)}`,
            `Decline rate: ${declineRate.toFixed(1)}%`,
            `${recentEri.filter(score => score < 60).length} recent assignments below threshold`
          ],
          recommendations: [
            'Review recent assignment types and complexity',
            'Assess external stressors or life changes',
            'Consider workload adjustment',
            'Focus on preparation and recovery protocols',
            'Seek peer support or supervision'
          ],
          predicted_impact: 'Continued decline may lead to increased error rates and reduced job satisfaction',
          timeframe: 'Review within 1-2 weeks',
          related_metrics: [
            { name: 'ERI Trend', value: recentAvg, trend: 'down' },
            { name: 'Decline Rate', value: declineRate, trend: 'up' },
            { name: 'Below Threshold', value: (recentEri.filter(score => score < 60).length / recentEri.length) * 100, trend: 'up' }
          ]
        });
      }
    }

    // Pattern 3: Recovery Gap
    const lowRecoveryStreak = findConsecutiveLowRecovery(data);
    if (lowRecoveryStreak.count >= 3) {
      insights.push({
        id: 'recovery_gap_001',
        type: 'recovery_gap',
        severity: lowRecoveryStreak.count > 5 ? 'high' : 'medium',
        title: 'Recovery Gap Pattern',
        description: `${lowRecoveryStreak.count} consecutive assignments with insufficient recovery activities.`,
        confidence: Math.min(85, lowRecoveryStreak.count * 15),
        evidence: [
          `Consecutive low recovery: ${lowRecoveryStreak.count} assignments`,
          `Average recovery score: ${(lowRecoveryStreak.avgRecovery * 100).toFixed(1)}%`,
          `Recovery actions used: ${lowRecoveryStreak.commonActions.join(', ')}`,
          `Time span: ${lowRecoveryStreak.timeSpan} days`
        ],
        recommendations: [
          'Implement structured recovery protocols',
          'Schedule dedicated recovery time between assignments',
          'Explore new recovery techniques',
          'Consider assignment spacing adjustments',
          'Monitor energy levels and fatigue patterns'
        ],
        predicted_impact: 'Recovery gaps may lead to cumulative fatigue and reduced performance quality',
        timeframe: 'Address within 1 week',
        related_metrics: [
          { name: 'Recovery Score', value: lowRecoveryStreak.avgRecovery * 100, trend: 'down' },
          { name: 'Consecutive Low', value: lowRecoveryStreak.count, trend: 'up' },
          { name: 'Recovery Actions', value: lowRecoveryStreak.actionVariety, trend: 'down' }
        ]
      });
    }

    // Pattern 4: Overwork Pattern
    const highAssignmentFrequency = analyzeAssignmentFrequency(data);
    if (highAssignmentFrequency.riskLevel === 'high') {
      insights.push({
        id: 'overwork_pattern_001',
        type: 'overwork_pattern',
        severity: 'high',
        title: 'High Assignment Frequency',
        description: `Assignments are occurring too frequently (${highAssignmentFrequency.avgDaysBetween} days average gap).`,
        confidence: highAssignmentFrequency.confidence,
        evidence: [
          `Average days between assignments: ${highAssignmentFrequency.avgDaysBetween}`,
          `Assignments in last 4 weeks: ${highAssignmentFrequency.recentCount}`,
          `Weekend/overtime assignments: ${highAssignmentFrequency.weekendAssignments}`,
          `Peak frequency: ${highAssignmentFrequency.peakFrequency} assignments per week`
        ],
        recommendations: [
          'Implement mandatory rest periods',
          'Review assignment scheduling practices',
          'Consider workload redistribution',
          'Establish minimum recovery time standards',
          'Monitor for signs of overwork'
        ],
        predicted_impact: 'Sustained high frequency may lead to burnout and quality degradation',
        timeframe: 'Immediate scheduling review needed',
        related_metrics: [
          { name: 'Days Between', value: highAssignmentFrequency.avgDaysBetween, trend: 'down' },
          { name: 'Recent Count', value: highAssignmentFrequency.recentCount, trend: 'up' },
          { name: 'Weekend Work', value: highAssignmentFrequency.weekendAssignments, trend: 'up' }
        ]
      });
    }

    return insights;
  };

  const analyzeTrends = (data: any[]): TrendAnalysis[] => {
    const trends: TrendAnalysis[] = [];

    // ERI Trend Analysis
    const eriScores = data.map(item => item.eri_assign_score);
    const eriTrend = calculateTrend(eriScores);
    trends.push({
      metric: 'ECCI Readiness Index',
      current_value: eriScores[eriScores.length - 1],
      trend_direction: eriTrend.direction,
      trend_strength: eriTrend.strength,
      volatility: eriTrend.volatility,
      change_rate: eriTrend.changeRate,
      prediction_next_week: eriTrend.prediction,
      prediction_confidence: eriTrend.confidence
    });

    // Strain Trend Analysis
    const strainScores = data.map(item => item.post_strain_score);
    const strainTrend = calculateTrend(strainScores);
    trends.push({
      metric: 'Post-Assignment Strain',
      current_value: strainScores[strainScores.length - 1],
      trend_direction: strainTrend.direction === 'improving' ? 'declining' : strainTrend.direction,
      trend_strength: strainTrend.strength,
      volatility: strainTrend.volatility,
      change_rate: strainTrend.changeRate,
      prediction_next_week: strainTrend.prediction,
      prediction_confidence: strainTrend.confidence
    });

    // Recovery Trend Analysis
    const recoveryScores = data.map(item => item.recovery_reflection_score);
    const recoveryTrend = calculateTrend(recoveryScores);
    trends.push({
      metric: 'Recovery & Reflection',
      current_value: recoveryScores[recoveryScores.length - 1],
      trend_direction: recoveryTrend.direction,
      trend_strength: recoveryTrend.strength,
      volatility: recoveryTrend.volatility,
      change_rate: recoveryTrend.changeRate,
      prediction_next_week: recoveryTrend.prediction,
      prediction_confidence: recoveryTrend.confidence
    });

    return trends;
  };

  const predictBurnoutRisk = (data: any[]): BurnoutPrediction[] => {
    const predictions: BurnoutPrediction[] = [];

    // Analyze recent patterns for burnout prediction
    const recentData = data.slice(-12); // Last 12 assignments
    
    if (recentData.length < 8) return predictions;

    const avgStrain = recentData.reduce((sum, item) => sum + item.post_strain_score, 0) / recentData.length;
    const avgRecovery = recentData.reduce((sum, item) => sum + item.recovery_reflection_score, 0) / recentData.length;
    const strainTrend = recentData.slice(-6).reduce((sum, item, i, arr) => {
      if (i === 0) return 0;
      return sum + (item.post_strain_score - arr[i-1].post_strain_score);
    }, 0) / 5;

    const recoveryTrend = recentData.slice(-6).reduce((sum, item, i, arr) => {
      if (i === 0) return 0;
      return sum + (item.recovery_reflection_score - arr[i-1].recovery_reflection_score);
    }, 0) / 5;

    const highStrainCount = recentData.filter(item => item.post_strain_score > 0.7).length;
    const lowRecoveryCount = recentData.filter(item => item.recovery_reflection_score < 0.3).length;

    // Calculate burnout risk probability
    let riskProbability = 0;
    const contributingFactors: string[] = [];
    const protectiveFactors: string[] = [];

    // Strain-based risk
    if (avgStrain > 0.7) {
      riskProbability += 30;
      contributingFactors.push('High average strain levels');
    } else if (avgStrain > 0.5) {
      riskProbability += 15;
      contributingFactors.push('Moderate strain levels');
    } else {
      protectiveFactors.push('Healthy strain levels');
    }

    // Recovery-based risk
    if (avgRecovery < 0.3) {
      riskProbability += 25;
      contributingFactors.push('Insufficient recovery activities');
    } else if (avgRecovery < 0.5) {
      riskProbability += 10;
      contributingFactors.push('Suboptimal recovery');
    } else {
      protectiveFactors.push('Good recovery practices');
    }

    // Trend-based risk
    if (strainTrend > 0.1) {
      riskProbability += 20;
      contributingFactors.push('Increasing strain trend');
    }
    if (recoveryTrend < -0.1) {
      riskProbability += 15;
      contributingFactors.push('Declining recovery trend');
    }

    // Frequency-based risk
    if (highStrainCount > recentData.length * 0.6) {
      riskProbability += 15;
      contributingFactors.push('Frequent high-strain assignments');
    }
    if (lowRecoveryCount > recentData.length * 0.4) {
      riskProbability += 10;
      contributingFactors.push('Consistent low recovery scores');
    }

    // Determine risk level
    let riskLevel: BurnoutPrediction['risk_level'];
    if (riskProbability >= 70) riskLevel = 'critical';
    else if (riskProbability >= 50) riskLevel = 'high';
    else if (riskProbability >= 30) riskLevel = 'medium';
    else riskLevel = 'low';

    // Early warning signs
    const earlyWarningSigns = [
      riskLevel !== 'low' ? 'Declining performance metrics' : null,
      avgStrain > 0.6 ? 'Increased assignment strain' : null,
      avgRecovery < 0.4 ? 'Reduced recovery activities' : null,
      strainTrend > 0 ? 'Worsening strain patterns' : null,
      recoveryTrend < 0 ? 'Declining recovery practices' : null
    ].filter(Boolean) as string[];

    // Intervention recommendations
    const interventionRecommendations = [
      riskLevel === 'critical' ? 'Immediate workload reduction' : null,
      riskLevel === 'critical' ? 'Professional consultation recommended' : null,
      avgStrain > 0.6 ? 'Implement stress management protocols' : null,
      avgRecovery < 0.4 ? 'Increase recovery time between assignments' : null,
      strainTrend > 0 ? 'Review assignment complexity' : null,
      recoveryTrend < 0 ? 'Enhance recovery practices' : null,
      'Regular monitoring and check-ins',
      'Consider peer support or supervision'
    ].filter(Boolean) as string[];

    predictions.push({
      risk_level: riskLevel,
      probability: riskProbability,
      contributing_factors: contributingFactors,
      protective_factors: protectiveFactors,
      timeline_weeks: riskLevel === 'critical' ? 2 : riskLevel === 'high' ? 4 : riskLevel === 'medium' ? 8 : 12,
      early_warning_signs,
      intervention_recommendations
    });

    return predictions;
  };

  // Helper functions
  const findConsecutiveLowRecovery = (data: any[]) => {
    let maxStreak = 0;
    let currentStreak = 0;
    let streakStart = 0;
    let streakScores: number[] = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i].recovery_reflection_score < 0.4) {
        if (currentStreak === 0) streakStart = i;
        currentStreak++;
        streakScores.push(data[i].recovery_reflection_score);
      } else {
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
        currentStreak = 0;
        streakScores = [];
      }
    }

    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }

    const avgRecovery = streakScores.length > 0 ? streakScores.reduce((sum, score) => sum + score, 0) / streakScores.length : 0;
    const timeSpan = maxStreak * 7; // Approximate days
    const commonActions = findCommonRecoveryActions(data.slice(-maxStreak));
    const actionVariety = countUniqueActions(data.slice(-maxStreak));

    return {
      count: maxStreak,
      avgRecovery,
      timeSpan,
      commonActions,
      actionVariety
    };
  };

  const analyzeAssignmentFrequency = (data: any[]) => {
    const dates = data.map(item => new Date(item.assignment_date));
    const gaps: number[] = [];
    
    for (let i = 1; i < dates.length; i++) {
      const gap = (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24);
      gaps.push(gap);
    }

    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const recentCount = data.slice(-4).length;
    const weekendAssignments = data.filter(item => {
      const day = new Date(item.assignment_date).getDay();
      return day === 0 || day === 6;
    }).length;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (avgGap < 2) riskLevel = 'high';
    else if (avgGap < 4) riskLevel = 'medium';

    return {
      avgDaysBetween: avgGap,
      recentCount,
      weekendAssignments,
      peakFrequency: recentCount,
      riskLevel,
      confidence: Math.min(90, (4 - avgGap) * 20)
    };
  };

  const calculateTrend = (values: number[]) => {
    if (values.length < 5) {
      return {
        direction: 'stable' as const,
        strength: 0,
        volatility: 0,
        changeRate: 0,
        prediction: values[values.length - 1] || 0,
        confidence: 0
      };
    }

    const recent = values.slice(-8);
    const earlier = values.slice(-16, -8);
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const earlierAvg = earlier.length > 0 ? earlier.reduce((sum, val) => sum + val, 0) / earlier.length : recentAvg;
    
    const changeRate = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    const volatility = calculateVolatility(recent);
    
    let direction: 'improving' | 'declining' | 'stable';
    if (Math.abs(changeRate) < 5) direction = 'stable';
    else if (changeRate > 5) direction = 'improving';
    else direction = 'declining';

    const strength = Math.min(100, Math.abs(changeRate) * 3);
    const confidence = Math.max(50, 100 - volatility);
    const prediction = recentAvg + (changeRate / 100) * recentAvg;

    return {
      direction,
      strength,
      volatility,
      changeRate,
      prediction,
      confidence
    };
  };

  const calculateVolatility = (values: number[]) => {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return Math.min(100, (stdDev / avg) * 100);
  };

  const findCommonRecoveryActions = (assignments: any[]) => {
    const actions = assignments.flatMap(item => item.post_recovery_actions || []);
    const actionCounts: { [key: string]: number } = {};
    
    actions.forEach(action => {
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });

    return Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([action]) => action);
  };

  const countUniqueActions = (assignments: any[]) => {
    const actions = assignments.flatMap(item => item.post_recovery_actions || []);
    return new Set(actions).size;
  };

  const refreshAnalysis = async () => {
    setRefreshing(true);
    await loadPatternData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadPatternData();
  }, [userId, timeRange, supabase]);

  if (loading) {
    return (
      <div className="bg-white rounded-data shadow-card p-8 border border-brand-gray-200">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-electric border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-brand-gray-600">Analyzing patterns...</span>
        </div>
      </div>
    );
  }

  const getInsightIcon = (type: PatternInsight['type']) => {
    switch (type) {
      case 'burnout_risk': return <AlertTriangle className="w-5 h-5" />;
      case 'performance_decline': return <TrendingDown className="w-5 h-5" />;
      case 'recovery_gap': return <Clock className="w-5 h-5" />;
      case 'overwork_pattern': return <Activity className="w-5 h-5" />;
      case 'skill_gap': return <Target className="w-5 h-5" />;
      case 'growth_opportunity': return <TrendingUp className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: PatternInsight['severity']) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 text-red-700';
      case 'high': return 'border-orange-500 bg-orange-50 text-orange-700';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'low': return 'border-green-500 bg-green-50 text-green-700';
      default: return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Advanced Pattern Recognition
            </h2>
            <p className="text-brand-gray-600 mt-1">
              AI-powered insights detecting performance patterns, burnout risks, and optimization opportunities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-electric focus:border-transparent"
            >
              <option value="4w">Last 4 weeks</option>
              <option value="8w">Last 8 weeks</option>
              <option value="12w">Last 12 weeks</option>
              <option value="6m">Last 6 months</option>
            </select>
            <button
              onClick={refreshAnalysis}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-brand-electric text-white rounded-lg hover:bg-brand-electric-hover disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Pattern Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Pattern Insights ({insights.length})
            </h3>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-brand-gray-100 text-brand-primary rounded-lg hover:bg-brand-gray-200 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-brand-gray-100 text-brand-primary rounded-lg hover:bg-brand-gray-200 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${getSeverityColor(insight.severity)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.severity === 'critical' ? 'bg-red-100 text-red-600' :
                      insight.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                      insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-primary">{insight.title}</h4>
                      <p className="text-sm text-brand-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      insight.confidence >= 80 ? 'bg-blue-100 text-blue-700' :
                      insight.confidence >= 60 ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {insight.confidence}% Confidence
                    </span>
                    <button
                      onClick={() => setSelectedInsight(insight)}
                      className="text-brand-electric hover:text-brand-electric-hover"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-medium text-brand-primary mb-2">Evidence</h5>
                    <ul className="space-y-1">
                      {insight.evidence.slice(0, 2).map((evidence, index) => (
                        <li key={index} className="text-sm text-brand-gray-600 flex items-start gap-2">
                          <span className="text-brand-electric mt-1">•</span>
                          {evidence}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-brand-primary mb-2">Recommendations</h5>
                    <ul className="space-y-1">
                      {insight.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="text-sm text-brand-gray-600 flex items-start gap-2">
                          <span className="text-green-600 mt-1">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-brand-primary mb-2">Related Metrics</h5>
                    <div className="space-y-2">
                      {insight.related_metrics.slice(0, 2).map((metric, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-brand-gray-600">{metric.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{metric.value.toFixed(1)}%</span>
                            <span className={`text-xs ${
                              metric.trend === 'up' ? 'text-green-600' :
                              metric.trend === 'down' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Analysis */}
      {trends.length > 0 && (
        <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
          <h3 className="text-xl font-bold text-brand-primary mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trend Analysis & Predictions
          </h3>

          <div className="grid lg:grid-cols-2 gap-6">
            {trends.map((trend, index) => (
              <div key={index} className="bg-brand-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-brand-primary">{trend.metric}</h4>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                    trend.trend_direction === 'improving' ? 'bg-green-100 text-green-700' :
                    trend.trend_direction === 'declining' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {trend.trend_direction === 'improving' ? <TrendingUp className="w-3 h-3" /> :
                     trend.trend_direction === 'declining' ? <TrendingDown className="w-3 h-3" /> :
                     <Activity className="w-3 h-3" />}
                    {trend.trend_direction}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-gray-600">Current Value</span>
                    <span className="font-medium">{trend.current_value.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-gray-600">Trend Strength</span>
                    <span className="font-medium">{trend.trend_strength.toFixed(0)}%</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-gray-600">Change Rate</span>
                    <span className={`font-medium ${
                      trend.change_rate > 0 ? 'text-green-600' : trend.change_rate < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {trend.change_rate > 0 ? '+' : ''}{trend.change_rate.toFixed(1)}%/week
                    </span>
                  </div>

                  <div className="pt-2 border-t border-brand-gray-200">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-brand-gray-600">Next Week Prediction</span>
                      <span className="font-medium">{trend.prediction_next_week.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-gray-600">Confidence</span>
                      <span className="font-medium">{trend.prediction_confidence.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Burnout Predictions */}
      {burnoutPredictions.length > 0 && (
        <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
          <h3 className="text-xl font-bold text-brand-primary mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Burnout Risk Predictions
          </h3>

          <div className="space-y-4">
            {burnoutPredictions.map((prediction, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                prediction.risk_level === 'critical' ? 'border-red-500 bg-red-50' :
                prediction.risk_level === 'high' ? 'border-orange-500 bg-orange-50' :
                prediction.risk_level === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-green-500 bg-green-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      prediction.risk_level === 'critical' ? 'bg-red-100 text-red-600' :
                      prediction.risk_level === 'high' ? 'bg-orange-100 text-orange-600' :
                      prediction.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-primary capitalize">
                        {prediction.risk_level} Risk ({prediction.probability.toFixed(0)}%)
                      </h4>
                      <p className="text-sm text-brand-gray-600">
                        Timeline: {prediction.timeline_weeks} weeks
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-brand-primary mb-2 text-red-700">Contributing Factors</h5>
                    <ul className="space-y-1">
                      {prediction.contributing_factors.map((factor, i) => (
                        <li key={i} className="text-sm text-brand-gray-600 flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-brand-primary mb-2 text-green-700">Protective Factors</h5>
                    <ul className="space-y-1">
                      {prediction.protective_factors.map((factor, i) => (
                        <li key={i} className="text-sm text-brand-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {prediction.early_warning_signs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-brand-gray-200">
                    <h5 className="font-medium text-brand-primary mb-2">Early Warning Signs</h5>
                    <div className="flex flex-wrap gap-2">
                      {prediction.early_warning_signs.map((sign, i) => (
                        <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          {sign}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {prediction.intervention_recommendations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-brand-gray-200">
                    <h5 className="font-medium text-brand-primary mb-2">Recommended Interventions</h5>
                    <ul className="space-y-1">
                      {prediction.intervention_recommendations.slice(0, 3).map((rec, i) => (
                        <li key={i} className="text-sm text-brand-gray-600 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-data shadow-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-brand-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedInsight.severity === 'critical' ? 'bg-red-100 text-red-600' :
                    selectedInsight.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                    selectedInsight.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {getInsightIcon(selectedInsight.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-primary">{selectedInsight.title}</h3>
                    <p className="text-brand-gray-600">{selectedInsight.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="text-brand-gray-400 hover:text-brand-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-brand-primary mb-3">Detailed Evidence</h4>
                <ul className="space-y-2">
                  {selectedInsight.evidence.map((evidence, index) => (
                    <li key={index} className="text-brand-gray-700 flex items-start gap-2">
                      <span className="text-brand-electric mt-1">•</span>
                      {evidence}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-brand-primary mb-3">Comprehensive Recommendations</h4>
                <ul className="space-y-2">
                  {selectedInsight.recommendations.map((rec, index) => (
                    <li key={index} className="text-brand-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-1">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-brand-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-brand-primary mb-2">Predicted Impact</h4>
                <p className="text-brand-gray-700">{selectedInsight.predicted_impact}</p>
                <p className="text-sm text-brand-gray-600 mt-2">
                  <strong>Timeframe:</strong> {selectedInsight.timeframe}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}