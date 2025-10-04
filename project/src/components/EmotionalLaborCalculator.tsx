import React, { useState, useEffect } from 'react';
import {
  Heart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Calculator,
  Shield,
  Clock,
  Award,
  BarChart3,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as ELQ from '../services/emotionalLaborQuantificationService';

interface EmotionalLaborCalculatorProps {
  onClose?: () => void;
}

export const EmotionalLaborCalculator: React.FC<EmotionalLaborCalculatorProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [baseRate, setBaseRate] = useState(25); // $25/hour default
  const [sessionData, setSessionData] = useState({
    assignmentType: 'Medical Consultation',
    context: 'medical' as const,
    duration: 60,
    emotionalIntensity: 5,
    traumaExposure: false,
    clientEmotionalState: 'distressed' as const,
    requiredDisplayRules: ['remain_calm', 'show_empathy'],
    personalEmotionalState: 7,
    displayedEmotionalState: 3,
    controlOverExpression: 4,
    consequencesOfAuthenticity: 8
  });

  const [assessment, setAssessment] = useState<ELQ.EmotionalLaborAssessment | null>(null);
  const [compensation, setCompensation] = useState<ELQ.EmotionalLaborCompensation | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'analytics' | 'education'>('calculator');

  const contextOptions = [
    { value: 'medical', label: 'Medical/Healthcare', multiplier: '1.8x' },
    { value: 'mental_health', label: 'Mental Health', multiplier: '2.2x' },
    { value: 'legal', label: 'Legal/Court', multiplier: '1.5x' },
    { value: 'educational', label: 'Educational', multiplier: '1.2x' },
    { value: 'community', label: 'Community Services', multiplier: '1.3x' },
    { value: 'general', label: 'General Business', multiplier: '1.0x' }
  ];

  const emotionalStates = [
    { value: 'calm', label: 'Calm/Stable', color: '#10B981' },
    { value: 'distressed', label: 'Distressed/Upset', color: '#F59E0B' },
    { value: 'angry', label: 'Angry/Hostile', color: '#EF4444' },
    { value: 'grief', label: 'Grief/Loss', color: '#8B5CF6' },
    { value: 'panic', label: 'Panic/Crisis', color: '#DC2626' },
    { value: 'mixed', label: 'Mixed Emotions', color: '#6B7280' }
  ];

  const displayRules = [
    { id: 'remain_calm', label: 'Must remain calm', intensity: 2 },
    { id: 'show_empathy', label: 'Show empathy/care', intensity: 2 },
    { id: 'hide_shock', label: 'Hide shock/surprise', intensity: 3 },
    { id: 'maintain_professional', label: 'Maintain professional demeanor', intensity: 1 },
    { id: 'appear_confident', label: 'Appear confident/assured', intensity: 2 },
    { id: 'show_concern', label: 'Show appropriate concern', intensity: 1 }
  ];

  const calculateEmotionalLabor = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Calculate assessment
      const assessmentResult = await ELQ.calculateEmotionalLabor(user.id, sessionData);
      if (assessmentResult.success && assessmentResult.assessment) {
        setAssessment(assessmentResult.assessment);

        // Calculate compensation
        const compensationResult = await ELQ.calculateCompensationAdjustment(
          baseRate,
          assessmentResult.assessment,
          sessionData.context,
          sessionData.traumaExposure
        );

        if (compensationResult.success && compensationResult.compensation) {
          setCompensation(compensationResult.compensation);

          // Record the entry
          await ELQ.recordEmotionalLaborEntry(
            user.id,
            `session-${Date.now()}`,
            sessionData.assignmentType,
            sessionData.context,
            assessmentResult.assessment,
            compensationResult.compensation
          );
        }
      }
    } catch (error) {
      console.error('Error calculating emotional labor:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!user?.id) return;

    const result = await ELQ.getEmotionalLaborAnalytics(user.id, 'month');
    if (result.success && result.analytics) {
      setAnalytics(result.analytics);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, user?.id]);

  const Slider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    color?: string;
    description?: string;
  }> = ({ label, value, onChange, min = 0, max = 10, color = '#3B82F6', description }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold" style={{ color }}>{value}/{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${(value / max) * 100}%, #e5e7eb ${(value / max) * 100}%, #e5e7eb 100%)`
        }}
      />
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 text-pink-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Emotional Labor Quantification</h2>
            <p className="text-gray-600">Scientific measurement of invisible emotional work</p>
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
          { id: 'calculator', label: 'EL Calculator', icon: Calculator },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'education', label: 'Education', icon: Info }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === id
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-gray-600 hover:text-pink-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Calculator Tab */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Assignment Details</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Type</label>
                    <input
                      type="text"
                      value={sessionData.assignmentType}
                      onChange={(e) => setSessionData({ ...sessionData, assignmentType: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
                    <select
                      value={sessionData.context}
                      onChange={(e) => setSessionData({ ...sessionData, context: e.target.value as any })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {contextOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label} ({option.multiplier})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={sessionData.duration}
                      onChange={(e) => setSessionData({ ...sessionData, duration: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Hourly Rate ($)</label>
                    <input
                      type="number"
                      value={baseRate}
                      onChange={(e) => setBaseRate(parseFloat(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-pink-900 mb-4">Emotional Context</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client's Emotional State</label>
                    <div className="grid grid-cols-2 gap-2">
                      {emotionalStates.map(state => (
                        <button
                          key={state.value}
                          onClick={() => setSessionData({ ...sessionData, clientEmotionalState: state.value as any })}
                          className={`p-2 text-sm rounded-md border ${
                            sessionData.clientEmotionalState === state.value
                              ? 'bg-white border-2 font-medium'
                              : 'bg-gray-50 border-gray-300'
                          }`}
                          style={{
                            borderColor: sessionData.clientEmotionalState === state.value ? state.color : undefined,
                            color: sessionData.clientEmotionalState === state.value ? state.color : undefined
                          }}
                        >
                          {state.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Required Display Rules</label>
                    <div className="space-y-2">
                      {displayRules.map(rule => (
                        <label key={rule.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={sessionData.requiredDisplayRules.includes(rule.id)}
                            onChange={(e) => {
                              const rules = e.target.checked
                                ? [...sessionData.requiredDisplayRules, rule.id]
                                : sessionData.requiredDisplayRules.filter(r => r !== rule.id);
                              setSessionData({ ...sessionData, requiredDisplayRules: rules });
                            }}
                            className="rounded border-gray-300"
                          />
                          {rule.label}
                          <span className="text-xs text-gray-500">({rule.intensity}x intensity)</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sessionData.traumaExposure}
                      onChange={(e) => setSessionData({ ...sessionData, traumaExposure: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-700">Trauma/Crisis Exposure</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Emotional Labor Sliders */}
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">Emotional Labor Assessment</h3>

                <div className="space-y-4">
                  <Slider
                    label="Your Actual Emotional State"
                    value={sessionData.personalEmotionalState}
                    onChange={(value) => setSessionData({ ...sessionData, personalEmotionalState: value })}
                    color="#8B5CF6"
                    description="How you actually felt during the session (0=very negative, 10=very positive)"
                  />

                  <Slider
                    label="Required Emotional Display"
                    value={sessionData.displayedEmotionalState}
                    onChange={(value) => setSessionData({ ...sessionData, displayedEmotionalState: value })}
                    color="#EC4899"
                    description="How you had to appear to others (0=very negative, 10=very positive)"
                  />

                  <Slider
                    label="Emotional Intensity Required"
                    value={sessionData.emotionalIntensity}
                    onChange={(value) => setSessionData({ ...sessionData, emotionalIntensity: value })}
                    color="#F59E0B"
                    description="How intense the emotional work was (0=minimal, 10=extremely intense)"
                  />

                  <Slider
                    label="Control Over Expression"
                    value={sessionData.controlOverExpression}
                    onChange={(value) => setSessionData({ ...sessionData, controlOverExpression: value })}
                    color="#10B981"
                    description="How much choice you had in how to express emotions (0=no choice, 10=complete freedom)"
                  />

                  <Slider
                    label="Consequences of Authenticity"
                    value={sessionData.consequencesOfAuthenticity}
                    onChange={(value) => setSessionData({ ...sessionData, consequencesOfAuthenticity: value })}
                    color="#EF4444"
                    description="What would happen if you showed your true emotions (0=no consequences, 10=severe consequences)"
                  />
                </div>

                <button
                  onClick={calculateEmotionalLabor}
                  disabled={loading}
                  className="w-full mt-6 px-4 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  {loading ? 'Calculating...' : 'Calculate Emotional Labor'}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {compensation && assessment && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-green-900">Compensation Analysis</h3>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-green-700">Base Rate</p>
                  <p className="text-2xl font-bold text-green-600">${compensation.base_session_rate}/hr</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-700">EL Multiplier</p>
                  <p className="text-2xl font-bold text-green-600">{compensation.emotional_labor_multiplier}x</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-700">Hazard Pay</p>
                  <p className="text-2xl font-bold text-green-600">+${compensation.hazard_pay_adjustment}/hr</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-700">Adjusted Rate</p>
                  <p className="text-2xl font-bold text-green-600">${compensation.total_adjusted_rate}/hr</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-900 mb-3">Cost Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Surface Acting Cost:</span>
                      <span className="font-medium">${compensation.justification.surface_acting_cost}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deep Acting Cost:</span>
                      <span className="font-medium">${compensation.justification.deep_acting_cost}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dissonance Penalty:</span>
                      <span className="font-medium">${compensation.justification.dissonance_penalty}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Complexity Premium:</span>
                      <span className="font-medium">${compensation.justification.complexity_premium}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Adjustment:</span>
                      <span className="font-medium">${compensation.justification.risk_adjustment}/hr</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-900 mb-3">Annual Impact</h4>
                  <div className="text-center bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Extra compensation per year</p>
                    <p className="text-3xl font-bold text-green-600">${compensation.annual_impact_estimate.toLocaleString()}</p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium">Burnout Risk: {Math.round(compensation.burnout_risk_factor * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                        style={{ width: `${compensation.burnout_risk_factor * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {compensation.recommended_interventions.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Recommended Interventions
                  </h4>
                  <ul className="space-y-1">
                    {compensation.recommended_interventions.map((intervention, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {intervention}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analytics ? (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-pink-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-pink-600" />
                    <h3 className="font-semibold text-pink-900">Average Multiplier</h3>
                  </div>
                  <p className="text-2xl font-bold text-pink-600">{analytics.averageMultiplier}x</p>
                  <p className="text-sm text-pink-700">Emotional labor intensity</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <h3 className="font-semibold text-green-900">Extra Compensation</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600">${analytics.totalExtraCompensation}</p>
                  <p className="text-sm text-green-700">This period</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                    <h3 className="font-semibold text-orange-900">Burnout Risk Trend</h3>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {analytics.burnoutRiskTrend.length > 0 ?
                      `${Math.round(analytics.burnoutRiskTrend[analytics.burnoutRiskTrend.length - 1] * 100)}%` :
                      'N/A'
                    }
                  </p>
                  <p className="text-sm text-orange-700">Current risk level</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Highest Labor Contexts</h3>
                  {analytics.highestLaborContexts.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.highestLaborContexts.map((context: string, index: number) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <span className="capitalize text-gray-700">{context.replace('_', ' ')}</span>
                          <span className="font-medium text-pink-600">#{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No data available yet</p>
                  )}
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
                  {analytics.recommendations.length > 0 ? (
                    <ul className="space-y-2">
                      {analytics.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">Continue tracking to get personalized recommendations</p>
                  )}
                </div>
              </div>

              {analytics.comparisonToBenchmark.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Industry Comparison</h3>
                  <div className="space-y-3">
                    {analytics.comparisonToBenchmark.map((comparison: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <span className="font-medium capitalize text-gray-700">
                            {comparison.context.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            (Industry: {comparison.industryBenchmark}x)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900">{comparison.userAverage}x</span>
                          <span className={`text-sm ml-2 ${
                            comparison.differential > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {comparison.differential > 0 ? '+' : ''}{comparison.differential}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No emotional labor data available yet.</p>
              <p className="text-sm text-gray-500">Use the calculator to start tracking your emotional labor.</p>
            </div>
          )}
        </div>
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">What is Emotional Labor?</h3>
            <p className="text-blue-800 mb-4">
              Emotional labor is the process of managing feelings and expressions to fulfill the emotional requirements of a job.
              It involves regulating emotions to create a publicly observable facial and bodily display.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Surface Acting</h4>
                <p className="text-sm text-blue-700">
                  Faking emotions you don't actually feel. This is the most taxing form of emotional labor and strongly predicts burnout.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Deep Acting</h4>
                <p className="text-sm text-blue-700">
                  Actually changing your internal emotional state to match what's required. Less taxing than surface acting but still requires effort.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-900 mb-4">Why This Matters for Interpreters</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Invisible Work Recognition</h4>
                  <p className="text-sm text-green-700">
                    Emotional labor is often invisible and uncompensated, despite being essential to professional interpreting.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Fair Compensation</h4>
                  <p className="text-sm text-green-700">
                    Understanding emotional labor costs helps justify appropriate compensation for different types of assignments.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Burnout Prevention</h4>
                  <p className="text-sm text-green-700">
                    Tracking emotional labor helps identify when you're at risk and need support or recovery time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">Research Foundation</h3>
            <p className="text-purple-800 mb-4">
              This calculator is based on Arlie Hochschild's groundbreaking research on emotional labor and subsequent studies
              showing the relationship between emotional labor and occupational burnout.
            </p>
            <div className="text-sm text-purple-700 space-y-2">
              <p><strong>Key Finding:</strong> Surface acting (faking emotions) is the strongest predictor of burnout among service workers.</p>
              <p><strong>Healthcare Context:</strong> Medical interpreters experience particularly high emotional labor due to trauma exposure and life-or-death stakes.</p>
              <p><strong>Compensation Theory:</strong> Jobs requiring higher emotional labor should compensate workers accordingly, similar to hazard pay for physical risks.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};