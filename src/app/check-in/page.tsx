'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext.next';
import toast from 'react-hot-toast';
import {
  Heart, Activity, AlertCircle, TrendingUp, Smile, Meh, Frown,
  ChevronLeft, CheckCircle
} from 'lucide-react';

interface CheckInData {
  stress_level: number;
  energy_level: number;
  mood: 'positive' | 'neutral' | 'negative' | '';
  sleep_quality: number;
  physical_symptoms: string[];
  challenges_today: string;
  wins_today: string;
  needs_support: boolean;
}

const PHYSICAL_SYMPTOMS = [
  'Headache',
  'Tension/Pain',
  'Fatigue',
  'Difficulty Concentrating',
  'Digestive Issues',
  'None'
];

export default function CheckInPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [formData, setFormData] = useState<CheckInData>({
    stress_level: 5,
    energy_level: 5,
    mood: '',
    sleep_quality: 5,
    physical_symptoms: [],
    challenges_today: '',
    wins_today: '',
    needs_support: false
  });

  const supabase = createClient();

  useEffect(() => {
    checkTodayStatus();
  }, [user]);

  const checkTodayStatus = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('wellness_check_ins')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .single();

      if (data) {
        setHasCheckedInToday(true);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in first');
      router.push('/login');
      return;
    }

    if (!formData.mood) {
      toast.error('Please select your mood');
      return;
    }

    setLoading(true);

    try {
      // Save check-in to wellness_check_ins table
      const { error } = await supabase
        .from('wellness_check_ins')
        .insert({
          user_id: user.id,
          stress_level: formData.stress_level,
          energy_level: formData.energy_level,
          mood: formData.mood,
          sleep_quality: formData.sleep_quality,
          physical_symptoms: formData.physical_symptoms,
          notes: JSON.stringify({
            challenges: formData.challenges_today,
            wins: formData.wins_today,
            needs_support: formData.needs_support
          })
        });

      if (error) throw error;

      toast.success('Performance baseline recorded. Data logged for trend analysis.');
      setHasCheckedInToday(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error saving check-in:', error);
      toast.error('Failed to save check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (symptom: string) => {
    if (symptom === 'None') {
      setFormData({ ...formData, physical_symptoms: ['None'] });
    } else {
      const filtered = formData.physical_symptoms.filter(s => s !== 'None');
      if (formData.physical_symptoms.includes(symptom)) {
        setFormData({
          ...formData,
          physical_symptoms: filtered.filter(s => s !== symptom)
        });
      } else {
        setFormData({
          ...formData,
          physical_symptoms: [...filtered, symptom]
        });
      }
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-electric border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-gray-600 font-body">Loading performance baseline...</p>
        </div>
      </div>
    );
  }

  if (hasCheckedInToday) {
    return (
      <div className="min-h-screen bg-brand-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-data shadow-card p-8 border border-brand-gray-200">
              <CheckCircle className="w-20 h-20 text-brand-electric mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-brand-primary mb-4 font-sans">
                Performance Baseline Recorded ✅
              </h1>
              <p className="text-lg text-brand-gray-600 mb-8 font-body">
                Data logged successfully. Consistent tracking builds actionable insights. Next baseline check available tomorrow.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-brand-primary to-brand-slate text-white px-6 py-3 rounded-data font-semibold hover:shadow-glow transition-all font-body"
                >
                  Back to Performance Hub
                </button>
                <button
                  onClick={() => router.push('/analytics')}
                  className="bg-white border-2 border-brand-electric text-brand-electric px-6 py-3 rounded-data font-semibold hover:bg-brand-electric-light transition-colors font-body"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-brand-gray-600 hover:text-brand-electric mb-4 font-body transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Performance Hub
            </button>
            <h1 className="text-4xl font-bold text-brand-primary mb-2 font-sans">Performance Baseline Check</h1>
            <p className="text-lg text-brand-gray-600 font-body">
              2-minute assessment. Track KPIs: stress capacity, energy output, recovery metrics.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Stress Level */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-brand-coral" />
                <h3 className="text-xl font-bold text-brand-primary font-sans">Cognitive Load</h3>
              </div>
              <p className="text-brand-gray-600 mb-4 font-body">Current cognitive load level (stress response intensity):</p>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.stress_level}
                onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-electric"
              />
              <div className="flex justify-between text-sm text-brand-gray-600 mt-2 font-mono">
                <span>Optimal (1)</span>
                <span className="font-bold text-xl text-brand-charcoal">{formData.stress_level}</span>
                <span>Overload (10)</span>
              </div>
            </div>

            {/* Energy Level */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-brand-electric" />
                <h3 className="text-xl font-bold text-brand-primary font-sans">Capacity Reserve</h3>
              </div>
              <p className="text-brand-gray-600 mb-4 font-body">Available energy for high-performance work:</p>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy_level}
                onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-electric"
              />
              <div className="flex justify-between text-sm text-brand-gray-600 mt-2 font-mono">
                <span>Depleted (1)</span>
                <span className="font-bold text-xl text-brand-charcoal">{formData.energy_level}</span>
                <span>Peak (10)</span>
              </div>
            </div>

            {/* Mood */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-brand-info" />
                <h3 className="text-xl font-bold text-brand-primary font-sans">Performance Readiness</h3>
              </div>
              <p className="text-brand-gray-600 mb-4 font-body">Current state for optimal performance:</p>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: 'positive' })}
                  className={`p-6 rounded-data border-2 transition-all ${
                    formData.mood === 'positive'
                      ? 'border-brand-electric bg-brand-electric-light'
                      : 'border-brand-gray-200 hover:border-brand-electric/30'
                  }`}
                >
                  <Smile className={`w-12 h-12 mx-auto mb-2 ${
                    formData.mood === 'positive' ? 'text-brand-electric' : 'text-brand-gray-400'
                  }`} />
                  <p className="font-semibold font-body">High Readiness</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: 'neutral' })}
                  className={`p-6 rounded-data border-2 transition-all ${
                    formData.mood === 'neutral'
                      ? 'border-brand-info bg-brand-info-light'
                      : 'border-brand-gray-200 hover:border-brand-info/30'
                  }`}
                >
                  <Meh className={`w-12 h-12 mx-auto mb-2 ${
                    formData.mood === 'neutral' ? 'text-brand-info' : 'text-brand-gray-400'
                  }`} />
                  <p className="font-semibold font-body">Moderate</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: 'negative' })}
                  className={`p-6 rounded-data border-2 transition-all ${
                    formData.mood === 'negative'
                      ? 'border-brand-coral bg-brand-coral-light'
                      : 'border-brand-gray-200 hover:border-brand-coral/30'
                  }`}
                >
                  <Frown className={`w-12 h-12 mx-auto mb-2 ${
                    formData.mood === 'negative' ? 'text-brand-coral' : 'text-brand-gray-400'
                  }`} />
                  <p className="font-semibold font-body">Low Capacity</p>
                </button>
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-brand-info" />
                <h3 className="text-xl font-bold text-brand-primary font-sans">Recovery Quality</h3>
              </div>
              <p className="text-brand-gray-600 mb-4 font-body">Last night's recovery effectiveness (sleep quality):</p>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.sleep_quality}
                onChange={(e) => setFormData({ ...formData, sleep_quality: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-electric"
              />
              <div className="flex justify-between text-sm text-brand-gray-600 mt-2 font-mono">
                <span>Disrupted (1)</span>
                <span className="font-bold text-xl text-brand-charcoal">{formData.sleep_quality}</span>
                <span>Optimal (10)</span>
              </div>
            </div>

            {/* Physical Symptoms */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-brand-coral" />
                <h3 className="text-xl font-bold text-brand-primary font-sans">Performance Indicators</h3>
              </div>
              <p className="text-brand-gray-600 mb-4 font-body">Current physical state indicators:</p>
              <div className="grid grid-cols-2 gap-3">
                {PHYSICAL_SYMPTOMS.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`p-3 rounded-data border-2 text-left transition-all font-body ${
                      formData.physical_symptoms.includes(symptom)
                        ? 'border-brand-electric bg-brand-electric-light'
                        : 'border-brand-gray-200 hover:border-brand-electric/30'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Reflections */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <h3 className="text-xl font-bold text-brand-primary mb-4 font-sans">Performance Notes</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-brand-gray-600 mb-2 font-semibold font-body">
                    High-load scenarios today? (Optional)
                  </label>
                  <textarea
                    value={formData.challenges_today}
                    onChange={(e) => setFormData({ ...formData, challenges_today: e.target.value })}
                    placeholder="e.g., Complex medical terminology, rapid-fire Q&A, long duration without breaks..."
                    className="w-full p-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-brand-gray-600 mb-2 font-semibold font-body">
                    Performance wins or breakthroughs? (Optional)
                  </label>
                  <textarea
                    value={formData.wins_today}
                    onChange={(e) => setFormData({ ...formData, wins_today: e.target.value })}
                    placeholder="e.g., Flawless consecutive interpretation, strong client rapport, new technical vocabulary mastered..."
                    className="w-full p-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Support Flag */}
            <div className="bg-brand-info-light border-2 border-brand-info/30 rounded-data p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.needs_support}
                  onChange={(e) => setFormData({ ...formData, needs_support: e.target.checked })}
                  className="w-5 h-5 mt-1 accent-brand-electric"
                />
                <div>
                  <p className="font-bold text-brand-primary mb-1 font-sans">
                    Flag for optimization review
                  </p>
                  <p className="text-sm text-brand-gray-600 font-body">
                    Prioritize capacity-building strategies and recovery protocols in your recommendations.
                  </p>
                </div>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-white border-2 border-brand-gray-300 text-brand-charcoal px-6 py-4 rounded-data font-semibold hover:bg-brand-gray-50 transition-colors font-body"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-brand-primary to-brand-slate text-white px-6 py-4 rounded-data font-semibold hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed font-body"
              >
                {loading ? 'Recording baseline...' : 'Record Baseline'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
