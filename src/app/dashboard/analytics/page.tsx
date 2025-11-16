'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Brain, Heart, Award, TrendingUp, MessageCircle,
  BookOpen, Activity, Clock, ChevronRight, Star, Sparkles,
  Calendar, BarChart3, Target, Zap, Users, Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.next';
import { createClient } from '@/lib/supabase/client';
import { StreakCounter } from '@/components/dashboard/StreakCounter';
import { CognitiveReset } from '@/components/dashboard/CognitiveReset';
import { SummaryWidget } from '@/components/dashboard/SummaryWidget';
import CatalystSummary from '@/components/dashboard/CatalystSummary';
import { EriAnalytics } from '@/components/dashboard/EriAnalytics';
import { PerformanceTrends } from '@/components/dashboard/PerformanceTrends';

interface CEUProgress {
  total_earned: number;
  in_progress: number;
  available: number;
}

function EnhancedDashboardContent() {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'trends' | 'team'>('overview');
  const supabase = useMemo(() => createClient(), []);
  const [eri, setEri] = useState<{ value: number|null; band: string|null }>({ value: null, band: null });

  const loadDashboardData = useCallback(async () => {
    try {
      // Load user profile
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

      // Load recent reflections count
      try {
        const { count, error: reflectionsError } = await supabase
          .from('quick_reflections')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (!reflectionsError) {
          setRecentReflections(count || 0);
        }
      } catch (reflectionsErr) {
        console.log('Reflections table not available yet:', reflectionsErr);
      }

      // Load next upcoming assignment
      try {
        const { data: upcoming } = await supabase
          .from('assignments')
          .select('*')
          .or(`creator_id.eq.${user?.id},primary_interpreter_id.eq.${user?.id}`)
          .gte('assignment_date', new Date().toISOString().slice(0,10))
          .order('assignment_date', { ascending: true })
          .limit(1);
        setNextAssignment(upcoming && upcoming.length ? upcoming[0] : null);
      } catch (e) {}

      // Recent activity
      try {
        const { data: recentA } = await supabase
          .from('assignments')
          .select('id, assignment_name, assignment_date, created_at')
          .or(`creator_id.eq.${user?.id},primary_interpreter_id.eq.${user?.id}`)
          .order('created_at', { ascending: false })
          .limit(3);
        const { data: recentQR } = await supabase
          .from('quick_reflections')
          .select('id, created_at')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(3);
        const itemsA = (recentA || []).map(a => ({ kind: 'Assignment', id: a.id, label: a.assignment_name, when: a.created_at }));
        const itemsR = (recentQR || []).map(r => ({ kind: 'Reflection', id: r.id, label: 'Quick Reflect', when: r.created_at }));
        const merged = [...itemsA, ...itemsR].sort((x, y) => (x.when > y.when ? -1 : 1));
        setRecentActivity(merged);
      } catch (e) {}
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, supabase]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      fetch('/api/eri').then(r=>r.json()).then(j=>{
        if (j && j.ok) setEri({ value: j.eri_user, band: j.band });
      }).catch(()=>{});
    } else if (!authLoading) {
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
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-electric border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-gray-600">Loading your enhanced performance dashboard...</p>
        </div>
      </div>
    );
  }

  // Show welcome screen for new users
  if (isWelcome && userProfile) {
    return (
      <div className="min-h-screen bg-brand-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-slate rounded-data shadow-card p-8 text-white mb-8 border border-brand-electric/20">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-12 h-12 text-brand-electric" />
                <h1 className="text-4xl font-bold font-sans">Welcome to InterpretReflect Analytics</h1>
              </div>
              <p className="text-xl text-white/90 font-body">
                {user?.email?.split('@')[0]}, let's unlock data-driven insights for your interpreting performance
              </p>
            </div>

            {/* Analytics Overview */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200 mb-8">
              <h2 className="text-2xl font-bold text-brand-primary mb-4 font-sans">Your Analytics Dashboard</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-brand-primary mb-2">Real-time ERI</h3>
                  <p className="text-sm text-brand-gray-600">Track your ECCI Readiness Index with live updates</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Target className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-brand-primary mb-2">Pattern Recognition</h3>
                  <p className="text-sm text-brand-gray-600">AI-powered insights identify performance trends</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-brand-primary mb-2">Team Analytics</h3>
                  <p className="text-sm text-brand-gray-600">Compare performance with peer benchmarks</p>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-gradient-to-br from-brand-info-light to-brand-electric-light border-2 border-brand-electric rounded-data p-6 text-center">
              <Zap className="w-10 h-10 text-brand-info mx-auto mb-3" />
              <h3 className="text-lg font-bold text-brand-primary mb-2">Ready to Start Tracking?</h3>
              <p className="text-brand-gray-600 mb-4">
                Complete your first assignment to unlock personalized analytics and insights.
              </p>
              <a href="/dashboard/assignments/new" className="inline-block bg-brand-electric text-white px-6 py-3 rounded-data font-semibold hover:bg-brand-electric-hover transition-colors">
                Create First Assignment
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-brand-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-primary font-sans">
                Enhanced Performance Analytics
              </h1>
              <p className="text-brand-gray-600 mt-0.5 font-body">
                Data-driven insights for every assignment
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Tab Navigation */}
              <div className="flex bg-brand-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-brand-gray-600 hover:text-brand-primary'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'analytics'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-brand-gray-600 hover:text-brand-primary'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('trends')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'trends'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-brand-gray-600 hover:text-brand-primary'
                  }`}
                >
                  Trends
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'team'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-brand-gray-600 hover:text-brand-primary'
                  }`}
                >
                  Team
                </button>
              </div>
              <Link
                href="/settings"
                className="text-brand-electric hover:text-brand-electric-hover font-medium font-body"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Widget and ERI */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SummaryWidget />
              </div>
              <div>
                {eri.value !== null && (
                  <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-brand-gray-600">ECCI Readiness Index</div>
                        <div className="text-3xl font-bold font-mono text-brand-primary">{eri.value}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        eri.band==='stable' ? 'bg-green-100 text-green-700' :
                        eri.band==='watch' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {eri.band?.toUpperCase()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-gray-600">Risk Level</span>
                        <span className={`font-medium ${
                          eri.band==='stable' ? 'text-green-600' :
                          eri.band==='watch' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {eri.band==='stable' ? 'Low Risk' :
                           eri.band==='watch' ? 'Moderate Risk' :
                           'High Risk'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            eri.band==='stable' ? 'bg-green-500' :
                            eri.band==='watch' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${eri.value}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                description="Deep-dive performance data"
                href="/dashboard/analytics"
                color="bg-purple-100 text-purple-600"
              />
            </div>

            {/* Today's Checklist */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <h2 className="text-2xl font-bold text-brand-primary mb-4 font-sans">Today's Checklist</h2>
              {nextAssignment ? (
                <div className="space-y-4">
                  <div className="text-brand-gray-700">Next assignment: <span className="font-semibold">{nextAssignment.assignment_name}</span> ({nextAssignment.assignment_date})</div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/dashboard/hubs/${nextAssignment.id}`} className="px-4 py-2 rounded-lg bg-brand-electric text-white hover:bg-brand-electric-hover transition-colors">
                      Prep materials
                    </Link>
                    <Link href={`/dashboard/hubs/${nextAssignment.id}`} className="px-4 py-2 rounded-lg bg-brand-gray-100 text-brand-primary hover:bg-brand-gray-200 transition-colors">
                      Invite teammate
                    </Link>
                    <Link href="/dashboard/baseline" className="px-4 py-2 rounded-lg bg-brand-gray-100 text-brand-primary hover:bg-brand-gray-200 transition-colors">
                      Readiness check
                    </Link>
                    <Link href="/dashboard/quick-reflect" className="px-4 py-2 rounded-lg bg-brand-gray-100 text-brand-primary hover:bg-brand-gray-200 transition-colors">
                      Post-session reflect
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-brand-gray-600">No pending assignments.</div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
                <h3 className="text-xl font-bold text-brand-primary mb-4 font-sans">Recent Activity</h3>
                {recentActivity.length === 0 ? (
                  <div className="text-brand-gray-600">No recent items. <Link href="/catalyst" className="text-brand-electric">Start with the Assistant →</Link></div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.slice(0,3).map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-brand-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            item.kind === 'Assignment' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-brand-primary">{item.kind}: {item.label}</div>
                            <div className="text-sm text-brand-gray-600">{new Date(item.when).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
                <h3 className="text-xl font-bold text-brand-primary mb-4 font-sans">Performance Summary</h3>
                {user && <CatalystSummary />}
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-gray-600">Weekly Reflections</span>
                    <span className="font-semibold text-brand-primary">{recentReflections}/7</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-brand-electric h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (recentReflections / 7) * 100)}%` }}
                    ></div>
                  </div>
                  {user && <StreakCounter userId={user.id} />}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && user && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand-primary font-sans">ECCI Analytics</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-brand-electric text-white rounded-lg hover:bg-brand-electric-hover transition-colors">
                  Export Data
                </button>
                <button className="px-4 py-2 bg-brand-gray-100 text-brand-primary rounded-lg hover:bg-brand-gray-200 transition-colors">
                  Refresh
                </button>
              </div>
            </div>
            <EriAnalytics userId={user.id} />
          </div>
        )}

        {activeTab === 'trends' && user && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand-primary font-sans">Performance Trends</h2>
              <div className="flex gap-2">
                <select className="px-3 py-2 border border-brand-gray-300 rounded-lg text-sm">
                  <option>Last 8 weeks</option>
                  <option>Last 3 months</option>
                  <option>Last 6 months</option>
                  <option>Last year</option>
                </select>
                <button className="px-4 py-2 bg-brand-gray-100 text-brand-primary rounded-lg hover:bg-brand-gray-200 transition-colors">
                  Generate Report
                </button>
              </div>
            </div>
            <PerformanceTrends userId={user.id} />
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-8">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-brand-primary mb-2 font-sans">Team Analytics</h2>
              <p className="text-brand-gray-600 mb-4">Team management and peer benchmarking features coming soon.</p>
              <button className="px-6 py-3 bg-brand-electric text-white rounded-lg hover:bg-brand-electric-hover transition-colors">
                Join Waitlist
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cognitive Reset Floating Widget */}
      <CognitiveReset />

      {assistantIntroOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <div className="text-brand-primary font-sans text-xl font-bold mb-2">Ready to prepare your next assignment?</div>
            <p className="text-brand-gray-700 font-body mb-4">Walk through pre-assignment setup, invite your team, capture vocabulary, and get session-ready. After the assignment, I'll guide your 2-minute reflect.</p>
            <div className="flex gap-3">
              <Link href="/dashboard/assignments/new/assistant" className="px-4 py-2 bg-brand-electric text-white rounded-data font-semibold" onClick={() => setAssistantIntroOpen(false)}>Start Assistant</Link>
              <button className="px-4 py-2 bg-brand-gray-100 text-brand-primary rounded-data border-2 border-brand-gray-200" onClick={() => setAssistantIntroOpen(false)}>Not now</button>
            </div>
          </div>
        </div>
      )}

      {paletteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-brand-primary">Command Palette</h2>
              <button onClick={()=>setPaletteOpen(false)} className="text-brand-gray-600">Close</button>
            </div>
            <input value={paletteQuery} onChange={(e)=>setPaletteQuery(e.target.value)} placeholder="Type to filter…" className="w-full mt-3 px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
            <div className="mt-3 space-y-2">
              {[
                {label:'Start new assignment', href:'/dashboard/assignments/new'},
                {label:'Open team hubs', href:'/dashboard/hubs'},
                {label:'Readiness check', href:'/dashboard/baseline'},
                {label:'Log Quick Reflect', href:'/dashboard/quick-reflect'},
                {label:'View analytics', href:'/dashboard/analytics'},
                {label:'View trends', href:'/dashboard/trends'},
                {label:'Open next assignment', href: nextAssignment ? `/dashboard/assignments/${nextAssignment.id}` : '/dashboard/assignments'},
              ].filter(opt=> opt.label.toLowerCase().includes(paletteQuery.toLowerCase())).map((opt, idx)=> (
                <Link key={idx} href={opt.href} onClick={()=>setPaletteOpen(false)} className="block px-3 py-2 rounded-data bg-brand-gray-100 text-brand-primary hover:bg-brand-gray-200">
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
      <div className="bg-white rounded-data shadow-card p-6 hover:shadow-card-hover transition-all h-full border border-brand-gray-200 hover:border-brand-electric">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="font-bold text-brand-charcoal mb-2 font-sans">{title}</h3>
        <p className="text-sm text-brand-gray-600 font-body">{description}</p>
      </div>
    </Link>
  );
}

export default function EnhancedDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-electric border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-gray-600 font-body">Loading enhanced analytics dashboard...</p>
        </div>
      </div>
    }>
      <EnhancedDashboardContent />
    </Suspense>
  );
}