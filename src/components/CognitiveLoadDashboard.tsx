import React, { useState, useEffect } from 'react';
import {
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as CLB from '../services/cognitiveLoadBalancingService';

interface CognitiveLoadDashboardProps {
  onClose?: () => void;
}

export const CognitiveLoadDashboard: React.FC<CognitiveLoadDashboardProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [capacity, setCapacity] = useState<CLB.CognitiveCapacity | null>(null);
  const [recommendations, setRecommendations] = useState<CLB.RoutingRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'capacity' | 'routing' | 'analytics'>('capacity');

  // Sample assignment for demo
  const sampleAssignment = {
    id: 'demo-assignment-001',
    type: 'Medical Consultation',
    domain: 'medical' as const,
    duration: 90,
    stakesLevel: 'high' as const,
    timepressure: 'normal' as const,
    emotionalIntensity: 'medium' as const,
    technicalContent: true,
    specializations: ['medical_terminology', 'patient_communication']
  };

  const updateCapacity = async (updates: Partial<CLB.CognitiveCapacity>) => {
    if (!user?.id) return;

    setLoading(true);
    const result = await CLB.updateCognitiveCapacity(user.id, updates);
    if (result.success) {
      setCapacity(prev => prev ? { ...prev, ...updates } : null);
    }
    setLoading(false);
  };

  const testRouting = async () => {
    if (!user?.id) return;

    setLoading(true);
    // First score the assignment
    await CLB.scoreAssignmentComplexity(sampleAssignment.id, sampleAssignment);

    // Then get routing recommendations
    const result = await CLB.getAssignmentRouting(sampleAssignment.id, [user.id]);
    if (result.success && result.recommendations) {
      setRecommendations(result.recommendations);
    }
    setLoading(false);
  };

  const CapacitySlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    color: string;
    description: string;
  }> = ({ label, value, onChange, color, description }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold" style={{ color }}>{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${value * 100}%, #e5e7eb ${value * 100}%, #e5e7eb 100%)`
        }}
      />
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'overload': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="w-5 h-5" />;
      case 'moderate': return <Clock className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'overload': return <AlertTriangle className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  // Initialize with default capacity
  useEffect(() => {
    if (user?.id && !capacity) {
      setCapacity({
        available_capacity: 0.8,
        working_memory_load: 0.3,
        attention_reserve: 0.7,
        decision_fatigue_level: 0.2,
        recovery_rate: 1.0,
        optimal_break_duration: 15,
        high_load_performance: 0.7,
        multitasking_efficiency: 0.6,
        error_rate_under_pressure: 0.15,
        medical_terminology_capacity: 0.8,
        legal_complexity_capacity: 0.5,
        emotional_resilience_capacity: 0.7,
        technical_jargon_capacity: 0.6
      });
    }
  }, [user, capacity]);

  if (!capacity) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto text-blue-500 animate-pulse" />
          <p className="mt-2 text-gray-600">Loading Cognitive Load Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cognitive Load Balancing</h2>
            <p className="text-gray-600">AI-Optimized Assignment Routing by Mental Capacity</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'capacity', label: 'Current Capacity', icon: Zap },
          { id: 'routing', label: 'Assignment Routing', icon: Target },
          { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Current Capacity Tab */}
      {activeTab === 'capacity' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Core Capacity Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Core Capacity
              </h3>

              <CapacitySlider
                label="Available Capacity"
                value={capacity.available_capacity}
                onChange={(value) => updateCapacity({ available_capacity: value })}
                color="#3B82F6"
                description="Overall mental energy available for new tasks"
              />

              <CapacitySlider
                label="Working Memory Load"
                value={capacity.working_memory_load}
                onChange={(value) => updateCapacity({ working_memory_load: value })}
                color="#8B5CF6"
                description="How much you're currently holding in your mind"
              />

              <CapacitySlider
                label="Attention Reserve"
                value={capacity.attention_reserve}
                onChange={(value) => updateCapacity({ attention_reserve: value })}
                color="#10B981"
                description="Ability to focus on complex or detailed tasks"
              />

              <CapacitySlider
                label="Decision Fatigue"
                value={capacity.decision_fatigue_level}
                onChange={(value) => updateCapacity({ decision_fatigue_level: value })}
                color="#EF4444"
                description="Mental tiredness from making decisions"
              />
            </div>

            {/* Specialized Capacities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-600" />
                Specialized Capacities
              </h3>

              <CapacitySlider
                label="Medical Terminology"
                value={capacity.medical_terminology_capacity}
                onChange={(value) => updateCapacity({ medical_terminology_capacity: value })}
                color="#DC2626"
                description="Comfort with medical language and concepts"
              />

              <CapacitySlider
                label="Legal Complexity"
                value={capacity.legal_complexity_capacity}
                onChange={(value) => updateCapacity({ legal_complexity_capacity: value })}
                color="#7C2D12"
                description="Ability to handle legal terminology and procedures"
              />

              <CapacitySlider
                label="Emotional Resilience"
                value={capacity.emotional_resilience_capacity}
                onChange={(value) => updateCapacity({ emotional_resilience_capacity: value })}
                color="#BE185D"
                description="Capacity for emotionally challenging content"
              />

              <CapacitySlider
                label="Technical Jargon"
                value={capacity.technical_jargon_capacity}
                onChange={(value) => updateCapacity({ technical_jargon_capacity: value })}
                color="#1E40AF"
                description="Comfort with technical and specialized language"
              />
            </div>
          </div>
        </div>
      )}

      {/* Assignment Routing Tab */}
      {activeTab === 'routing' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Sample Assignment</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Type:</span> {sampleAssignment.type}
              </div>
              <div>
                <span className="font-medium text-blue-800">Duration:</span> {sampleAssignment.duration} minutes
              </div>
              <div>
                <span className="font-medium text-blue-800">Stakes:</span> {sampleAssignment.stakesLevel}
              </div>
            </div>
            <button
              onClick={testRouting}
              disabled={loading}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              {loading ? 'Calculating...' : 'Get Routing Recommendation'}
            </button>
          </div>

          {recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Routing Analysis</h3>
              {recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div style={{ color: getRiskColor(rec.risk_level) }}>
                        {getRiskIcon(rec.risk_level)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Match Score: {rec.match_score}%</h4>
                        <p className="text-sm text-gray-600 capitalize">Risk Level: {rec.risk_level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Capacity Utilization</p>
                      <p className="text-lg font-bold" style={{ color: getRiskColor(rec.risk_level) }}>
                        {rec.capacity_utilization}%
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Predicted Performance:</span>
                      <div className="text-lg font-semibold text-green-600">{rec.predicted_performance}%</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Error Rate:</span>
                      <div className="text-lg font-semibold text-orange-600">{Math.round(rec.predicted_error_rate * 100)}%</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Recovery Time:</span>
                      <div className="text-lg font-semibold text-blue-600">{rec.recovery_time_needed} min</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Analysis:</h5>
                    <ul className="space-y-1">
                      {rec.reasoning.map((reason, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      rec.recommended
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {rec.recommended ? 'Recommended' : 'Not Recommended'}
                    </span>
                    {rec.alternative_suggestions && rec.alternative_suggestions.length > 0 && (
                      <div className="text-sm text-gray-600">
                        Suggestion: {rec.alternative_suggestions[0].action.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Performance Optimization</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((1 - capacity.error_rate_under_pressure) * 100)}%
              </p>
              <p className="text-sm text-blue-700">Accuracy under pressure</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-green-900">Recovery Efficiency</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {capacity.optimal_break_duration} min
              </p>
              <p className="text-sm text-green-700">Optimal break duration</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Multitasking Ability</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(capacity.multitasking_efficiency * 100)}%
              </p>
              <p className="text-sm text-purple-700">Complex assignment handling</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Recommendations</h3>
            <div className="space-y-3">
              {capacity.available_capacity < 0.5 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Low Available Capacity</p>
                    <p className="text-sm text-red-700">Consider taking a break or reducing assignment complexity</p>
                  </div>
                </div>
              )}

              {capacity.decision_fatigue_level > 0.7 && (
                <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-800">High Decision Fatigue</p>
                    <p className="text-sm text-orange-700">Avoid complex decision-making tasks until recovery</p>
                  </div>
                </div>
              )}

              {capacity.available_capacity > 0.8 && capacity.decision_fatigue_level < 0.3 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Optimal Capacity</p>
                    <p className="text-sm text-green-700">Ready for complex or high-stakes assignments</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};