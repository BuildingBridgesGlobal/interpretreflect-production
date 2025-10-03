import React, { useState, useEffect } from 'react';
import {
import { directInsertReflection } from '../services/directSupabaseApi';
  X, FileText, ChevronRight, ChevronLeft, Save, Heart, Brain,
  Target, AlertTriangle, Sparkles, Copy, CheckCircle, Activity,
  Globe, Users, MapPin, Settings, Shield
} from 'lucide-react';
import { supabase, PreAssignmentPrepData, ReflectionEntry } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PreAssignmentPrepEnhancedProps {
  onComplete?: (data: PreAssignmentPrepData) => void;
  onClose: () => void;
}

// Common emotion options for Emotion RAG integration
const EMOTION_OPTIONS = [
  'Confident', 'Anxious', 'Excited', 'Prepared', 'Nervous', 
  'Focused', 'Uncertain', 'Energized', 'Overwhelmed', 'Calm',
  'Curious', 'Apprehensive', 'Motivated', 'Tired', 'Alert'
];

export const PreAssignmentPrepEnhanced: React.FC<PreAssignmentPrepEnhancedProps> = ({ 
  onComplete, 
  onClose 
}) => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const startTime = Date.now();
  
  // Form state for all fields
  const [formData, setFormData] = useState<PreAssignmentPrepData>({
    // Quick Insight Capture
    assignment_type: 'medical',
    assignment_format: 'in-person',
    current_feeling: '',
    most_challenging_aspect: '',
    
    // Section 1: Assignment Understanding
    assignment_description: '',
    preparation_completed: '',
    preparation_needed: '',
    terminology_review: '',
    remaining_questions: '',
    subject_familiarity: 5,
    
    // Section 2: Emotional & Physical Readiness
    current_emotions: [],
    body_sensations: '',
    past_influence: '',
    self_care_practices: '',
    energy_level: 5,
    mental_clarity: 5,
    
    // Section 3: Strategic Planning
    key_strategies: '',
    cognitive_load_management: '',
    environmental_factors: '',
    technical_setup: '',
    positioning_plan: '',
    boundaries_to_maintain: '',
    
    // Section 4: Anticipated Challenges
    anticipated_challenges: '',
    potential_triggers: '',
    coping_strategies: '',
    support_resources: '',
    unfamiliar_terminology_plan: '',
    
    // Section 5: Success Vision
    success_vision: '',
    skills_to_demonstrate: '',
    desired_feelings: '',
    quality_goals: '',
    recovery_plan: '',
    
    // Wellness Check
    confidence_level: 5,
    stress_anxiety_level: 5,
    preparedness_rating: 5,
    current_state_word: '',
    concerns_to_address: '',
    
    // Closing Commitment
    assignment_intention: '',
    self_care_commitment: '',
    
    // Metadata
    timestamp: new Date().toISOString(),
    assignment_id: `prep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });

  const handleFieldChange = (field: keyof PreAssignmentPrepData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleEmotionToggle = (emotion: string) => {
    const currentEmotions = formData.current_emotions || [];
    if (currentEmotions.includes(emotion)) {
      handleFieldChange('current_emotions', currentEmotions.filter(e => e !== emotion));
    } else {
      handleFieldChange('current_emotions', [...currentEmotions, emotion]);
    }
  };

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (sectionIndex) {
      case 0: // Quick Insight
        if (!formData.current_feeling.trim()) {
          newErrors.current_feeling = 'Please describe how you\'re feeling';
        }
        if (!formData.most_challenging_aspect.trim()) {
          newErrors.most_challenging_aspect = 'Please identify the most challenging aspect';
        }
        break;
      case 1: // Assignment Understanding
        if (!formData.assignment_description.trim()) {
          newErrors.assignment_description = 'Please describe the assignment';
        }
        if (!formData.preparation_completed.trim()) {
          newErrors.preparation_completed = 'Please describe your preparation';
        }
        break;
      case 2: // Emotional Readiness
        if (formData.current_emotions.length === 0) {
          newErrors.current_emotions = 'Please select at least one emotion';
        }
        if (!formData.body_sensations.trim()) {
          newErrors.body_sensations = 'Please describe where you feel tension or energy';
        }
        break;
      case 3: // Strategic Planning
        if (!formData.key_strategies.trim()) {
          newErrors.key_strategies = 'Please describe your key strategies';
        }
        if (!formData.cognitive_load_management.trim()) {
          newErrors.cognitive_load_management = 'Please describe your cognitive load management plan';
        }
        break;
      case 4: // Anticipated Challenges
        if (!formData.anticipated_challenges.trim()) {
          newErrors.anticipated_challenges = 'Please describe anticipated challenges';
        }
        if (!formData.coping_strategies.trim()) {
          newErrors.coping_strategies = 'Please describe your coping strategies';
        }
        break;
      case 5: // Success Vision
        if (!formData.success_vision.trim()) {
          newErrors.success_vision = 'Please describe your success vision';
        }
        if (!formData.recovery_plan.trim()) {
          newErrors.recovery_plan = 'Please describe your recovery plan';
        }
        break;
      case 6: // Wellness Check
        if (!formData.current_state_word.trim()) {
          newErrors.current_state_word = 'Please provide one word for your current state';
        }
        break;
      case 7: // Closing Commitment
        if (!formData.assignment_intention.trim()) {
          newErrors.assignment_intention = 'Please write your intention';
        }
        if (!formData.self_care_commitment.trim()) {
          newErrors.self_care_commitment = 'Please write your self-care commitment';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const generateSummary = () => {
    const summary = `PRE-ASSIGNMENT PREP SUMMARY
    
Assignment: ${formData.assignment_type} (${formData.assignment_format})
Current State: ${formData.current_feeling}
Confidence Level: ${formData.confidence_level}/10
Preparedness: ${formData.preparedness_rating}/10

KEY INTENTIONS:
• ${formData.assignment_intention}

SELF-CARE COMMITMENT:
• ${formData.self_care_commitment}

TOP STRATEGIES:
• ${formData.key_strategies}

CHALLENGES TO WATCH:
• ${formData.most_challenging_aspect}
• ${formData.anticipated_challenges}

SUPPORT RESOURCES:
• ${formData.support_resources}

RECOVERY PLAN:
• ${formData.recovery_plan}

Generated: ${new Date().toLocaleString()}`;

    setSummaryText(summary);
    setShowSummary(true);

      // Close immediately after successful save
      setIsSaving(false);

      if (onComplete) {
        onComplete(formData || answers || data || {});
      }
      setTimeout(() => {
        onClose();
      }, 100); // Small delay to ensure state updates
  };

  const handleSave = async () => {
    if (!validateSection(currentSection)) return;
    
    setIsSaving(true);
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const finalData = {
        ...formData,
        completion_time: duration,
        // Connect to Emotion RAG
        emotion_patterns: formData.current_emotions
      };

      const entry: ReflectionEntry = {
        user_id: user.id,
        reflection_id: `pre_assignment_prep_${Date.now()}`,
        entry_kind: 'pre_assignment_prep',
        data: finalData,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('reflection_entries')
        .insert([entry]);

      if (error) throw error;

      // Generate summary for user
      generateSummary();
      
      setIsSaving(false);

      
      if (onComplete) {
        onComplete(finalData);
      }
      
      // Check for high stress/anxiety levels
      if (formData.stress_anxiety_level >= 8) {
        // TODO: Show resources modal
        console.log('High stress detected - offering resources');
      }
    } catch (error) {
      console.error('Error saving prep:', error);
      setErrors({ save: 'Failed to save preparation. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    {
      title: "Quick Insight Capture",
      icon: <Brain className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E40AF' }}>
              Opening Context
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              Before you begin your interpreting assignment, let's explore your preparation, 
              emotional state, and strategies for success. Your responses here will help track 
              your growth and provide insights for future assignments.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                  What type of assignment is this?
                </label>
                <select
                  value={formData.assignment_type}
                  onChange={(e) => handleFieldChange('assignment_type', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <option value="medical">Medical</option>
                  <option value="legal">Legal</option>
                  <option value="educational">Educational</option>
                  <option value="conference">Conference</option>
                  <option value="community">Community</option>
                  <option value="other">Other</option>
                </select>
                {formData.assignment_type === 'other' && (
                  <input
                    type="text"
                    value={formData.assignment_type_other || ''}
                    onChange={(e) => handleFieldChange('assignment_type_other', e.target.value)}
                    placeholder="Please specify..."
                    className="w-full mt-2 px-4 py-2 border rounded-lg"
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                  Assignment format?
                </label>
                <select
                  value={formData.assignment_format}
                  onChange={(e) => handleFieldChange('assignment_format', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <option value="in-person">In-Person</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                How are you feeling about this upcoming assignment right now?
              </label>
              <textarea
                value={formData.current_feeling}
                onChange={(e) => handleFieldChange('current_feeling', e.target.value)}
                placeholder="Describe your current emotional state..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                style={{
                  borderColor: errors.current_feeling ? '#ef4444' : '#E5E7EB'
                }}
              />
              {errors.current_feeling && (
                <p className="text-sm text-red-500 mt-1">{errors.current_feeling}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                What specific aspect of this assignment feels most challenging?
              </label>
              <textarea
                value={formData.most_challenging_aspect}
                onChange={(e) => handleFieldChange('most_challenging_aspect', e.target.value)}
                placeholder="Identify the primary challenge..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                style={{
                  borderColor: errors.most_challenging_aspect ? '#ef4444' : '#E5E7EB'
                }}
              />
              {errors.most_challenging_aspect && (
                <p className="text-sm text-red-500 mt-1">{errors.most_challenging_aspect}</p>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Assignment Understanding & Preparation",
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              Describe what you know about this assignment (setting, participants, duration, topic)
            </label>
            <textarea
              value={formData.assignment_description}
              onChange={(e) => handleFieldChange('assignment_description', e.target.value)}
              placeholder="Provide details about the assignment..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: errors.assignment_description ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.assignment_description && (
              <p className="text-sm text-red-500 mt-1">{errors.assignment_description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                What preparation have you completed so far?
              </label>
              <textarea
                value={formData.preparation_completed}
                onChange={(e) => handleFieldChange('preparation_completed', e.target.value)}
                placeholder="List completed preparation steps..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                style={{
                  borderColor: errors.preparation_completed ? '#ef4444' : '#E5E7EB'
                }}
              />
              {errors.preparation_completed && (
                <p className="text-sm text-red-500 mt-1">{errors.preparation_completed}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                What still needs to be done?
              </label>
              <textarea
                value={formData.preparation_needed}
                onChange={(e) => handleFieldChange('preparation_needed', e.target.value)}
                placeholder="List remaining preparation tasks..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What terminology or concepts do you need to review before the assignment?
            </label>
            <textarea
              value={formData.terminology_review}
              onChange={(e) => handleFieldChange('terminology_review', e.target.value)}
              placeholder="List key terms, concepts, or subject matter to review..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What questions do you still have about the assignment logistics or content?
            </label>
            <textarea
              value={formData.remaining_questions}
              onChange={(e) => handleFieldChange('remaining_questions', e.target.value)}
              placeholder="List any unanswered questions..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              How familiar are you with this subject matter? (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.subject_familiarity}
                onChange={(e) => handleFieldChange('subject_familiarity', Number(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#3B82F6' }}
              />
              <span className="w-12 text-center font-semibold" style={{ color: '#1A1A1A' }}>
                {formData.subject_familiarity}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Emotional & Physical Readiness",
      icon: <Heart className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What emotions are you experiencing as you prepare? (select all that apply)
            </label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
              {EMOTION_OPTIONS.map(emotion => (
                <button
                  key={emotion}
                  onClick={() => handleEmotionToggle(emotion)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    formData.current_emotions.includes(emotion)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
            {formData.current_emotions.length > 0 && (
              <div className="p-3 rounded-lg bg-blue-50">
                <p className="text-sm text-blue-700">
                  Selected: {formData.current_emotions.join(', ')}
                </p>
              </div>
            )}
            {errors.current_emotions && (
              <p className="text-sm text-red-500 mt-1">{errors.current_emotions}</p>
            )}
            <input
              type="text"
              value={formData.custom_emotions || ''}
              onChange={(e) => handleFieldChange('custom_emotions', e.target.value)}
              placeholder="Other emotions (comma-separated)..."
              className="w-full mt-2 px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              Where do you feel tension or energy in your body right now?
            </label>
            <textarea
              value={formData.body_sensations}
              onChange={(e) => handleFieldChange('body_sensations', e.target.value)}
              placeholder="Describe physical sensations and their locations..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: errors.body_sensations ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.body_sensations && (
              <p className="text-sm text-red-500 mt-1">{errors.body_sensations}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What past assignment experience is influencing how you feel about this one?
            </label>
            <textarea
              value={formData.past_influence}
              onChange={(e) => handleFieldChange('past_influence', e.target.value)}
              placeholder="Describe relevant past experiences and their impact..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What self-care practices have you done/will you do before the assignment?
            </label>
            <textarea
              value={formData.self_care_practices}
              onChange={(e) => handleFieldChange('self_care_practices', e.target.value)}
              placeholder="List self-care activities completed or planned..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                Current energy level (1-10)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energy_level}
                  onChange={(e) => handleFieldChange('energy_level', Number(e.target.value))}
                  className="flex-1"
                  style={{ accentColor: '#3B82F6' }}
                />
                <span className="w-12 text-center font-semibold" style={{ color: '#1A1A1A' }}>
                  {formData.energy_level}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                Mental clarity (1-10)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.mental_clarity}
                  onChange={(e) => handleFieldChange('mental_clarity', Number(e.target.value))}
                  className="flex-1"
                  style={{ accentColor: '#3B82F6' }}
                />
                <span className="w-12 text-center font-semibold" style={{ color: '#1A1A1A' }}>
                  {formData.mental_clarity}
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Strategic Planning & Approach",
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What interpreting strategies will be most important for this assignment?
            </label>
            <textarea
              value={formData.key_strategies}
              onChange={(e) => handleFieldChange('key_strategies', e.target.value)}
              placeholder="Describe your primary interpreting strategies..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: errors.key_strategies ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.key_strategies && (
              <p className="text-sm text-red-500 mt-1">{errors.key_strategies}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              How will you manage cognitive load during this assignment?
            </label>
            <textarea
              value={formData.cognitive_load_management}
              onChange={(e) => handleFieldChange('cognitive_load_management', e.target.value)}
              placeholder="Describe your approach to managing mental fatigue and processing..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: errors.cognitive_load_management ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.cognitive_load_management && (
              <p className="text-sm text-red-500 mt-1">{errors.cognitive_load_management}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What environmental factors might impact your performance? How will you adapt?
            </label>
            <textarea
              value={formData.environmental_factors}
              onChange={(e) => handleFieldChange('environmental_factors', e.target.value)}
              placeholder="Identify environmental challenges and adaptation strategies..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Conditional fields based on assignment format */}
          {(formData.assignment_format === 'virtual' || formData.assignment_format === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                What's your technical setup and backup plan?
              </label>
              <textarea
                value={formData.technical_setup || ''}
                onChange={(e) => handleFieldChange('technical_setup', e.target.value)}
                placeholder="Describe your equipment, internet, platform familiarity, and backup plans..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {(formData.assignment_format === 'in-person' || formData.assignment_format === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                What's your positioning and environmental management plan?
              </label>
              <textarea
                value={formData.positioning_plan || ''}
                onChange={(e) => handleFieldChange('positioning_plan', e.target.value)}
                placeholder="Describe your positioning strategy, sight lines, and space management..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What boundaries do you need to maintain during this assignment?
            </label>
            <textarea
              value={formData.boundaries_to_maintain}
              onChange={(e) => handleFieldChange('boundaries_to_maintain', e.target.value)}
              placeholder="Describe professional, personal, or ethical boundaries..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Anticipated Challenges & Solutions",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What specific challenges do you anticipate in this assignment?
            </label>
            <textarea
              value={formData.anticipated_challenges}
              onChange={(e) => handleFieldChange('anticipated_challenges', e.target.value)}
              placeholder="List potential challenges you might face..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: errors.anticipated_challenges ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.anticipated_challenges && (
              <p className="text-sm text-red-500 mt-1">{errors.anticipated_challenges}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What triggers or stressors might arise? How will you recognize them?
            </label>
            <textarea
              value={formData.potential_triggers}
              onChange={(e) => handleFieldChange('potential_triggers', e.target.value)}
              placeholder="Identify potential triggers and early warning signs..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What coping strategies will you use if you feel overwhelmed?
            </label>
            <textarea
              value={formData.coping_strategies}
              onChange={(e) => handleFieldChange('coping_strategies', e.target.value)}
              placeholder="Describe specific techniques for managing overwhelm..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: errors.coping_strategies ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.coping_strategies && (
              <p className="text-sm text-red-500 mt-1">{errors.coping_strategies}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              Who can you reach out to for support if needed (before, during, after)?
            </label>
            <textarea
              value={formData.support_resources}
              onChange={(e) => handleFieldChange('support_resources', e.target.value)}
              placeholder="List people, resources, or services available for support..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What will you do if you encounter unfamiliar terminology or concepts?
            </label>
            <textarea
              value={formData.unfamiliar_terminology_plan}
              onChange={(e) => handleFieldChange('unfamiliar_terminology_plan', e.target.value)}
              placeholder="Describe your strategy for handling unknown terms..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Success Vision & Intentions",
      icon: <Sparkles className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What does successful completion of this assignment look like to you?
            </label>
            <textarea
              value={formData.success_vision}
              onChange={(e) => handleFieldChange('success_vision', e.target.value)}
              placeholder="Describe your vision of success..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: errors.success_vision ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.success_vision && (
              <p className="text-sm text-red-500 mt-1">{errors.success_vision}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What professional skills do you want to demonstrate or develop?
            </label>
            <textarea
              value={formData.skills_to_demonstrate}
              onChange={(e) => handleFieldChange('skills_to_demonstrate', e.target.value)}
              placeholder="List specific skills to showcase or improve..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              How do you want to feel during and after this assignment?
            </label>
            <textarea
              value={formData.desired_feelings}
              onChange={(e) => handleFieldChange('desired_feelings', e.target.value)}
              placeholder="Describe your desired emotional state..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What specific quality of interpretation are you aiming for?
            </label>
            <textarea
              value={formData.quality_goals}
              onChange={(e) => handleFieldChange('quality_goals', e.target.value)}
              placeholder="Describe your quality standards and goals..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
              What recovery or debrief practice will you do afterward?
            </label>
            <textarea
              value={formData.recovery_plan}
              onChange={(e) => handleFieldChange('recovery_plan', e.target.value)}
              placeholder="Describe your post-assignment recovery plan..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: errors.recovery_plan ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.recovery_plan && (
              <p className="text-sm text-red-500 mt-1">{errors.recovery_plan}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Pre-Assignment Wellness Check",
      icon: <Activity className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E40AF' }}>
              Wellness Metrics
            </h3>
            <p className="mb-6 text-sm" style={{ color: '#5A5A5A' }}>
              These metrics help track your readiness and will be compared with your post-assignment state.
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                  Overall confidence level for this assignment (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.confidence_level}
                    onChange={(e) => handleFieldChange('confidence_level', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#3B82F6' }}
                  />
                  <span className="w-12 text-center font-semibold text-lg" style={{ color: '#1A1A1A' }}>
                    {formData.confidence_level}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                  Stress/anxiety level (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.stress_anxiety_level}
                    onChange={(e) => handleFieldChange('stress_anxiety_level', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: formData.stress_anxiety_level >= 7 ? '#EF4444' : '#3B82F6' }}
                  />
                  <span className="w-12 text-center font-semibold text-lg" style={{ 
                    color: formData.stress_anxiety_level >= 7 ? '#EF4444' : '#1A1A1A' 
                  }}>
                    {formData.stress_anxiety_level}
                  </span>
                </div>
                {formData.stress_anxiety_level >= 8 && (
                  <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">
                      High stress detected. Consider reviewing your coping strategies and support resources.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                  Preparedness rating (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.preparedness_rating}
                    onChange={(e) => handleFieldChange('preparedness_rating', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#3B82F6' }}
                  />
                  <span className="w-12 text-center font-semibold text-lg" style={{ color: '#1A1A1A' }}>
                    {formData.preparedness_rating}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                  One word describing your current state
                </label>
                <input
                  type="text"
                  value={formData.current_state_word}
                  onChange={(e) => handleFieldChange('current_state_word', e.target.value)}
                  placeholder="Enter one word..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: errors.current_state_word ? '#ef4444' : '#E5E7EB'
                  }}
                />
                {errors.current_state_word && (
                  <p className="text-sm text-red-500 mt-1">{errors.current_state_word}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                  Do you have any concerns that need addressing before starting? (optional)
                </label>
                <textarea
                  value={formData.concerns_to_address || ''}
                  onChange={(e) => handleFieldChange('concerns_to_address', e.target.value)}
                  placeholder="Share any immediate concerns..."
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Closing Commitment",
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E40AF' }}>
              Your Commitments
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              Based on your reflection, write one intention for how you'll show up in this 
              assignment and one self-care commitment for afterward.
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                  My intention for this assignment:
                </label>
                <textarea
                  value={formData.assignment_intention}
                  onChange={(e) => handleFieldChange('assignment_intention', e.target.value)}
                  placeholder="Write your intention for how you'll approach this assignment..."
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: errors.assignment_intention ? '#ef4444' : '#E5E7EB'
                  }}
                />
                {errors.assignment_intention && (
                  <p className="text-sm text-red-500 mt-1">{errors.assignment_intention}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1E40AF' }}>
                  My self-care commitment for afterward:
                </label>
                <textarea
                  value={formData.self_care_commitment}
                  onChange={(e) => handleFieldChange('self_care_commitment', e.target.value)}
                  placeholder="Write your commitment to self-care after the assignment..."
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: errors.self_care_commitment ? '#ef4444' : '#E5E7EB'
                  }}
                />
                {errors.self_care_commitment && (
                  <p className="text-sm text-red-500 mt-1">{errors.self_care_commitment}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Remember:</strong> Complete the Post-Assignment Debrief after your assignment 
              to track your growth and insights. Your responses here will be available for comparison.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentSectionData = sections[currentSection];
  const isLastSection = currentSection === sections.length - 1;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          style={{ backgroundColor: '#FAFAFA' }}
        >
          {/* Header */}
          <div 
            className="p-6 border-b"
            style={{ 
              borderColor: '#E5E7EB',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, #3B82F6 0%, #6366F1 100%)',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                    Pre-Assignment Preparation
                  </h2>
                  <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                    Preparing for your interpreting assignment
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex space-x-2">
                {sections.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      index <= currentSection ? 'opacity-100' : 'opacity-30'
                    }`}
                    style={{
                      backgroundColor: index <= currentSection ? '#3B82F6' : '#E5E7EB',
                      minWidth: '40px'
                    }}
                  />
                ))}
              </div>
              <span className="text-sm ml-4" style={{ color: '#5A5A5A' }}>
                {currentSection + 1} of {sections.length}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
            <div className="mb-4 flex items-center space-x-2">
              {currentSectionData.icon}
              <h3 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
                {currentSectionData.title}
              </h3>
            </div>

            {currentSectionData.content}
          </div>

          {/* Footer */}
          <div 
            className="p-6 border-t flex justify-between items-center"
            style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}
          >
            {currentSection > 0 && (
              <button
                onClick={handlePrev}
                className="px-6 py-2 rounded-lg flex items-center transition-colors"
                style={{
                  backgroundColor: '#F3F4F6',
                  color: '#3B82F6',
                  border: '1px solid #3B82F6'
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
            )}

            <div className="flex-1" />

            {errors.save && (
              <p className="text-sm text-red-500 mr-4">{errors.save}</p>
            )}

            {!isLastSection ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 rounded-lg flex items-center transition-all"
                style={{
                  background: 'linear-gradient(145deg, #3B82F6 0%, #6366F1 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                }}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 rounded-lg flex items-center transition-all"
                style={{
                  background: isSaving 
                    ? 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)'
                    : 'linear-gradient(145deg, #3B82F6 0%, #6366F1 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Preparation'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div 
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: '#FAFAFA' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                Assignment Prep Summary
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(summaryText);
                  setCopiedSummary(true);
                  setTimeout(() => setCopiedSummary(false), 2000);
                }}
                className="px-4 py-2 rounded-lg flex items-center transition-all"
                style={{
                  backgroundColor: copiedSummary ? '#10B981' : '#3B82F6',
                  color: '#FFFFFF'
                }}
              >
                {copiedSummary ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Summary
                  </>
                )}
              </button>
            </div>

            <pre className="whitespace-pre-wrap font-mono text-sm p-4 rounded-lg bg-gray-50">
              {summaryText}
            </pre>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  setShowSummary(false);
                  onClose();
                }}
                className="w-full px-6 py-3 rounded-lg transition-all"
                style={{
                  background: 'linear-gradient(145deg, #3B82F6 0%, #6366F1 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                }}
              >
                Complete & Close
              </button>
              
              <p className="text-center text-sm text-gray-600">
                Remember to complete the Post-Assignment Debrief after your assignment
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PreAssignmentPrepEnhanced;