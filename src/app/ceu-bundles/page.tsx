'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle, Clock, BookOpen, TrendingUp, ChevronRight, ArrowLeft } from 'lucide-react';
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
        throw new Error(data.error || 'Checkout failed');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout');
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-electric border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-gray-600 font-body">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-brand-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-brand-gray-600 hover:text-brand-primary mb-6 font-body transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-electric to-brand-electric-hover rounded-data flex items-center justify-center flex-shrink-0 shadow-glow-sm">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-brand-primary mb-2 font-sans">
                Professional Development Programs
              </h1>
              <p className="text-lg text-brand-gray-600 font-body">
                RID-approved CEUs designed for interpreter wellness and performance optimization
              </p>
            </div>
          </div>

          {/* RID Sponsor Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-data shadow-sm font-body">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">RID Approved Sponsor #2309</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* New Category Announcement */}
        <div className="bg-gradient-to-r from-brand-electric-light to-brand-info-light border-2 border-brand-electric rounded-data p-8 mb-12 shadow-card">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 bg-brand-electric rounded-data flex items-center justify-center flex-shrink-0 shadow-glow-sm">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-brand-primary mb-3 font-sans">
                NEW: Studies of Healthy Minds & Bodies
              </h2>
              <p className="text-brand-charcoal mb-4 font-body leading-relaxed">
                InterpretReflect is the first platform designed specifically for RID's new Professional Studies category
                (effective December 1, 2025). Our evidence-based programs help you meet CEU requirements while
                building skills to prevent burnout and manage vicarious trauma.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-brand-primary font-medium font-body">
                  <CheckCircle className="w-5 h-5 text-brand-electric" />
                  RID-compliant pre-enrollment
                </div>
                <div className="flex items-center gap-2 text-sm text-brand-primary font-medium font-body">
                  <CheckCircle className="w-5 h-5 text-brand-electric" />
                  Official certificate issued
                </div>
                <div className="flex items-center gap-2 text-sm text-brand-primary font-medium font-body">
                  <CheckCircle className="w-5 h-5 text-brand-electric" />
                  Expert attestation included
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-data shadow-card p-8 mb-12 border border-brand-gray-200">
          <h2 className="text-2xl font-bold text-brand-primary mb-8 font-sans">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: "1", title: "Choose Program", desc: "Select the CEU program that fits your goals" },
              { num: "2", title: "Enroll First", desc: "Complete RID-required enrollment" },
              { num: "3", title: "Complete Activities", desc: "Guided reflections with time tracking" },
              { num: "4", title: "Get Certificate", desc: "Official RID certificate delivered" }
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-electric to-brand-electric-hover text-white rounded-data flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-glow-sm font-mono">
                  {step.num}
                </div>
                <h3 className="font-bold text-brand-primary mb-2 font-sans">{step.title}</h3>
                <p className="text-sm text-brand-gray-600 font-body leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {programs.map((program) => (
            <div
              key={program.id}
              className={`bg-white rounded-data shadow-card p-8 border border-brand-gray-200 hover:border-brand-electric hover:shadow-card-hover transition-all ${
                program.bundle_type === 'path' ? 'lg:col-span-2 bg-gradient-to-br from-white to-brand-electric-light/30' : ''
              } relative overflow-hidden`}
            >
              {/* Best Value Badge */}
              {program.bundle_type === 'path' && (
                <div className="absolute top-6 right-6 bg-gradient-to-r from-brand-electric to-brand-electric-hover text-white px-4 py-2 rounded-data text-sm font-bold shadow-glow-sm font-body">
                  COMPLETE PATH
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm font-semibold text-brand-electric mb-2 font-body uppercase tracking-wide">
                  {program.ps_subcategory || program.category}
                </div>
                <h3 className="text-2xl font-bold text-brand-primary mb-3 font-sans">
                  {program.title}
                </h3>
                <p className="text-brand-gray-600 font-body leading-relaxed">{program.description}</p>
              </div>

              <div className="flex items-baseline gap-4 mb-8 pb-6 border-b border-brand-gray-200">
                <div className="text-4xl font-bold text-brand-primary font-mono">
                  {formatPrice(program.price_cents)}
                </div>
                <div className="text-lg text-brand-charcoal font-semibold font-body">
                  {program.ceu_value} CEU{program.ceu_value !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-brand-gray-600 font-body">
                  <Clock className="w-4 h-4" />
                  ~{program.estimated_hours} hours
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="mb-6">
                <h4 className="font-bold text-brand-primary mb-4 flex items-center gap-2 font-sans">
                  <BookOpen className="w-5 h-5 text-brand-electric" />
                  Learning Objectives
                </h4>
                <ul className="space-y-3">
                  {program.learning_objectives.map((objective, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-brand-charcoal font-body">
                      <CheckCircle className="w-5 h-5 text-brand-electric mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What's Included */}
              <div className="mb-8">
                <h4 className="font-bold text-brand-primary mb-4 flex items-center gap-2 font-sans">
                  <TrendingUp className="w-5 h-5 text-brand-electric" />
                  What's Included
                </h4>
                <div className="flex flex-wrap gap-2">
                  {program.required_reflections.map((reflection, idx) => (
                    <span
                      key={idx}
                      className="bg-brand-gray-50 border border-brand-gray-200 px-4 py-2 rounded-data text-sm text-brand-charcoal font-body"
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
                className="w-full bg-gradient-to-r from-brand-electric to-brand-electric-hover text-white py-4 rounded-data font-semibold hover:shadow-glow-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed font-body"
              >
                {enrolling === program.id ? 'Processing...' : 'Enroll Now'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-xs text-center text-brand-gray-600 mt-4 font-body">
                RID requires enrollment before starting activities
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RID Number Modal */}
      {showRidModal && selectedProgram && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-data shadow-xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-brand-primary mb-4 font-sans">
              RID Certification Number
            </h3>
            <p className="text-brand-gray-600 mb-6 font-body">
              Please enter your RID certification number to continue with enrollment for{' '}
              <strong>{selectedProgram.title}</strong>.
            </p>
            <input
              type="text"
              placeholder="RID-XXXXX"
              value={ridNumber}
              onChange={(e) => setRidNumber(e.target.value)}
              className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data mb-6 focus:border-brand-electric focus:outline-none font-body"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRidModal(false);
                  setRidNumber('');
                  setSelectedProgram(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-brand-gray-200 text-brand-charcoal rounded-data font-semibold hover:bg-brand-gray-50 transition-colors font-body"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={!ridNumber.trim() || enrolling === selectedProgram.id}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-electric to-brand-electric-hover text-white rounded-data font-semibold hover:shadow-glow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-body"
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
