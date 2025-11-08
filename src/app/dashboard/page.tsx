'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Brain, Heart, Award, TrendingUp, MessageCircle,
  BookOpen, Activity, Clock, ChevronRight, Star, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.next';
import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      setUserProfile(profile);

      // Load CEU progress (when CEU tables exist)
      // For now, showing placeholder data

      // Load recent reflections count
      const { count } = await supabase
        .from('reflections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      setRecentReflections(count || 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-electric border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-gray-600">Loading your performance dashboard...</p>
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
                  <div className="bg-white rounded-data shadow-card p-6 hover:shadow-card-hover transition-all border border-brand-gray-200 group-hover:border-brand-electric">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-electric-light rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-brand-electric" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-brand-charcoal mb-2 font-sans">Professional Development Credits</h3>
                        <p className="text-brand-gray-600 mb-3 font-body">
                          {userProfile.specializations && userProfile.specializations.length > 0
                            ? `Optimized for ${userProfile.specializations[0]} interpreters.`
                            : 'RID-approved CEUs with measurable performance impact.'
                          } Programs from $49-$399.
                        </p>
                        <div className="flex items-center gap-2 text-brand-electric font-semibold font-body">
                          View CEU Programs
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Catalyst AI */}
                <Link href="/catalyst" className="group">
                  <div className="bg-white rounded-data shadow-card p-6 hover:shadow-card-hover transition-all border border-brand-gray-200 group-hover:border-brand-electric">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-info-light rounded-lg flex items-center justify-center flex-shrink-0">
                        <Brain className="w-6 h-6 text-brand-info" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-brand-charcoal mb-2 font-sans">Catalyst: AI Performance Partner</h3>
                        <p className="text-brand-gray-600 mb-3 font-body">
                          Accelerate your growth with data-driven insights using the ECCI Model. Get personalized recommendations to optimize professional performance.
                        </p>
                        <div className="flex items-center gap-2 text-brand-electric font-semibold font-body">
                          Launch Catalyst
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Daily Check-In */}
                <Link href="/check-in" className="group">
                  <div className="bg-white rounded-data shadow-card p-6 hover:shadow-card-hover transition-all border border-brand-gray-200 group-hover:border-brand-electric">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-coral-light rounded-lg flex items-center justify-center flex-shrink-0">
                        <Activity className="w-6 h-6 text-brand-coral" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-brand-charcoal mb-2 font-sans">Performance Baseline Check</h3>
                        <p className="text-brand-gray-600 mb-3 font-body">
                          Track key performance indicators: stress levels, energy output, and capacity metrics. 2-minute daily assessment.
                        </p>
                        <div className="flex items-center gap-2 text-brand-electric font-semibold font-body">
                          Record Metrics
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Coming Soon Box */}
              <div className="bg-gradient-to-br from-brand-info-light to-brand-electric-light border-2 border-brand-electric rounded-data p-6 text-center">
                <TrendingUp className="w-10 h-10 text-brand-info mx-auto mb-3" />
                <h3 className="text-lg font-bold text-brand-primary mb-2 font-sans">
                  Peer Benchmarking Coming Soon
                </h3>
                <p className="text-brand-gray-600 mb-4 font-body">
                  Compare your performance metrics with {userProfile.specializations && userProfile.specializations.length > 0
                    ? `other ${userProfile.specializations[0]} interpreters`
                    : 'industry peers'
                  }. Access anonymized data insights and optimization strategies.
                </p>
                <button className="text-brand-electric font-semibold hover:underline font-body">
                  Join waiting list →
                </button>
              </div>

              {/* Go to Dashboard Button */}
              <div className="text-center pt-4">
                <Link
                  href="/dashboard"
                  className="inline-block bg-gradient-to-r from-brand-primary to-brand-slate text-white px-8 py-4 rounded-data font-semibold hover:shadow-glow transition-all font-sans"
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
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-brand-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-primary font-sans">
                {user?.email?.split('@')[0]}'s Performance Hub
              </h1>
              <p className="text-brand-gray-600 mt-1 font-body">
                Real-time metrics and optimization insights
              </p>
            </div>
            <Link
              href="/settings"
              className="text-brand-electric hover:text-brand-electric-hover font-medium font-body"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* CEU Progress Card */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-slate rounded-data p-8 text-white mb-8 shadow-card border border-brand-electric/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 font-sans">Professional Development Progress</h2>
              <p className="text-white/90 font-body font-mono text-sm">
                TARGET: 8.0 CEUs / 4 years (RID requirement)
              </p>
            </div>
            <Award className="w-16 h-16 opacity-20" />
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-4xl font-bold font-mono text-brand-electric">{ceuProgress.total_earned}</div>
              <div className="text-sm text-white/80 font-body">Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold font-mono text-brand-electric">{ceuProgress.in_progress}</div>
              <div className="text-sm text-white/80 font-body">Active</div>
            </div>
            <div>
              <div className="text-4xl font-bold font-mono text-brand-electric">5.0+</div>
              <div className="text-sm text-white/80 font-body">Available Now</div>
            </div>
          </div>

          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <div
              className="bg-brand-electric rounded-full h-3 transition-all duration-500 shadow-glow-sm"
              style={{ width: `${(ceuProgress.total_earned / 8.0) * 100}%` }}
            ></div>
          </div>

          <Link
            href="/ceu-bundles"
            className="inline-flex items-center gap-2 bg-brand-electric text-brand-primary px-6 py-3 rounded-data font-semibold hover:bg-brand-electric-hover transition-all shadow-sm font-body"
          >
            View CEU Programs
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickAction
            icon={<Activity className="w-8 h-8" />}
            title="BREATHE Protocol"
            description="2-min recovery cycle"
            href="/reflections/breathe"
            color="bg-brand-coral-light text-brand-coral"
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
            title="Post-Assignment"
            description="Log performance data"
            href="/reflections/post-assignment"
            color="bg-brand-electric-light text-brand-electric-hover"
          />
          <QuickAction
            icon={<MessageCircle className="w-8 h-8" />}
            title="Community"
            description="Connect with peers"
            href="/community"
            color="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-brand-primary font-sans">
                  Performance Log
                </h3>
                <Link
                  href="/reflections"
                  className="text-sm text-brand-electric hover:text-brand-electric-hover font-medium font-body"
                >
                  View all entries
                </Link>
              </div>

              <div className="space-y-4">
                {recentReflections > 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-brand-electric mx-auto mb-3" />
                    <p className="text-brand-charcoal font-semibold font-mono text-2xl">
                      {recentReflections} entries this week
                    </p>
                    <p className="text-sm text-brand-gray-600 font-body">
                      Data collection on track. Consistency builds insights.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
                    <p className="text-brand-gray-600 mb-4 font-body">
                      No performance data logged this week
                    </p>
                    <Link
                      href="/reflections"
                      className="inline-block bg-gradient-to-r from-brand-primary to-brand-slate text-white px-6 py-2 rounded-data font-semibold hover:shadow-glow transition-all font-body"
                    >
                      Log Performance Data
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* New RID Category Announcement */}
            <div className="bg-gradient-to-br from-brand-primary to-brand-slate border-2 border-brand-electric rounded-data p-6">
              <div className="flex items-start gap-3 mb-3">
                <Award className="w-6 h-6 text-brand-electric flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-1 font-sans">
                    New RID Professional Category
                  </h4>
                  <p className="text-sm text-white/90 mb-3 font-body">
                    Studies of Healthy Minds & Bodies
                  </p>
                  <p className="text-xs text-white/70 mb-3 font-body">
                    Earn RID-approved CEUs through performance optimization • Sponsor #2309
                  </p>
                  <Link
                    href="/ceu-bundles"
                    className="text-sm text-brand-electric hover:text-brand-electric-hover font-semibold font-body"
                  >
                    View programs →
                  </Link>
                </div>
              </div>
            </div>

            {/* ECCI Assessment */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <Brain className="w-8 h-8 text-brand-electric mb-3" />
              <h4 className="font-bold text-brand-primary mb-2 font-sans">
                ECCI Performance Profile
              </h4>
              <p className="text-sm text-brand-gray-600 mb-4 font-body">
                Generate data-driven optimization recommendations using the ECCI analytical framework
              </p>
              <Link
                href="/ecci-assessment"
                className="inline-block text-sm bg-gradient-to-r from-brand-primary to-brand-slate text-white px-4 py-2 rounded-data font-semibold hover:shadow-glow transition-all font-body"
              >
                Run Assessment
              </Link>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <h4 className="font-bold text-brand-primary mb-4 font-sans">Quick Access</h4>
              <div className="space-y-3">
                <ResourceLink href="/reflections" text="Performance Log" />
                <ResourceLink href="/my-ceus" text="CEU Records" />
                <ResourceLink href="/glossary" text="Terminology Glossary" />
                <ResourceLink href="/community" text="Community Forum" />
                <ResourceLink href="/research" text="Research Data" />
                <ResourceLink href="/support" text="Technical Support" />
              </div>
            </div>
          </div>
        </div>
      </div>
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
        <div className={`w-14 h-14 ${color} rounded-lg flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="font-bold text-brand-charcoal mb-1 font-sans">{title}</h3>
        <p className="text-sm text-brand-gray-600 font-body">{description}</p>
      </div>
    </Link>
  );
}

function ResourceLink({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between py-2 text-sm text-brand-gray-600 hover:text-brand-electric transition-colors group font-body"
    >
      {text}
      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-electric border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-gray-600 font-body">Loading performance hub...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
