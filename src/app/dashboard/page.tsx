'use client';

import { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Brain, Heart, Award, TrendingUp, MessageCircle,
  BookOpen, Activity, Clock, ChevronRight, Star, Sparkles,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.next';
import { BarChart3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { StreakCounter } from '@/components/dashboard/StreakCounter';
import { CognitiveReset } from '@/components/dashboard/CognitiveReset';
import { SummaryWidget } from '@/components/dashboard/SummaryWidget';
import CatalystSummary from '@/components/dashboard/CatalystSummary';

interface CEUProgress {
  total_earned: number;
  in_progress: number;
  available: number;
}

function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === 'true';
  const [ceuProgress, setCeuProgress] = useState<CEUProgress>({
    total_earned: 0,
    in_progress: 0,
    available: 5.0,
  });
  const [recentReflections, setRecentReflections] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [nextAssignment, setNextAssignment] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [assistantIntroOpen, setAssistantIntroOpen] = useState(false);
  const supabase = useMemo(() => createClient(), []); // Memoize Supabase client
  const [eri, setEri] = useState<{ value: number|null; band: string|null }>({ value: null, band: null })

  const loadDashboardData = useCallback(async () => {
    try {
      // Load user profile - gracefully handle if table doesn't exist
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (!profileError) {
          setUserProfile(profile);
        }
      } catch (profileErr) {
        console.log('User profiles table not available yet:', profileErr);
      }

      // Load CEU progress (when CEU tables exist)
      // For now, showing placeholder data

      // Load recent reflections count - gracefully handle if table doesn't exist
      try {
        const { count, error: reflectionsError } = await supabase
          .from('reflections')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (!reflectionsError) {
          setRecentReflections(count || 0);
        }
      } catch (reflectionsErr) {
        console.log('Reflections table not available yet:', reflectionsErr);
      }

      // Load next upcoming assignment for checklist
      try {
        const { data: upcoming } = await supabase
          .from('assignments')
          .select('*')
          .or(`creator_id.eq.${user?.id},primary_interpreter_id.eq.${user?.id}`)
          .gte('assignment_date', new Date().toISOString().slice(0,10))
          .order('assignment_date', { ascending: true })
          .limit(1)
        setNextAssignment(upcoming && upcoming.length ? upcoming[0] : null)
      } catch (e) {}

      // Recent activity
      try {
        const { data: recentA } = await supabase
          .from('assignments')
          .select('id, assignment_name, assignment_date, created_at')
          .or(`creator_id.eq.${user?.id},primary_interpreter_id.eq.${user?.id}`)
          .order('created_at', { ascending: false })
          .limit(3)
        const { data: recentQR } = await supabase
          .from('quick_reflections')
          .select('id, created_at')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(3)
        const itemsA = (recentA || []).map(a => ({ kind: 'Assignment', id: a.id, label: a.assignment_name, when: a.created_at }))
        const itemsR = (recentQR || []).map(r => ({ kind: 'Reflection', id: r.id, label: 'Quick Reflect', when: r.created_at }))
        const merged = [...itemsA, ...itemsR].sort((x, y) => (x.when > y.when ? -1 : 1))
        setRecentActivity(merged)
      } catch (e) {}
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      // Always set loading to false, even if data fetch fails
      setLoading(false);
    }
  }, [user?.id, supabase]); // Add dependencies

  useEffect(() => {
    if (user) {
      loadDashboardData();
      fetch('/api/eri').then(r=>r.json()).then(j=>{
        if (j && j.ok) setEri({ value: j.eri_user, band: j.band })
      }).catch(()=>{})
    } else if (!authLoading) {
      // If not loading and no user, stop loading state
      setLoading(false);
    }
  }, [user, authLoading, loadDashboardData]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const a = searchParams.get('assistant') === '1';
    if (a) setAssistantIntroOpen(true);
  }, [searchParams]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-electric border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-gray-600 dark:text-gray-300">Loading your performance dashboard...</p>
        </div>
      </div>
    );
  }

  // Show welcome screen for new users
  if (isWelcome && userProfile) {
    return (
      <div className="min-h-screen bg-brand-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-900 dark:to-slate-800 rounded-data shadow-card p-8 text-white mb-8 border border-brand-electric/20">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-12 h-12 text-brand-electric dark:text-orange-400" />
                <h1 className="text-4xl font-bold font-sans">Welcome to InterpretReflect</h1>
              </div>
              <p className="text-xl text-white/90 font-body">
                {user?.email?.split('@')[0]}, let's establish your performance baseline
              </p>
            </div>

            {/* Personalized Recommendations */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary font-sans">Recommended optimization pathways:</h2>

              <div className="grid gap-6">
                {/* CEU Programs */}
                <Link href="/ceu-bundles" className="group">
                  <div className="bg-white dark:bg-gray-800 rounded-data shadow-card p-6 hover:shadow-card-hover transition-all border border-brand-gray-200 dark:border-gray-700 group-hover:border-brand-electric">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-electric-light dark:bg-orange-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-brand-electric dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-brand-charcoal dark:text-white mb-2 font-sans">Professional Development Credits</h3>
                        <p className="text-brand-gray-600 dark:text-gray-300 mb-3 font-body">
                          {userProfile.specializations && userProfile.specializations.length > 0
                            ? `Optimized for ${userProfile.specializations[0]} interpreters.`
                            : 'RID-approved CEUs with measurable performance impact.'
                          } Programs from $49-$399.
                        </p>
                        <div className="flex items-center gap-2 text-brand-electric dark:text-orange-400 font-semibold font-body">
                          View CEU Programs
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Catalyst AI */}
                <Link href="/catalyst" className="group">
                  <div className="bg-white dark:bg-gray-800 rounded-data shadow-card p-6 hover:shadow-card-hover transition-all border border-brand-gray-200 dark:border-gray-700 group-hover:border-brand-electric">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-info-light dark:bg-blue-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Brain className="w-6 h-6 text-brand-info dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-brand-charcoal dark:text-white mb-2 font-sans">Catalyst: AI Performance Partner</h3>
                        <p className="text-brand-gray-600 dark:text-gray-300 mb-3 font-body">
                          Accelerate your growth with data-driven insights using the ECCI Model. Get personalized recommendations to optimize professional performance.
                        </p>
                        <div className="flex items-center gap-2 text-brand-electric dark:text-orange-400 font-semibold font-body">
                          Launch Catalyst
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Daily Check-In */}
                <Link href="/check-in" className="group">
                  <div className="bg-white dark:bg-gray-800 rounded-data shadow-card p-6 hover:shadow-card-hover transition-all border border-brand-gray-200 dark:border-gray-700 group-hover:border-brand-electric">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-coral-light dark:bg-red-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Activity className="w-6 h-6 text-brand-coral dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-brand-charcoal dark:text-white mb-2 font-sans">Performance Baseline Check</h3>
                        <p className="text-brand-gray-600 dark:text-gray-300 mb-3 font-body">
                          Track key performance indicators: stress levels, energy output, and capacity metrics. 2-minute daily assessment.
                        </p>
                        <div className="flex items-center gap-2 text-brand-electric dark:text-orange-400 font-semibold font-body">
                          Record Metrics
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Coming Soon Box */}
              <div className="bg-gradient-to-br from-brand-info-light to-brand-electric-light dark:from-blue-400/20 dark:to-orange-400/20 border-2 border-brand-electric dark:border-orange-400 rounded-data p-6 text-center">
                <TrendingUp className="w-10 h-10 text-brand-info dark:text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-brand-primary dark:text-blue-300 mb-2 font-sans">
                  Peer Benchmarking Coming Soon
                </h3>
                <p className="text-brand-gray-600 dark:text-gray-300 mb-4 font-body">
                  Compare your performance metrics with {userProfile.specializations && userProfile.specializations.length > 0
                    ? `other ${userProfile.specializations[0]} interpreters`
                    : 'industry peers'
                  }. Access anonymized data insights and optimization strategies.
                </p>
                <button className="text-brand-electric dark:text-orange-400 font-semibold hover:underline font-body">
                  Join waiting list →
                </button>
              </div>

              {/* Go to Dashboard Button */}
              <div className="text-center pt-4">
                <Link
                  href="/dashboard"
                  className="inline-block bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-900 dark:to-slate-800 text-white px-8 py-4 rounded-data font-semibold hover:shadow-glow transition-all font-sans"
                >
                  Access Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-brand-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-primary dark:text-blue-300 font-sans">
                Your Performance Hub
              </h1>
              <p className="text-brand-gray-600 dark:text-gray-300 mt-0.5 font-body">
                Daily calibration, reflection, and insights for every assignment.
              </p>
            </div>
            <Link
              href="/settings"
              className="text-brand-electric dark:text-orange-400 hover:text-brand-electric-hover font-medium font-body"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>

      {/* Daily Flow */}
      <div className="container mx-auto px-4 pt-3">
        <SummaryWidget />
        {eri.value !== null && (
          <div className="mt-4 bg-white rounded-data shadow-card p-4 border border-brand-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-brand-gray-600">ECCI Readiness Index</div>
                <div className="text-2xl font-mono text-brand-primary">{eri.value}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${eri.band==='stable' ? 'bg-green-100 text-green-700' : eri.band==='watch' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{eri.band}</div>
            </div>
          </div>
        )}
        <CatalystSummary />
        <div className="grid md:grid-cols-5 gap-4">
          <Link href="/catalyst" className="bg-white dark:bg-gray-800 border-2 border-brand-gray-200 dark:border-gray-700 rounded-data p-3 hover:border-brand-electric dark:hover:border-orange-400 transition-all">
            <div className="text-sm font-bold text-brand-gray-600 dark:text-gray-400 uppercase">Assistant</div>
            <div className="text-brand-primary dark:text-blue-300 font-sans">Guided Setup & Debrief</div>
            <div className="text-xs text-brand-gray-600 dark:text-gray-400 mt-1">Calibrate before work and process afterward</div>
          </Link>
          <Link href="/dashboard/assignments/new" className="bg-white dark:bg-gray-800 border-2 border-brand-gray-200 dark:border-gray-700 rounded-data p-3 hover:border-brand-electric dark:hover:border-orange-400 transition-all">
            <div className="text-sm font-bold text-brand-gray-600 dark:text-gray-400 uppercase">Prepare</div>
            <div className="text-brand-primary dark:text-blue-300 font-sans">Start New Assignment</div>
            <div className="text-xs text-brand-gray-600 dark:text-gray-400 mt-1">Set context, goals, logistics, priorities in 2 minutes</div>
          </Link>
          <Link href="/dashboard/hubs" className="bg-white dark:bg-gray-800 border-2 border-brand-gray-200 dark:border-gray-700 rounded-data p-3 hover:border-brand-electric dark:hover:border-orange-400 transition-all">
            <div className="text-sm font-bold text-brand-gray-600 dark:text-gray-400 uppercase">Team</div>
            <div className="text-brand-primary dark:text-blue-300 font-sans">Open Team Hub</div>
            <div className="text-xs text-brand-gray-600 dark:text-gray-400 mt-1">Share prep, align roles, build vocabulary, coordinate</div>
          </Link>
          <Link href={nextAssignment ? `/dashboard/assignments/${nextAssignment.id}` : '/dashboard/assignments'} className="bg-white dark:bg-gray-800 border-2 border-brand-gray-200 dark:border-gray-700 rounded-data p-3 hover:border-brand-electric dark:hover:border-orange-400 transition-all">
            <div className="text-sm font-bold text-brand-gray-600 dark:text-gray-400 uppercase">Deliver</div>
            <div className="text-brand-primary dark:text-blue-300 font-sans">Open Active Assignment</div>
            <div className="text-xs text-brand-gray-600 dark:text-gray-400 mt-1">Jump to logistics, notes, and session details</div>
          </Link>
          <Link href="/dashboard/quick-reflect" className="bg-white dark:bg-gray-800 border-2 border-brand-gray-200 dark:border-gray-700 rounded-data p-3 hover:border-brand-electric dark:hover:border-orange-400 transition-all">
            <div className="text-sm font-bold text-brand-gray-600 dark:text-gray-400 uppercase">Reflect</div>
            <div className="text-brand-primary dark:text-blue-300 font-sans">Log Quick Reflect</div>
            <div className="text-xs text-brand-gray-600 dark:text-gray-400 mt-1">2-minute post-assignment analysis of cognitive/emotional load</div>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Today's Checklist */}
        <div className="bg-white dark:bg-gray-800 rounded-data shadow-card p-6 border border-brand-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-brand-primary dark:text-blue-300 mb-3 font-sans">Today's Checklist</h2>
          {nextAssignment ? (
            <div className="space-y-3">
              <div className="text-brand-gray-700 dark:text-gray-300">Next assignment: <span className="font-semibold">{nextAssignment.assignment_name}</span> ({nextAssignment.assignment_date})</div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/dashboard/hubs/${nextAssignment.id}`} className="px-3 py-2 rounded-lg bg-brand-electric dark:bg-orange-500 text-white">Prep materials</Link>
                <Link href={`/dashboard/hubs/${nextAssignment.id}`} className="px-3 py-2 rounded-lg bg-brand-gray-100 dark:bg-gray-700 text-brand-primary dark:text-blue-300">Invite teammate</Link>
                <Link href="/dashboard/baseline" className="px-3 py-2 rounded-lg bg-brand-gray-100 dark:bg-gray-700 text-brand-primary dark:text-blue-300">Readiness check</Link>
                <Link href="/dashboard/quick-reflect" className="px-3 py-2 rounded-lg bg-brand-gray-100 dark:bg-gray-700 text-brand-primary dark:text-blue-300">Post-session reflect</Link>
              </div>
            </div>
          ) : (
            <div className="text-brand-gray-600 dark:text-gray-400">No pending assignments.</div>
          )}
        </div>
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-data shadow-card p-6 border border-brand-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-brand-primary dark:text-blue-300 mb-3 font-sans">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <div className="text-brand-gray-600 dark:text-gray-400">No recent items. <Link href="/catalyst" className="text-brand-electric dark:text-orange-400">Start with the Assistant →</Link></div>
          ) : (
            <div className="space-y-2">
              {recentActivity.slice(0,3).map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="text-brand-primary dark:text-blue-300 font-body">{item.kind}: {item.label}</div>
                  <div className="text-brand-gray-600 dark:text-gray-400 text-sm">{new Date(item.when).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Streak Counter */}
        {user && (
          <div className="mb-8">
            <StreakCounter userId={user.id} />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-data shadow-card p-4 border border-brand-gray-200 dark:border-gray-700">
            <div className="text-sm text-brand-gray-600 dark:text-gray-400">Day Streak</div>
            <div className="text-2xl font-mono text-brand-primary dark:text-blue-300">Start your streak today</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-data shadow-card p-4 border border-brand-gray-200 dark:border-gray-700">
            <div className="text-sm text-brand-gray-600 dark:text-gray-400">Weekly Goal</div>
            <div className="text-2xl font-mono text-brand-primary dark:text-blue-300">Reflections: 3/week</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-data shadow-card p-4 border border-brand-gray-200 dark:border-gray-700">
            <div className="text-sm text-brand-gray-600 dark:text-gray-400">Total Reflections</div>
            <div className="text-2xl font-mono text-brand-primary dark:text-blue-300">{recentReflections}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickAction
            icon={<Calendar className="w-8 h-8" />}
            title="Assignments"
            description="Organize prep & coordinate"
            href="/dashboard/assignments"
            color="bg-brand-energy-light text-brand-energy"
          />
          <QuickAction
            icon={<Brain className="w-8 h-8" />}
            title="Catalyst"
            description="AI performance partner"
            href="/catalyst"
            color="bg-brand-info-light text-brand-info"
          />
          <QuickAction
            icon={<TrendingUp className="w-8 h-8" />}
            title="Quick Reflect"
            description="Post-assignment insights"
            href="/dashboard/quick-reflect"
            color="bg-brand-electric-light text-brand-electric-hover"
          />
          <QuickAction
            icon={<BarChart3 className="w-8 h-8" />}
            title="Analytics"
            description="Performance insights & trends"
            href="/dashboard/analytics"
            color="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-data shadow-card p-6 border border-brand-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-brand-primary dark:text-blue-300 font-sans">
                  Performance Log
                </h3>
                <Link
                  href="/reflections"
                  className="text-sm text-brand-electric dark:text-orange-400 hover:text-brand-electric-hover font-medium font-body"
                >
                  View all entries
                </Link>
              </div>

              <div className="space-y-4">
                {recentReflections > 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-brand-electric dark:text-orange-400 mx-auto mb-3" />
                    <p className="text-brand-charcoal dark:text-white font-semibold font-mono text-2xl">
                      {recentReflections} entries this week
                    </p>
                    <p className="text-sm text-brand-gray-600 dark:text-gray-400 font-body">
                      Data collection on track. Consistency builds insights.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-brand-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-brand-gray-600 dark:text-gray-400 mb-4 font-body">
                      No performance data logged this week
                    </p>
                    <Link
                      href="/reflections"
                      className="inline-block bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-900 dark:to-slate-800 text-white px-6 py-2 rounded-data font-semibold hover:shadow-glow transition-all font-body"
                    >
                      Log Performance Data
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Resources */}
            <div className="bg-white dark:bg-gray-800 rounded-data shadow-card p-4 border border-brand-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-brand-primary dark:text-blue-300 mb-2 font-sans">Quick Access</h4>
              <div className="space-y-3">
                <ResourceLink href="/reflections" text="Performance Log" />
                <ResourceLink href="/glossary" text="Terminology Glossary" />
                <ResourceLink href="/community" text="Community Forum" />
                <ResourceLink href="/research" text="Research Data" />
                <ResourceLink href="/support" text="Technical Support" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cognitive Reset Floating Widget */}
      <CognitiveReset />

      {assistantIntroOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <div className="text-brand-primary dark:text-blue-300 font-sans text-xl font-bold mb-2">Ready to prepare your next assignment?</div>
            <p className="text-brand-gray-700 dark:text-gray-300 font-body mb-4">Walk through pre-assignment setup, invite your team, capture vocabulary, and get session-ready. After the assignment, I'll guide your 2-minute reflect.</p>
            <div className="flex gap-3">
              <Link href="/dashboard/assignments/new/assistant" className="px-4 py-2 bg-brand-electric dark:bg-orange-500 text-white rounded-data font-semibold" onClick={() => setAssistantIntroOpen(false)}>Start Assistant</Link>
              <button className="px-4 py-2 bg-brand-gray-100 dark:bg-gray-700 text-brand-primary dark:text-blue-300 rounded-data border-2 border-brand-gray-200 dark:border-gray-600" onClick={() => setAssistantIntroOpen(false)}>Not now</button>
            </div>
          </div>
        </div>
      )}

      {paletteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-brand-primary dark:text-blue-300">Command Palette</h2>
              <button onClick={()=>setPaletteOpen(false)} className="text-brand-gray-600 dark:text-gray-400">Close</button>
            </div>
            <input value={paletteQuery} onChange={(e)=>setPaletteQuery(e.target.value)} placeholder="Type to filter…" className="w-full mt-3 px-3 py-2 border-2 border-brand-gray-200 dark:border-gray-600 rounded-data bg-white dark:bg-gray-800 text-brand-charcoal dark:text-white" />
            <div className="mt-3 space-y-2">
              {[
                {label:'Start new assignment', href:'/dashboard/assignments/new'},
                {label:'Open team hubs', href:'/dashboard/hubs'},
                {label:'Readiness check', href:'/dashboard/baseline'},
                {label:'Log Quick Reflect', href:'/dashboard/quick-reflect'},
                {label:'Open next assignment', href: nextAssignment ? `/dashboard/assignments/${nextAssignment.id}` : '/dashboard/assignments'},
              ].filter(opt=> opt.label.toLowerCase().includes(paletteQuery.toLowerCase())).map((opt, idx)=> (
                <Link key={idx} href={opt.href} onClick={()=>setPaletteOpen(false)} className="block px-3 py-2 rounded-data bg-brand-gray-100 dark:bg-gray-700 text-brand-primary dark:text-blue-300 hover:bg-brand-gray-200 dark:hover:bg-gray-600">
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickAction({ icon, title, description, href, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <Link href={href} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-data shadow-card p-6 hover:shadow-card-hover transition-all h-full border border-brand-gray-200 dark:border-gray-700 hover:border-brand-electric dark:hover:border-orange-400">
        <h3 className="font-bold text-brand-charcoal dark:text-white mb-1 font-sans">{title}</h3>
        <p className="text-sm text-brand-gray-600 dark:text-gray-400 font-body">{description}</p>
      </div>
    </Link>
  );
}

function ResourceLink({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between py-1 text-sm text-brand-gray-700 dark:text-gray-300 hover:text-brand-electric dark:hover:text-orange-400 transition-colors group font-body"
    >
      {text}
      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-electric border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-gray-600 dark:text-gray-300 font-body">Loading performance hub...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
