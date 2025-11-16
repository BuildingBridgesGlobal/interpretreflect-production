'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Zap, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const ASSIGNMENT_TYPES = [
  'Medical',
  'Legal',
  'Educational',
  'VRI (Video Remote)',
  'OPI (Over-the-Phone)',
  'Community',
  'Conference',
  'Mental Health',
  'Government',
  'Other'
];

const SETTING_TYPES = [
  'In-Person',
  'Video Remote (VRI)',
  'Over-the-Phone (OPI)',
  'Hybrid'
];

export default function QuickReflectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    post_emotional_load_score: 0,
    post_cognitive_load_score: 0,
    post_meaning_challenge_score: 0,
    post_meaning_challenge_tags: [] as string[],
    post_rolespace_challenge_score: 0,
    post_rolespace_challenge_tags: [] as string[],
    post_cultural_friction_score: 0,
    post_cultural_friction_tags: [] as string[],
    post_ai_impact_score: 0,
    post_ai_issue_tags: [] as string[],
    post_recovery_actions: [] as string[],
    post_recovery_other: '',
    post_key_learning_text: '',
    post_key_learning_tags: [] as string[],
    post_performance_confidence_score: 0,
    post_reflection_depth_self_score: 0,
  });

  const [customInputs, setCustomInputs] = useState({ otherRecovery: '' });

  const [aiSectionVisible, setAiSectionVisible] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);
      }
    });
  }, [router]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('qr.draft');
      if (raw) {
        const parsed = JSON.parse(raw);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
      
    } catch {}
  }, [searchParams]);

  useEffect(() => {
    try { localStorage.setItem('qr.draft', JSON.stringify(formData)); } catch {}
  }, [formData]);

  const handleAddItem = (field: 'challenge_areas' | 'success_moments' | 'new_vocabulary' | 'skills_practiced', inputKey: 'challenge' | 'success' | 'vocab' | 'skill') => {
    const value = customInputs[inputKey].trim();
    if (value) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
      setCustomInputs(prev => ({ ...prev, [inputKey]: '' }));
    }
  };

  const handleRemoveItem = (field: 'challenge_areas' | 'success_moments' | 'new_vocabulary' | 'skills_practiced', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      const payload: any = { user_id: user.id, ...formData };
      const { error } = await supabase
        .from('quick_reflections')
        .insert(payload);

      if (error) throw error;

      setSubmitted(true);
    } catch (err: any) {
      alert('Error saving reflection: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-brand-electric p-8 text-center">
          <div className="w-16 h-16 bg-brand-energy rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-primary mb-4 font-sans">
            Reflection Saved!
          </h1>
          <p className="text-brand-gray-600 mb-6 font-body">
            Your post-assignment insights have been recorded. We'll analyze patterns and provide personalized recommendations.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  post_emotional_load_score: 0,
                  post_cognitive_load_score: 0,
                  post_meaning_challenge_score: 0,
                  post_meaning_challenge_tags: [],
                  post_rolespace_challenge_score: 0,
                  post_rolespace_challenge_tags: [],
                  post_cultural_friction_score: 0,
                  post_cultural_friction_tags: [],
                  post_ai_impact_score: 0,
                  post_ai_issue_tags: [],
                  post_recovery_actions: [],
                  post_recovery_other: '',
                  post_key_learning_text: '',
                  post_key_learning_tags: [],
                  post_performance_confidence_score: 0,
                  post_reflection_depth_self_score: 0,
                });
              }}
              className="bg-brand-electric text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-primary transition-colors font-body"
            >
              Log Another Assignment
            </button>
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
          <div className="w-12 h-12 bg-brand-electric-light rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-brand-electric" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-brand-primary font-sans">
              Quick Reflect
            </h1>
            <p className="text-brand-gray-600 font-body">
              Post-Assignment Performance Check-In (2 minutes)
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border-2 border-brand-gray-200 p-8 space-y-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-brand-primary font-sans mb-4">Emotional and Cognitive Demand</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">Emotional Load Experienced</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setFormData({ ...formData, post_emotional_load_score: v })} className={`flex-1 py-3 rounded-lg font-mono font-bold ${formData.post_emotional_load_score===v?'bg-brand-energy text-white':'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">Cognitive Load Experienced</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setFormData({ ...formData, post_cognitive_load_score: v })} className={`flex-1 py-3 rounded-lg font-mono font-bold ${formData.post_cognitive_load_score===v?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'}`}>{v}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brand-primary font-sans mb-4">Meaning-Making and Role-Space</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">Meaning-Making Challenges</label>
                <div className="flex gap-2 mb-3">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setFormData({ ...formData, post_meaning_challenge_score: v })} className={`flex-1 py-3 rounded-lg font-mono font-bold ${formData.post_meaning_challenge_score===v?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'}`}>{v}</button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Accuracy of content','Emotional tone','Register / formality','Cultural references / metaphors','Pace / density'].map(t => (
                    <button key={t} type="button" onClick={() => toggleTag('post_meaning_challenge_tags', t)} className={`px-3 py-2 rounded-full text-sm font-semibold ${formData.post_meaning_challenge_tags.includes(t)?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-primary'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">Role-Space Strain</label>
                <div className="flex gap-2 mb-3">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setFormData({ ...formData, post_rolespace_challenge_score: v })} className={`flex-1 py-3 rounded-lg font-mono font-bold ${formData.post_rolespace_challenge_score===v?'bg-brand-energy text-white':'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'}`}>{v}</button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Pressure to advocate / align with one side','Power imbalance','Teaming issues','Provider behavior','Platform / policy constraints'].map(t => (
                    <button key={t} type="button" onClick={() => toggleTag('post_rolespace_challenge_tags', t)} className={`px-3 py-2 rounded-full text-sm font-semibold ${formData.post_rolespace_challenge_tags.includes(t)?'bg-brand-energy text-white':'bg-brand-gray-100 text-brand-primary'}`}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brand-primary font-sans mb-4">Cultural Friction</h2>
            <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">Did you notice cultural friction or misalignment?</label>
            <div className="flex gap-2 mb-3">
              {[1,2,3,4,5].map(v => (
                <button key={v} type="button" onClick={() => setFormData({ ...formData, post_cultural_friction_score: v })} className={`flex-1 py-3 rounded-lg font-mono font-bold ${formData.post_cultural_friction_score===v?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'}`}>{v}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {['Deaf/hearing norms','Race / ethnicity','Gender / sexuality','Disability / access','System / institution','Other'].map(t => (
                <button key={t} type="button" onClick={() => toggleTag('post_cultural_friction_tags', t)} className={`px-3 py-2 rounded-full text-sm font-semibold ${formData.post_cultural_friction_tags.includes(t)?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-primary'}`}>{t}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-brand-primary font-sans">AI, Tech, and Avatars</h2>
              <button type="button" onClick={() => setAiSectionVisible(s=>!s)} className="px-3 py-2 bg-brand-gray-100 rounded-lg text-brand-primary">{aiSectionVisible?'Hide':'Show'}</button>
            </div>
            {aiSectionVisible && (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">How did AI/tech/avatars affect communication?</label>
                <div className="flex gap-2 mb-3">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setFormData({ ...formData, post_ai_impact_score: v })} className={`flex-1 py-3 rounded-lg font-mono font-bold ${formData.post_ai_impact_score===v?'bg-brand-energy text-white':'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'}`}>{v}</button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Flattened emotional tone','Cultural mismatch / bias','Misrecognition / mis-sign / mis-translation','Latency / timing issues','Role confusion (who is “speaking”?)','None of the above'].map(t => (
                    <button key={t} type="button" onClick={() => toggleTag('post_ai_issue_tags', t)} className={`px-3 py-2 rounded-full text-sm font-semibold ${formData.post_ai_issue_tags.includes(t)?'bg-brand-energy text-white':'bg-brand-gray-100 text-brand-primary'}`}>{t}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brand-primary font-sans mb-4">Recovery and Reflection</h2>
            <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">What have you done, or will do, to recover?</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Grounding / breathing','Movement / walk / stretch','Debrief with Deaf consumer / colleague','Debrief with supervisor / mentor','Journaling / reflection','Scheduling rest / buffer time','Nothing yet'].map(t => (
                <button key={t} type="button" onClick={() => toggleTag('post_recovery_actions', t)} className={`px-3 py-2 rounded-full text-sm font-semibold ${formData.post_recovery_actions.includes(t)?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-primary'}`}>{t}</button>
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              <input type="text" value={customInputs.otherRecovery} onChange={(e)=>setCustomInputs({ ...customInputs, otherRecovery: e.target.value })} className="flex-1 px-4 py-2 border-2 border-brand-gray-200 rounded-lg font-body text-brand-primary focus:border-brand-electric focus:outline-none" placeholder="Other (optional)" />
              <button type="button" onClick={()=>{ const v=customInputs.otherRecovery.trim(); if (v) { toggleTag('post_recovery_actions', v); setCustomInputs({ ...customInputs, otherRecovery: '' }); } }} className="px-4 py-2 bg-brand-electric text-white rounded-lg font-semibold hover:bg-brand-primary transition-colors font-body">Add</button>
            </div>
            <textarea value={formData.post_recovery_other} onChange={(e)=>setFormData({ ...formData, post_recovery_other: e.target.value })} rows={3} className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-lg font-body text-brand-primary focus:border-brand-electric focus:outline-none" placeholder="Notes (optional)" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-brand-primary font-sans mb-4">Key Learning and Confidence</h2>
            <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">Most important slip, decision, or learning</label>
            <textarea value={formData.post_key_learning_text} onChange={(e)=>setFormData({ ...formData, post_key_learning_text: e.target.value })} rows={3} className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-lg font-body text-brand-primary focus:border-brand-electric focus:outline-none" placeholder="Short text" />
            <div className="flex flex-wrap gap-2 mt-3">
              {['Emotional regulation','Cultural judgment','Meaning accuracy / tone','Role-space / boundaries','AI/tech/avatars','Teaming / collaboration'].map(t => (
                <button key={t} type="button" onClick={() => toggleTag('post_key_learning_tags', t)} className={`px-3 py-2 rounded-full text-sm font-semibold ${formData.post_key_learning_tags.includes(t)?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-primary'}`}>{t}</button>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">Self-Rated Performance Confidence</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setFormData({ ...formData, post_performance_confidence_score: v })} className={`flex-1 py-3 rounded-lg font-mono font-bold ${formData.post_performance_confidence_score===v?'bg-brand-energy text-white':'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">Reflection Depth (Self-View)</label>
                <div className="flex gap-2">
                  {[1,2,3,4].map(v => (
                    <button key={v} type="button" onClick={() => setFormData({ ...formData, post_reflection_depth_self_score: v })} className={`flex-1 py-3 rounded-lg font-mono font-bold ${formData.post_reflection_depth_self_score===v?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-200'}`}>{v}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={loading || !formData.post_emotional_load_score || !formData.post_cognitive_load_score || !formData.post_meaning_challenge_score || !formData.post_rolespace_challenge_score || !formData.post_cultural_friction_score || !formData.post_performance_confidence_score || !formData.post_reflection_depth_self_score} className="w-full bg-brand-electric text-white font-bold py-4 px-6 rounded-lg font-body hover:bg-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">{loading ? 'Saving...' : 'Save Reflection'}</button>
          <p className="text-xs text-center text-brand-gray-500 mt-2 font-body">* Required core fields</p>
        </div>
      </form>
    </div>
  );
}
