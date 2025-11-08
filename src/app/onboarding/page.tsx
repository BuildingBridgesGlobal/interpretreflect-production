'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext.next';
import toast from 'react-hot-toast';
import {
  User, Briefcase, Target, Activity, ChevronRight, ChevronLeft,
  Heart, Scale, BookOpen, Zap, Brain, Clock,
  Shield, Handshake, Battery, Users, Globe,
  TrendingUp, Award, UserPlus, Wifi, MessageSquare
} from 'lucide-react';

interface OnboardingData {
  // Step 1
  profile_type: 'interpreter' | 'cdi' | 'student' | 'educator' | '';
  years_experience: number;
  specializations: string[];

  // Step 2
  performance_goals: string[];

  // Step 3
  stress_level: number;
  energy_level: number;
  skill_confidence: Record<string, number>;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    profile_type: '',
    years_experience: 0,
    specializations: [],
    performance_goals: [],
    stress_level: 5,
    energy_level: 5,
    skill_confidence: {}
  });

  const supabase = createClient();

  const calculateSkillLevel = (data: OnboardingData): string => {
    if (data.years_experience < 2) return 'beginner';
    if (data.years_experience < 5) return 'intermediate';
    if (data.years_experience < 10) return 'advanced';
    return 'expert';
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in first');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      // 1. Save to user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          profile_type: formData.profile_type,
          years_experience: formData.years_experience,
          specializations: formData.specializations,
          performance_goals: formData.performance_goals,
          skill_level: calculateSkillLevel(formData),
          onboarding_completed: true,
          onboarding_step: 3
        });

      if (profileError) throw profileError;

      // 2. Create first wellness check-in
      const { error: checkInError } = await supabase
        .from('wellness_check_ins')
        .insert({
          user_id: user.id,
          stress_level: formData.stress_level,
          energy_level: formData.energy_level,
          check_in_date: new Date().toISOString().split('T')[0]
        });

      if (checkInError) throw checkInError;

      // 3. Create baseline skill assessment
      const { error: assessmentError } = await supabase
        .from('skill_assessments')
        .insert({
          user_id: user.id,
          assessment_type: 'baseline',
          domain: formData.specializations[0] || 'general',
          score: Object.values(formData.skill_confidence).reduce((a, b) => a + b, 0) / Object.keys(formData.skill_confidence).length * 20,
          max_score: 100,
          assessment_data: formData.skill_confidence
        });

      if (assessmentError) throw assessmentError;

      toast.success('Profile created successfully!');
      router.push('/dashboard?welcome=true');

    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-data shadow-card p-8 border border-brand-gray-200">

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-brand-primary font-sans">Step {step} of 3</span>
            <span className="text-sm text-brand-gray-600 font-body font-mono">{Math.round((step/3)*100)}% complete</span>
          </div>
          <div className="w-full bg-brand-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-brand-electric to-brand-info h-2 rounded-full transition-all duration-300 shadow-glow-sm"
              style={{ width: `${(step/3)*100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Profile Type */}
        {step === 1 && (
          <Step1ProfileType
            data={formData}
            onChange={setFormData}
            onNext={() => setStep(2)}
          />
        )}

        {/* Step 2: Performance Goals */}
        {step === 2 && (
          <Step2PerformanceGoals
            data={formData}
            onChange={setFormData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {/* Step 3: Baseline Assessment */}
        {step === 3 && (
          <Step3BaselineCheck
            data={formData}
            onChange={setFormData}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}

      </div>
    </div>
  );
}

// Step 1: Profile Type Component
function Step1ProfileType({
  data,
  onChange,
  onNext
}: {
  data: OnboardingData;
  onChange: (data: OnboardingData) => void;
  onNext: () => void;
}) {
  const profileTypes = [
    { value: 'interpreter', label: 'Interpreter', icon: User },
    { value: 'cdi', label: 'CDI', icon: User },
    { value: 'student', label: 'Student', icon: Briefcase },
    { value: 'educator', label: 'Educator', icon: Briefcase }
  ];

  const specializations = [
    'Healthcare/Medical',
    'Legal/Court',
    'Educational (K-12)',
    'Post-Secondary',
    'VRS (Video Relay)',
    'Mental Health',
    'DeafBlind Services',
    'Emergency Services',
    'Business/Corporate',
    'Government',
    'Social Services',
    'Vocational Rehabilitation',
    'Religious/Spiritual',
    'Performing Arts',
    'Conference/Events',
    'Community'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-charcoal mb-2 font-sans">Build Your Performance Profile</h2>
        <p className="text-brand-charcoal/80 font-body">Help us optimize your professional development pathway</p>
      </div>

      {/* Profile Type */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-brand-charcoal font-sans">I am a...</label>
        <div className="grid grid-cols-2 gap-3">
          {profileTypes.map(type => (
            <button
              key={type.value}
              onClick={() => onChange({ ...data, profile_type: type.value as any })}
              className={`p-4 border-2 rounded-data transition flex flex-col items-center gap-2 font-body ${
                data.profile_type === type.value
                  ? 'border-brand-electric bg-brand-electric-light shadow-sm text-brand-charcoal'
                  : 'border-brand-gray-200 hover:border-brand-electric/50 hover:bg-brand-gray-50 text-brand-charcoal'
              }`}
            >
              <type.icon className="w-6 h-6 text-brand-charcoal" />
              <span className="font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Years Experience */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-brand-charcoal font-sans">
          Years of Experience: <strong className="text-brand-electric font-mono">{data.years_experience}</strong>
        </label>
        <input
          type="range"
          min="0"
          max="30"
          value={data.years_experience}
          onChange={(e) => onChange({ ...data, years_experience: parseInt(e.target.value) })}
          className="w-full accent-brand-electric"
        />
        <div className="flex justify-between text-xs text-brand-gray-500 font-body">
          <span>New</span>
          <span>Experienced</span>
          <span>Expert (30+)</span>
        </div>
      </div>

      {/* Specializations */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-brand-charcoal font-sans">
          Primary Specializations <span className="text-brand-gray-600 font-normal font-body">(select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {specializations.map(spec => (
            <label
              key={spec}
              className={`flex items-center space-x-2 p-3 border rounded-data cursor-pointer transition font-body ${
                data.specializations.includes(spec)
                  ? 'border-brand-electric bg-brand-electric-light text-brand-charcoal'
                  : 'border-brand-gray-200 hover:bg-brand-gray-50 text-brand-charcoal'
              }`}
            >
              <input
                type="checkbox"
                checked={data.specializations.includes(spec)}
                onChange={(e) => {
                  const newSpecs = e.target.checked
                    ? [...data.specializations, spec]
                    : data.specializations.filter(s => s !== spec);
                  onChange({ ...data, specializations: newSpecs });
                }}
                className="w-4 h-4 text-brand-electric rounded focus:ring-brand-electric"
              />
              <span className="text-sm">{spec}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!data.profile_type || data.specializations.length === 0}
        className="w-full bg-gradient-to-r from-brand-primary to-brand-slate text-white py-3 rounded-data font-semibold hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-body"
      >
        Continue
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// Step 2: Performance Goals Component
function Step2PerformanceGoals({
  data,
  onChange,
  onNext,
  onBack
}: {
  data: OnboardingData;
  onChange: (data: OnboardingData) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const goals = [
    // Domain-Specific Knowledge
    { id: 'medical_terminology', label: 'Medical Terminology', icon: '🏥' },
    { id: 'legal_vocabulary', label: 'Legal Vocabulary', icon: '⚖️' },
    { id: 'technical_vocabulary', label: 'Technical/Academic Vocabulary', icon: '📚' },

    // Cognitive & Performance
    { id: 'processing_speed', label: 'Processing Speed & Accuracy', icon: '⚡' },
    { id: 'working_memory', label: 'Working Memory Capacity', icon: '🧠' },
    { id: 'processing_time', label: 'Processing Time Optimization', icon: '⏱️' },

    // Emotional & Professional Wellness
    { id: 'emotional_regulation', label: 'Emotional Regulation', icon: '🧘' },
    { id: 'trauma_informed', label: 'Trauma-Informed Practice', icon: '🤝' },
    { id: 'burnout_prevention', label: 'Burnout Prevention', icon: '🔋' },
    { id: 'professional_boundaries', label: 'Professional Boundaries', icon: '🛡️' },

    // Cultural & Interpersonal
    { id: 'cultural_competency', label: 'Cultural Competency', icon: '🌍' },
    { id: 'deaf_culture', label: 'Deaf Culture & Community', icon: '👥' },

    // Business & Career Development
    { id: 'business_development', label: 'Business Development', icon: '💼' },
    { id: 'ethical_decision_making', label: 'Ethical Decision Making', icon: '⚖️' },
    { id: 'mentorship_leadership', label: 'Mentorship & Leadership', icon: '🌟' },

    // Technical & Advanced Skills
    { id: 'team_interpreting', label: 'Team Interpreting', icon: '👥' },
    { id: 'technology_skills', label: 'Technology & Platform Skills', icon: '💻' },
    { id: 'specialized_registers', label: 'Specialized Registers & Discourse', icon: '💬' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-charcoal mb-2 font-sans">Performance Optimization Goals</h2>
        <p className="text-brand-charcoal/80 font-body">Select your top 3 capacity-building priorities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {goals.map(goal => {
          const isSelected = data.performance_goals.includes(goal.id);
          const canSelect = data.performance_goals.length < 3 || isSelected;

          return (
            <button
              key={goal.id}
              onClick={() => {
                if (!canSelect && !isSelected) return;

                const newGoals = isSelected
                  ? data.performance_goals.filter(g => g !== goal.id)
                  : [...data.performance_goals, goal.id].slice(0, 3);
                onChange({ ...data, performance_goals: newGoals });
              }}
              disabled={!canSelect}
              className={`p-3 border-2 rounded-data text-left transition font-body ${
                isSelected
                  ? 'border-brand-electric bg-brand-electric-light shadow-sm text-brand-charcoal'
                  : canSelect
                  ? 'border-brand-gray-200 hover:border-brand-electric/50 hover:bg-brand-gray-50 text-brand-charcoal'
                  : 'border-brand-gray-200 opacity-50 cursor-not-allowed text-brand-charcoal'
              }`}
            >
              <goal.icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-brand-electric' : 'text-brand-primary'}`} />
              <div className="font-medium text-sm">{goal.label}</div>
            </button>
          );
        })}
      </div>

      {data.performance_goals.length > 0 && (
        <div className="text-sm text-brand-electric bg-brand-electric-light p-3 rounded-data border border-brand-electric/20 font-body">
          <Target className="w-4 h-4 inline mr-2" />
          Selected: {data.performance_goals.length} of 3 optimization targets
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border-2 border-brand-gray-200 rounded-data font-semibold text-brand-charcoal hover:bg-brand-gray-50 transition-colors flex items-center gap-2 font-body"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={data.performance_goals.length === 0}
          className="flex-1 bg-gradient-to-r from-brand-primary to-brand-slate text-white py-3 rounded-data font-semibold hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-body"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Step 3: Baseline Check Component
function Step3BaselineCheck({
  data,
  onChange,
  onBack,
  onSubmit,
  loading
}: {
  data: OnboardingData;
  onChange: (data: OnboardingData) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const goalLabels: Record<string, string> = {
    medical_terminology: 'Medical Terminology',
    legal_vocabulary: 'Legal Vocabulary',
    technical_vocabulary: 'Technical/Academic Vocabulary',
    processing_speed: 'Processing Speed & Accuracy',
    working_memory: 'Working Memory Capacity',
    processing_time: 'Processing Time Optimization',
    emotional_regulation: 'Emotional Regulation',
    trauma_informed: 'Trauma-Informed Practice',
    burnout_prevention: 'Burnout Prevention',
    professional_boundaries: 'Professional Boundaries',
    cultural_competency: 'Cultural Competency',
    deaf_culture: 'Deaf Culture & Community',
    business_development: 'Business Development',
    ethical_decision_making: 'Ethical Decision Making',
    mentorship_leadership: 'Mentorship & Leadership',
    team_interpreting: 'Team Interpreting',
    technology_skills: 'Technology & Platform Skills',
    specialized_registers: 'Specialized Registers & Discourse'
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-charcoal mb-2 font-sans">Performance Baseline Assessment</h2>
        <p className="text-brand-charcoal/80 font-body">Establish your starting metrics for capacity optimization</p>
      </div>

      {/* Stress Level */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-brand-charcoal font-sans">
          Current Cognitive Load: <strong className="text-brand-electric font-mono">{data.stress_level}/10</strong>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={data.stress_level}
          onChange={(e) => onChange({ ...data, stress_level: parseInt(e.target.value) })}
          className="w-full accent-brand-electric"
        />
        <div className="flex justify-between text-xs text-brand-gray-500 font-body">
          <span>Low Load</span>
          <span>Moderate</span>
          <span>High Load</span>
        </div>
      </div>

      {/* Energy Level */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-brand-charcoal font-sans">
          Current Capacity Level: <strong className="text-brand-electric font-mono">{data.energy_level}/10</strong>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={data.energy_level}
          onChange={(e) => onChange({ ...data, energy_level: parseInt(e.target.value) })}
          className="w-full accent-brand-electric"
        />
        <div className="flex justify-between text-xs text-brand-gray-500 font-body">
          <span>Depleted</span>
          <span>Moderate</span>
          <span>Peak Capacity</span>
        </div>
      </div>

      {/* Skill Confidence */}
      {data.performance_goals.length > 0 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-brand-charcoal font-sans">
            Current Proficiency in Optimization Targets
          </label>
          {data.performance_goals.map(goalId => (
            <div key={goalId} className="space-y-2 bg-white p-4 rounded-data border-2 border-brand-gray-200">
              <label className="text-sm font-medium text-brand-charcoal font-body">
                {goalLabels[goalId]}
                <span className="text-brand-electric ml-2 font-bold font-mono">
                  {data.skill_confidence[goalId] || 3}/5
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={data.skill_confidence[goalId] || 3}
                onChange={(e) => onChange({
                  ...data,
                  skill_confidence: {
                    ...data.skill_confidence,
                    [goalId]: parseInt(e.target.value)
                  }
                })}
                className="w-full accent-brand-electric"
              />
              <div className="flex justify-between text-xs text-brand-gray-500 font-body">
                <span>Building</span>
                <span>Developing</span>
                <span>Optimized</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-brand-info-light border-2 border-brand-info rounded-data p-4">
        <Activity className="w-5 h-5 text-brand-info inline mr-2" />
        <span className="text-sm text-brand-charcoal font-body">
          <strong>Next:</strong> We'll generate your personalized optimization pathway and recommend high-impact starting actions.
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border-2 border-brand-gray-200 rounded-data font-semibold text-brand-charcoal hover:bg-brand-gray-50 transition-colors flex items-center gap-2 font-body"
          disabled={loading}
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-brand-primary to-brand-slate text-white py-3 rounded-data font-semibold hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all font-body"
        >
          {loading ? 'Building performance profile...' : 'Launch Performance Hub'}
        </button>
      </div>
    </div>
  );
}
