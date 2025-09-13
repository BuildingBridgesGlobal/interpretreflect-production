import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Heart,
  Brain,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw
} from 'lucide-react';
import {
  predictBurnoutRisk,
  getBurnoutRiskTrend,
  generateInterventionPlan,
  subscribeToBurnoutAlerts,
  trackInterventionOutcome,
  type BurnoutRiskAssessment,
  type InterventionPlan
} from '../services/burnoutPredictionService';
import { useAuth } from '../contexts/AuthContext';

export function BurnoutRiskMonitor() {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<BurnoutRiskAssessment | null>(null);
  const [interventionPlan, setInterventionPlan] = useState<InterventionPlan | null>(null);
  const [trend, setTrend] = useState<{ date: string; risk_score: number; risk_level: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInterventions, setShowInterventions] = useState(false);
  const [alert, setAlert] = useState<{ risk_level: string; message: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadAssessment();
      loadTrend();
      
      // Subscribe to real-time alerts
      const unsubscribe = subscribeToBurnoutAlerts(user.id, (newAlert) => {
        setAlert(newAlert);
        // Auto-refresh assessment on alert
        loadAssessment();
      });

      return () => unsubscribe();
    }
  }, [user]);

  const loadAssessment = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data } = await predictBurnoutRisk(user.id);
    
    if (data) {
      setAssessment(data);
      const plan = generateInterventionPlan(data);
      setInterventionPlan(plan);
      
      // Auto-show interventions if risk is high
      if (data.risk_level === 'critical' || data.risk_level === 'high') {
        setShowInterventions(true);
      }
    }
    setLoading(false);
  };

  const loadTrend = async () => {
    if (!user) return;
    
    const { data } = await getBurnoutRiskTrend(user.id, 30);
    if (data) {
      setTrend(data);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAssessment();
    await loadTrend();
    setRefreshing(false);
  };

  const handleInterventionAction = async (actionId: string, outcome: 'completed' | 'skipped') => {
    if (!user) return;
    
    await trackInterventionOutcome(user.id, actionId, outcome);
    
    // Update UI to show completion
    if (interventionPlan) {
      const updatedPlan = { ...interventionPlan };
      updatedPlan.actions = updatedPlan.actions.map(action => 
        action.id === actionId 
          ? { ...action, completed: outcome === 'completed' } 
          : action
      );
      setInterventionPlan(updatedPlan);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'moderate': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertCircle;
      case 'moderate': return Activity;
      case 'low': return Shield;
      default: return CheckCircle;
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl p-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin" style={{ color: '#6B8B60' }} />
          <span className="ml-2" style={{ color: '#1A1A1A' }}>Analyzing burnout risk...</span>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  const Icon = getRiskIcon(assessment.risk_level);
  const riskColor = getRiskColor(assessment.risk_level);

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      {alert && (
        <div
          className="rounded-xl p-4 flex items-start space-x-3"
          style={{
            backgroundColor: assessment.risk_level === 'critical' ? '#FEE2E2' : '#FEF3C7',
            border: `1px solid ${assessment.risk_level === 'critical' ? '#DC2626' : '#F59E0B'}`
          }}
        >
          <AlertTriangle className="h-5 w-5 mt-0.5" style={{ color: riskColor }} />
          <div className="flex-1">
            <p className="font-semibold" style={{ color: '#1A1A1A' }}>{alert.message}</p>
            <button
              onClick={() => setShowInterventions(true)}
              className="text-sm underline mt-1"
              style={{ color: riskColor }}
            >
              View recommended actions
            </button>
          </div>
        </div>
      )}

      {/* Main Risk Card */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: '#FFFFFF',
          border: `2px solid ${riskColor}20`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${riskColor}20` }}
            >
              <Icon className="h-6 w-6" style={{ color: riskColor }} />
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: '#1A1A1A' }}>
                Burnout Risk Assessment
              </h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Predictive analysis based on your wellness patterns
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={refreshing}
          >
            <RefreshCw 
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} 
              style={{ color: '#6B7280' }} 
            />
          </button>
        </div>

        {/* Risk Score Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: riskColor }}
            >
              {assessment.risk_score.toFixed(1)}
            </div>
            <p className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>
              Risk Score
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <div
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: `${riskColor}20`,
                  color: riskColor
                }}
              >
                {assessment.risk_level.toUpperCase()}
              </div>
            </div>
            <p className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>
              Risk Level
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              {assessment.trend === 'worsening' ? (
                <TrendingUp className="h-6 w-6" style={{ color: '#DC2626' }} />
              ) : assessment.trend === 'declining' ? (
                <TrendingDown className="h-6 w-6" style={{ color: '#F59E0B' }} />
              ) : (
                <Activity className="h-6 w-6" style={{ color: '#10B981' }} />
              )}
            </div>
            <p className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>
              {assessment.trend}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              {assessment.weeks_until_burnout ? (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-1" style={{ color: riskColor }} />
                  <span className="font-bold" style={{ color: riskColor }}>
                    {assessment.weeks_until_burnout}w
                  </span>
                </div>
              ) : (
                <CheckCircle className="h-6 w-6" style={{ color: '#10B981' }} />
              )}
            </div>
            <p className="text-xs uppercase tracking-wide" style={{ color: '#6B7280' }}>
              {assessment.weeks_until_burnout ? 'Time to Burnout' : 'No Risk'}
            </p>
          </div>
        </div>

        {/* Key Factors */}
        <div className="space-y-3 mb-4">
          <h4 className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>
            Contributing Factors
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Energy Level */}
            <div className="flex items-center space-x-2">
              <Zap 
                className="h-4 w-4" 
                style={{ 
                  color: assessment.factors.energy_trend < 4 ? '#DC2626' : '#10B981' 
                }} 
              />
              <span className="text-sm" style={{ color: '#5A5A5A' }}>
                Energy: {assessment.factors.energy_trend.toFixed(1)}/10
              </span>
            </div>

            {/* Stress Level */}
            <div className="flex items-center space-x-2">
              <Brain 
                className="h-4 w-4" 
                style={{ 
                  color: assessment.factors.stress_level > 7 ? '#DC2626' : '#10B981' 
                }} 
              />
              <span className="text-sm" style={{ color: '#5A5A5A' }}>
                Stress: {assessment.factors.stress_level.toFixed(1)}/10
              </span>
            </div>

            {/* Engagement */}
            <div className="flex items-center space-x-2">
              <Heart 
                className="h-4 w-4" 
                style={{ 
                  color: assessment.factors.engagement_days < 3 ? '#F59E0B' : '#10B981' 
                }} 
              />
              <span className="text-sm" style={{ color: '#5A5A5A' }}>
                Active: {assessment.factors.engagement_days} days
              </span>
            </div>

            {/* Chronic Stress */}
            {assessment.factors.chronic_stress_detected && (
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" style={{ color: '#DC2626' }} />
                <span className="text-sm" style={{ color: '#5A5A5A' }}>
                  Chronic stress pattern
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowInterventions(!showInterventions)}
          className="w-full py-3 rounded-lg font-semibold transition-all"
          style={{
            backgroundColor: assessment.risk_level === 'critical' || assessment.risk_level === 'high' 
              ? riskColor 
              : '#6B8B60',
            color: '#FFFFFF'
          }}
        >
          {showInterventions ? 'Hide' : 'View'} Recommended Actions
          {assessment.recommended_actions.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs" 
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
              {assessment.recommended_actions.length}
            </span>
          )}
        </button>
      </div>

      {/* Intervention Plan */}
      {showInterventions && interventionPlan && (
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB'
          }}
        >
          <h3 className="font-bold text-lg mb-4" style={{ color: '#1A1A1A' }}>
            Your Personalized Intervention Plan
          </h3>

          {/* Priority Actions */}
          <div className="space-y-3 mb-6">
            {interventionPlan.actions.map((action) => (
              <div
                key={action.id}
                className="flex items-start space-x-3 p-3 rounded-lg"
                style={{
                  backgroundColor: action.completed ? '#F0FDF4' : '#F9FAFB',
                  border: `1px solid ${action.completed ? '#10B981' : '#E5E7EB'}`
                }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {action.completed ? (
                    <CheckCircle className="h-5 w-5" style={{ color: '#10B981' }} />
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full border-2"
                      style={{
                        borderColor: action.priority === 'critical' ? '#DC2626' :
                                    action.priority === 'high' ? '#F59E0B' : '#6B7280'
                      }}
                    />
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>
                    {action.title}
                  </h4>
                  <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                    {action.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs" style={{ color: '#6B7280' }}>
                      {action.estimated_time}
                    </span>
                    {!action.completed && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleInterventionAction(action.id, 'completed')}
                          className="text-xs underline"
                          style={{ color: '#10B981' }}
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => handleInterventionAction(action.id, 'skipped')}
                          className="text-xs underline"
                          style={{ color: '#6B7280' }}
                        >
                          Skip
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Elya AI Prompts */}
          {interventionPlan.elya_prompts.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-sm mb-3" style={{ color: '#1A1A1A' }}>
                Talk to Elya About:
              </h4>
              <div className="space-y-2">
                {interventionPlan.elya_prompts.map((prompt, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 rounded-lg transition-colors hover:bg-gray-50"
                    style={{
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB'
                    }}
                    onClick={() => {
                      // This would open Elya with the prompt
                      console.log('Open Elya with:', prompt);
                    }}
                  >
                    <span className="text-sm" style={{ color: '#5A5A5A' }}>
                      "{prompt}"
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {interventionPlan.resources.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3" style={{ color: '#1A1A1A' }}>
                Helpful Resources
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {interventionPlan.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url || '#'}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                    style={{ color: '#6B8B60' }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">{resource.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risk Trend Mini Chart */}
      {trend.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB'
          }}
        >
          <h4 className="font-semibold text-sm mb-3" style={{ color: '#1A1A1A' }}>
            30-Day Risk Trend
          </h4>
          <div className="flex items-end space-x-1" style={{ height: '60px' }}>
            {trend.map((point, index) => (
              <div
                key={index}
                className="flex-1 rounded-t"
                style={{
                  height: `${(point.risk_score / 10) * 100}%`,
                  backgroundColor: getRiskColor(point.risk_level),
                  opacity: 0.7
                }}
                title={`${new Date(point.date).toLocaleDateString()}: ${point.risk_score}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}