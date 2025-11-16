'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, ArrowLeft, Activity, Calendar, Award, Zap, Target } from 'lucide-react';
import Link from 'next/link';

interface PerformanceMetrics {
  totalAssignments: number;
  totalMinutes: number;
  avgPerformanceRating: number;
  avgCognitiveLoad: number;
  avgCapacityReserve: number;
  avgPerformanceReadiness: number;
  topAssignmentTypes: { type: string; count: number }[];
  topChallenges: string[];
  topSuccesses: string[];
  recentReflections: any[];
  recentBaselines: any[];
  moodAvgIntensity?: number;
  moodCounts?: Record<string, number>;
  typeCorrelations?: Array<{ type: string; avgLoad: number; avgPerformance: number; moodAvgIntensity: number }>;
}

export default function PerformanceHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalAssignments: 0,
    totalMinutes: 0,
    avgPerformanceRating: 0,
    avgCognitiveLoad: 0,
    avgCapacityReserve: 0,
    avgPerformanceReadiness: 0,
    topAssignmentTypes: [],
    topChallenges: [],
    topSuccesses: [],
    recentReflections: [],
    recentBaselines: [],
  });
  const [alerts, setAlerts] = useState({ engagementDrop: false, highStressTrend: false, loadSpike: false, moodHigh: false })
  const [showBreath, setShowBreath] = useState(false)
  const [showBodyScan, setShowBodyScan] = useState(false)
  const [consistencyChange, setConsistencyChange] = useState<number>(0)
  const [highRiskType, setHighRiskType] = useState<{ type: string; avgLoad: number; moodAvgIntensity: number } | null>(null)
  const [wearableStats, setWearableStats] = useState<{ restingHr?: number; latestHr?: number } | null>(null)

  useEffect(() => {
    const supabase = createClient();
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        setLoading(false);
      }
    }, 8000);
    supabase.auth.getUser()
      .then(async ({ data: { user } }) => {
        resolved = true;
        clearTimeout(timeout);
        if (!user) {
          router.push('/auth/login');
          return;
        }

        setUser(user);
        await loadMetrics(user.id);
      })
      .catch(() => {
        resolved = true;
        clearTimeout(timeout);
        setLoading(false);
      });
  }, [router, timeRange]);

  const loadMetrics = async (userId: string) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const daysAgo = parseInt(timeRange);
      const dateThreshold = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      // Load Quick Reflect entries
      const { data: reflections, error: reflectionsError } = await supabase
        .from('quick_reflect_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', dateThreshold)
        .order('created_at', { ascending: false });

      // Load Baseline checks
      const { data: baselines, error: baselinesError } = await supabase
        .from('baseline_checks')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', dateThreshold)
        .order('created_at', { ascending: false });

      if (!reflectionsError && reflections) {
        // Calculate metrics
        const totalAssignments = reflections.length;
        const totalMinutes = reflections.reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
        const avgPerformanceRating = totalAssignments > 0
          ? reflections.reduce((sum, r) => sum + (r.performance_rating || 0), 0) / totalAssignments
          : 0;
        const avgCognitiveLoad = totalAssignments > 0
          ? reflections.reduce((sum, r) => sum + (r.cognitive_load_rating || 0), 0) / totalAssignments
          : 0;

        // Top assignment types
        const typeCounts: Record<string, number> = {};
        reflections.forEach(r => {
          if (r.assignment_type) {
            typeCounts[r.assignment_type] = (typeCounts[r.assignment_type] || 0) + 1;
          }
        });
        const topAssignmentTypes = Object.entries(typeCounts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Top challenges and successes
        const allChallenges: string[] = [];
        const allSuccesses: string[] = [];
        reflections.forEach(r => {
          if (r.challenge_areas) allChallenges.push(...r.challenge_areas);
          if (r.success_moments) allSuccesses.push(...r.success_moments);
        });

        const challengeCounts: Record<string, number> = {};
        allChallenges.forEach(c => {
          challengeCounts[c] = (challengeCounts[c] || 0) + 1;
        });
        const topChallenges = Object.entries(challengeCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([challenge]) => challenge);

        const successCounts: Record<string, number> = {};
        allSuccesses.forEach(s => {
          successCounts[s] = (successCounts[s] || 0) + 1;
        });
        const topSuccesses = Object.entries(successCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([success]) => success);

        // Baseline averages
        const avgCapacityReserve = baselines && baselines.length > 0
          ? baselines.reduce((sum, b) => sum + (b.capacity_reserve || 0), 0) / baselines.length
          : 0;
        const avgPerformanceReadiness = baselines && baselines.length > 0
          ? baselines.reduce((sum, b) => sum + (b.performance_readiness || 0), 0) / baselines.length
          : 0;

        // Mood stats
        const moodCounts: Record<string, number> = { low: 0, medium: 0, high: 0, overwhelming: 0 }
        const moodScores: number[] = []
        const intensityMap: Record<string, number> = { low: 1, medium: 2, high: 3, overwhelming: 4 }
        reflections.forEach(r => {
          const mood = (r as any).ai_insights?.mood
          if (mood?.intensity && intensityMap[mood.intensity] != null) {
            moodCounts[mood.intensity] = (moodCounts[mood.intensity] || 0) + 1
            moodScores.push(intensityMap[mood.intensity])
          }
        })
        const moodAvgIntensity = moodScores.length > 0 ? moodScores.reduce((s, v) => s + v, 0) / moodScores.length : 0

        const typeAgg: Record<string, { loadSum: number; perfSum: number; moodSum: number; moodCount: number; count: number }> = {}
        reflections.forEach(r => {
          const t = r.assignment_type || 'Other'
          if (!typeAgg[t]) typeAgg[t] = { loadSum: 0, perfSum: 0, moodSum: 0, moodCount: 0, count: 0 }
          typeAgg[t].count += 1
          typeAgg[t].loadSum += r.cognitive_load_rating || 0
          typeAgg[t].perfSum += r.performance_rating || 0
          const mood = (r as any).ai_insights?.mood?.intensity
          if (mood && intensityMap[mood] != null) { typeAgg[t].moodSum += intensityMap[mood]; typeAgg[t].moodCount += 1 }
        })
        const typeCorrelations = Object.entries(typeAgg).map(([type, v]) => ({
          type,
          avgLoad: v.count > 0 ? v.loadSum / v.count : 0,
          avgPerformance: v.count > 0 ? v.perfSum / v.count : 0,
          moodAvgIntensity: v.moodCount > 0 ? v.moodSum / v.moodCount : 0,
        })).sort((a, b) => (b.avgLoad + b.moodAvgIntensity) - (a.avgLoad + a.moodAvgIntensity))

        setMetrics({
          totalAssignments,
          totalMinutes,
          avgPerformanceRating,
          avgCognitiveLoad,
          avgCapacityReserve,
          avgPerformanceReadiness,
          topAssignmentTypes,
          topChallenges,
          topSuccesses,
          recentReflections: reflections.slice(0, 10),
          recentBaselines: baselines || [],
          moodAvgIntensity,
          moodCounts,
          typeCorrelations,
        });

        const last14 = reflections.slice(0, 14)
        const last7 = reflections.slice(0, 7)
        const prev7 = reflections.slice(7, 14)
        const engagementDrop = prev7.length > 0 ? ((prev7.length - last7.length) / prev7.length) >= 0.3 : false
        const consistencyDelta = prev7.length > 0 ? Math.round(((last7.length - prev7.length) / prev7.length) * 100) : 0
        setConsistencyChange(consistencyDelta)

        const triggerCounts: Record<string, number> = {}
        last10(reflections).forEach(r => {
          (r.challenge_areas || []).forEach((c: string) => { triggerCounts[c] = (triggerCounts[c] || 0) + 1 })
        })
        const topTriggerFreq = Math.max(0, ...Object.values(triggerCounts))
        const highStressTrend = last10(reflections).length > 0 ? (topTriggerFreq / last10(reflections).length) >= 0.4 : false

        const last3 = reflections.slice(0, 3)
        const avgLast3Load = last3.length > 0 ? last3.reduce((s, r) => s + (r.cognitive_load_rating || 0), 0) / last3.length : 0
        const loadSpike = avgLast3Load >= 4

        const recentMood = last10(reflections).map(r => (r as any).ai_insights?.mood?.intensity).filter(Boolean)
        const moodHighCount = recentMood.filter(i => i === 'high' || i === 'overwhelming').length
        const moodHigh = recentMood.length > 0 ? (moodHighCount / recentMood.length) >= 0.5 : false

        setAlerts({ engagementDrop, highStressTrend, loadSpike, moodHigh })

        // High-risk type (combine load + mood)
        if (typeCorrelations && typeCorrelations.length > 0) {
          const top = [...typeCorrelations].sort((a, b) => (b.avgLoad + b.moodAvgIntensity) - (a.avgLoad + a.moodAvgIntensity))[0]
          setHighRiskType({ type: top.type, avgLoad: top.avgLoad, moodAvgIntensity: top.moodAvgIntensity })
        } else {
          setHighRiskType(null)
        }

        // Wearables
        const { data: w } = await supabase
          .from('wearable_data')
          .select('resting_hr_bpm, heart_rate_bpm, timestamp')
          .eq('user_id', user.id)
          .gte('timestamp', new Date(Date.now() - 24*60*60*1000).toISOString())
          .order('timestamp', { ascending: false })
          .limit(20)
        const resting = w?.find((row:any)=> row.resting_hr_bpm)?.resting_hr_bpm
        const latestHr = w && w.length ? w[0].heart_rate_bpm : undefined
        setWearableStats({ restingHr: resting, latestHr })
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-electric rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-brand-gray-600 font-body">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-brand-electric hover:text-brand-primary mb-4 font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-electric-light rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-brand-electric" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-brand-primary font-sans">
                Performance Intelligence Hub
              </h1>
              <p className="text-brand-gray-600 font-body">
                Longitudinal analytics and performance insights
              </p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 bg-brand-gray-100 rounded-lg p-1">
            {(['7', '30', '90'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors font-body ${
                  timeRange === range
                    ? 'bg-brand-electric text-white'
                    : 'text-brand-gray-600 hover:text-brand-primary'
                }`}
              >
                {range} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-brand-electric" />
            <h3 className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">
              Total Assignments
            </h3>
          </div>
          <p className="text-4xl font-bold text-brand-primary mb-1 font-mono">
            {metrics.totalAssignments}
          </p>
          <p className="text-sm text-brand-gray-500 font-body">
            {Math.round(metrics.totalMinutes / 60)} hours interpreted
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-5 h-5 text-brand-energy" />
            <h3 className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">
              Avg Performance
            </h3>
          </div>
          <p className="text-4xl font-bold text-brand-primary mb-1 font-mono">
            {metrics.avgPerformanceRating.toFixed(1)}
          </p>
          <p className="text-sm text-brand-gray-500 font-body">
            Out of 5.0
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-brand-electric" />
            <h3 className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">
              Avg Cognitive Load
            </h3>
          </div>
          <p className="text-4xl font-bold text-brand-primary mb-1 font-mono">
            {metrics.avgCognitiveLoad.toFixed(1)}
          </p>
          <p className="text-sm text-brand-gray-500 font-body">
            Out of 5.0
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-brand-energy" />
            <h3 className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">
              Avg Readiness
            </h3>
          </div>
          <p className="text-4xl font-bold text-brand-primary mb-1 font-mono">
            {metrics.avgPerformanceReadiness.toFixed(1)}
          </p>
          <p className="text-sm text-brand-gray-500 font-body">
            Out of 10.0
          </p>
        </div>
      </div>

      {/* Action Tiles */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border-2 border-brand-gray-200 bg-white p-6">
          <h3 className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">Consistency Index</h3>
          <p className="text-brand-primary font-sans text-lg mt-1">{consistencyChange >= 0 ? '+' : ''}{consistencyChange}% vs last week</p>
          <button className="mt-3 px-4 py-2 bg-brand-electric text-white rounded-lg font-semibold">Keep streak</button>
        </div>
        <div className="rounded-xl border-2 border-brand-gray-200 bg-white p-6">
          <h3 className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">High-Risk Type</h3>
          <p className="text-brand-primary font-sans text-lg mt-1">{highRiskType ? highRiskType.type : '—'}</p>
          {highRiskType && (
            <p className="text-sm text-brand-gray-600 font-body">Load {highRiskType.avgLoad.toFixed(1)} • Mood {highRiskType.moodAvgIntensity.toFixed(1)}</p>
          )}
          <button className="mt-3 px-4 py-2 bg-brand-energy text-white rounded-lg font-semibold">Prep strategy</button>
        </div>
      </div>

      {/* Wearable Readiness */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6">
          <h3 className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">Wearable Readiness</h3>
          <p className="text-brand-primary font-sans text-lg mt-2">Resting HR {wearableStats?.restingHr ?? '—'} bpm</p>
          <p className="text-brand-gray-600 text-sm">Latest HR {wearableStats?.latestHr ?? '—'} bpm</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6">
          <h3 className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">Heart Rate (Last 24h)</h3>
          <p className="text-sm text-brand-gray-600">Import test data via Wearables page to see this populate.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className={`rounded-xl border-2 p-6 ${alerts.engagementDrop ? 'border-yellow-300 bg-yellow-50' : 'border-brand-gray-200 bg-white'}`}>
          <h3 className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">Engagement</h3>
          <p className="text-brand-primary font-sans text-lg mt-2">{alerts.engagementDrop ? 'Drop detected' : 'Stable'}</p>
        </div>
        <div className={`rounded-xl border-2 p-6 ${alerts.highStressTrend ? 'border-orange-300 bg-orange-50' : 'border-brand-gray-200 bg-white'}`}>
          <h3 className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">Stress Triggers</h3>
          <p className="text-brand-primary font-sans text-lg mt-2">{alerts.highStressTrend ? 'High-frequency trigger' : 'Normal'}</p>
          {alerts.highStressTrend && (
            <button onClick={() => setShowBodyScan(true)} className="mt-3 px-4 py-2 bg-brand-energy text-white rounded-lg font-semibold">Body Awareness</button>
          )}
        </div>
        <div className={`rounded-xl border-2 p-6 ${alerts.loadSpike ? 'border-red-300 bg-red-50' : 'border-brand-gray-200 bg-white'}`}>
          <h3 className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">Cognitive Load</h3>
          <p className="text-brand-primary font-sans text-lg mt-2">{alerts.loadSpike ? 'Spike detected' : 'Normal'}</p>
          {alerts.loadSpike && (
            <button onClick={() => setShowBreath(true)} className="mt-3 px-4 py-2 bg-brand-electric text-white rounded-lg font-semibold">Breath Protocol</button>
          )}
        </div>
        <div className={`rounded-xl border-2 p-6 ${alerts.moodHigh ? 'border-purple-300 bg-purple-50' : 'border-brand-gray-200 bg-white'}`}>
          <h3 className="text-sm font-bold text-brand-gray-600 uppercase tracking-wide font-body">Mood State</h3>
          <p className="text-brand-primary font-sans text-lg mt-2">{alerts.moodHigh ? 'Elevated emotional intensity' : 'Normal'}</p>
          {alerts.moodHigh && (
            <button onClick={() => setShowBodyScan(true)} className="mt-3 px-4 py-2 bg-brand-info text-white rounded-lg font-semibold">Label & Regulate</button>
          )}
        </div>
      </div>

      

      <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-brand-primary mb-4 font-sans">Assignment Type Correlations</h2>
        {metrics.typeCorrelations && metrics.typeCorrelations.length > 0 ? (
          <div className="space-y-4">
            {metrics.typeCorrelations.map(row => {
              const loadPct = Math.min(100, (row.avgLoad / 5) * 100)
              const perfPct = Math.min(100, (row.avgPerformance / 5) * 100)
              const moodPct = Math.min(100, (row.moodAvgIntensity / 4) * 100)
              const insight = (() => {
                const highLoad = row.avgLoad >= 3.5
                const highMood = row.moodAvgIntensity >= 2.5
                const lowPerf = row.avgPerformance <= 3
                if (highLoad && highMood) return 'Focus: terminology prep, pacing, and team rotation'
                if (highLoad && lowPerf) return 'Focus: reduce cognitive load with pacing and chunking'
                if (highMood) return 'Focus: quick recovery before/after sessions'
                return 'Maintain current approach'
              })()
              return (
                <div key={row.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-brand-primary font-body">{row.type}</span>
                    <span className="text-xs text-brand-gray-600 font-mono">Load {row.avgLoad.toFixed(1)} • Perf {row.avgPerformance.toFixed(1)} • Mood {row.moodAvgIntensity.toFixed(1)}</span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-brand-gray-600 mb-1">Avg Load</div>
                      <div className="w-full bg-brand-gray-100 rounded-full h-2">
                        <div className="bg-brand-electric rounded-full h-2" style={{ width: `${loadPct}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-brand-gray-600 mb-1">Avg Performance</div>
                      <div className="w-full bg-brand-gray-100 rounded-full h-2">
                        <div className="bg-brand-energy rounded-full h-2" style={{ width: `${perfPct}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-brand-gray-600 mb-1">Mood Intensity</div>
                      <div className="w-full bg-brand-gray-100 rounded-full h-2">
                        <div className="bg-purple-500 rounded-full h-2" style={{ width: `${moodPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-brand-gray-600 mt-2">{insight}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-brand-gray-500">No assignment type data yet.</p>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Assignment Types */}
          <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 font-sans">
              Assignment Breakdown
            </h2>
            {metrics.topAssignmentTypes.length > 0 ? (
              <div className="space-y-3">
                {metrics.topAssignmentTypes.map(({ type, count }) => {
                  const percentage = (count / metrics.totalAssignments) * 100;
                  return (
                    <div key={type}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-brand-primary font-body">
                          {type}
                        </span>
                        <span className="text-sm text-brand-gray-600 font-mono">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-brand-gray-100 rounded-full h-2">
                        <div
                          className="bg-brand-electric rounded-full h-2 transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-brand-gray-500 text-center py-8 font-body">
                No assignment data yet. Log your first assignment with Quick Reflect!
              </p>
            )}
          </div>

          {/* Top Challenges */}
          <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 font-sans">
              Most Common Challenges
            </h2>
            {metrics.topChallenges.length > 0 ? (
              <ul className="space-y-2">
                {metrics.topChallenges.map((challenge, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-electric font-bold font-mono">{i + 1}.</span>
                    <span className="text-brand-gray-700 font-body">{challenge}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-brand-gray-500 text-center py-8 font-body">
                No challenge data yet.
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Baseline Metrics Trend */}
          <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 font-sans">
              Baseline Performance Metrics
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-brand-electric-light rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-brand-electric font-mono">
                  {metrics.avgCapacityReserve.toFixed(1)}
                </p>
                <p className="text-xs text-brand-primary font-body mt-1">
                  Avg Capacity Reserve
                </p>
              </div>
              <div className="bg-brand-energy-light rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-brand-energy font-mono">
                  {metrics.avgPerformanceReadiness.toFixed(1)}
                </p>
                <p className="text-xs text-brand-primary font-body mt-1">
                  Avg Readiness
                </p>
              </div>
            </div>
            {metrics.recentBaselines.length > 0 ? (
              <div className="text-sm text-brand-gray-600 font-body">
                <p className="mb-2">
                  <strong>{metrics.recentBaselines.length}</strong> baseline checks recorded in this period
                </p>
                <Link
                  href="/dashboard/baseline"
                  className="text-brand-electric hover:underline"
                >
                  Complete today's baseline check →
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-brand-gray-500 mb-3 font-body">
                  No baseline data yet.
                </p>
                <Link
                  href="/dashboard/baseline"
                  className="inline-block bg-brand-energy text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-primary transition-colors font-body"
                >
                  Complete First Check
                </Link>
              </div>
            )}
          </div>

          {/* Top Successes */}
          <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6">
            <h2 className="text-2xl font-bold text-brand-primary mb-4 font-sans">
              Most Common Successes
            </h2>
            {metrics.topSuccesses.length > 0 ? (
              <ul className="space-y-2">
                {metrics.topSuccesses.map((success, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-energy font-bold font-mono">{i + 1}.</span>
                    <span className="text-brand-gray-700 font-body">{success}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-brand-gray-500 text-center py-8 font-body">
                No success data yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights Teaser */}
      <div className="mt-8 bg-gradient-to-br from-brand-electric-light via-white to-brand-energy-light rounded-xl border-2 border-brand-electric p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-electric rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-brand-primary mb-2 font-sans">
              Want Deeper Insights?
            </h3>
            <p className="text-brand-gray-600 mb-4 font-body">
              Chat with Catalyst AI to get personalized analysis of your performance patterns, burnout risk assessment, and optimization strategies.
            </p>
            <Link
              href="/dashboard/catalyst"
              className="inline-block bg-brand-electric text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-primary transition-colors font-body"
            >
              Talk to Catalyst AI
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/quick-reflect"
          className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6 hover:border-brand-electric hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <Zap className="w-8 h-8 text-brand-electric" />
            <div>
              <h3 className="text-xl font-bold text-brand-primary font-sans group-hover:text-brand-electric transition-colors">
                Log New Assignment
              </h3>
              <p className="text-sm text-brand-gray-600 font-body">
                Complete a Quick Reflect check-in
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/baseline"
          className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6 hover:border-brand-energy hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <Target className="w-8 h-8 text-brand-energy" />
            <div>
              <h3 className="text-xl font-bold text-brand-primary font-sans group-hover:text-brand-energy transition-colors">
                Daily Baseline Check
              </h3>
              <p className="text-sm text-brand-gray-600 font-body">
                Track your performance readiness
              </p>
            </div>
          </div>
        </Link>
      </div>
      {showBreath && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <button onClick={() => setShowBreath(false)} className="text-brand-gray-600">Close</button>
            {/* Fallback simple guidance if component not available */}
            <div className="mt-4 space-y-2 text-brand-gray-800">
              <p className="font-semibold">90s Breath Reset</p>
              <p>Inhale 4 • Hold 2 • Exhale 6 • Repeat ×10</p>
            </div>
          </div>
        </div>
      )}
      {showBodyScan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <button onClick={() => setShowBodyScan(false)} className="text-brand-gray-600">Close</button>
            <div className="mt-4 space-y-2 text-brand-gray-800">
              <p className="font-semibold">90s Body Awareness</p>
              <p>Scan head→neck→shoulders→chest→stomach. Label sensations without judgment.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function last10(arr: any[]) { return arr.slice(0, 10) }
function moodValue(intensity?: string) { const m: any = { low: 1, medium: 2, high: 3, overwhelming: 4 }; return intensity ? m[intensity] ?? 0 : 0 }
