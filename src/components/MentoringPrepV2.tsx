/**
 * Mentoring Prep V2 Component
 * 
 * Matches exact design pattern of Pre-Assignment Prep, Post-Assignment Debrief, 
 * Teaming Prep, and Teaming Reflection with sage green color scheme and consistent styling
 * 
 * @module MentoringPrepV2
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Users,
  Heart,
  Brain,
  Target,
  BookOpen,
  Compass,
  Shield,
  Lightbulb,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { updateGrowthInsightsForUser } from '../services/growthInsightsService';

interface MentoringPrepV2Props {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

/**
 * Main Component
 */
export function MentoringPrepV2({ onClose, onComplete }: MentoringPrepV2Props) {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const startTime = Date.now();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Form state for all fields
  const [formData, setFormData] = useState({
    // Section 1: Mentorship Context
    mentorship_type: 'peer',
    relationship_stage: 'new',
    context_background: '',
    
    // Section 2: Goals & Expectations
    mentoring_goals: '',
    success_indicators: '',
    expectations_clarity: '',
    
    // Section 3: Knowledge & Preparation
    topic_preparation: '',
    knowledge_gaps: '',
    resources_needed: '',
    
    // Section 4: Communication Style
    communication_approach: '',
    feedback_preferences: '',
    difficult_conversations: '',
    
    // Section 5: Boundaries & Ethics
    professional_boundaries: '',
    ethical_considerations: '',
    confidentiality_approach: '',
    
    // Section 6: Growth & Development
    skill_development_focus: '',
    learning_objectives: '',
    growth_mindset: '',
    
    // Section 7: Support & Self-Care
    support_strategies: '',
    self_care_plan: '',
    stress_management: '',
    
    // Section 8: Closing Commitment
    intention_statement: '',
    confidence_level: 5,
    commitment_rating: 5,
    one_word_focus: '',
    
    // Metadata
    session_date: new Date().toISOString().split('T')[0],
    session_duration_planned: '',
    timestamp: new Date().toISOString()
  });

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (sectionIndex) {
      case 0: // Mentorship Context
        if (!formData.context_background.trim()) {
          newErrors.context_background = 'Please describe the mentorship context';
        }
        break;
      
      case 1: // Goals & Expectations
        if (!formData.mentoring_goals.trim()) {
          newErrors.mentoring_goals = 'Please define your mentoring goals';
        }
        if (!formData.success_indicators.trim()) {
          newErrors.success_indicators = 'Please identify success indicators';
        }
        break;
      
      case 2: // Knowledge & Preparation
        if (!formData.topic_preparation.trim()) {
          newErrors.topic_preparation = 'Please describe your preparation';
        }
        break;
      
      case 3: // Communication Style
        if (!formData.communication_approach.trim()) {
          newErrors.communication_approach = 'Please describe your communication approach';
        }
        break;
      
      case 4: // Boundaries & Ethics
        if (!formData.professional_boundaries.trim()) {
          newErrors.professional_boundaries = 'Please define professional boundaries';
        }
        if (!formData.ethical_considerations.trim()) {
          newErrors.ethical_considerations = 'Please address ethical considerations';
        }
        break;
      
      case 5: // Growth & Development
        if (!formData.skill_development_focus.trim()) {
          newErrors.skill_development_focus = 'Please identify development focus areas';
        }
        break;
      
      case 6: // Support & Self-Care
        if (!formData.support_strategies.trim()) {
          newErrors.support_strategies = 'Please describe support strategies';
        }
        break;
      
      case 7: // Closing Commitment
        if (!formData.intention_statement.trim()) {
          newErrors.intention_statement = 'Please craft an intention statement';
        }
        if (!formData.one_word_focus.trim()) {
          newErrors.one_word_focus = 'Please provide a focus word';
        }
        break;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateSection(currentSection)) return;
    if (!user) {
      setErrors({ save: 'You must be logged in to save' });
      return;
    }

    setIsSaving(true);
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Save to database
      const { data, error } = await supabase
        .from('mentoring_reflections')
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          reflection_type: 'mentoring_prep',
          ...formData,
          status: 'completed',
          metadata: {
            completion_time: new Date().toISOString(),
            time_spent_seconds: timeSpent,
            sections_completed: 8
          },
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update growth insights
      const insights = {
        mentoring_preparation: formData.topic_preparation,
        goals_clarity: formData.mentoring_goals,
        boundary_awareness: formData.professional_boundaries,
        growth_mindset: formData.growth_mindset
      };
      
      await updateGrowthInsightsForUser(user.id, insights);

      // Show summary
      setShowSummary(true);
      
      // Call onComplete if provided
      if (onComplete) {
        setTimeout(() => {
          onComplete(formData);
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving mentoring prep:', error);
      setErrors({ save: 'Failed to save preparation. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const generateSummary = () => {
    return `MENTORING PREPARATION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTEXT:
${formData.context_background}

MENTORING GOALS:
${formData.mentoring_goals}

SUCCESS INDICATORS:
${formData.success_indicators}

PREPARATION FOCUS:
${formData.topic_preparation}

BOUNDARIES:
${formData.professional_boundaries}

INTENTION:
${formData.intention_statement}

CONFIDENCE: ${formData.confidence_level}/10
COMMITMENT: ${formData.commitment_rating}/10
FOCUS WORD: ${formData.one_word_focus}
    `.trim();
  };

  const sections = [
    {
      title: "Mentorship Context",
      icon: <Users className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)',
              border: '1px solid rgba(107, 139, 96, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#2D5F3F' }}>
              Setting the Foundation
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              Understanding your mentoring context helps create a meaningful and impactful 
              experience for both mentor and mentee. Let's explore your unique situation.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What type of mentoring relationship is this?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'peer', label: 'Peer Mentoring' },
                { value: 'senior', label: 'Senior Mentor' },
                { value: 'reverse', label: 'Reverse Mentoring' },
                { value: 'group', label: 'Group Mentoring' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleFieldChange('mentorship_type', type.value)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    formData.mentorship_type === type.value
                      ? 'font-semibold'
                      : ''
                  }`}
                  style={{
                    backgroundColor: formData.mentorship_type === type.value 
                      ? 'rgba(107, 139, 96, 0.2)' 
                      : '#F8FBF6',
                    color: formData.mentorship_type === type.value 
                      ? '#2D5F3F' 
                      : '#5A5A5A',
                    border: `1px solid ${formData.mentorship_type === type.value ? '#6B8B60' : '#E8E5E0'}`
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What stage is this mentoring relationship?
            </label>
            <div className="flex gap-3">
              {[
                { value: 'new', label: 'New' },
                { value: 'developing', label: 'Developing' },
                { value: 'established', label: 'Established' }
              ].map((stage) => (
                <button
                  key={stage.value}
                  onClick={() => handleFieldChange('relationship_stage', stage.value)}
                  className={`px-4 py-2 rounded-lg capitalize transition-all ${
                    formData.relationship_stage === stage.value
                      ? 'font-semibold'
                      : ''
                  }`}
                  style={{
                    backgroundColor: formData.relationship_stage === stage.value 
                      ? 'rgba(107, 139, 96, 0.2)' 
                      : '#F8FBF6',
                    color: formData.relationship_stage === stage.value 
                      ? '#2D5F3F' 
                      : '#5A5A5A',
                    border: `1px solid ${formData.relationship_stage === stage.value ? '#6B8B60' : '#E8E5E0'}`
                  }}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Describe the context and background of this mentoring session
            </label>
            <textarea
              value={formData.context_background}
              onChange={(e) => handleFieldChange('context_background', e.target.value)}
              placeholder="Provide context about the mentee, situation, and objectives..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.context_background ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.context_background && (
              <p className="text-sm text-red-500 mt-1">{errors.context_background}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Goals & Expectations",
      icon: <Target className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What are your primary mentoring goals for this session?
            </label>
            <textarea
              value={formData.mentoring_goals}
              onChange={(e) => handleFieldChange('mentoring_goals', e.target.value)}
              placeholder="Define what you want to achieve through this mentoring interaction..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.mentoring_goals ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.mentoring_goals && (
              <p className="text-sm text-red-500 mt-1">{errors.mentoring_goals}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How will you know this mentoring session was successful?
            </label>
            <textarea
              value={formData.success_indicators}
              onChange={(e) => handleFieldChange('success_indicators', e.target.value)}
              placeholder="List specific outcomes or indicators of success..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.success_indicators ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.success_indicators && (
              <p className="text-sm text-red-500 mt-1">{errors.success_indicators}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How clear are expectations on both sides?
            </label>
            <textarea
              value={formData.expectations_clarity}
              onChange={(e) => handleFieldChange('expectations_clarity', e.target.value)}
              placeholder="Reflect on mutual understanding of roles and outcomes..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Knowledge & Preparation",
      icon: <BookOpen className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What topics or areas have you prepared to discuss?
            </label>
            <textarea
              value={formData.topic_preparation}
              onChange={(e) => handleFieldChange('topic_preparation', e.target.value)}
              placeholder="List topics, questions, or areas you're ready to explore..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.topic_preparation ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.topic_preparation && (
              <p className="text-sm text-red-500 mt-1">{errors.topic_preparation}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What knowledge gaps do you need to acknowledge?
            </label>
            <textarea
              value={formData.knowledge_gaps}
              onChange={(e) => handleFieldChange('knowledge_gaps', e.target.value)}
              placeholder="Identify areas where you may need additional support or information..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What resources or materials might be helpful?
            </label>
            <textarea
              value={formData.resources_needed}
              onChange={(e) => handleFieldChange('resources_needed', e.target.value)}
              placeholder="List resources, articles, tools, or references..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Communication Style",
      icon: <Heart className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What communication approach will you use?
            </label>
            <textarea
              value={formData.communication_approach}
              onChange={(e) => handleFieldChange('communication_approach', e.target.value)}
              placeholder="Describe your listening, questioning, and engagement style..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.communication_approach ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.communication_approach && (
              <p className="text-sm text-red-500 mt-1">{errors.communication_approach}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How do you prefer to give and receive feedback?
            </label>
            <textarea
              value={formData.feedback_preferences}
              onChange={(e) => handleFieldChange('feedback_preferences', e.target.value)}
              placeholder="Describe your feedback style and preferences..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How will you handle difficult conversations?
            </label>
            <textarea
              value={formData.difficult_conversations}
              onChange={(e) => handleFieldChange('difficult_conversations', e.target.value)}
              placeholder="Consider strategies for challenging topics or emotions..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Boundaries & Ethics",
      icon: <Shield className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What professional boundaries will you maintain?
            </label>
            <textarea
              value={formData.professional_boundaries}
              onChange={(e) => handleFieldChange('professional_boundaries', e.target.value)}
              placeholder="Define limits and appropriate professional distance..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.professional_boundaries ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.professional_boundaries && (
              <p className="text-sm text-red-500 mt-1">{errors.professional_boundaries}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What ethical considerations are relevant?
            </label>
            <textarea
              value={formData.ethical_considerations}
              onChange={(e) => handleFieldChange('ethical_considerations', e.target.value)}
              placeholder="Consider power dynamics, dual relationships, and ethical guidelines..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.ethical_considerations ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.ethical_considerations && (
              <p className="text-sm text-red-500 mt-1">{errors.ethical_considerations}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How will you handle confidentiality?
            </label>
            <textarea
              value={formData.confidentiality_approach}
              onChange={(e) => handleFieldChange('confidentiality_approach', e.target.value)}
              placeholder="Define what can be shared and with whom..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Growth & Development",
      icon: <Lightbulb className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What skills or areas will you focus on developing?
            </label>
            <textarea
              value={formData.skill_development_focus}
              onChange={(e) => handleFieldChange('skill_development_focus', e.target.value)}
              placeholder="Identify specific skills, competencies, or growth areas..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.skill_development_focus ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.skill_development_focus && (
              <p className="text-sm text-red-500 mt-1">{errors.skill_development_focus}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What are your specific learning objectives?
            </label>
            <textarea
              value={formData.learning_objectives}
              onChange={(e) => handleFieldChange('learning_objectives', e.target.value)}
              placeholder="Define what you or your mentee should learn..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How will you cultivate a growth mindset?
            </label>
            <textarea
              value={formData.growth_mindset}
              onChange={(e) => handleFieldChange('growth_mindset', e.target.value)}
              placeholder="Describe how you'll encourage learning and resilience..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Support & Self-Care",
      icon: <Compass className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What support strategies will you employ?
            </label>
            <textarea
              value={formData.support_strategies}
              onChange={(e) => handleFieldChange('support_strategies', e.target.value)}
              placeholder="Describe how you'll provide or seek support during mentoring..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.support_strategies ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.support_strategies && (
              <p className="text-sm text-red-500 mt-1">{errors.support_strategies}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What self-care will you practice before, during, and after?
            </label>
            <textarea
              value={formData.self_care_plan}
              onChange={(e) => handleFieldChange('self_care_plan', e.target.value)}
              placeholder="Plan how you'll maintain your wellbeing throughout..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How will you manage stress or challenging moments?
            </label>
            <textarea
              value={formData.stress_management}
              onChange={(e) => handleFieldChange('stress_management', e.target.value)}
              placeholder="Identify coping strategies for difficult situations..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Closing Commitment",
      icon: <Brain className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Craft your intention statement for this mentoring experience
            </label>
            <textarea
              value={formData.intention_statement}
              onChange={(e) => handleFieldChange('intention_statement', e.target.value)}
              placeholder="I will approach this mentoring with..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.intention_statement ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.intention_statement && (
              <p className="text-sm text-red-500 mt-1">{errors.intention_statement}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate your confidence level for this mentoring (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.confidence_level}
                onChange={(e) => handleFieldChange('confidence_level', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.confidence_level}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate your commitment to this mentoring process (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.commitment_rating}
                onChange={(e) => handleFieldChange('commitment_rating', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.commitment_rating}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Choose one word to focus on during this mentoring
            </label>
            <input
              type="text"
              value={formData.one_word_focus}
              onChange={(e) => handleFieldChange('one_word_focus', e.target.value)}
              placeholder="e.g., empathy, growth, listening, wisdom..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.one_word_focus ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.one_word_focus && (
              <p className="text-sm text-red-500 mt-1">{errors.one_word_focus}</p>
            )}
          </div>

          {showSummary && (
            <div className="mt-8">
              <p className="text-sm font-medium mb-4" style={{ color: '#2D5F3F' }}>
                Your preparation has been saved! Here's your summary:
              </p>
              
              <div 
                className="p-4 rounded-lg font-mono text-xs"
                style={{
                  backgroundColor: '#F8FBF6',
                  border: '1px solid rgba(107, 139, 96, 0.2)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {generateSummary()}
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  const currentSectionData = sections[currentSection];
  const isLastSection = currentSection === sections.length - 1;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        style={{ backgroundColor: '#FAF9F6' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-6 border-b"
          style={{ 
            borderColor: '#E8E5E0',
            background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.02) 100%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                  boxShadow: '0 2px 8px rgba(107, 139, 96, 0.3)'
                }}
              >
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  Mentoring Preparation
                </h2>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  Prepare thoughtfully for meaningful mentoring interactions
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
                    backgroundColor: index <= currentSection ? '#6B8B60' : '#E8E5E0',
                    minWidth: '30px'
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
        <div className="p-6 flex-1 overflow-y-auto">
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
          style={{ borderColor: '#E8E5E0', backgroundColor: '#FFFFFF' }}
        >
          {currentSection > 0 && (
            <button
              onClick={handlePrev}
              className="px-6 py-2 rounded-lg flex items-center transition-colors"
              style={{
                backgroundColor: '#F8FBF6',
                color: '#6B8B60',
                border: '1px solid #6B8B60'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F7F0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FBF6';
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
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(107, 139, 96, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 139, 96, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 139, 96, 0.3)';
              }}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-6 py-2 rounded-lg flex items-center transition-all"
              style={{
                background: isSaving 
                  ? '#CCCCCC' 
                  : 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                color: '#FFFFFF',
                boxShadow: isSaving 
                  ? 'none' 
                  : '0 2px 8px rgba(107, 139, 96, 0.3)',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 139, 96, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 139, 96, 0.3)';
                }
              }}
            >
              {isSaving ? (
                <>
                  <Sparkles className="w-4 h-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : showSummary ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Complete!
                </>
              ) : (
                <>
                  Complete Preparation
                  <Check className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MentoringPrepV2;