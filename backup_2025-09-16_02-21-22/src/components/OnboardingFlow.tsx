import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ArrowRight, ChevronLeft, User, Heart, Brain, Clock, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { analytics } from '../utils/analytics';
import { HeartPulseIcon, NotepadIcon, GrowthIcon, HourglassPersonIcon, CommunityIcon, TargetIcon } from './CustomIcon';

interface OnboardingFlowProps {
  onComplete: () => void;
  onClose: () => void;
}

interface UserProfile {
  interpreter_type: string;
  experience_level: string;
  primary_challenges: string[];
  wellness_goals: string[];
  preferred_session_length: string;
  notification_preferences: {
    daily_checkins: boolean;
    weekly_insights: boolean;
    emergency_support: boolean;
  };
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to InterpretReflect',
    description: 'Let\'s personalize your wellness journey'
  },
  {
    id: 'role',
    title: 'Your Role',
    description: 'Help us understand your interpreting context'
  },
  {
    id: 'challenges',
    title: 'Current Challenges',
    description: 'What areas would you like support with?'
  },
  {
    id: 'goals',
    title: 'Wellness Goals',
    description: 'What outcomes are you hoping to achieve?'
  },
  {
    id: 'preferences',
    title: 'Your Preferences',
    description: 'Customize your experience'
  },
  {
    id: 'complete',
    title: 'All Set!',
    description: 'Your personalized wellness plan is ready'
  }
];

export function OnboardingFlow({ onComplete, onClose }: OnboardingFlowProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    interpreter_type: '',
    experience_level: '',
    primary_challenges: [],
    wellness_goals: [],
    preferred_session_length: '3',
    notification_preferences: {
      daily_checkins: true,
      weekly_insights: true,
      emergency_support: true
    }
  });

  const interpreterTypes = [
    { id: 'medical', label: 'Medical Interpreter', icon: <HeartPulseIcon size={20} /> },
    { id: 'legal', label: 'Legal/Court Interpreter', icon: <Shield className="w-5 h-5" /> },
    { id: 'educational', label: 'Educational Interpreter', icon: <Brain className="w-5 h-5" /> },
    { id: 'conference', label: 'Conference Interpreter', icon: <CommunityIcon size={20} /> },
    { id: 'community', label: 'Community Interpreter', icon: <CommunityIcon size={20} /> },
    { id: 'other', label: 'Other', icon: <User className="w-5 h-5" /> }
  ];

  const experienceLevels = [
    { id: 'new', label: 'New to interpreting (0-2 years)' },
    { id: 'developing', label: 'Developing (2-5 years)' },
    { id: 'experienced', label: 'Experienced (5-10 years)' },
    { id: 'veteran', label: 'Veteran (10+ years)' }
  ];

  const challenges = [
    { id: 'burnout', label: 'Preventing burnout' },
    { id: 'stress', label: 'Managing assignment stress' },
    { id: 'boundaries', label: 'Setting professional boundaries' },
    { id: 'trauma', label: 'Processing difficult content' },
    { id: 'isolation', label: 'Feeling professionally isolated' },
    { id: 'worklife', label: 'Work-life balance' },
    { id: 'confidence', label: 'Building confidence' },
    { id: 'ethics', label: 'Ethical decision-making' }
  ];

  const goals = [
    { id: 'resilience', label: 'Build emotional resilience', icon: <HeartPulseIcon size={16} /> },
    { id: 'selfcare', label: 'Develop consistent self-care habits', icon: <GrowthIcon size={16} /> },
    { id: 'processing', label: 'Better process difficult assignments', icon: <NotepadIcon size={16} /> },
    { id: 'community', label: 'Connect with other interpreters', icon: <CommunityIcon size={16} /> },
    { id: 'growth', label: 'Professional development', icon: <TargetIcon size={16} /> },
    { id: 'balance', label: 'Achieve better work-life balance', icon: <HourglassPersonIcon size={16} /> },
    { id: 'wellness', label: 'Improve overall wellness', icon: <HeartPulseIcon size={16} /> }
  ];

  const sessionLengths = [
    { id: '1', label: '1 minute - Quick check-ins' },
    { id: '3', label: '3 minutes - Standard sessions' },
    { id: '5', label: '5 minutes - Deep dives' },
    { id: '10', label: '10 minutes - Extended reflection' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          interpreter_type: profile.interpreter_type,
          experience_level: profile.experience_level,
          primary_challenges: profile.primary_challenges,
          wellness_goals: profile.wellness_goals,
          preferred_session_length: parseInt(profile.preferred_session_length),
          notification_preferences: profile.notification_preferences,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Track onboarding completion
      analytics.trackOnboardingComplete(profile);

      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const toggleChallenge = (challengeId: string) => {
    setProfile(prev => ({
      ...prev,
      primary_challenges: prev.primary_challenges.includes(challengeId)
        ? prev.primary_challenges.filter(id => id !== challengeId)
        : [...prev.primary_challenges, challengeId]
    }));
  };

  const toggleGoal = (goalId: string) => {
    setProfile(prev => ({
      ...prev,
      wellness_goals: prev.wellness_goals.includes(goalId)
        ? prev.wellness_goals.filter(id => id !== goalId)
        : [...prev.wellness_goals, goalId]
    }));
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Track onboarding start
  useEffect(() => {
    analytics.trackOnboardingStart();
  }, []);

  // Track step changes
  useEffect(() => {
    if (currentStep > 0) {
      analytics.trackOnboardingStep(currentStep, currentStepData.id);
    }
  }, [currentStep, currentStepData.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-emerald-700 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600">
            {currentStepData.description}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 0 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-emerald-700" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Welcome to your personalized wellness journey
              </h3>
              <p className="text-gray-600 mb-6">
                We'll ask a few quick questions to customize InterpretReflect for your unique needs as an interpreter. 
                This will help us provide the most relevant tools and insights for your wellness journey.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>Personalized recommendations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>Customized check-ins</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>Relevant resources</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>Community connections</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h3 className="font-semibold mb-4">What type of interpreting do you primarily do?</h3>
              <div className="space-y-3 mb-6">
                {interpreterTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setProfile(prev => ({ ...prev, interpreter_type: type.id }))}
                    className={`w-full p-4 rounded-lg border text-left flex items-center space-x-3 transition-colors ${
                      profile.interpreter_type === type.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`${profile.interpreter_type === type.id ? 'text-green-600' : 'text-gray-400'}`}>
                      {type.icon}
                    </div>
                    <span className="font-medium">{type.label}</span>
                  </button>
                ))}
              </div>

              <h3 className="font-semibold mb-4">How long have you been interpreting?</h3>
              <div className="space-y-3">
                {experienceLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setProfile(prev => ({ ...prev, experience_level: level.id }))}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      profile.experience_level === level.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="font-semibold mb-4">What challenges would you like support with? (Select all that apply)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {challenges.map(challenge => (
                  <button
                    key={challenge.id}
                    onClick={() => toggleChallenge(challenge.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      profile.primary_challenges.includes(challenge.id)
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded border-2 ${
                        profile.primary_challenges.includes(challenge.id)
                          ? 'bg-emerald-700 border-emerald-700'
                          : 'border-gray-300'
                      }`}>
                        {profile.primary_challenges.includes(challenge.id) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span>{challenge.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="font-semibold mb-4">What are your wellness goals? (Select all that apply)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goals.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      profile.wellness_goals.includes(goal.id)
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded border-2 ${
                        profile.wellness_goals.includes(goal.id)
                          ? 'bg-emerald-700 border-emerald-700'
                          : 'border-gray-300'
                      }`}>
                        {profile.wellness_goals.includes(goal.id) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      {goal.icon}
                      <span>{goal.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">How long do you prefer your wellness sessions?</h3>
                <div className="space-y-3">
                  {sessionLengths.map(length => (
                    <button
                      key={length.id}
                      onClick={() => setProfile(prev => ({ ...prev, preferred_session_length: length.id }))}
                      className={`w-full p-3 rounded-lg border text-left flex items-center space-x-3 transition-colors ${
                        profile.preferred_session_length === length.id
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Clock className={`w-4 h-4 ${
                        profile.preferred_session_length === length.id ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <span>{length.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Notification preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.notification_preferences.daily_checkins}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          daily_checkins: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-emerald-700 border-gray-300 rounded focus:ring-emerald-600"
                    />
                    <span>Daily wellness check-in reminders</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.notification_preferences.weekly_insights}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          weekly_insights: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-emerald-700 border-gray-300 rounded focus:ring-emerald-600"
                    />
                    <span>Weekly wellness insights</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={profile.notification_preferences.emergency_support}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          emergency_support: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-emerald-700 border-gray-300 rounded focus:ring-emerald-600"
                    />
                    <span>Emergency support notifications</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Your personalized plan is ready!
              </h3>
              <p className="text-gray-600 mb-6">
                Based on your responses, we've customized InterpretReflect to support your unique needs. 
                You can always update these preferences in your profile settings.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">Your personalized experience includes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {profile.preferred_session_length}-minute wellness sessions</li>
                  <li>• Tools focused on {profile.primary_challenges.length} key challenge areas</li>
                  <li>• Resources for {profile.interpreter_type.replace('_', ' ')} interpreters</li>
                  <li>• Progress tracking toward {profile.wellness_goals.length} wellness goals</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleComplete}
              className="bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-800 transition-colors flex items-center space-x-2"
            >
              <span>Complete Setup</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && (!profile.interpreter_type || !profile.experience_level)) ||
                (currentStep === 2 && profile.primary_challenges.length === 0) ||
                (currentStep === 3 && profile.wellness_goals.length === 0)
              }
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold transition-colors ${
                (currentStep === 1 && (!profile.interpreter_type || !profile.experience_level)) ||
                (currentStep === 2 && profile.primary_challenges.length === 0) ||
                (currentStep === 3 && profile.wellness_goals.length === 0)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}