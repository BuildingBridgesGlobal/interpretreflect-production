'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext.next';
import toast from 'react-hot-toast';
import {
  Heart, Activity, AlertCircle, TrendingUp, Smile, Meh, Frown,
  ChevronLeft, ChevronRight, CheckCircle
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
      const { data, error } = await supabase
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

      toast.success('Check-in completed! Great job taking care of yourself.');
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
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5C7F4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#7F8C8D]">Loading...</p>
        </div>
      </div>
    );
  }

  if (hasCheckedInToday) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-deafspace shadow-sm p-8">
              <CheckCircle className="w-20 h-20 text-[#5C7F4F] mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-[#2C3E50] mb-4">
                You've Already Checked In Today! ✅
              </h1>
              <p className="text-lg text-[#7F8C8D] mb-8">
                Great job staying consistent with your wellness tracking. Come back tomorrow for your next check-in.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-[#5C7F4F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4a6640] transition-colors"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => router.push('/wellness-trends')}
                  className="bg-white border-2 border-[#5C7F4F] text-[#5C7F4F] px-6 py-3 rounded-lg font-semibold hover:bg-[#E8F3E5] transition-colors"
                >
                  View Your Trends
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-[#7F8C8D] hover:text-[#5C7F4F] mb-4"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-[#2C3E50] mb-2">Daily Wellness Check-In</h1>
            <p className="text-lg text-[#7F8C8D]">
              Take 2 minutes to check in with yourself. Track your patterns over time.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Stress Level */}
            <div className="bg-white rounded-deafspace shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-bold text-[#2C3E50]">Stress Level</h3>
              </div>
              <p className="text-[#7F8C8D] mb-4">How stressed do you feel right now?</p>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.stress_level}
                onChange={(e) => setFormData({ ...formData, stress_level: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5C7F4F]"
              />
              <div className="flex justify-between text-sm text-[#7F8C8D] mt-2">
                <span>Low (1)</span>
                <span className="font-bold text-xl text-[#2C3E50]">{formData.stress_level}</span>
                <span>High (10)</span>
              </div>
            </div>

            {/* Energy Level */}
            <div className="bg-white rounded-deafspace shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-[#5C7F4F]" />
                <h3 className="text-xl font-bold text-[#2C3E50]">Energy Level</h3>
              </div>
              <p className="text-[#7F8C8D] mb-4">How much energy do you have today?</p>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy_level}
                onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5C7F4F]"
              />
              <div className="flex justify-between text-sm text-[#7F8C8D] mt-2">
                <span>Drained (1)</span>
                <span className="font-bold text-xl text-[#2C3E50]">{formData.energy_level}</span>
                <span>Energized (10)</span>
              </div>
            </div>

            {/* Mood */}
            <div className="bg-white rounded-deafspace shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-pink-500" />
                <h3 className="text-xl font-bold text-[#2C3E50]">Overall Mood</h3>
              </div>
              <p className="text-[#7F8C8D] mb-4">How are you feeling overall?</p>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: 'positive' })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.mood === 'positive'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <Smile className={`w-12 h-12 mx-auto mb-2 ${
                    formData.mood === 'positive' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <p className="font-semibold">Positive</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: 'neutral' })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.mood === 'neutral'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <Meh className={`w-12 h-12 mx-auto mb-2 ${
                    formData.mood === 'neutral' ? 'text-yellow-600' : 'text-gray-400'
                  }`} />
                  <p className="font-semibold">Neutral</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: 'negative' })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    formData.mood === 'negative'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <Frown className={`w-12 h-12 mx-auto mb-2 ${
                    formData.mood === 'negative' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <p className="font-semibold">Challenging</p>
                </button>
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="bg-white rounded-deafspace shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-bold text-[#2C3E50]">Sleep Quality</h3>
              </div>
              <p className="text-[#7F8C8D] mb-4">How well did you sleep last night?</p>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.sleep_quality}
                onChange={(e) => setFormData({ ...formData, sleep_quality: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5C7F4F]"
              />
              <div className="flex justify-between text-sm text-[#7F8C8D] mt-2">
                <span>Poor (1)</span>
                <span className="font-bold text-xl text-[#2C3E50]">{formData.sleep_quality}</span>
                <span>Excellent (10)</span>
              </div>
            </div>

            {/* Physical Symptoms */}
            <div className="bg-white rounded-deafspace shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-bold text-[#2C3E50]">Physical Symptoms</h3>
              </div>
              <p className="text-[#7F8C8D] mb-4">Select any symptoms you're experiencing:</p>
              <div className="grid grid-cols-2 gap-3">
                {PHYSICAL_SYMPTOMS.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.physical_symptoms.includes(symptom)
                        ? 'border-[#5C7F4F] bg-[#E8F3E5]'
                        : 'border-gray-200 hover:border-[#5C7F4F]/30'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Reflections */}
            <div className="bg-white rounded-deafspace shadow-sm p-6">
              <h3 className="text-xl font-bold text-[#2C3E50] mb-4">Quick Reflection</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[#7F8C8D] mb-2 font-semibold">
                    What's been challenging today? (Optional)
                  </label>
                  <textarea
                    value={formData.challenges_today}
                    onChange={(e) => setFormData({ ...formData, challenges_today: e.target.value })}
                    placeholder="e.g., Difficult assignment, emotional content, conflict with colleague..."
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#5C7F4F] focus:outline-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-[#7F8C8D] mb-2 font-semibold">
                    Any wins or positive moments? (Optional)
                  </label>
                  <textarea
                    value={formData.wins_today}
                    onChange={(e) => setFormData({ ...formData, wins_today: e.target.value })}
                    placeholder="e.g., Great connection with client, learned new sign, felt confident..."
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#5C7F4F] focus:outline-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Support Flag */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-deafspace p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.needs_support}
                  onChange={(e) => setFormData({ ...formData, needs_support: e.target.checked })}
                  className="w-5 h-5 mt-1 accent-[#5C7F4F]"
                />
                <div>
                  <p className="font-bold text-[#2C3E50] mb-1">
                    I could use some support today
                  </p>
                  <p className="text-sm text-[#7F8C8D]">
                    We'll prioritize supportive resources and recommendations for you.
                  </p>
                </div>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-white border-2 border-gray-300 text-[#2C3E50] px-6 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#5C7F4F] text-white px-6 py-4 rounded-lg font-semibold hover:bg-[#4a6640] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Complete Check-In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
