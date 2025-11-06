'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Brain, Heart, Award, TrendingUp, MessageCircle,
  BookOpen, Activity, Clock, ChevronRight, Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.next';
import { createClient } from '@/lib/supabase/client';

interface CEUProgress {
  total_earned: number;
  in_progress: number;
  available: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [ceuProgress, setCeuProgress] = useState<CEUProgress>({
    total_earned: 0,
    in_progress: 0,
    available: 8.0,
  });
  const [recentReflections, setRecentReflections] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
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
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5C7F4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#7F8C8D]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E6E3]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2C3E50]">
                Welcome back, {user?.email?.split('@')[0]}!
              </h1>
              <p className="text-[#7F8C8D] mt-1">
                Your sustainable wellness journey continues
              </p>
            </div>
            <Link
              href="/settings"
              className="text-[#5C7F4F] hover:text-[#4a6640] font-medium"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* CEU Progress Card */}
        <div className="bg-gradient-to-r from-[#5C7F4F] to-[#4a6640] rounded-xl p-8 text-white mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your CEU Journey</h2>
              <p className="text-white/80">
                RID requires 8.0 CEUs every 4 years
              </p>
            </div>
            <Award className="w-16 h-16 opacity-20" />
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-4xl font-bold">{ceuProgress.total_earned}</div>
              <div className="text-sm text-white/80">Earned</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{ceuProgress.in_progress}</div>
              <div className="text-sm text-white/80">In Progress</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{ceuProgress.available}</div>
              <div className="text-sm text-white/80">Available</div>
            </div>
          </div>

          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <div
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${(ceuProgress.total_earned / 8.0) * 100}%` }}
            ></div>
          </div>

          <Link
            href="/ceu-bundles"
            className="inline-flex items-center gap-2 bg-white text-[#5C7F4F] px-6 py-3 rounded-lg font-semibold hover:bg-[#F0EDE6] transition-colors"
          >
            Browse CEU Bundles
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickAction
            icon={<Heart className="w-8 h-8" />}
            title="Quick BREATHE"
            description="2-min stress reset"
            href="/reflections/breathe"
            color="bg-red-50 text-red-600"
          />
          <QuickAction
            icon={<MessageCircle className="w-8 h-8" />}
            title="Chat with Elya"
            description="AI wellness support"
            href="/elya"
            color="bg-purple-50 text-purple-600"
          />
          <QuickAction
            icon={<BookOpen className="w-8 h-8" />}
            title="Post-Assignment"
            description="Process your day"
            href="/reflections/post-assignment"
            color="bg-blue-50 text-blue-600"
          />
          <QuickAction
            icon={<Activity className="w-8 h-8" />}
            title="Wellness Check"
            description="Daily check-in"
            href="/reflections/wellness"
            color="bg-green-50 text-green-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#2C3E50]">
                  Recent Reflections
                </h3>
                <Link
                  href="/reflections"
                  className="text-sm text-[#5C7F4F] hover:text-[#4a6640] font-medium"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {recentReflections > 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-[#5C7F4F] mx-auto mb-3" />
                    <p className="text-[#2C3E50] font-semibold">
                      {recentReflections} reflections this week
                    </p>
                    <p className="text-sm text-[#7F8C8D]">
                      You're building sustainable practices!
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-[#E8E6E3] mx-auto mb-4" />
                    <p className="text-[#7F8C8D] mb-4">
                      No reflections yet this week
                    </p>
                    <Link
                      href="/reflections"
                      className="inline-block bg-[#5C7F4F] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4a6640] transition-colors"
                    >
                      Start Reflecting
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* New RID Category Announcement */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <Star className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-[#2C3E50] mb-1">
                    New RID Category!
                  </h4>
                  <p className="text-sm text-[#7F8C8D] mb-3">
                    Studies of Healthy Minds & Bodies (Effective Dec 1, 2025)
                  </p>
                  <Link
                    href="/ceu-bundles"
                    className="text-sm text-yellow-700 hover:text-yellow-800 font-semibold"
                  >
                    Explore CEU Bundles →
                  </Link>
                </div>
              </div>
            </div>

            {/* ECCI Assessment */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Brain className="w-8 h-8 text-[#5C7F4F] mb-3" />
              <h4 className="font-bold text-[#2C3E50] mb-2">
                Your ECCI Profile
              </h4>
              <p className="text-sm text-[#7F8C8D] mb-4">
                Get personalized wellness recommendations based on the ECCI Model
              </p>
              <Link
                href="/ecci-assessment"
                className="inline-block text-sm bg-[#5C7F4F] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#4a6640] transition-colors"
              >
                Take Assessment
              </Link>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="font-bold text-[#2C3E50] mb-4">Quick Links</h4>
              <div className="space-y-3">
                <ResourceLink href="/reflections" text="All Reflections" />
                <ResourceLink href="/my-ceus" text="My CEU History" />
                <ResourceLink href="/research" text="Research & Evidence" />
                <ResourceLink href="/support" text="Get Support" />
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
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow h-full">
        <div className={`w-14 h-14 ${color} rounded-lg flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="font-bold text-[#2C3E50] mb-1">{title}</h3>
        <p className="text-sm text-[#7F8C8D]">{description}</p>
      </div>
    </Link>
  );
}

function ResourceLink({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between py-2 text-sm text-[#7F8C8D] hover:text-[#5C7F4F] transition-colors group"
    >
      {text}
      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}
