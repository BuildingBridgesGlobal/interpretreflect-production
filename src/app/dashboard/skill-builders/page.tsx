'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, ArrowLeft, Award, Clock, CheckCircle, Play, Lock } from 'lucide-react';
import Link from 'next/link';

interface SkillModule {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: number; // minutes
  ceuCredits: number;
  ceuCategory: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isPremium: boolean;
  steps: number;
}

// Sample skill builder modules (in production, these would come from database)
const SKILL_MODULES: SkillModule[] = [
  {
    id: 'consecutive-notetaking-101',
    title: 'Consecutive Interpreting: Note-Taking Fundamentals',
    category: 'Technical Skills',
    description: 'Master the foundational techniques of effective note-taking for consecutive interpreting. Learn symbol systems, layout strategies, and memory aids.',
    duration: 45,
    ceuCredits: 0.5,
    ceuCategory: 'Professional Studies',
    difficulty: 'Beginner',
    isPremium: false,
    steps: 8,
  },
  {
    id: 'medical-terminology-intensive',
    title: 'Medical Terminology Intensive',
    category: 'Domain Knowledge',
    description: 'Build fluency in common medical terms across specialties. Includes anatomy, procedures, medications, and patient care vocabulary.',
    duration: 90,
    ceuCredits: 1.0,
    ceuCategory: 'Professional Studies',
    difficulty: 'Intermediate',
    isPremium: true,
    steps: 12,
  },
  {
    id: 'cognitive-load-management',
    title: 'Cognitive Load Management for Interpreters',
    category: 'Performance Optimization',
    description: 'Evidence-based strategies to reduce mental fatigue, optimize working memory, and maintain peak cognitive performance during demanding assignments.',
    duration: 60,
    ceuCredits: 0.5,
    ceuCategory: 'Studies of Healthy Minds & Bodies',
    difficulty: 'Intermediate',
    isPremium: false,
    steps: 10,
  },
  {
    id: 'legal-interpreting-essentials',
    title: 'Legal Interpreting Essentials',
    category: 'Domain Knowledge',
    description: 'Navigate courtroom procedures, legal terminology, and ethical considerations specific to legal interpreting contexts.',
    duration: 120,
    ceuCredits: 1.5,
    ceuCategory: 'Professional Studies',
    difficulty: 'Advanced',
    isPremium: true,
    steps: 15,
  },
  {
    id: 'burnout-prevention-strategies',
    title: 'Burnout Prevention & Career Longevity',
    category: 'Performance Optimization',
    description: 'Identify early warning signs of burnout, implement recovery protocols, and develop sustainable performance habits for long-term career success.',
    duration: 45,
    ceuCredits: 0.5,
    ceuCategory: 'Studies of Healthy Minds & Bodies',
    difficulty: 'Beginner',
    isPremium: false,
    steps: 7,
  },
  {
    id: 'vri-optimization',
    title: 'VRI Performance Optimization',
    category: 'Technical Skills',
    description: 'Specialized techniques for video remote interpreting: managing screen fatigue, optimizing audio clarity, and maintaining engagement in virtual settings.',
    duration: 60,
    ceuCredits: 0.5,
    ceuCategory: 'Professional Studies',
    difficulty: 'Intermediate',
    isPremium: true,
    steps: 9,
  },
];

const CATEGORIES = ['All', 'Technical Skills', 'Domain Knowledge', 'Performance Optimization'];

export default function SkillBuildersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [progress, setProgress] = useState<Record<string, any>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);

        // Get user profile for subscription tier
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setProfile(profile);

        // Get user's progress on skill builders
        const { data: progressData } = await supabase
          .from('skill_builder_progress')
          .select('*')
          .eq('user_id', user.id);

        if (progressData) {
          const progressMap: Record<string, any> = {};
          progressData.forEach(p => {
            progressMap[p.module_id] = p;
          });
          setProgress(progressMap);
        }
      }
    });
  }, [router]);

  const filteredModules = selectedCategory === 'All'
    ? SKILL_MODULES
    : SKILL_MODULES.filter(m => m.category === selectedCategory);

  const canAccessModule = (module: SkillModule) => {
    if (!module.isPremium) return true;
    return profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'agency';
  };

  const getStatusBadge = (moduleId: string) => {
    const prog = progress[moduleId];
    if (!prog) return null;

    if (prog.status === 'completed') {
      return (
        <div className="flex items-center gap-1 bg-brand-energy-light text-brand-energy px-3 py-1 rounded-full text-xs font-semibold font-body">
          <CheckCircle className="w-3 h-3" />
          Completed
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 bg-brand-electric-light text-brand-electric px-3 py-1 rounded-full text-xs font-semibold font-body">
        <Play className="w-3 h-3" />
        {prog.progress_percent}% Complete
      </div>
    );
  };

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
              <BookOpen className="w-6 h-6 text-brand-electric" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-brand-primary font-sans">
                Skill Builders
              </h1>
              <p className="text-brand-gray-600 font-body">
                Micro-learning modules for professional development
              </p>
            </div>
          </div>

          {/* CEU Count */}
          <div className="bg-gradient-to-br from-brand-electric-light to-brand-energy-light rounded-xl border-2 border-brand-electric p-4 text-center">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Award className="w-5 h-5 text-brand-electric" />
              <span className="text-2xl font-bold text-brand-primary font-mono">
                {SKILL_MODULES.reduce((sum, m) => sum + m.ceuCredits, 0).toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-brand-gray-600 font-body">
              RID CEUs Available
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex gap-2">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors font-body ${
              selectedCategory === category
                ? 'bg-brand-electric text-white'
                : 'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {filteredModules.map(module => {
          const hasAccess = canAccessModule(module);
          const moduleProgress = progress[module.id];

          return (
            <div
              key={module.id}
              className={`bg-white rounded-xl shadow-md border-2 p-6 transition-all ${
                hasAccess
                  ? 'border-brand-gray-200 hover:border-brand-electric hover:shadow-lg cursor-pointer'
                  : 'border-brand-gray-200 opacity-75'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-brand-electric bg-brand-electric-light px-2 py-1 rounded font-body">
                      {module.category}
                    </span>
                    <span className="text-xs text-brand-gray-500 font-body">
                      {module.difficulty}
                    </span>
                    {!hasAccess && (
                      <Lock className="w-4 h-4 text-brand-gray-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-brand-primary font-sans">
                    {module.title}
                  </h3>
                </div>
                {getStatusBadge(module.id)}
              </div>

              <p className="text-sm text-brand-gray-600 mb-4 font-body">
                {module.description}
              </p>

              {/* Module Details */}
              <div className="flex items-center gap-4 mb-4 text-sm text-brand-gray-500 font-body">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {module.duration} min
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {module.ceuCredits} CEUs
                </div>
                <div className="text-xs">
                  {module.steps} steps
                </div>
              </div>

              {/* CEU Category Badge */}
              <div className="mb-4">
                <span className="text-xs bg-brand-energy-light text-brand-primary px-2 py-1 rounded font-body">
                  {module.ceuCategory}
                </span>
              </div>

              {/* Action Button */}
              {hasAccess ? (
                <Link
                  href={`/dashboard/skill-builders/${module.id}`}
                  className="block text-center bg-brand-electric text-white py-3 rounded-lg font-semibold hover:bg-brand-primary transition-colors font-body"
                >
                  {moduleProgress?.status === 'completed'
                    ? 'Review Module'
                    : moduleProgress?.status === 'in_progress'
                    ? 'Continue Learning'
                    : 'Start Module'}
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="block text-center bg-brand-gray-200 text-brand-gray-700 py-3 rounded-lg font-semibold hover:bg-brand-gray-300 transition-colors font-body"
                >
                  Upgrade to Access
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-br from-brand-electric-light to-brand-energy-light rounded-xl border-2 border-brand-electric p-6">
        <div className="flex items-start gap-4">
          <Award className="w-8 h-8 text-brand-electric flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-brand-primary mb-2 font-sans">
              RID-Approved Professional Development
            </h3>
            <p className="text-brand-gray-700 mb-3 font-body">
              All Skill Builder modules provide RID-approved CEUs through Building Bridges Global, LLC (Sponsor #2309). Track your progress and download certificates upon completion.
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm font-body">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-energy flex-shrink-0 mt-0.5" />
                <span className="text-brand-gray-700">
                  Self-paced learning modules
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-energy flex-shrink-0 mt-0.5" />
                <span className="text-brand-gray-700">
                  Instant certificate generation
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-energy flex-shrink-0 mt-0.5" />
                <span className="text-brand-gray-700">
                  Evidence-based curriculum
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-energy flex-shrink-0 mt-0.5" />
                <span className="text-brand-gray-700">
                  Progress tracking & analytics
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription CTA (for free users) */}
      {profile?.subscription_tier === 'free' && (
        <div className="mt-8 bg-white rounded-xl shadow-lg border-2 border-brand-electric p-8 text-center">
          <h3 className="text-2xl font-bold text-brand-primary mb-3 font-sans">
            Unlock All Skill Builders
          </h3>
          <p className="text-brand-gray-600 mb-6 font-body">
            Upgrade to Premium to access all {SKILL_MODULES.filter(m => m.isPremium).length} premium modules and earn up to {SKILL_MODULES.reduce((sum, m) => sum + m.ceuCredits, 0).toFixed(1)} RID-approved CEUs.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-brand-electric text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-primary transition-colors font-body"
          >
            View Pricing
          </Link>
        </div>
      )}
    </div>
  );
}
