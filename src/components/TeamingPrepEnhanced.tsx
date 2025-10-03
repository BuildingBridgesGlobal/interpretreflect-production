import React, { useState, useRef, useEffect } from 'react';
import {
  X, ChevronRight, ChevronLeft, Check, 
  Monitor, MapPin, MessageSquare,
  AlertTriangle, Sparkles, Share2
} from 'lucide-react';
import { CommunityIcon, HeartPulseIcon, TargetIcon } from './CustomIcon';
import { supabase, TeamingPrepEnhancedData, ReflectionEntry } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { reflectionService } from '../services/reflectionService';

interface TeamingPrepEnhancedProps {
  onClose: () => void;
  onComplete?: (data: TeamingPrepEnhancedData) => void;
}

export const TeamingPrepEnhanced: React.FC<TeamingPrepEnhancedProps> = ({ 
  onClose, 
  onComplete 
}) => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
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
  const [formData, setFormData] = useState<TeamingPrepEnhancedData>({
    // Quick Insight
    excites_most: '',
    concerns_most: '',
    assignment_type: 'in-person',
    // Section 1
    ideal_team_dynamic: '',
    natural_role: '',
    past_experience_influence: '',
    hoped_outcomes: '',
    // Section 2
    handoff_signal: '',
    virtual_handoff_strategy: '',
    physical_cues: '',
    communication_style: '',
    feedback_preferences: '',
    boundaries_preferences: '',
    debriefing_plan: '',
    // Section 3
    typical_stressor: '',
    stress_management_plan: '',
    virtual_challenges: '',
    environmental_challenges: '',
    anticipated_obstacles: '',
    skills_to_develop: '',
    success_indicators: '',
    conflict_management: '',
    // Section 4
    unique_strengths: '',
    support_needs: '',
    transition_strategy: '',
    dynamic_not_working_plan: '',
    corrections_approach: '',
    roles_responsibilities: '',
    // Section 5
    success_description: '',
    ten_out_of_ten: '',
    specific_commitments: '',
    desired_reputation: '',
    fatigue_support_plan: '',
    // Closing
    intention_statement: '',
    confidence_rating: 5,
    feeling_word: '',
    // Metadata
    timestamp: new Date().toISOString()
  });

  const handleFieldChange = (field: keyof TeamingPrepEnhancedData, value: string | number) => {
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
      case 0: // Quick Insight
        if (!formData.excites_most.trim()) {
          newErrors.excites_most = 'Please share what excites you';
        }
        if (!formData.concerns_most.trim()) {
          newErrors.concerns_most = 'Please share your concerns';
        }
        break;
      case 1: // Team Expectations
        if (!formData.ideal_team_dynamic.trim()) {
          newErrors.ideal_team_dynamic = 'Please describe your ideal team dynamic';
        }
        if (!formData.natural_role.trim()) {
          newErrors.natural_role = 'Please describe your natural role';
        }
        break;
      case 2: // Communication Strategy
        if (!formData.handoff_signal.trim()) {
          newErrors.handoff_signal = 'Please describe your handoff signal';
        }
        if ((formData.assignment_type === 'virtual' || formData.assignment_type === 'hybrid') && !formData.virtual_handoff_strategy?.trim()) {
          newErrors.virtual_handoff_strategy = 'Please describe your virtual handoff strategy';
        }
        if ((formData.assignment_type === 'in-person' || formData.assignment_type === 'hybrid') && !formData.physical_cues?.trim()) {
          newErrors.physical_cues = 'Please describe your physical cues';
        }
        break;
      // Add more validation as needed
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

  const handleSave = async () => {
    if (hasSaved) return; // Prevent double-save

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
        // Add team_context field for getDisplayName fallback
        team_context: formData.context || formData.assignment_context || 'Team preparation'
      };

      console.log('TeamingPrepEnhanced - Saving with reflectionService');
      const result = await reflectionService.saveReflection(
        user.id,
        'teaming_prep', // Use standard entry_kind that matches reflectionTypes.ts
        finalData
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to save teaming prep');
      }

      setHasSaved(true);
      setShowSummary(true);

      setIsSaving(false);

      
      if (onComplete) {
        onComplete(finalData);
      }
      
      // Show success message for a moment then close
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error saving prep:', error);
      setErrors({ save: 'Failed to save preparation. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const generateSummary = () => {
    return `
TEAM INTERPRETING PREP SUMMARY
==============================
Assignment Type: ${formData.assignment_type}
Confidence Level: ${formData.confidence_rating}/10

KEY STRATEGIES:
• Handoff Signal: ${formData.handoff_signal}
${formData.assignment_type === 'virtual' || formData.assignment_type === 'hybrid' ? `• Virtual Strategy: ${formData.virtual_handoff_strategy}` : ''}
${formData.assignment_type === 'in-person' || formData.assignment_type === 'hybrid' ? `• Physical Cues: ${formData.physical_cues}` : ''}

MY STRENGTHS:
${formData.unique_strengths}

MY INTENTION:
${formData.intention_statement}

SUPPORT NEEDED:
${formData.support_needs}
    `.trim();
  };

  const sections = [
    {
      title: "Quick Insight Capture",
      icon: <HeartPulseIcon size={64} />,
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
              Opening Context
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              Before you begin your team interpreting assignment, let's explore your expectations, 
              concerns, and strategies for effective collaboration. Your responses here will help 
              you track your growth when you reflect later.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What excites you most about this upcoming team interpreting assignment?
            </label>
            <textarea
              value={formData.excites_most}
              onChange={(e) => handleFieldChange('excites_most', e.target.value)}
              placeholder="Share what energizes or motivates you about this team assignment..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.excites_most ? '#ef4444' : '#E8E5E0'
              }}
              aria-label="What excites you most"
            />
            {errors.excites_most && (
              <p className="text-sm text-red-500 mt-1">{errors.excites_most}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What concerns you most about working in a team interpreting context?
            </label>
            <textarea
              value={formData.concerns_most}
              onChange={(e) => handleFieldChange('concerns_most', e.target.value)}
              placeholder="Describe any worries or challenges you anticipate..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.concerns_most ? '#ef4444' : '#E8E5E0'
              }}
              aria-label="What concerns you most"
            />
            {errors.concerns_most && (
              <p className="text-sm text-red-500 mt-1">{errors.concerns_most}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Will this be a virtual or in-person assignment?
            </label>
            <div className="flex gap-3">
              {(['virtual', 'in-person', 'hybrid'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleFieldChange('assignment_type', type)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                    formData.assignment_type === type
                      ? 'border-sage-600 bg-sage-50'
                      : 'border-gray-300 hover:border-sage-400'
                  }`}
                  style={{
                    backgroundColor: formData.assignment_type === type ? 'rgba(107, 139, 96, 0.05)' : '#FFFFFF',
                    borderColor: formData.assignment_type === type ? '#6B8B60' : '#E8E5E0'
                  }}
                >
                  {type === 'virtual' && <Monitor className="w-4 h-4" />}
                  {type === 'in-person' && <MapPin className="w-4 h-4" />}
                  {type === 'hybrid' && (
                    <>
                      <Monitor className="w-4 h-4" />
                      <MapPin className="w-4 h-4" />
                    </>
                  )}
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Team Expectations & Mindset",
      icon: <CommunityIcon size={64} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How do you typically prefer to work in interpreting teams? Describe your ideal team dynamic.
            </label>
            <textarea
              value={formData.ideal_team_dynamic}
              onChange={(e) => handleFieldChange('ideal_team_dynamic', e.target.value)}
              placeholder="Describe how you work best with other interpreters..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.ideal_team_dynamic ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.ideal_team_dynamic && (
              <p className="text-sm text-red-500 mt-1">{errors.ideal_team_dynamic}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What role do you naturally gravitate toward in team interpreting settings?
            </label>
            <textarea
              value={formData.natural_role}
              onChange={(e) => handleFieldChange('natural_role', e.target.value)}
              placeholder="Are you a leader, supporter, coordinator, etc.?"
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.natural_role ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.natural_role && (
              <p className="text-sm text-red-500 mt-1">{errors.natural_role}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What past team interpreting experience (positive or negative) is influencing how you approach this assignment?
            </label>
            <textarea
              value={formData.past_experience_influence}
              onChange={(e) => handleFieldChange('past_experience_influence', e.target.value)}
              placeholder="Share relevant past experiences and their impact..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What specific outcomes do you hope to achieve through this team interpreting assignment?
            </label>
            <textarea
              value={formData.hoped_outcomes}
              onChange={(e) => handleFieldChange('hoped_outcomes', e.target.value)}
              placeholder="List your goals and desired outcomes..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Communication & Collaboration Strategy",
      icon: <MessageSquare className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How will you signal when you need help or want to hand off during the interpretation?
            </label>
            <textarea
              value={formData.handoff_signal}
              onChange={(e) => handleFieldChange('handoff_signal', e.target.value)}
              placeholder="Describe your handoff signal clearly..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.handoff_signal ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.handoff_signal && (
              <p className="text-sm text-red-500 mt-1">{errors.handoff_signal}</p>
            )}
          </div>

          {(formData.assignment_type === 'virtual' || formData.assignment_type === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                For virtual: How will you manage handoffs and support without visual cues?
              </label>
              <textarea
                value={formData.virtual_handoff_strategy}
                onChange={(e) => handleFieldChange('virtual_handoff_strategy', e.target.value)}
                placeholder="Describe your virtual communication strategy..."
                rows={2}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
                style={{
                  borderColor: errors.virtual_handoff_strategy ? '#ef4444' : '#E8E5E0'
                }}
              />
              {errors.virtual_handoff_strategy && (
                <p className="text-sm text-red-500 mt-1">{errors.virtual_handoff_strategy}</p>
              )}
            </div>
          )}

          {(formData.assignment_type === 'in-person' || formData.assignment_type === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                For in-person: What physical or visual cues will you use with your team?
              </label>
              <textarea
                value={formData.physical_cues}
                onChange={(e) => handleFieldChange('physical_cues', e.target.value)}
                placeholder="Describe your physical signaling methods..."
                rows={2}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
                style={{
                  borderColor: errors.physical_cues ? '#ef4444' : '#E8E5E0'
                }}
              />
              {errors.physical_cues && (
                <p className="text-sm text-red-500 mt-1">{errors.physical_cues}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What communication style works best for you in interpreting teams?
            </label>
            <textarea
              value={formData.communication_style}
              onChange={(e) => handleFieldChange('communication_style', e.target.value)}
              placeholder="Direct, supportive, collaborative, etc..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How do you prefer to give and receive feedback during and after assignments?
            </label>
            <textarea
              value={formData.feedback_preferences}
              onChange={(e) => handleFieldChange('feedback_preferences', e.target.value)}
              placeholder="Describe your feedback preferences..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What boundaries or working preferences do you want to establish?
            </label>
            <textarea
              value={formData.boundaries_preferences}
              onChange={(e) => handleFieldChange('boundaries_preferences', e.target.value)}
              placeholder="List your boundaries and non-negotiables..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Team Debriefing Plan
            </label>
            <textarea
              value={formData.debriefing_plan}
              onChange={(e) => handleFieldChange('debriefing_plan', e.target.value)}
              placeholder="After the assignment, how will we come together to debrief as a team? Who will initiate or lead the debrief? What format will we use (quick check-in, structured reflection, written notes, etc.)? When and where will the debrief take place?"
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Anticipated Challenges & Preparation",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What aspect of team interpreting typically stresses you most?
            </label>
            <textarea
              value={formData.typical_stressor}
              onChange={(e) => handleFieldChange('typical_stressor', e.target.value)}
              placeholder="Identify your main stressor..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How do you plan to manage this stress?
            </label>
            <textarea
              value={formData.stress_management_plan}
              onChange={(e) => handleFieldChange('stress_management_plan', e.target.value)}
              placeholder="Describe your stress management strategy..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          {(formData.assignment_type === 'virtual' || formData.assignment_type === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                For virtual: What technical or communication challenges do you anticipate?
              </label>
              <textarea
                value={formData.virtual_challenges}
                onChange={(e) => handleFieldChange('virtual_challenges', e.target.value)}
                placeholder="List potential virtual challenges..."
                rows={2}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          )}

          {(formData.assignment_type === 'in-person' || formData.assignment_type === 'hybrid') && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                For in-person: What environmental or positioning challenges might arise?
              </label>
              <textarea
                value={formData.environmental_challenges}
                onChange={(e) => handleFieldChange('environmental_challenges', e.target.value)}
                placeholder="List potential physical environment challenges..."
                rows={2}
                className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What potential conflicts or obstacles do you anticipate during the assignment?
            </label>
            <textarea
              value={formData.anticipated_obstacles}
              onChange={(e) => handleFieldChange('anticipated_obstacles', e.target.value)}
              placeholder="Identify potential challenges..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What specific interpreting skills do you want to develop through this team experience?
            </label>
            <textarea
              value={formData.skills_to_develop}
              onChange={(e) => handleFieldChange('skills_to_develop', e.target.value)}
              placeholder="List skills you want to improve..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How will you know if your interpreting team is functioning well?
            </label>
            <textarea
              value={formData.success_indicators}
              onChange={(e) => handleFieldChange('success_indicators', e.target.value)}
              placeholder="Describe indicators of good teamwork..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Addressing Disagreements or Conflicts
            </label>
            <textarea
              value={formData.conflict_management}
              onChange={(e) => handleFieldChange('conflict_management', e.target.value)}
              placeholder="How will we address disagreements or conflicts if they arise during the assignment? What ground rules or communication strategies will help us resolve issues constructively? When would we pause the assignment to address a conflict, and how will we do so respectfully?"
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Personal Contribution Planning",
      icon: <TargetIcon size={64} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What unique strengths will you bring to this interpreting team?
            </label>
            <textarea
              value={formData.unique_strengths}
              onChange={(e) => handleFieldChange('unique_strengths', e.target.value)}
              placeholder="List your strengths and abilities..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Where might you need support from your team interpreter(s)?
            </label>
            <textarea
              value={formData.support_needs}
              onChange={(e) => handleFieldChange('support_needs', e.target.value)}
              placeholder="Be honest about where you need help..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How will you ensure smooth transitions and maintain message accuracy?
            </label>
            <textarea
              value={formData.transition_strategy}
              onChange={(e) => handleFieldChange('transition_strategy', e.target.value)}
              placeholder="Describe your transition strategy..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What will you do if the team dynamic isn't working during the assignment?
            </label>
            <textarea
              value={formData.dynamic_not_working_plan}
              onChange={(e) => handleFieldChange('dynamic_not_working_plan', e.target.value)}
              placeholder="Describe your backup plan..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How will you handle corrections or clarifications as a team?
            </label>
            <textarea
              value={formData.corrections_approach}
              onChange={(e) => handleFieldChange('corrections_approach', e.target.value)}
              placeholder="Describe your approach to corrections..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Roles and Responsibilities
            </label>
            <textarea
              value={formData.roles_responsibilities}
              onChange={(e) => handleFieldChange('roles_responsibilities', e.target.value)}
              placeholder="How will we divide or rotate key roles and responsibilities before, during, and after the assignment? Who will handle preparation, monitoring, switching, and note-taking? Are there any specialized tasks or leadership roles we need to clarify?"
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Success Vision",
      icon: <Sparkles className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Describe what successful team interpreting looks like to you
            </label>
            <textarea
              value={formData.success_description}
              onChange={(e) => handleFieldChange('success_description', e.target.value)}
              placeholder="Paint a picture of success..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What would make you rate this interpreting assignment a 10/10?
            </label>
            <textarea
              value={formData.ten_out_of_ten}
              onChange={(e) => handleFieldChange('ten_out_of_ten', e.target.value)}
              placeholder="Describe the perfect outcome..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What specific behaviors or practices will you commit to during the assignment?
            </label>
            <textarea
              value={formData.specific_commitments}
              onChange={(e) => handleFieldChange('specific_commitments', e.target.value)}
              placeholder="List your commitments..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How do you want your interpreting partner(s) to remember your contribution?
            </label>
            <textarea
              value={formData.desired_reputation}
              onChange={(e) => handleFieldChange('desired_reputation', e.target.value)}
              placeholder="Describe the impression you want to leave..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How will you support each other if fatigue or challenges arise?
            </label>
            <textarea
              value={formData.fatigue_support_plan}
              onChange={(e) => handleFieldChange('fatigue_support_plan', e.target.value)}
              placeholder="Describe your mutual support plan..."
              rows={2}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Closing Commitment",
      icon: <Check className="w-5 h-5" />,
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
              Your Commitment
            </h3>
            <p className="mb-4" style={{ color: '#5A5A5A' }}>
              Based on your reflection, write one intention statement for how you'll show up in this team interpreting assignment.
            </p>
            
            <textarea
              value={formData.intention_statement}
              onChange={(e) => handleFieldChange('intention_statement', e.target.value)}
              placeholder="I commit to..."
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

          <div 
            className="p-6 rounded-xl"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(107, 139, 96, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#2D5F3F' }}>
              Pre-Assignment Confidence Check
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                  How confident do you feel about the upcoming team interpreting assignment? (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.confidence_rating}
                    onChange={(e) => handleFieldChange('confidence_rating', Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#6B8B60' }}
                  />
                  <span className="w-12 text-center font-semibold" style={{ color: '#1A1A1A' }}>
                    {formData.confidence_rating}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
                  In one word, how are you feeling about starting this team interpreting experience?
                </label>
                <input
                  type="text"
                  value={formData.feeling_word}
                  onChange={(e) => handleFieldChange('feeling_word', e.target.value)}
                  placeholder="Enter one word..."
                  maxLength={30}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sage-500"
                />
              </div>
            </div>
          </div>

          {showSummary && (
            <div 
              className="p-6 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)',
                border: '2px solid rgba(107, 139, 96, 0.3)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: '#2D5F3F' }}>
                  ✅ Preparation Complete!
                </h3>
                <button
                  onClick={() => {
                    const summary = generateSummary();
                    navigator.clipboard.writeText(summary);
                    alert('Summary copied to clipboard!');
                  }}
                  className="flex items-center space-x-2 px-3 py-1 rounded-lg"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #6B8B60',
                    color: '#6B8B60'
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Copy Summary</span>
                </button>
              </div>
              
              <p className="mb-4" style={{ color: '#5A5A5A' }}>
                Your preparation has been saved. You'll revisit these responses in your reflection after the assignment.
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
                <CommunityIcon size={64} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  Team Interpreting Preparation
                </h2>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  Setting intentions for effective collaboration
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
              onClick={handleSave}
              disabled={isSaving || hasSaved || showSummary}
              className="px-6 py-2 rounded-lg flex items-center transition-all"
              style={{
                background: isSaving || showSummary
                  ? 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)'
                  : 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(107, 139, 96, 0.3)',
                cursor: isSaving || showSummary ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isSaving && !showSummary) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 139, 96, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving && !showSummary) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 139, 96, 0.3)';
                }
              }}
            >
              <Check className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : showSummary ? 'Complete!' : 'Complete Preparation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamingPrepEnhanced;