'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Target, CheckCircle, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const EMOTIONAL_LABELS = ['calm','anxious','frustrated','tired','focused','overwhelmed','other'];

const FOCUS_OPTIONS = [
  'Emotional regulation under stress (EI)',
  'Cultural humility / perspective-taking (CQ)',
  'Capturing emotional tone and intent (Meaning-Making)',
  'Role-space & boundaries (Role-Space)',
  'Repairing slips / recovery strategies (Reflective Praxis)',
  'Working with AI/tech/avatars ethically and effectively (AI Collaboration)'
];

export default function BaselineCheckPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [recentChecks, setRecentChecks] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    pre_emotional_state_score: 0,
    pre_emotional_state_label: '',
    pre_cognitive_readiness_score: 0,
    pre_context_familiarity_score: 0,
    pre_role_clarity_score: 0,
    pre_focus_ecci_domains: [] as string[],
    pre_focus_free_text: '',
    pre_ai_involvement_expected: '' as 'yes' | 'no' | 'unsure' | '',
    pre_ai_confidence_score: 0,
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);

        // Load recent baseline checks
        const { data: checks } = await supabase
          .from('readiness_checks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(7);

        if (checks) {
          setRecentChecks(checks);
        }
      }
    });
  }, [router]);

  const toggleFocus = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      pre_focus_ecci_domains: prev.pre_focus_ecci_domains.includes(tag)
        ? prev.pre_focus_ecci_domains.filter(t => t !== tag)
        : [...prev.pre_focus_ecci_domains, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('readiness_checks')
        .insert({
          user_id: user.id,
          pre_emotional_state_score: formData.pre_emotional_state_score,
          pre_emotional_state_label: formData.pre_emotional_state_label || null,
          pre_cognitive_readiness_score: formData.pre_cognitive_readiness_score,
          pre_context_familiarity_score: formData.pre_context_familiarity_score,
          pre_role_clarity_score: formData.pre_role_clarity_score,
          pre_focus_ecci_domains: formData.pre_focus_ecci_domains,
          pre_focus_free_text: formData.pre_focus_free_text || null,
          pre_ai_involvement_expected: formData.pre_ai_involvement_expected,
          pre_ai_confidence_score: formData.pre_ai_involvement_expected === 'no' ? null : formData.pre_ai_confidence_score || null,
        });

      if (error) throw error;

      setSubmitted(true);
    } catch (err: any) {
      alert('Error saving baseline check: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (metric: string) => {
    if (recentChecks.length === 0) return null;
    const sum = recentChecks.reduce((acc, check) => acc + (check[metric] || 0), 0);
    return (sum / recentChecks.length).toFixed(1);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-brand-energy p-8 text-center">
          <div className="w-16 h-16 bg-brand-energy rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-primary mb-4 font-sans">
            Baseline Check Complete!
          </h1>
          <p className="text-brand-gray-600 mb-6 font-body">
            Your daily performance baseline has been recorded. We're tracking your patterns to optimize your performance trajectory.
          </p>

          {/* Quick Stats */}
          <div className="bg-brand-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-sm font-semibold text-brand-primary mb-4 font-body">Your Recent Averages</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-brand-electric font-mono">{calculateAverage('pre_emotional_state_score') || '--'}</p>
                <p className="text-xs text-brand-gray-600 font-body">Emotional State</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-energy font-mono">{calculateAverage('pre_cognitive_readiness_score') || '--'}</p>
                <p className="text-xs text-brand-gray-600 font-body">Cognitive Readiness</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-electric font-mono">{calculateAverage('pre_context_familiarity_score') || '--'}</p>
                <p className="text-xs text-brand-gray-600 font-body">Context Familiarity</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-energy font-mono">{calculateAverage('pre_role_clarity_score') || '--'}</p>
                <p className="text-xs text-brand-gray-600 font-body">Role Clarity</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard/performance"
              className="bg-brand-electric text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-primary transition-colors font-body flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              View Trends
            </Link>
            <Link
              href="/dashboard"
              className="bg-brand-gray-200 text-brand-primary px-6 py-3 rounded-lg font-semibold hover:bg-brand-gray-300 transition-colors font-body"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-brand-electric hover:text-brand-primary mb-4 font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-brand-energy-light rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-brand-energy" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-brand-primary font-sans">
              Readiness Check
            </h1>
            <p className="text-brand-gray-600 font-body">
              2-minute pre-session calibration
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border-2 border-brand-gray-200 p-8 space-y-8">
        <div className="space-y-6">
          <div className="border-b border-brand-gray-200 pb-6">
            <h3 className="text-xl font-bold text-brand-primary font-sans mb-2">Emotional State Snapshot</h3>
            <p className="text-sm text-brand-gray-600 font-body mb-3">Right now, how would you describe your emotional state before this assignment?</p>
            <div className="flex gap-2 mb-3">
              {[1,2,3,4,5].map(v => (
                <button key={v} type="button" onClick={() => setFormData({ ...formData, pre_emotional_state_score: v })} className={`flex-1 py-3 rounded-lg font-mono font-bold ${formData.pre_emotional_state_score===v?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'}`}>{v}</button>
              ))}
            </div>
            <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">Optional label</label>
            <div className="flex flex-wrap gap-2">
              {EMOTIONAL_LABELS.map(l => (
                <button key={l} type="button" onClick={() => setFormData({ ...formData, pre_emotional_state_label: l })} className={`px-3 py-2 rounded-lg ${formData.pre_emotional_state_label===l?'bg-brand-energy text-white':'bg-brand-gray-100 text-brand-primary'}`}>{l}</button>
              ))}
            </div>
          </div>

          <div className="border-b border-brand-gray-200 pb-6">
            <h3 className="text-xl font-bold text-brand-primary font-sans mb-2">Cognitive Bandwidth</h3>
            <p className="text-sm text-brand-gray-600 font-body mb-3">How mentally clear and focused do you feel going into this assignment?</p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(v => (
                <button key={v} type="button" onClick={() => setFormData({ ...formData, pre_cognitive_readiness_score: v })} className={`flex-1 py-3 rounded-lg font-mono font-bold ${formData.pre_cognitive_readiness_score===v?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'}`}>{v}</button>
              ))}
            </div>
          </div>

          <div className="border-b border-brand-gray-200 pb-6">
            <h3 className="text-xl font-bold text-brand-primary font-sans mb-2">Context and Cultural Familiarity</h3>
            <p className="text-sm text-brand-gray-600 font-body mb-3">How familiar are you with this assignment's setting, participants, and cultural context?</p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(v => (
                <button key={v} type="button" onClick={() => setFormData({ ...formData, pre_context_familiarity_score: v })} className={`flex-1 py-3 rounded-lg font-mono font-bold ${formData.pre_context_familiarity_score===v?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'}`}>{v}</button>
              ))}
            </div>
          </div>

          <div className="border-b border-brand-gray-200 pb-6">
            <h3 className="text-xl font-bold text-brand-primary font-sans mb-2">Role and Expectation Clarity</h3>
            <p className="text-sm text-brand-gray-600 font-body mb-3">How clear are you about your role, boundaries, and expectations in this assignment?</p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(v => (
                <button key={v} type="button" onClick={() => setFormData({ ...formData, pre_role_clarity_score: v })} className={`flex-1 py-3 rounded-lg font-mono font-bold ${formData.pre_role_clarity_score===v?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'}`}>{v}</button>
              ))}
            </div>
          </div>

          <div className="border-b border-brand-gray-200 pb-6">
            <h3 className="text-xl font-bold text-brand-primary font-sans mb-2">Strategic Intention</h3>
            <p className="text-sm text-brand-gray-600 font-body mb-3">What are you intentionally practicing or focusing on in this assignment?</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {FOCUS_OPTIONS.map(opt => (
                <button key={opt} type="button" onClick={() => toggleFocus(opt)} className={`px-3 py-2 rounded-full text-sm font-semibold ${formData.pre_focus_ecci_domains.includes(opt)?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-primary'}`}>{opt}</button>
              ))}
            </div>
            <textarea value={formData.pre_focus_free_text} onChange={(e)=>setFormData({ ...formData, pre_focus_free_text: e.target.value })} rows={3} className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-lg font-body text-brand-primary focus:border-brand-electric focus:outline-none" placeholder="In your own words (optional)" />
          </div>

          <div className="pb-2">
            <h3 className="text-xl font-bold text-brand-primary font-sans mb-2">AI, Tech, and Avatar Readiness</h3>
            <p className="text-sm text-brand-gray-600 font-body mb-3">Will this assignment involve AI, remote platforms, or signing avatars?</p>
            <div className="flex gap-2 mb-3">
              {(['yes','no','unsure'] as const).map(v => (
                <button key={v} type="button" onClick={() => setFormData({ ...formData, pre_ai_involvement_expected: v })} className={`flex-1 py-3 rounded-lg font-semibold ${formData.pre_ai_involvement_expected===v?'bg-brand-energy text-white':'bg-brand-gray-100 text-brand-primary'}`}>{v}</button>
              ))}
            </div>
            {(formData.pre_ai_involvement_expected==='yes' || formData.pre_ai_involvement_expected==='unsure') && (
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">Confidence managing AI/tech ethically and effectively</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setFormData({ ...formData, pre_ai_confidence_score: v })} className={`flex-1 py-3 rounded-lg font-mono font-bold ${formData.pre_ai_confidence_score===v?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'}`}>{v}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={loading || !formData.pre_emotional_state_score || !formData.pre_cognitive_readiness_score || !formData.pre_context_familiarity_score || !formData.pre_role_clarity_score || formData.pre_focus_ecci_domains.length===0 || !formData.pre_ai_involvement_expected || ((formData.pre_ai_involvement_expected!=='no') && !formData.pre_ai_confidence_score)} className="w-full bg-brand-energy text-white font-bold py-4 px-6 rounded-lg font-body hover:bg-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Saving...' : 'Complete Readiness Check'}</button>
          <p className="text-xs text-center text-brand-gray-500 mt-2 font-body">All required fields must be completed</p>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-8 bg-brand-gray-50 rounded-xl p-6 border border-brand-gray-200">
        <h3 className="text-lg font-bold text-brand-primary mb-2 font-sans">
          Why Run Readiness Checks?
        </h3>
        <ul className="space-y-2 text-sm text-brand-gray-600 font-body">
          <li className="flex items-start gap-2">
            <span className="text-brand-electric font-bold">•</span>
            <span>Identify patterns between recovery quality and performance outcomes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-electric font-bold">•</span>
            <span>Recognize early warning signs of burnout or cognitive overload</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-electric font-bold">•</span>
            <span>Optimize scheduling based on your performance readiness cycles</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-electric font-bold">•</span>
            <span>Build data-driven insights for sustainable career longevity</span>
          </li>
        </ul>
      </div>
    </div>
  );
}