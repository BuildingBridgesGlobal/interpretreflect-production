'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle, Clock, BookOpen, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext.next';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CEUProgram {
  id: string;
  program_code: string;
  title: string;
  description: string;
  category: string;
  ps_subcategory: string | null;
  ceu_value: number;
  estimated_hours: number;
  learning_objectives: string[];
  required_reflections: string[];
  bundle_type: string;
  price_cents: number;
  stripe_price_id: string | null;
}

export default function CEUBundlesPage() {
  const [programs, setPrograms] = useState<CEUProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [ridNumber, setRidNumber] = useState('');
  const [showRidModal, setShowRidModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<CEUProgram | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('ceu_programs')
        .select('*')
        .eq('is_active', true)
        .order('ceu_value', { ascending: true });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading CEU programs:', error);
      toast.error('Failed to load CEU programs');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getBundleColor = (bundleType: string) => {
    switch (bundleType) {
      case 'series':
        return 'border-blue-200 bg-blue-50';
      case 'path':
        return 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const handleEnroll = (program: CEUProgram) => {
    if (!user) {
      toast.error('Please sign in to enroll');
      router.push('/login');
      return;
    }

    setSelectedProgram(program);
    setShowRidModal(true);
  };

  const handleCheckout = async () => {
    if (!selectedProgram || !ridNumber.trim()) {
      toast.error('Please enter your RID certification number');
      return;
    }

    setEnrolling(selectedProgram.id);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: selectedProgram.id,
          ridNumber: ridNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5C7F4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#7F8C8D]">Loading CEU programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E6E3]">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#5C7F4F] hover:text-[#4a6640] mb-4"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <Award className="w-12 h-12 text-[#5C7F4F]" />
            <div>
              <h1 className="text-4xl font-bold text-[#2C3E50]">
                RID-Approved CEU Bundles
              </h1>
              <p className="text-[#7F8C8D] mt-1">
                Earn continuing education units while building sustainable wellness practices
              </p>
            </div>
          </div>

          {/* RID Sponsor Badge */}
          <div className="inline-flex items-center gap-2 bg-[#5C7F4F] text-white px-4 py-2 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">RID Approved Sponsor #2309</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* New RID Category Announcement */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-8 mb-12">
          <div className="flex items-start gap-4">
            <Star className="w-12 h-12 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">
                NEW RID Professional Studies Category
              </h2>
              <p className="text-lg text-[#7F8C8D] mb-3">
                <strong>Studies of Healthy Minds & Bodies</strong> - Effective December 1, 2025
              </p>
              <p className="text-[#7F8C8D] mb-4">
                InterpretReflect is the first platform designed specifically for this new category.
                Our evidence-based wellness programs help you meet your CEU requirements while
                building skills to prevent burnout and manage vicarious trauma.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-[#5C7F4F]">
                  <CheckCircle className="w-4 h-4" />
                  Pre-enrollment required by RID
                </div>
                <div className="flex items-center gap-2 text-sm text-[#5C7F4F]">
                  <CheckCircle className="w-4 h-4" />
                  Certificate issued upon completion
                </div>
                <div className="flex items-center gap-2 text-sm text-[#5C7F4F]">
                  <CheckCircle className="w-4 h-4" />
                  Attested by Sarah Wheeler, M.Ed., M.S.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-6">How CEU Bundles Work</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#5C7F4F] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                1
              </div>
              <h3 className="font-semibold text-[#2C3E50] mb-2">Choose Bundle</h3>
              <p className="text-sm text-[#7F8C8D]">
                Select the CEU bundle that fits your goals
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#5C7F4F] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                2
              </div>
              <h3 className="font-semibold text-[#2C3E50] mb-2">Enroll First</h3>
              <p className="text-sm text-[#7F8C8D]">
                RID requires enrollment before starting
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#5C7F4F] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                3
              </div>
              <h3 className="font-semibold text-[#2C3E50] mb-2">Complete Activities</h3>
              <p className="text-sm text-[#7F8C8D]">
                Guided reflections with time tracking
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#5C7F4F] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                4
              </div>
              <h3 className="font-semibold text-[#2C3E50] mb-2">Get Certificate</h3>
              <p className="text-sm text-[#7F8C8D]">
                Official RID certificate mailed to you
              </p>
            </div>
          </div>
        </div>

        {/* CEU Bundles Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {programs.map((program) => (
            <div
              key={program.id}
              className={`border-2 rounded-xl p-8 ${getBundleColor(program.bundle_type)} ${
                program.bundle_type === 'path' ? 'lg:col-span-2' : ''
              } relative overflow-hidden`}
            >
              {/* Best Value Badge */}
              {program.bundle_type === 'path' && (
                <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  BEST VALUE
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-[#5C7F4F] mb-1">
                    {program.ps_subcategory || program.category}
                  </div>
                  <h3 className="text-2xl font-bold text-[#2C3E50] mb-2">
                    {program.title}
                  </h3>
                  <p className="text-[#7F8C8D] mb-4">{program.description}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-4 mb-6">
                <div className="text-4xl font-bold text-[#2C3E50]">
                  {formatPrice(program.price_cents)}
                </div>
                <div className="text-lg text-[#7F8C8D]">
                  {program.ceu_value} CEU{program.ceu_value !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1 text-sm text-[#7F8C8D]">
                  <Clock className="w-4 h-4" />
                  {program.estimated_hours} hours
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="mb-6">
                <h4 className="font-semibold text-[#2C3E50] mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Learning Objectives
                </h4>
                <ul className="space-y-2">
                  {program.learning_objectives.map((objective, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[#7F8C8D]">
                      <CheckCircle className="w-4 h-4 text-[#5C7F4F] mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Reflections */}
              <div className="mb-6">
                <h4 className="font-semibold text-[#2C3E50] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  What's Included
                </h4>
                <div className="flex flex-wrap gap-2">
                  {program.required_reflections.map((reflection, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-[#E8E6E3] px-3 py-1 rounded-full text-sm text-[#7F8C8D]"
                    >
                      {reflection}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleEnroll(program)}
                disabled={enrolling === program.id}
                className="w-full bg-[#5C7F4F] text-white py-4 rounded-lg font-semibold hover:bg-[#4a6640] transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling === program.id ? 'Processing...' : 'Enroll Now'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-xs text-center text-[#7F8C8D] mt-3">
                You must enroll before starting activities (RID requirement)
              </p>
            </div>
          ))}
        </div>

        {/* Pro Tier Upsell */}
        <div className="bg-gradient-to-r from-[#5C7F4F] to-[#4a6640] rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Need More CEUs?</h2>
              <p className="text-white/90 mb-4">
                Get unlimited access to all CEU programs with our Pro tier
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Unlimited CEU enrollments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Access to all future programs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Priority support from Elya AI</span>
                </li>
              </ul>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-white/80">/year</span>
              </div>
            </div>
            <button
              onClick={() => toast.success('Pro tier checkout coming soon!')}
              className="bg-white text-[#5C7F4F] px-8 py-4 rounded-lg font-semibold hover:bg-[#F0EDE6] transition-colors whitespace-nowrap"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-[#2C3E50] mb-2">
                Are these CEUs accepted by RID?
              </h3>
              <p className="text-[#7F8C8D]">
                Yes! InterpretReflect is an RID Approved Sponsor (#2309). Our CEUs are fully
                accepted for the new "Studies of Healthy Minds & Bodies" Professional Studies category.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#2C3E50] mb-2">
                When do I need to enroll?
              </h3>
              <p className="text-[#7F8C8D]">
                RID requires that you enroll in a CEU program BEFORE beginning any activities.
                You cannot receive retroactive CEUs for work completed before enrollment.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#2C3E50] mb-2">
                How long do I have to complete a bundle?
              </h3>
              <p className="text-[#7F8C8D]">
                You have 12 months from enrollment to complete your bundle. We track your time
                and progress automatically.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#2C3E50] mb-2">
                How do I receive my certificate?
              </h3>
              <p className="text-[#7F8C8D]">
                Upon completion, you'll receive a digital certificate immediately. We also report
                your CEUs directly to RID quarterly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#2C3E50] mb-2">
                Can I use the free reflections without getting CEUs?
              </h3>
              <p className="text-[#7F8C8D]">
                Absolutely! All reflection tools are free to use. You only need to enroll in a
                CEU bundle if you want official continuing education credit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RID Number Modal */}
      {showRidModal && selectedProgram && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">
              Enter Your RID Number
            </h2>
            <p className="text-[#7F8C8D] mb-6">
              We need your RID certification number to issue your CEU certificate upon completion.
            </p>

            <div className="mb-6">
              <label htmlFor="ridNumber" className="block text-sm font-medium text-[#2C3E50] mb-2">
                RID Certification Number
              </label>
              <input
                id="ridNumber"
                type="text"
                value={ridNumber}
                onChange={(e) => setRidNumber(e.target.value)}
                placeholder="e.g., CI1234, CT5678"
                className="w-full px-4 py-3 border border-[#E8E6E3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C7F4F] focus:border-transparent"
              />
              <p className="text-xs text-[#7F8C8D] mt-2">
                Your RID number starts with your credential type (CI, CT, CDI, etc.) followed by numbers.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-[#7F8C8D]">
                <strong className="text-[#2C3E50]">Important:</strong> RID requires you to enroll
                BEFORE starting any activities. You cannot receive CEUs retroactively.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRidModal(false);
                  setSelectedProgram(null);
                  setRidNumber('');
                }}
                className="flex-1 px-6 py-3 border-2 border-[#E8E6E3] rounded-lg font-semibold text-[#7F8C8D] hover:bg-[#F0EDE6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={!ridNumber.trim() || enrolling === selectedProgram.id}
                className="flex-1 bg-[#5C7F4F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4a6640] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling === selectedProgram.id ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
