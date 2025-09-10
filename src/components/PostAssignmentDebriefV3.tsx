/**
 * Post-Assignment Debrief V3 Component
 * 
 * Matches exact Team Interpreting Preparation design pattern
 * with sage green color scheme and consistent styling
 * 
 * @module PostAssignmentDebriefV3
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  AlertTriangle,
  Heart,
  Brain,
  Users,
  Target,
  Compass,
  Shield,
  X,
  Check,
  Sparkles,
  Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { updateGrowthInsightsForUser } from '../services/growthInsightsService';

interface PostAssignmentDebriefV3Props {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

/**
 * Main Component
 */
export function PostAssignmentDebriefV3({ onClose, onComplete }: PostAssignmentDebriefV3Props) {
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
    // Section 1: Initial Check-In
    overall_experience: '',
    energy_level: 5,
    
    // Section 2: What Went Well
    successes: '',
    proud_moments: '',
    effective_strategies: '',
    
    // Section 3: Challenges & Growth
    challenges_faced: '',
    difficult_moments: '',
    coping_strategies: '',
    
    // Section 4: Team Dynamics (if applicable)
    team_dynamics: '',
    communication_effectiveness: '',
    
    // Section 5: Ethical & Cultural Reflections
    ethical_dilemmas: '',
    cultural_considerations: '',
    boundary_management: '',
    
    // Section 6: Learning & Insights
    key_learnings: '',
    surprises: '',
    skills_developed: '',
    preparation_impact: '',
    interpretive_choices: '',
    
    // Section 7: Future Application
    apply_next_time: '',
    areas_for_improvement: '',
    support_needed: '',
    
    // Section 8: Closing Reflection
    gratitude: '',
    self_compassion: '',
    overall_rating: 5,
    one_word_summary: '',
    
    // Metadata
    assignment_date: new Date().toISOString().split('T')[0],
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
      case 0: // Initial Check-In
        if (!formData.overall_experience.trim()) {
          newErrors.overall_experience = 'Please describe your overall experience';
        }
        break;
      
      case 1: // What Went Well
        if (!formData.successes.trim()) {
          newErrors.successes = 'Please share what went well';
        }
        if (!formData.proud_moments.trim()) {
          newErrors.proud_moments = 'Please describe moments you felt proud';
        }
        break;
      
      case 2: // Challenges & Growth
        if (!formData.challenges_faced.trim()) {
          newErrors.challenges_faced = 'Please describe challenges you faced';
        }
        break;
      
      case 3: // Team Dynamics
        // Optional section - no validation required
        break;
      
      case 4: // Ethical & Cultural
        if (!formData.boundary_management.trim()) {
          newErrors.boundary_management = 'Please reflect on boundary management';
        }
        break;
      
      case 5: // Learning & Insights
        if (!formData.key_learnings.trim()) {
          newErrors.key_learnings = 'Please share your key learnings';
        }
        break;
      
      case 6: // Future Application
        if (!formData.apply_next_time.trim()) {
          newErrors.apply_next_time = 'Please describe what you\'ll apply next time';
        }
        break;
      
      case 7: // Closing Reflection
        if (!formData.gratitude.trim()) {
          newErrors.gratitude = 'Please share what you\'re grateful for';
        }
        if (!formData.one_word_summary.trim()) {
          newErrors.one_word_summary = 'Please provide a one-word summary';
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

      // Prepare debrief data
      const debriefData = {
        ...formData,
        user_id: user.id,
        session_id: sessionId,
        reflection_type: 'post_assignment_debrief',
        status: 'completed',
        metadata: {
          completion_time: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          sections_completed: 8
        }
      };

      // Save to database
      const { data, error } = await supabase
        .from('post_assignment_reflections')
        .upsert(debriefData)
        .select()
        .single();

      if (error) throw error;

      // Update growth insights
      const insights = {
        overall_experience: formData.overall_experience,
        key_learnings: formData.key_learnings,
        challenges_faced: formData.challenges_faced,
        successes: formData.successes,
        areas_for_improvement: formData.areas_for_improvement
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
      console.error('Error saving debrief:', error);
      setErrors({ save: 'Failed to save debrief. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const generateSummary = () => {
    return `POST-ASSIGNMENT DEBRIEF SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERALL EXPERIENCE:
${formData.overall_experience}

KEY SUCCESSES:
${formData.successes}

MAIN CHALLENGES:
${formData.challenges_faced}

KEY LEARNINGS:
${formData.key_learnings}

NEXT TIME I WILL:
${formData.apply_next_time}

GRATITUDE:
${formData.gratitude}

RATING: ${formData.overall_rating}/10
IN ONE WORD: ${formData.one_word_summary}
    `.trim();
  };

  const sections = [
    {
      title: "Initial Check-In",
      icon: <Heart className="w-5 h-5" style={{ color: '#6B8B60' }} />,
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
              Welcome Back
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              You've completed your assignment. Let's take a moment to reflect on your experience 
              and capture valuable insights for your professional growth.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How would you describe your overall experience with this assignment?
            </label>
            <textarea
              value={formData.overall_experience}
              onChange={(e) => handleFieldChange('overall_experience', e.target.value)}
              placeholder="Share your general thoughts and feelings about the assignment..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.overall_experience ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.overall_experience && (
              <p className="text-sm text-red-500 mt-1">{errors.overall_experience}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Current energy level (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy_level}
                onChange={(e) => handleFieldChange('energy_level', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.energy_level}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "What Went Well",
      icon: <CheckCircle className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What successes did you experience during this assignment?
            </label>
            <textarea
              value={formData.successes}
              onChange={(e) => handleFieldChange('successes', e.target.value)}
              placeholder="Describe moments when things went smoothly..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.successes ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.successes && (
              <p className="text-sm text-red-500 mt-1">{errors.successes}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What moments made you feel proud of your work?
            </label>
            <textarea
              value={formData.proud_moments}
              onChange={(e) => handleFieldChange('proud_moments', e.target.value)}
              placeholder="Share specific instances where you felt accomplished..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.proud_moments ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.proud_moments && (
              <p className="text-sm text-red-500 mt-1">{errors.proud_moments}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Which strategies or techniques worked particularly well?
            </label>
            <textarea
              value={formData.effective_strategies}
              onChange={(e) => handleFieldChange('effective_strategies', e.target.value)}
              placeholder="List techniques that were effective..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Challenges & Growth",
      icon: <AlertTriangle className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What challenges did you encounter?
            </label>
            <textarea
              value={formData.challenges_faced}
              onChange={(e) => handleFieldChange('challenges_faced', e.target.value)}
              placeholder="Describe difficulties you faced..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.challenges_faced ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.challenges_faced && (
              <p className="text-sm text-red-500 mt-1">{errors.challenges_faced}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Were there any particularly difficult moments? How did you handle them?
            </label>
            <textarea
              value={formData.difficult_moments}
              onChange={(e) => handleFieldChange('difficult_moments', e.target.value)}
              placeholder="Describe challenging situations and your response..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What coping strategies did you use when things got tough?
            </label>
            <textarea
              value={formData.coping_strategies}
              onChange={(e) => handleFieldChange('coping_strategies', e.target.value)}
              placeholder="List strategies that helped you manage stress..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Team Dynamics",
      icon: <Users className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(107, 139, 96, 0.05)',
              border: '1px solid rgba(107, 139, 96, 0.15)'
            }}
          >
            <p className="text-sm" style={{ color: '#5A5A5A' }}>
              Skip this section if you worked alone
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How did the team dynamics affect your work?
            </label>
            <textarea
              value={formData.team_dynamics}
              onChange={(e) => handleFieldChange('team_dynamics', e.target.value)}
              placeholder="Describe collaboration, support, or challenges with team members..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How effective was communication with your team?
            </label>
            <textarea
              value={formData.communication_effectiveness}
              onChange={(e) => handleFieldChange('communication_effectiveness', e.target.value)}
              placeholder="Reflect on handoffs, signals, and coordination..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Ethical & Cultural Reflections",
      icon: <Compass className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Did you encounter any ethical dilemmas? How did you navigate them?
            </label>
            <textarea
              value={formData.ethical_dilemmas}
              onChange={(e) => handleFieldChange('ethical_dilemmas', e.target.value)}
              placeholder="Describe ethical considerations and decisions..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Were there cultural factors that influenced your interpreting?
            </label>
            <textarea
              value={formData.cultural_considerations}
              onChange={(e) => handleFieldChange('cultural_considerations', e.target.value)}
              placeholder="Reflect on cultural awareness and sensitivity..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How well did you maintain professional boundaries?
            </label>
            <textarea
              value={formData.boundary_management}
              onChange={(e) => handleFieldChange('boundary_management', e.target.value)}
              placeholder="Reflect on role-space and professional limits..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.boundary_management ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.boundary_management && (
              <p className="text-sm text-red-500 mt-1">{errors.boundary_management}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Learning & Insights",
      icon: <Brain className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What are your key learnings from this assignment?
            </label>
            <textarea
              value={formData.key_learnings}
              onChange={(e) => handleFieldChange('key_learnings', e.target.value)}
              placeholder="List the most important insights you gained..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.key_learnings ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.key_learnings && (
              <p className="text-sm text-red-500 mt-1">{errors.key_learnings}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What surprised you about this experience?
            </label>
            <textarea
              value={formData.surprises}
              onChange={(e) => handleFieldChange('surprises', e.target.value)}
              placeholder="Share unexpected discoveries or realizations..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Which skills did you strengthen or develop?
            </label>
            <textarea
              value={formData.skills_developed}
              onChange={(e) => handleFieldChange('skills_developed', e.target.value)}
              placeholder="List skills you improved or newly acquired..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How did your preparation affect your performance in this assignment?
            </label>
            <textarea
              value={formData.preparation_impact}
              onChange={(e) => handleFieldChange('preparation_impact', e.target.value)}
              placeholder="Reflect on how your preparation influenced your performance..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Describe a significant interpretive choice you made and the effect it had.
            </label>
            <textarea
              value={formData.interpretive_choices}
              onChange={(e) => handleFieldChange('interpretive_choices', e.target.value)}
              placeholder="Share a key decision you made during interpretation and its impact..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Future Application",
      icon: <Target className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What will you apply or do differently next time?
            </label>
            <textarea
              value={formData.apply_next_time}
              onChange={(e) => handleFieldChange('apply_next_time', e.target.value)}
              placeholder="Describe specific changes you'll make..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.apply_next_time ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.apply_next_time && (
              <p className="text-sm text-red-500 mt-1">{errors.apply_next_time}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What areas need more development or practice?
            </label>
            <textarea
              value={formData.areas_for_improvement}
              onChange={(e) => handleFieldChange('areas_for_improvement', e.target.value)}
              placeholder="Identify skills or areas to focus on..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What support or resources would help you grow?
            </label>
            <textarea
              value={formData.support_needed}
              onChange={(e) => handleFieldChange('support_needed', e.target.value)}
              placeholder="Describe training, mentorship, or resources needed..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Closing Reflection",
      icon: <Activity className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What are you grateful for from this experience?
            </label>
            <textarea
              value={formData.gratitude}
              onChange={(e) => handleFieldChange('gratitude', e.target.value)}
              placeholder="Express gratitude for people, moments, or learnings..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.gratitude ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.gratitude && (
              <p className="text-sm text-red-500 mt-1">{errors.gratitude}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What compassionate message would you give yourself?
            </label>
            <textarea
              value={formData.self_compassion}
              onChange={(e) => handleFieldChange('self_compassion', e.target.value)}
              placeholder="Write a kind message to yourself about your effort and growth..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Overall rating of this assignment (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.overall_rating}
                onChange={(e) => handleFieldChange('overall_rating', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.overall_rating}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Summarize this assignment in one word
            </label>
            <input
              type="text"
              value={formData.one_word_summary}
              onChange={(e) => handleFieldChange('one_word_summary', e.target.value)}
              placeholder="e.g., challenging, rewarding, growth, intense..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.one_word_summary ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.one_word_summary && (
              <p className="text-sm text-red-500 mt-1">{errors.one_word_summary}</p>
            )}
          </div>

          {showSummary && (
            <div className="mt-8">
              <p className="text-sm font-medium mb-4" style={{ color: '#2D5F3F' }}>
                Your debrief has been saved! Here's your summary:
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
        ref={modalRef}
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
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  Post-Assignment Debrief
                </h2>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  Reflect, learn, and grow from your experience
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
                  Complete Debrief
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

export default PostAssignmentDebriefV3;