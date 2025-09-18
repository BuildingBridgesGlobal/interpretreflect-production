import React, { useState } from 'react';
import {
import { directInsertReflection } from '../services/directSupabaseApi';
  X, Users, ChevronRight, ChevronLeft, Save, Target, HelpCircle,
  Heart, Shield, Zap, CheckCircle, Copy, MessageSquare
} from 'lucide-react';
import { supabase, MentoringPrepData, ReflectionEntry } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MentoringPrepEnhancedProps {
  onComplete?: (data: MentoringPrepData) => void;
  onClose: () => void;
}

export const MentoringPrepEnhanced: React.FC<MentoringPrepEnhancedProps> = ({ 
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
  const [formData, setFormData] = useState<MentoringPrepData>({
    // Quick Insight Capture
    mentoring_type: 'career_guidance',
    meeting_format: 'in-person',
    seeking_reason: '',
    
    // Section 1: Clarifying Your Ask
    specific_situation: '',
    context_needed: '',
    already_tried: '',
    whats_at_stake: '',
    urgency_level: '',
    
    // Section 2: Defining Success
    success_definition: '',
    hoped_outcomes: '',
    success_indicators: '',
    support_type_needed: '',
    what_not_wanted: '',
    
    // Section 3: Preparation & Questions
    top_questions: ['', '', '', '', ''],
    materials_to_share: '',
    difficult_topics: '',
    patterns_to_explore: '',
    assumptions_to_check: '',
    
    // Section 4: Openness & Boundaries
    feedback_openness: 7,
    valuable_feedback_type: '',
    conversation_boundaries: '',
    off_limits_topics: '',
    directness_preference: '',
    
    // Section 5: Action Readiness
    ready_to_commit: '',
    implementation_resources: '',
    potential_blockers: '',
    progress_tracking_plan: '',
    followup_timeline: '',
    
    // Pre-Mentoring State Check
    needs_articulation_confidence: 5,
    openness_to_perspectives: 7,
    emotional_readiness: 5,
    current_stress_level: 5,
    current_state_word: '',
    
    // Closing Intention
    clear_request: '',
    offering_in_return: '',
    
    // Metadata
    session_id: `mentoring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  });

  const handleFieldChange = (field: keyof MentoringPrepData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    const questions = [...formData.top_questions];
    questions[index] = value;
    handleFieldChange('top_questions', questions);
  };

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (sectionIndex) {
      case 0: // Quick Insight
        if (!formData.seeking_reason.trim()) {
          newErrors.seeking_reason = 'Please explain why you\'re seeking mentoring';
        }
        break;
      case 1: // Clarifying Your Ask
        if (!formData.specific_situation.trim()) {
          newErrors.specific_situation = 'Please describe your situation';
        }
        if (!formData.context_needed.trim()) {
          newErrors.context_needed = 'Please provide context';
        }
        break;
      case 2: // Defining Success
        if (!formData.success_definition.trim()) {
          newErrors.success_definition = 'Please define success for this session';
        }
        if (!formData.hoped_outcomes.trim()) {
          newErrors.hoped_outcomes = 'Please describe your hoped outcomes';
        }
        break;
      case 3: // Preparation & Questions
        const filledQuestions = formData.top_questions.filter(q => q.trim()).length;
        if (filledQuestions < 3) {
          newErrors.top_questions = 'Please provide at least 3 questions';
        }
        break;
      case 4: // Openness & Boundaries
        if (!formData.valuable_feedback_type.trim()) {
          newErrors.valuable_feedback_type = 'Please describe valuable feedback';
        }
        break;
      case 5: // Action Readiness
        if (!formData.ready_to_commit.trim()) {
          newErrors.ready_to_commit = 'Please describe what you\'re ready to commit to';
        }
        if (!formData.followup_timeline.trim()) {
          newErrors.followup_timeline = 'Please specify follow-up timeline';
        }
        break;
      case 6: // State Check
        if (!formData.current_state_word.trim()) {
          newErrors.current_state_word = 'Please provide one word';
        }
        break;
      case 7: // Closing Intention
        if (!formData.clear_request.trim()) {
          newErrors.clear_request = 'Please write your request';
        }
        if (!formData.offering_in_return.trim()) {
          newErrors.offering_in_return = 'Please describe what you\'ll offer';
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
    const questions = formData.top_questions.filter(q => q.trim()).join('\n• ');
    
    const summary = `MENTORING PREP SUMMARY
    
Session Type: ${formData.mentoring_type.replace('_', ' ')} (${formData.meeting_format})
Current State: ${formData.current_state_word}

MY SITUATION:
${formData.specific_situation}

SUCCESS LOOKS LIKE:
${formData.success_definition}

MY KEY QUESTIONS:
• ${questions}

WHAT I NEED:
${formData.support_type_needed}

MY REQUEST:
${formData.clear_request}

WHAT I'M OFFERING:
${formData.offering_in_return}

READY TO COMMIT TO:
${formData.ready_to_commit}

FOLLOW-UP PLAN:
${formData.followup_timeline}

State Check:
• Confidence in articulating needs: ${formData.needs_articulation_confidence}/10
• Openness to perspectives: ${formData.openness_to_perspectives}/10
• Emotional readiness: ${formData.emotional_readiness}/10
• Current stress: ${formData.current_stress_level}/10

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
        completion_time: duration
      };

      const entry: ReflectionEntry = {
        user_id: user.id,
        reflection_id: `mentoring_prep_${Date.now()}`,
        entry_kind: 'mentoring_prep',
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
    } catch (error) {
      console.error('Error saving mentoring prep:', error);
      setErrors({ save: 'Failed to save preparation. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    {
      title: "Quick Insight Capture",
      icon: <MessageSquare className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#7C3AED' }}>
              Opening Context
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              Before your mentoring session, let's clarify your goals, prepare your questions, 
              and set intentions for a productive conversation. This preparation will maximize 
              the value of your mentoring time.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  What type of mentoring is this?
                </label>
                <select
                  value={formData.mentoring_type}
                  onChange={(e) => handleFieldChange('mentoring_type', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <option value="career_guidance">Career Guidance</option>
                  <option value="skill_development">Skill Development</option>
                  <option value="problem_solving">Problem Solving</option>
                  <option value="emotional_support">Emotional Support</option>
                  <option value="other">Other</option>
                </select>
                {formData.mentoring_type === 'other' && (
                  <input
                    type="text"
                    value={formData.mentoring_type_other || ''}
                    onChange={(e) => handleFieldChange('mentoring_type_other', e.target.value)}
                    placeholder="Please specify..."
                    className="w-full mt-2 px-4 py-2 border rounded-lg"
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  Meeting format?
                </label>
                <select
                  value={formData.meeting_format}
                  onChange={(e) => handleFieldChange('meeting_format', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <option value="in-person">In-Person</option>
                  <option value="virtual">Virtual</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                What prompted you to seek mentoring at this time?
              </label>
              <textarea
                value={formData.seeking_reason}
                onChange={(e) => handleFieldChange('seeking_reason', e.target.value)}
                placeholder="Describe what's driving your need for mentoring right now..."
                rows={3}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
                style={{
                  borderColor: errors.seeking_reason ? '#ef4444' : '#E5E7EB'
                }}
              />
              {errors.seeking_reason && (
                <p className="text-sm text-red-500 mt-1">{errors.seeking_reason}</p>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Clarifying Your Ask",
      icon: <HelpCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What specific situation or challenge brings you to mentoring today?
            </label>
            <textarea
              value={formData.specific_situation}
              onChange={(e) => handleFieldChange('specific_situation', e.target.value)}
              placeholder="Describe the specific situation you need help with..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
              style={{
                borderColor: errors.specific_situation ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.specific_situation && (
              <p className="text-sm text-red-500 mt-1">{errors.specific_situation}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What context does your mentor need to understand your situation?
            </label>
            <textarea
              value={formData.context_needed}
              onChange={(e) => handleFieldChange('context_needed', e.target.value)}
              placeholder="Provide background information and relevant context..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
              style={{
                borderColor: errors.context_needed ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.context_needed && (
              <p className="text-sm text-red-500 mt-1">{errors.context_needed}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What have you already tried or considered?
            </label>
            <textarea
              value={formData.already_tried}
              onChange={(e) => handleFieldChange('already_tried', e.target.value)}
              placeholder="List approaches you've already attempted..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What's at stake for you in this situation?
            </label>
            <textarea
              value={formData.whats_at_stake}
              onChange={(e) => handleFieldChange('whats_at_stake', e.target.value)}
              placeholder="Describe the importance and potential impact..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              How urgent is resolution or progress on this issue?
            </label>
            <textarea
              value={formData.urgency_level}
              onChange={(e) => handleFieldChange('urgency_level', e.target.value)}
              placeholder="Describe timelines and urgency factors..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Defining Success",
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What would a successful mentoring session look like for you?
            </label>
            <textarea
              value={formData.success_definition}
              onChange={(e) => handleFieldChange('success_definition', e.target.value)}
              placeholder="Describe your ideal outcome from this session..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
              style={{
                borderColor: errors.success_definition ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.success_definition && (
              <p className="text-sm text-red-500 mt-1">{errors.success_definition}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What specific outcomes or insights are you hoping for?
            </label>
            <textarea
              value={formData.hoped_outcomes}
              onChange={(e) => handleFieldChange('hoped_outcomes', e.target.value)}
              placeholder="List specific outcomes you're seeking..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
              style={{
                borderColor: errors.hoped_outcomes ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.hoped_outcomes && (
              <p className="text-sm text-red-500 mt-1">{errors.hoped_outcomes}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              How will you know if you've gotten what you need?
            </label>
            <textarea
              value={formData.success_indicators}
              onChange={(e) => handleFieldChange('success_indicators', e.target.value)}
              placeholder="Describe how you'll measure success..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What type of support would be most helpful? (advice, validation, accountability, connections, other)
            </label>
            <textarea
              value={formData.support_type_needed}
              onChange={(e) => handleFieldChange('support_type_needed', e.target.value)}
              placeholder="Describe the type of support you need..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What don't you want from this session?
            </label>
            <textarea
              value={formData.what_not_wanted}
              onChange={(e) => handleFieldChange('what_not_wanted', e.target.value)}
              placeholder="Identify what wouldn't be helpful..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Preparation & Questions",
      icon: <HelpCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              List your top 3-5 specific questions for your mentor
            </label>
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((index) => (
                <input
                  key={index}
                  type="text"
                  value={formData.top_questions[index] || ''}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  placeholder={`Question ${index + 1}${index < 3 ? ' (required)' : ' (optional)'}...`}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  style={{
                    borderColor: errors.top_questions && index < 3 && !formData.top_questions[index]?.trim() 
                      ? '#ef4444' 
                      : '#E5E7EB'
                  }}
                />
              ))}
              {errors.top_questions && (
                <p className="text-sm text-red-500">{errors.top_questions}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What materials or information should you share beforehand?
            </label>
            <textarea
              value={formData.materials_to_share}
              onChange={(e) => handleFieldChange('materials_to_share', e.target.value)}
              placeholder="List documents, data, or context to share..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What might be hard for you to talk about but important to address?
            </label>
            <textarea
              value={formData.difficult_topics}
              onChange={(e) => handleFieldChange('difficult_topics', e.target.value)}
              placeholder="Identify sensitive but important topics..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What patterns have you noticed that you want to explore?
            </label>
            <textarea
              value={formData.patterns_to_explore}
              onChange={(e) => handleFieldChange('patterns_to_explore', e.target.value)}
              placeholder="Describe recurring patterns or themes..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What assumptions are you making that need checking?
            </label>
            <textarea
              value={formData.assumptions_to_check}
              onChange={(e) => handleFieldChange('assumptions_to_check', e.target.value)}
              placeholder="List assumptions to validate or challenge..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Openness & Boundaries",
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              How open are you to feedback that might be difficult to hear? (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.feedback_openness}
                onChange={(e) => handleFieldChange('feedback_openness', Number(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#A855F7' }}
              />
              <span className="w-12 text-center font-semibold text-lg" style={{ color: '#1A1A1A' }}>
                {formData.feedback_openness}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              1 = Very guarded, 10 = Completely open
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What feedback or advice would you find most valuable?
            </label>
            <textarea
              value={formData.valuable_feedback_type}
              onChange={(e) => handleFieldChange('valuable_feedback_type', e.target.value)}
              placeholder="Describe the type of feedback that would help most..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
              style={{
                borderColor: errors.valuable_feedback_type ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.valuable_feedback_type && (
              <p className="text-sm text-red-500 mt-1">{errors.valuable_feedback_type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What boundaries do you need to maintain in this conversation?
            </label>
            <textarea
              value={formData.conversation_boundaries}
              onChange={(e) => handleFieldChange('conversation_boundaries', e.target.value)}
              placeholder="Identify personal or professional boundaries..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What topics are off-limits or need careful handling?
            </label>
            <textarea
              value={formData.off_limits_topics}
              onChange={(e) => handleFieldChange('off_limits_topics', e.target.value)}
              placeholder="List sensitive or private topics..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              How direct do you want your mentor to be?
            </label>
            <textarea
              value={formData.directness_preference}
              onChange={(e) => handleFieldChange('directness_preference', e.target.value)}
              placeholder="Describe your preference for directness vs. gentleness..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Action Readiness",
      icon: <Zap className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What are you ready to commit to after this session?
            </label>
            <textarea
              value={formData.ready_to_commit}
              onChange={(e) => handleFieldChange('ready_to_commit', e.target.value)}
              placeholder="Describe actions you're prepared to take..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
              style={{
                borderColor: errors.ready_to_commit ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.ready_to_commit && (
              <p className="text-sm text-red-500 mt-1">{errors.ready_to_commit}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What resources or support do you have for implementation?
            </label>
            <textarea
              value={formData.implementation_resources}
              onChange={(e) => handleFieldChange('implementation_resources', e.target.value)}
              placeholder="List available resources and support systems..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              What might prevent you from taking action on advice?
            </label>
            <textarea
              value={formData.potential_blockers}
              onChange={(e) => handleFieldChange('potential_blockers', e.target.value)}
              placeholder="Identify potential obstacles or resistance..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              How will you track progress on insights gained?
            </label>
            <textarea
              value={formData.progress_tracking_plan}
              onChange={(e) => handleFieldChange('progress_tracking_plan', e.target.value)}
              placeholder="Describe your tracking and accountability plan..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
              When will you follow up with your mentor?
            </label>
            <textarea
              value={formData.followup_timeline}
              onChange={(e) => handleFieldChange('followup_timeline', e.target.value)}
              placeholder="Specify follow-up timeline and method..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
              style={{
                borderColor: errors.followup_timeline ? '#ef4444' : '#E5E7EB'
              }}
            />
            {errors.followup_timeline && (
              <p className="text-sm text-red-500 mt-1">{errors.followup_timeline}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Pre-Mentoring State Check",
      icon: <Heart className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#7C3AED' }}>
              State Assessment
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  Confidence in articulating your needs (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.needs_articulation_confidence}
                    onChange={(e) => handleFieldChange('needs_articulation_confidence', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#A855F7' }}
                  />
                  <span className="w-12 text-center font-semibold text-lg" style={{ color: '#1A1A1A' }}>
                    {formData.needs_articulation_confidence}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  Openness to new perspectives (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.openness_to_perspectives}
                    onChange={(e) => handleFieldChange('openness_to_perspectives', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#A855F7' }}
                  />
                  <span className="w-12 text-center font-semibold text-lg" style={{ color: '#1A1A1A' }}>
                    {formData.openness_to_perspectives}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  Emotional readiness for feedback (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.emotional_readiness}
                    onChange={(e) => handleFieldChange('emotional_readiness', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#A855F7' }}
                  />
                  <span className="w-12 text-center font-semibold text-lg" style={{ color: '#1A1A1A' }}>
                    {formData.emotional_readiness}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  Current stress about the situation (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.current_stress_level}
                    onChange={(e) => handleFieldChange('current_stress_level', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: formData.current_stress_level >= 7 ? '#EF4444' : '#A855F7' }}
                  />
                  <span className="w-12 text-center font-semibold text-lg" style={{ 
                    color: formData.current_stress_level >= 7 ? '#EF4444' : '#1A1A1A' 
                  }}>
                    {formData.current_stress_level}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  One word describing your current state
                </label>
                <input
                  type="text"
                  value={formData.current_state_word}
                  onChange={(e) => handleFieldChange('current_state_word', e.target.value)}
                  placeholder="Enter one word..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  style={{
                    borderColor: errors.current_state_word ? '#ef4444' : '#E5E7EB'
                  }}
                />
                {errors.current_state_word && (
                  <p className="text-sm text-red-500 mt-1">{errors.current_state_word}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Closing Intention",
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#7C3AED' }}>
              Your Commitments
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              Write one clear request you'll make of your mentor and one thing you'll offer or share in return.
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  My clear request to my mentor:
                </label>
                <textarea
                  value={formData.clear_request}
                  onChange={(e) => handleFieldChange('clear_request', e.target.value)}
                  placeholder="Write a specific, clear request..."
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
                  style={{
                    borderColor: errors.clear_request ? '#ef4444' : '#E5E7EB'
                  }}
                />
                {errors.clear_request && (
                  <p className="text-sm text-red-500 mt-1">{errors.clear_request}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#7C3AED' }}>
                  What I'll offer or share in return:
                </label>
                <textarea
                  value={formData.offering_in_return}
                  onChange={(e) => handleFieldChange('offering_in_return', e.target.value)}
                  placeholder="Describe what you'll contribute to the relationship..."
                  rows={3}
                  className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
                  style={{
                    borderColor: errors.offering_in_return ? '#ef4444' : '#E5E7EB'
                  }}
                />
                {errors.offering_in_return && (
                  <p className="text-sm text-red-500 mt-1">{errors.offering_in_return}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-sm text-purple-700">
              <strong>Remember:</strong> Share this preparation summary with your mentor if appropriate. 
              It will help them understand your needs and make the session more productive.
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
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, #A855F7 0%, #8B5CF6 100%)',
                    boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)'
                  }}
                >
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                    Mentoring Preparation
                  </h2>
                  <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                    Preparing for your mentoring session
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
                      backgroundColor: index <= currentSection ? '#A855F7' : '#E5E7EB',
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
                  color: '#A855F7',
                  border: '1px solid #A855F7'
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
                  background: 'linear-gradient(145deg, #A855F7 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)'
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
                    : 'linear-gradient(145deg, #A855F7 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)',
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
                Mentoring Prep Summary
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(summaryText);
                  setCopiedSummary(true);
                  setTimeout(() => setCopiedSummary(false), 2000);
                }}
                className="px-4 py-2 rounded-lg flex items-center transition-all"
                style={{
                  backgroundColor: copiedSummary ? '#10B981' : '#A855F7',
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
                  background: 'linear-gradient(145deg, #A855F7 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)'
                }}
              >
                Complete & Close
              </button>
              
              <p className="text-center text-sm text-gray-600">
                Consider sharing this summary with your mentor for a more productive session
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MentoringPrepEnhanced;