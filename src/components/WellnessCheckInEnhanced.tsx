import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, Heart, Activity, Brain, Users, Briefcase, TrendingUp, Copy, Check, AlertTriangle } from 'lucide-react';
import { supabase, WellnessCheckInData } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { reflectionService } from '../services/reflectionService';

interface WellnessCheckInEnhancedProps {
  onComplete: (data: WellnessCheckInData) => void;
  onClose: () => void;
}

const EMOTION_OPTIONS = [
  'Calm', 'Anxious', 'Energized', 'Exhausted', 'Focused', 'Scattered',
  'Confident', 'Uncertain', 'Content', 'Frustrated', 'Hopeful', 'Overwhelmed',
  'Grateful', 'Resentful', 'Connected', 'Isolated', 'Motivated', 'Drained'
];

export const WellnessCheckInEnhanced: React.FC<WellnessCheckInEnhancedProps> = ({ 
  onComplete, 
  onClose 
}) => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [startTime] = useState(Date.now());
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const [formData, setFormData] = useState<WellnessCheckInData>({
    // Quick Insight Capture
    check_in_reason: '',
    overall_feeling: 5,
    last_break_taken: '',
    
    // Section 1: Emotional Landscape
    current_emotions: [],
    custom_emotions: '',
    strongest_emotion: '',
    emotion_message: '',
    emotional_patterns: '',
    avoided_feelings: '',
    emotional_needs: '',
    
    // Section 2: Physical Awareness
    body_scan: '',
    tension_areas: '',
    relaxation_areas: '',
    energy_level: '',
    physical_symptoms: '',
    
    // Section 3: Professional Wellbeing
    workload_sustainability: 5,
    energizing_aspects: '',
    draining_aspects: '',
    purpose_connection: '',
    boundaries_needing_attention: '',
    
    // Section 4: Support & Resources
    available_support_systems: '',
    people_to_reach_out: '',
    recent_self_care: '',
    needed_resources: '',
    help_comfort_level: 5,
    
    // Section 5: Needs & Intentions
    immediate_needs: '',
    balance_helpers: '',
    today_wellness_step: '',
    longer_term_changes: '',
    week_wellness_priority: '',
    
    // Wellness Metrics
    physical_energy: 5,
    emotional_balance: 5,
    mental_clarity: 5,
    social_connection: 5,
    professional_satisfaction: 5,
    overall_wellbeing: 5,
    stress_level: 5,
    energy_level: 5,
    
    // Closing
    self_care_commitment: '',
    gratitude_reflection: '',
    
    // Metadata
    timestamp: new Date().toISOString(),
  });

  const sections = [
    'Quick Insight Capture',
    'Emotional Landscape',
    'Physical Awareness',
    'Professional Wellbeing',
    'Support & Resources',
    'Needs & Intentions',
    'Wellness Metrics',
    'Closing Reflection',
    'Summary'
  ];

  const handleInputChange = (field: keyof WellnessCheckInData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmotionToggle = (emotion: string) => {
    setFormData(prev => ({
      ...prev,
      current_emotions: prev.current_emotions.includes(emotion)
        ? prev.current_emotions.filter(e => e !== emotion)
        : [...prev.current_emotions, emotion]
    }));
  };

  const validateSection = (section: number): boolean => {
    switch (section) {
      case 0: // Quick Insight
        return formData.check_in_reason.trim() !== '' && 
               formData.last_break_taken.trim() !== '';
      case 1: // Emotional Landscape
        return formData.current_emotions.length > 0 &&
               formData.strongest_emotion.trim() !== '' &&
               formData.emotion_message.trim() !== '';
      case 2: // Physical Awareness
        return formData.body_scan.trim() !== '';
      case 3: // Professional Wellbeing
        return formData.energizing_aspects.trim() !== '' &&
               formData.draining_aspects.trim() !== '';
      case 4: // Support & Resources
        return formData.available_support_systems.trim() !== '' &&
               formData.recent_self_care.trim() !== '';
      case 5: // Needs & Intentions
        return formData.immediate_needs.trim() !== '' &&
               formData.today_wellness_step.trim() !== '';
      case 6: // Wellness Metrics
        return true; // All sliders have default values
      case 7: // Closing
        return formData.self_care_commitment.trim() !== '' &&
               formData.gratitude_reflection.trim() !== '';
      default:
        return true;
    }
  };

  const nextSection = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const generateSummary = (): string => {
    const emotionsList = formData.current_emotions.join(', ');
    
    return `WELLNESS CHECK-IN SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━

📊 OVERALL WELLNESS: ${formData.overall_wellbeing}/10

🎯 CHECK-IN REASON
${formData.check_in_reason}

💭 EMOTIONAL STATE
Current emotions: ${emotionsList}
Strongest: ${formData.strongest_emotion}
${formData.emotion_message}

🏃 PHYSICAL STATE
Energy level: ${formData.energy_level}/10
Stress level: ${formData.stress_level}/10
Physical energy: ${formData.physical_energy}/10
${formData.body_scan}

💼 PROFESSIONAL WELLBEING
Workload sustainability: ${formData.workload_sustainability}/10
Energizing: ${formData.energizing_aspects}
Draining: ${formData.draining_aspects}

🤝 SUPPORT AVAILABLE
${formData.available_support_systems}
Help comfort: ${formData.help_comfort_level}/10

🎯 IMMEDIATE ACTION
Today's step: ${formData.today_wellness_step}
24-hour commitment: ${formData.self_care_commitment}

📈 WELLNESS METRICS
• Physical Energy: ${formData.physical_energy}/10
• Emotional Balance: ${formData.emotional_balance}/10
• Mental Clarity: ${formData.mental_clarity}/10
• Social Connection: ${formData.social_connection}/10
• Professional Satisfaction: ${formData.professional_satisfaction}/10

🙏 GRATITUDE
${formData.gratitude_reflection}

━━━━━━━━━━━━━━━━━━━━━━━━
Completed: ${new Date().toLocaleString()}`;
  };

  const copyToClipboard = () => {
    const summary = generateSummary();
    navigator.clipboard.writeText(summary).then(() => {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    });
  };

  const handleSubmit = async () => {
    if (!validateSection(7)) return;
    if (hasSaved) return; // Prevent double-save

    setIsSubmitting(true);

    const completionTime = Math.round((Date.now() - startTime) / 1000);
    const finalData = {
      ...formData,
      completion_time: completionTime,
      timestamp: new Date().toISOString(),
      concerning_patterns: formData.overall_wellbeing <= 3 || formData.physical_energy <= 3 || formData.emotional_balance <= 3,
      needs_followup: formData.overall_wellbeing <= 4,
      // Add fields for getDisplayName fallback
      current_feeling: formData.primary_emotion || formData.check_in_reason || 'Wellness check completed',
      wellness_score: formData.overall_wellbeing,
      stress_level: formData.stress_level,
      energy_level: formData.energy_level
    };

    try {
      if (user) {
        console.log('WellnessCheckInEnhanced - Saving with reflectionService');
        const result = await reflectionService.saveReflection(
          user.id,
          'wellness_checkin', // Use correct entry_kind without hyphen
          finalData
        );

        if (!result.success) {
          console.error('Error saving wellness check-in:', result.error);
          throw new Error(result.error || 'Failed to save wellness check-in');
        }

        setHasSaved(true);
      }

      onComplete(finalData);
    } catch (error) {
      console.error('Error submitting wellness check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuickInsight = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What brought you to this wellness check-in today?
        </label>
        <textarea
          value={formData.check_in_reason}
          onChange={(e) => handleInputChange('check_in_reason', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Describe what prompted this check-in..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall, how are you feeling right now?
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.overall_feeling}
            onChange={(e) => handleInputChange('overall_feeling', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.overall_feeling}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          When did you last take a deliberate break or rest?
        </label>
        <input
          type="text"
          value={formData.last_break_taken}
          onChange={(e) => handleInputChange('last_break_taken', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
          placeholder="e.g., Yesterday afternoon, 3 days ago..."
        />
      </div>
    </div>
  );

  const renderEmotionalLandscape = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What emotions are present for you right now? (select all that apply)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EMOTION_OPTIONS.map(emotion => (
            <button
              key={emotion}
              onClick={() => handleEmotionToggle(emotion)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                formData.current_emotions.includes(emotion)
                  ? 'bg-sage-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {emotion}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={formData.custom_emotions || ''}
          onChange={(e) => handleInputChange('custom_emotions', e.target.value)}
          className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
          placeholder="Other emotions (comma-separated)..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Which emotion feels strongest? What's it telling you?
        </label>
        <input
          type="text"
          value={formData.strongest_emotion}
          onChange={(e) => handleInputChange('strongest_emotion', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent mb-2"
          placeholder="Strongest emotion..."
        />
        <textarea
          value={formData.emotion_message}
          onChange={(e) => handleInputChange('emotion_message', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="What is this emotion telling you?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What emotional patterns have you noticed lately?
        </label>
        <textarea
          value={formData.emotional_patterns}
          onChange={(e) => handleInputChange('emotional_patterns', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What feelings have you been avoiding or pushing away?
        </label>
        <textarea
          value={formData.avoided_feelings}
          onChange={(e) => handleInputChange('avoided_feelings', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What do you need emotionally that you're not getting?
        </label>
        <textarea
          value={formData.emotional_needs}
          onChange={(e) => handleInputChange('emotional_needs', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>
    </div>
  );

  const renderPhysicalAwareness = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How does your body feel right now? Scan from head to toe.
        </label>
        <textarea
          value={formData.body_scan}
          onChange={(e) => handleInputChange('body_scan', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Describe what you notice in your body..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Where are you holding tension or discomfort?
        </label>
        <textarea
          value={formData.tension_areas}
          onChange={(e) => handleInputChange('tension_areas', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Where do you feel ease or relaxation?
        </label>
        <textarea
          value={formData.relaxation_areas}
          onChange={(e) => handleInputChange('relaxation_areas', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How is your energy level? What's affecting it?
        </label>
        <textarea
          value={formData.energy_level}
          onChange={(e) => handleInputChange('energy_level', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="Describe your energy and what's influencing it..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What physical symptoms have you been experiencing? (fatigue, headaches, tension, etc.)
        </label>
        <textarea
          value={formData.physical_symptoms}
          onChange={(e) => handleInputChange('physical_symptoms', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>
    </div>
  );

  const renderProfessionalWellbeing = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How sustainable does your current workload feel?
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Unsustainable</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.workload_sustainability}
            onChange={(e) => handleInputChange('workload_sustainability', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">Very sustainable</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.workload_sustainability}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What aspects of interpreting are energizing you lately?
        </label>
        <textarea
          value={formData.energizing_aspects}
          onChange={(e) => handleInputChange('energizing_aspects', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="What gives you energy and excitement?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What aspects are draining you?
        </label>
        <textarea
          value={formData.draining_aspects}
          onChange={(e) => handleInputChange('draining_aspects', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="What depletes your energy?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How connected do you feel to your professional purpose?
        </label>
        <textarea
          value={formData.purpose_connection}
          onChange={(e) => handleInputChange('purpose_connection', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What boundaries need attention or reinforcement?
        </label>
        <textarea
          value={formData.boundaries_needing_attention}
          onChange={(e) => handleInputChange('boundaries_needing_attention', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>
    </div>
  );

  const renderSupportResources = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What support systems are currently available to you?
        </label>
        <textarea
          value={formData.available_support_systems}
          onChange={(e) => handleInputChange('available_support_systems', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="People, groups, resources..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Who could you reach out to if you needed help?
        </label>
        <textarea
          value={formData.people_to_reach_out}
          onChange={(e) => handleInputChange('people_to_reach_out', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What self-care practices have you engaged in recently?
        </label>
        <textarea
          value={formData.recent_self_care}
          onChange={(e) => handleInputChange('recent_self_care', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="Activities that nurture your wellbeing..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What resources do you need but don't currently have?
        </label>
        <textarea
          value={formData.needed_resources}
          onChange={(e) => handleInputChange('needed_resources', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How comfortable are you asking for help when needed?
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Very uncomfortable</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.help_comfort_level}
            onChange={(e) => handleInputChange('help_comfort_level', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">Very comfortable</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.help_comfort_level}
          </span>
        </div>
      </div>
    </div>
  );

  const renderNeedsIntentions = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What do you need most right now? (rest, connection, challenge, variety, etc.)
        </label>
        <textarea
          value={formData.immediate_needs}
          onChange={(e) => handleInputChange('immediate_needs', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="Your most pressing needs..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What would help you feel more balanced?
        </label>
        <textarea
          value={formData.balance_helpers}
          onChange={(e) => handleInputChange('balance_helpers', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What small step could you take today for your wellbeing?
        </label>
        <textarea
          value={formData.today_wellness_step}
          onChange={(e) => handleInputChange('today_wellness_step', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="One achievable action..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What bigger change might be needed longer-term?
        </label>
        <textarea
          value={formData.longer_term_changes}
          onChange={(e) => handleInputChange('longer_term_changes', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How will you prioritize your wellbeing this week?
        </label>
        <textarea
          value={formData.week_wellness_priority}
          onChange={(e) => handleInputChange('week_wellness_priority', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>
    </div>
  );

  const renderWellnessMetrics = () => (
    <div className="space-y-6">
      <div className="bg-sage-50 p-4 rounded-lg">
        <p className="text-sm text-sage-700 mb-4">
          Rate each aspect of your wellbeing on a scale of 1-10
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Activity className="inline w-4 h-4 mr-1" /> Rate your current energy level (1-10)
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.energy_level}
            onChange={(e) => handleInputChange('energy_level', parseInt(e.target.value))}
            className="flex-1"
            style={{ accentColor: '#6B8B60' }}
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.energy_level}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <AlertTriangle className="inline w-4 h-4 mr-1" /> Rate your current stress level (1-10)
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.stress_level}
            onChange={(e) => handleInputChange('stress_level', parseInt(e.target.value))}
            className="flex-1"
            style={{ accentColor: '#DC2626' }}
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.stress_level}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Activity className="inline w-4 h-4 mr-1" /> Physical Energy
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.physical_energy}
            onChange={(e) => handleInputChange('physical_energy', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.physical_energy}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Heart className="inline w-4 h-4 mr-1" /> Emotional Balance
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.emotional_balance}
            onChange={(e) => handleInputChange('emotional_balance', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.emotional_balance}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Brain className="inline w-4 h-4 mr-1" /> Mental Clarity
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.mental_clarity}
            onChange={(e) => handleInputChange('mental_clarity', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.mental_clarity}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users className="inline w-4 h-4 mr-1" /> Social Connection
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.social_connection}
            onChange={(e) => handleInputChange('social_connection', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.social_connection}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Briefcase className="inline w-4 h-4 mr-1" /> Professional Satisfaction
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.professional_satisfaction}
            onChange={(e) => handleInputChange('professional_satisfaction', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.professional_satisfaction}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <TrendingUp className="inline w-4 h-4 mr-1" /> Overall Wellbeing
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm">1</span>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.overall_wellbeing}
            onChange={(e) => handleInputChange('overall_wellbeing', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm">10</span>
          <span className="ml-4 font-medium text-sage-700 min-w-[2ch]">
            {formData.overall_wellbeing}
          </span>
        </div>
      </div>
    </div>
  );

  const renderClosingReflection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Based on this check-in, what's one specific self-care action you'll take in the next 24 hours?
        </label>
        <textarea
          value={formData.self_care_commitment}
          onChange={(e) => handleInputChange('self_care_commitment', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Be specific about what you'll do and when..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What are you grateful for right now, despite any challenges?
        </label>
        <textarea
          value={formData.gratitude_reflection}
          onChange={(e) => handleInputChange('gratitude_reflection', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Name what you're thankful for..."
        />
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <div className="bg-sage-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-sage-900 mb-4">Check-In Summary</h3>
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
          {generateSummary()}
        </pre>
      </div>

      <div className="flex justify-between">
        <button
          onClick={copyToClipboard}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {copiedToClipboard ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Summary
            </>
          )}
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || hasSaved}
          className="px-6 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Complete Check-In'}
        </button>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (currentSection) {
      case 0: return renderQuickInsight();
      case 1: return renderEmotionalLandscape();
      case 2: return renderPhysicalAwareness();
      case 3: return renderProfessionalWellbeing();
      case 4: return renderSupportResources();
      case 5: return renderNeedsIntentions();
      case 6: return renderWellnessMetrics();
      case 7: return renderClosingReflection();
      case 8: return renderSummary();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Wellness Check-In</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            Let's pause to check in with your emotional and physical wellbeing. This practice helps you stay connected to yourself and identify what you need to maintain balance in your interpreting practice.
          </p>

          <div className="flex space-x-2 mb-4">
            {sections.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  index < currentSection
                    ? 'bg-sage-600'
                    : index === currentSection
                    ? 'bg-sage-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <p className="text-sm text-sage-700 font-medium">
            {sections[currentSection]} ({currentSection + 1}/{sections.length})
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {renderSection()}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={prevSection}
              disabled={currentSection === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <button
              onClick={nextSection}
              disabled={currentSection === sections.length - 1 || !validateSection(currentSection)}
              className="flex items-center px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};