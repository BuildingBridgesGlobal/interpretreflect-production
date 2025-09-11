import React, { useState } from 'react';
import { testElyaIntegration } from '../utils/testElyaIntegration';
import { userContextService } from '../services/userContextService';
import { CheckCircle, XCircle, Loader, Play, RefreshCw, Activity, Brain, Users, Target, Heart, FileText } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  data?: any;
}

export function ElyaIntegrationTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [insights, setInsights] = useState<any>(null);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setInsights(null);

    const tests = [
      { name: 'User Context', fn: () => userContextService.getUserContextForElya() },
      { name: 'Wellness Insights', fn: () => userContextService.getWellnessInsights() },
      { name: 'Team Insights', fn: () => userContextService.getTeamInsights() },
      { name: 'Recommendations', fn: () => userContextService.generateRecommendations() },
      { name: 'Emotion Patterns', fn: () => userContextService.analyzeEmotionPatterns() },
      { name: 'Assignment Insights', fn: () => userContextService.getAssignmentInsights() },
    ];

    for (const test of tests) {
      setTestResults(prev => [...prev, { name: test.name, status: 'running' }]);

      try {
        const result = await test.fn();
        setTestResults(prev => 
          prev.map(t => 
            t.name === test.name 
              ? { ...t, status: 'success', data: result }
              : t
          )
        );

        // Store wellness insights for display
        if (test.name === 'Wellness Insights' && result) {
          setInsights(result);
        }
      } catch (error) {
        setTestResults(prev => 
          prev.map(t => 
            t.name === test.name 
              ? { ...t, status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }
              : t
          )
        );
      }

      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300" />;
    }
  };

  const getTestIcon = (name: string) => {
    switch (name) {
      case 'User Context':
        return <Brain className="w-4 h-4" />;
      case 'Wellness Insights':
        return <Activity className="w-4 h-4" />;
      case 'Team Insights':
        return <Users className="w-4 h-4" />;
      case 'Recommendations':
        return <Target className="w-4 h-4" />;
      case 'Emotion Patterns':
        return <Heart className="w-4 h-4" />;
      case 'Assignment Insights':
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Elya Integration Test Suite</h2>
            <p className="text-gray-600 mt-1">Test all Supabase functions for Elya AI integration</p>
          </div>
          <button
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run All Tests
              </>
            )}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : result.status === 'running'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex items-center gap-2">
                    {getTestIcon(result.name)}
                    <span className="font-medium">{result.name}</span>
                  </div>
                </div>
                {result.message && (
                  <span className="text-sm text-red-600">{result.message}</span>
                )}
                {result.status === 'success' && result.data && (
                  <span className="text-sm text-green-600">✓ Data retrieved</span>
                )}
              </div>
            ))}
          </div>
        )}

        {insights && (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
            <h3 className="font-semibold text-gray-900 mb-3">Wellness Insights Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {insights.burnout_risk_score?.toFixed(0) || 0}%
                </div>
                <div className="text-xs text-gray-600">Burnout Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-600 capitalize">
                  {insights.wellness_trend || 'Unknown'}
                </div>
                <div className="text-xs text-gray-600">Trend</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-600">
                  {insights.recent_challenges?.length || 0}
                </div>
                <div className="text-xs text-gray-600">Challenges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {insights.effective_strategies?.length || 0}
                </div>
                <div className="text-xs text-gray-600">Strategies</div>
              </div>
            </div>
            {insights.needs_attention && (
              <div className="mt-3 p-2 bg-yellow-100 rounded text-sm text-yellow-800">
                ⚠️ User needs attention - consider wellness check-in
              </div>
            )}
          </div>
        )}

        {testResults.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Test Summary:</span>
                <div className="flex gap-4 mt-1">
                  <span className="text-sm">
                    ✅ Passed: {testResults.filter(r => r.status === 'success').length}
                  </span>
                  <span className="text-sm">
                    ❌ Failed: {testResults.filter(r => r.status === 'error').length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setTestResults([]);
                  setInsights(null);
                }}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="w-3 h-3" />
                Clear Results
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Testing Instructions</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Ensure you're logged in as an authenticated user</li>
          <li>Run Part 1 SQL (elya_conversations and user_context_summary tables) in Supabase</li>
          <li>Run Part 2 SQL (reflection_entries table and all functions) in Supabase</li>
          <li>Click "Run All Tests" to verify the integration</li>
          <li>Check the console for detailed error messages if tests fail</li>
        </ol>
      </div>
    </div>
  );
}