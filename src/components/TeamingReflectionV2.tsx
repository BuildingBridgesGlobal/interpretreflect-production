/**
 * Teaming Reflection V2 Component
 * 
 * Matches exact design pattern of Pre-Assignment Prep, Post-Assignment Debrief, and Teaming Prep
 * with sage green color scheme and consistent styling
 * 
 * @module TeamingReflectionV2
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Users,
  Heart,
  MessageSquare,
  Zap,
  Shield,
  Target,
  Lightbulb,
  Award,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { updateGrowthInsightsForUser } from '../services/growthInsightsService';

interface TeamingReflectionV2Props {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

/**
 * Main Component
 */
export function TeamingReflectionV2({ onClose, onComplete }: TeamingReflectionV2Props) {
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
    // Section 1: Team Dynamics Assessment
    team_cohesion: '',
    collaboration_quality: 5,
    team_strengths: '',
    
    // Section 2: Communication Flow
    communication_effectiveness: '',
    handoff_success: '',
    signal_clarity: '',
    
    // Section 3: Individual Contributions
    my_contributions: '',
    partner_contributions: '',
    role_clarity: '',
    
    // Section 4: Challenges & Solutions
    challenges_encountered: '',
    resolution_strategies: '',
    unresolved_issues: '',
    
    // Section 5: Support & Trust
    support_given: '',
    support_received: '',
    trust_level: 5,
    psychological_safety: '',
    
    // Peer Feedback (added after Support & Trust)
    constructive_feedback: '',
    partner_strengths: '',
    partner_improvements: '',
    
    // Section 6: Learning & Growth
    team_learnings: '',
    personal_growth: '',
    skills_developed: '',
    
    // Section 7: Future Improvements
    improvement_suggestions: '',
    process_refinements: '',
    training_needs: '',
    
    // Section 8: Closing Appreciation
    appreciation_message: '',
    team_success_rating: 5,
    would_team_again: 'yes',
    one_word_description: '',
    
    // Metadata
    assignment_date: new Date().toISOString().split('T')[0],
    team_size: 2,
    assignment_type: '',
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
      case 0: // Team Dynamics
        if (!formData.team_cohesion.trim()) {
          newErrors.team_cohesion = 'Please describe team cohesion';
        }
        if (!formData.team_strengths.trim()) {
          newErrors.team_strengths = 'Please identify team strengths';
        }
        break;
      
      case 1: // Communication Flow
        if (!formData.communication_effectiveness.trim()) {
          newErrors.communication_effectiveness = 'Please describe communication effectiveness';
        }
        if (!formData.handoff_success.trim()) {
          newErrors.handoff_success = 'Please reflect on handoffs';
        }
        break;
      
      case 2: // Individual Contributions
        if (!formData.my_contributions.trim()) {
          newErrors.my_contributions = 'Please describe your contributions';
        }
        if (!formData.partner_contributions.trim()) {
          newErrors.partner_contributions = 'Please acknowledge partner contributions';
        }
        break;
      
      case 3: // Challenges & Solutions
        if (!formData.challenges_encountered.trim()) {
          newErrors.challenges_encountered = 'Please describe challenges faced';
        }
        break;
      
      case 4: // Support & Trust
        if (!formData.support_given.trim()) {
          newErrors.support_given = 'Please describe support you provided';
        }
        if (!formData.psychological_safety.trim()) {
          newErrors.psychological_safety = 'Please reflect on psychological safety';
        }
        break;
      
      case 5: // Peer Feedback
        // All fields are optional in this section
        break;
      
      case 6: // Learning & Growth
        if (!formData.team_learnings.trim()) {
          newErrors.team_learnings = 'Please share team learnings';
        }
        break;
      
      case 7: // Future Improvements
        if (!formData.improvement_suggestions.trim()) {
          newErrors.improvement_suggestions = 'Please suggest improvements';
        }
        break;
      
      case 8: // Closing Appreciation
        if (!formData.appreciation_message.trim()) {
          newErrors.appreciation_message = 'Please share appreciation';
        }
        if (!formData.one_word_description.trim()) {
          newErrors.one_word_description = 'Please provide one word';
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
        .from('teaming_reflections')
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          reflection_type: 'teaming_reflection',
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
        team_collaboration: formData.team_cohesion,
        communication_skills: formData.communication_effectiveness,
        team_learnings: formData.team_learnings,
        areas_for_growth: formData.improvement_suggestions
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
      console.error('Error saving reflection:', error);
      setErrors({ save: 'Failed to save reflection. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const generateSummary = () => {
    return `TEAMING REFLECTION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEAM COHESION:
${formData.team_cohesion}

MY CONTRIBUTIONS:
${formData.my_contributions}

KEY CHALLENGES:
${formData.challenges_encountered}

TEAM LEARNINGS:
${formData.team_learnings}

IMPROVEMENTS NEEDED:
${formData.improvement_suggestions}

APPRECIATION:
${formData.appreciation_message}

TEAM SUCCESS: ${formData.team_success_rating}/10
WOULD TEAM AGAIN: ${formData.would_team_again}
IN ONE WORD: ${formData.one_word_description}
    `.trim();
  };

  const sections = [
    {
      title: "Team Dynamics Assessment",
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
              Reflecting on Your Team Experience
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              Let's explore how your team worked together and what made your collaboration effective. 
              Your insights help build stronger teams in the future.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How would you describe the overall team cohesion and synergy?
            </label>
            <textarea
              value={formData.team_cohesion}
              onChange={(e) => handleFieldChange('team_cohesion', e.target.value)}
              placeholder="Describe how well your team worked together..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.team_cohesion ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.team_cohesion && (
              <p className="text-sm text-red-500 mt-1">{errors.team_cohesion}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate your collaboration quality (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.collaboration_quality}
                onChange={(e) => handleFieldChange('collaboration_quality', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.collaboration_quality}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What were your team's greatest strengths?
            </label>
            <textarea
              value={formData.team_strengths}
              onChange={(e) => handleFieldChange('team_strengths', e.target.value)}
              placeholder="Identify what your team did particularly well..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.team_strengths ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.team_strengths && (
              <p className="text-sm text-red-500 mt-1">{errors.team_strengths}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Communication Flow",
      icon: <MessageSquare className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How effective was communication between team members?
            </label>
            <textarea
              value={formData.communication_effectiveness}
              onChange={(e) => handleFieldChange('communication_effectiveness', e.target.value)}
              placeholder="Describe clarity, timing, and understanding..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.communication_effectiveness ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.communication_effectiveness && (
              <p className="text-sm text-red-500 mt-1">{errors.communication_effectiveness}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How well did handoffs and transitions work?
            </label>
            <textarea
              value={formData.handoff_success}
              onChange={(e) => handleFieldChange('handoff_success', e.target.value)}
              placeholder="Reflect on smooth transitions and any hiccups..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.handoff_success ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.handoff_success && (
              <p className="text-sm text-red-500 mt-1">{errors.handoff_success}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Were signals and cues clear and understood?
            </label>
            <textarea
              value={formData.signal_clarity}
              onChange={(e) => handleFieldChange('signal_clarity', e.target.value)}
              placeholder="Describe how well non-verbal communication worked..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Individual Contributions",
      icon: <Award className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What were your key contributions to the team?
            </label>
            <textarea
              value={formData.my_contributions}
              onChange={(e) => handleFieldChange('my_contributions', e.target.value)}
              placeholder="Describe your role and what you brought to the team..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.my_contributions ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.my_contributions && (
              <p className="text-sm text-red-500 mt-1">{errors.my_contributions}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What valuable contributions did your partner(s) make?
            </label>
            <textarea
              value={formData.partner_contributions}
              onChange={(e) => handleFieldChange('partner_contributions', e.target.value)}
              placeholder="Acknowledge your team members' strengths and efforts..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.partner_contributions ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.partner_contributions && (
              <p className="text-sm text-red-500 mt-1">{errors.partner_contributions}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How clear were roles and responsibilities?
            </label>
            <textarea
              value={formData.role_clarity}
              onChange={(e) => handleFieldChange('role_clarity', e.target.value)}
              placeholder="Reflect on role definition and any overlaps or gaps..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Challenges & Solutions",
      icon: <Zap className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What challenges did your team encounter?
            </label>
            <textarea
              value={formData.challenges_encountered}
              onChange={(e) => handleFieldChange('challenges_encountered', e.target.value)}
              placeholder="Describe difficulties faced as a team..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.challenges_encountered ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.challenges_encountered && (
              <p className="text-sm text-red-500 mt-1">{errors.challenges_encountered}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How did you resolve issues together?
            </label>
            <textarea
              value={formData.resolution_strategies}
              onChange={(e) => handleFieldChange('resolution_strategies', e.target.value)}
              placeholder="Describe problem-solving approaches used..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Were there any unresolved issues?
            </label>
            <textarea
              value={formData.unresolved_issues}
              onChange={(e) => handleFieldChange('unresolved_issues', e.target.value)}
              placeholder="Note any ongoing concerns or unsolved problems..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Support & Trust",
      icon: <Heart className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What support did you provide to your team?
            </label>
            <textarea
              value={formData.support_given}
              onChange={(e) => handleFieldChange('support_given', e.target.value)}
              placeholder="Describe how you supported your partner(s)..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.support_given ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.support_given && (
              <p className="text-sm text-red-500 mt-1">{errors.support_given}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What support did you receive from your team?
            </label>
            <textarea
              value={formData.support_received}
              onChange={(e) => handleFieldChange('support_received', e.target.value)}
              placeholder="Acknowledge support you received..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Trust level within the team (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.trust_level}
                onChange={(e) => handleFieldChange('trust_level', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.trust_level}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How psychologically safe did you feel with your team?
            </label>
            <textarea
              value={formData.psychological_safety}
              onChange={(e) => handleFieldChange('psychological_safety', e.target.value)}
              placeholder="Describe comfort level in making mistakes or asking for help..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.psychological_safety ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.psychological_safety && (
              <p className="text-sm text-red-500 mt-1">{errors.psychological_safety}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Peer Feedback",
      icon: <MessageSquare className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'rgba(107, 139, 96, 0.1)',
              border: '1px solid rgba(107, 139, 96, 0.2)'
            }}
          >
            <p className="text-sm" style={{ color: '#2D5F3F' }}>
              Providing constructive feedback helps your team grow and improve future collaborations.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What constructive feedback would you like to share with your team member(s) about their performance or collaboration?
            </label>
            <textarea
              value={formData.constructive_feedback}
              onChange={(e) => handleFieldChange('constructive_feedback', e.target.value)}
              placeholder="Share honest, constructive feedback for your partner(s)..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What did your partner do especially well?
            </label>
            <textarea
              value={formData.partner_strengths}
              onChange={(e) => handleFieldChange('partner_strengths', e.target.value)}
              placeholder="Highlight specific strengths and positive contributions..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Is there anything they could do differently next time?
            </label>
            <textarea
              value={formData.partner_improvements}
              onChange={(e) => handleFieldChange('partner_improvements', e.target.value)}
              placeholder="Suggest areas for improvement in a supportive way..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Learning & Growth",
      icon: <Lightbulb className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What did you learn about effective teaming?
            </label>
            <textarea
              value={formData.team_learnings}
              onChange={(e) => handleFieldChange('team_learnings', e.target.value)}
              placeholder="Share insights about collaboration and teamwork..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.team_learnings ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.team_learnings && (
              <p className="text-sm text-red-500 mt-1">{errors.team_learnings}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How did this experience contribute to your personal growth?
            </label>
            <textarea
              value={formData.personal_growth}
              onChange={(e) => handleFieldChange('personal_growth', e.target.value)}
              placeholder="Describe personal development from this team experience..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What team-related skills did you strengthen?
            </label>
            <textarea
              value={formData.skills_developed}
              onChange={(e) => handleFieldChange('skills_developed', e.target.value)}
              placeholder="List collaboration skills you improved..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Future Improvements",
      icon: <Target className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What would improve team interpreting experiences?
            </label>
            <textarea
              value={formData.improvement_suggestions}
              onChange={(e) => handleFieldChange('improvement_suggestions', e.target.value)}
              placeholder="Suggest improvements for future team assignments..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.improvement_suggestions ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.improvement_suggestions && (
              <p className="text-sm text-red-500 mt-1">{errors.improvement_suggestions}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What processes or protocols could be refined?
            </label>
            <textarea
              value={formData.process_refinements}
              onChange={(e) => handleFieldChange('process_refinements', e.target.value)}
              placeholder="Identify specific procedures to improve..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What training would benefit team interpreters?
            </label>
            <textarea
              value={formData.training_needs}
              onChange={(e) => handleFieldChange('training_needs', e.target.value)}
              placeholder="Suggest training topics or skills development areas..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Closing Appreciation",
      icon: <Shield className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Share appreciation for your team experience
            </label>
            <textarea
              value={formData.appreciation_message}
              onChange={(e) => handleFieldChange('appreciation_message', e.target.value)}
              placeholder="Express gratitude for your team and the experience..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.appreciation_message ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.appreciation_message && (
              <p className="text-sm text-red-500 mt-1">{errors.appreciation_message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate your team's overall success (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.team_success_rating}
                onChange={(e) => handleFieldChange('team_success_rating', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.team_success_rating}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Would you team with these interpreters again?
            </label>
            <div className="flex gap-3">
              {['yes', 'maybe', 'no'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleFieldChange('would_team_again', option)}
                  className={`px-6 py-2 rounded-lg capitalize transition-all ${
                    formData.would_team_again === option
                      ? 'font-semibold'
                      : ''
                  }`}
                  style={{
                    backgroundColor: formData.would_team_again === option 
                      ? 'rgba(107, 139, 96, 0.2)' 
                      : '#F8FBF6',
                    color: formData.would_team_again === option 
                      ? '#2D5F3F' 
                      : '#5A5A5A',
                    border: `1px solid ${formData.would_team_again === option ? '#6B8B60' : '#E8E5E0'}`
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Describe this team experience in one word
            </label>
            <input
              type="text"
              value={formData.one_word_description}
              onChange={(e) => handleFieldChange('one_word_description', e.target.value)}
              placeholder="e.g., synergistic, challenging, growth, supportive..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.one_word_description ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.one_word_description && (
              <p className="text-sm text-red-500 mt-1">{errors.one_word_description}</p>
            )}
          </div>

          {showSummary && (
            <div className="mt-8">
              <p className="text-sm font-medium mb-4" style={{ color: '#2D5F3F' }}>
                Your reflection has been saved! Here's your summary:
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
                  Teaming Reflection
                </h2>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  Celebrate collaboration and learn from your team experience
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
                  : 'linear-gradient(135deg, #1b5e20, #2e7d32)',
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
                  Complete Reflection
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

export default TeamingReflectionV2;