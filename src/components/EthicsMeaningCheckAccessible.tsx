/**
 * Values Alignment Check-In Accessible Component
 * 
 * Matches design pattern with InterpretReflect brand colors
 * and consistent styling across all reflection components
 * 
 * @module EthicsMeaningCheckAccessible
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Compass,
  AlertTriangle,
  Sparkles,
  X,
  Check
} from 'lucide-react';
import { TargetIcon, HeartPulseIcon, NotepadIcon, CommunityIcon, SecureLockIcon } from './CustomIcon';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { updateGrowthInsightsForUser } from '../services/growthInsightsService';

interface EthicsMeaningCheckAccessibleProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

/**
 * Main Component
 */
export const EthicsMeaningCheckAccessible: React.FC<EthicsMeaningCheckAccessibleProps> = ({ onClose, onComplete }) => {
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
    // Section 1: Current Context
    check_in_trigger: 'routine',
    recent_challenge: '',
    emotional_state: '',
    
    // Section 2: Ethical Landscape
    ethical_tensions: '',
    value_conflicts: '',
    ethical_clarity: 5,
    
    // Section 3: Boundaries & Voice
    boundary_status: '',
    boundary_challenges: '',
    professional_voice: '',
    
    // Section 4: Meaning & Purpose
    work_meaning: '',
    pride_moments: '',
    purpose_alignment: 5,
    
    // Section 5: Impact & Growth
    positive_impact: '',
    growth_areas: '',
    learning_insights: '',
    
    // Section 6: Support & Resources
    support_needs: '',
    available_support: '',
    support_comfort: 5,
    
    // Section 7: Technology & Innovation
    ai_impact: '',
    tech_boundaries: '',
    innovation_thoughts: '',
    
    // Section 8: Commitments & Actions
    ethical_commitment: '',
    boundary_commitment: '',
    growth_commitment: '',
    overall_resilience: 5,
    
    // Metadata
    check_in_date: new Date().toISOString().split('T')[0],
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
      case 0: // Current Context
        if (!formData.recent_challenge.trim()) {
          newErrors.recent_challenge = 'Please describe a recent challenge';
        }
        if (!formData.emotional_state.trim()) {
          newErrors.emotional_state = 'Please describe your emotional state';
        }
        break;
      
      case 1: // Ethical Landscape
        if (!formData.ethical_tensions.trim()) {
          newErrors.ethical_tensions = 'Please reflect on ethical tensions';
        }
        break;
      
      case 2: // Boundaries & Voice
        if (!formData.boundary_status.trim()) {
          newErrors.boundary_status = 'Please describe your boundary status';
        }
        break;
      
      case 3: // Meaning & Purpose
        if (!formData.work_meaning.trim()) {
          newErrors.work_meaning = 'Please reflect on work meaning';
        }
        break;
      
      case 4: // Impact & Growth
        if (!formData.positive_impact.trim()) {
          newErrors.positive_impact = 'Please describe your positive impact';
        }
        break;
      
      case 5: // Support & Resources
        if (!formData.support_needs.trim()) {
          newErrors.support_needs = 'Please identify support needs';
        }
        break;
      
      case 6: // Technology & Innovation
        if (!formData.ai_impact.trim()) {
          newErrors.ai_impact = 'Please reflect on AI/technology impact';
        }
        break;
      
      case 7: // Commitments & Actions
        if (!formData.ethical_commitment.trim()) {
          newErrors.ethical_commitment = 'Please make an ethical commitment';
        }
        if (!formData.growth_commitment.trim()) {
          newErrors.growth_commitment = 'Please identify a growth commitment';
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
      const reflectionId = `ethics_meaning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Save to reflection_entries table (using standard reflection entry format)
      const { data, error } = await supabase
        .from('reflection_entries')
        .insert({
          user_id: user.id,
          reflection_id: reflectionId,
          entry_kind: 'ethics_meaning_check',
          data: {
            ...formData,
            metadata: {
              completion_time: new Date().toISOString(),
              time_spent_seconds: timeSpent,
              sections_completed: 8
            }
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Update growth insights
      const insights = {
        ethical_reflection: formData.ethical_tensions,
        boundary_awareness: formData.boundary_status,
        purpose_alignment: formData.work_meaning,
        resilience_level: formData.overall_resilience
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
      console.error('Error saving values alignment check-in:', error);
      setErrors({ save: 'Failed to save check-in. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const generateSummary = () => {
    return `VALUES ALIGNMENT CHECK-IN SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECENT CHALLENGE:
${formData.recent_challenge}

ETHICAL TENSIONS:
${formData.ethical_tensions}

BOUNDARY STATUS:
${formData.boundary_status}

WORK MEANING:
${formData.work_meaning}

POSITIVE IMPACT:
${formData.positive_impact}

COMMITMENTS:
• Ethical: ${formData.ethical_commitment}
• Growth: ${formData.growth_commitment}

ETHICAL CLARITY: ${formData.ethical_clarity}/10
PURPOSE ALIGNMENT: ${formData.purpose_alignment}/10
OVERALL RESILIENCE: ${formData.overall_resilience}/10
    `.trim();
  };

  const sections = [
    {
      title: "Current Context",
      icon: <Compass className="w-5 h-5" style={{ color: '#5C7F4F' }} />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(92, 127, 79, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)',
              border: '1px solid rgba(92, 127, 79, 0.2)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#2D3A31' }}>
              Values Alignment Check-In
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              Let's check in on your values and boundaries together. This reflection helps you navigate 
              ethical challenges, maintain professional boundaries, and connect with the deeper meaning 
              in your work. There are no right or wrong answers—just your unique experience as an interpreter.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What brings you to this values check-in today?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'routine', label: 'Routine Check' },
                { value: 'ethical_concern', label: 'Ethical Concern' },
                { value: 'boundary_issue', label: 'Boundary Issue' },
                { value: 'meaning_search', label: 'Seeking Meaning' }
              ].map((trigger) => (
                <button
                  key={trigger.value}
                  onClick={() => handleFieldChange('check_in_trigger', trigger.value)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    formData.check_in_trigger === trigger.value
                      ? 'font-semibold'
                      : ''
                  }`}
                  style={{
                    backgroundColor: formData.check_in_trigger === trigger.value 
                      ? 'rgba(92, 127, 79, 0.2)' 
                      : '#F8FBF6',
                    color: formData.check_in_trigger === trigger.value 
                      ? '#2D3A31' 
                      : '#5A5A5A',
                    border: `1px solid ${formData.check_in_trigger === trigger.value ? '#5C7F4F' : '#E8E5E0'}`
                  }}
                >
                  {trigger.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              Share a recent situation where you navigated ethical considerations or boundary challenges
            </label>
            <textarea
              value={formData.recent_challenge}
              onChange={(e) => handleFieldChange('recent_challenge', e.target.value)}
              placeholder="Share a recent ethical dilemma, boundary challenge, or meaning-related situation..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
              style={{
                borderColor: errors.recent_challenge ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.recent_challenge && (
              <p className="text-sm text-red-500 mt-1">{errors.recent_challenge}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              How are you experiencing this situation emotionally right now?
            </label>
            <textarea
              value={formData.emotional_state}
              onChange={(e) => handleFieldChange('emotional_state', e.target.value)}
              placeholder="Describe your emotional response and current state..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
              style={{
                borderColor: errors.emotional_state ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.emotional_state && (
              <p className="text-sm text-red-500 mt-1">{errors.emotional_state}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Ethical Landscape",
      icon: <SecureLockIcon size={64} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What ethical considerations or tensions are you noticing in your work?
            </label>
            <textarea
              value={formData.ethical_tensions}
              onChange={(e) => handleFieldChange('ethical_tensions', e.target.value)}
              placeholder="Describe any conflicts between values, duties, or ethical principles..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
              style={{
                borderColor: errors.ethical_tensions ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.ethical_tensions && (
              <p className="text-sm text-red-500 mt-1">{errors.ethical_tensions}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              Are there any value conflicts you're navigating?
            </label>
            <textarea
              value={formData.value_conflicts}
              onChange={(e) => handleFieldChange('value_conflicts', e.target.value)}
              placeholder="Identify conflicts between personal, professional, or organizational values..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              How clear do you feel about your ethical approach right now? (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.ethical_clarity}
                onChange={(e) => handleFieldChange('ethical_clarity', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#5C7F4F' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(92, 127, 79, 0.1)',
                  color: '#2D3A31'
                }}>
                {formData.ethical_clarity}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Boundaries & Voice",
      icon: <AlertTriangle className="w-5 h-5" style={{ color: '#5C7F4F' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              How are your professional boundaries feeling right now?
            </label>
            <textarea
              value={formData.boundary_status}
              onChange={(e) => handleFieldChange('boundary_status', e.target.value)}
              placeholder="Reflect on your ability to maintain healthy professional limits..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
              style={{
                borderColor: errors.boundary_status ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.boundary_status && (
              <p className="text-sm text-red-500 mt-1">{errors.boundary_status}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What boundary challenges are you facing?
            </label>
            <textarea
              value={formData.boundary_challenges}
              onChange={(e) => handleFieldChange('boundary_challenges', e.target.value)}
              placeholder="Identify specific situations where boundaries are being tested..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              How empowered do you feel to use your professional voice?
            </label>
            <textarea
              value={formData.professional_voice}
              onChange={(e) => handleFieldChange('professional_voice', e.target.value)}
              placeholder="Reflect on your ability to speak up, advocate, and assert your expertise..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>
      )
    },
    {
      title: "Meaning & Purpose",
      icon: <HeartPulseIcon size={64} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What meaning and purpose are you finding in your work right now?
            </label>
            <textarea
              value={formData.work_meaning}
              onChange={(e) => handleFieldChange('work_meaning', e.target.value)}
              placeholder="Reflect on the significance and purpose you find in your professional role..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
              style={{
                borderColor: errors.work_meaning ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.work_meaning && (
              <p className="text-sm text-red-500 mt-1">{errors.work_meaning}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What recent work are you most proud of?
            </label>
            <textarea
              value={formData.pride_moments}
              onChange={(e) => handleFieldChange('pride_moments', e.target.value)}
              placeholder="Share accomplishments or moments that brought you satisfaction..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              How aligned do you feel with your sense of purpose? (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.purpose_alignment}
                onChange={(e) => handleFieldChange('purpose_alignment', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#5C7F4F' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(92, 127, 79, 0.1)',
                  color: '#2D3A31'
                }}>
                {formData.purpose_alignment}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Impact & Growth",
      icon: <TargetIcon size={64} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What positive impact have you made recently?
            </label>
            <textarea
              value={formData.positive_impact}
              onChange={(e) => handleFieldChange('positive_impact', e.target.value)}
              placeholder="Describe the difference you've made for others or your field..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
              style={{
                borderColor: errors.positive_impact ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.positive_impact && (
              <p className="text-sm text-red-500 mt-1">{errors.positive_impact}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What areas of growth are emerging for you?
            </label>
            <textarea
              value={formData.growth_areas}
              onChange={(e) => handleFieldChange('growth_areas', e.target.value)}
              placeholder="Identify skills, knowledge, or personal development areas..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What insights have you gained about yourself?
            </label>
            <textarea
              value={formData.learning_insights}
              onChange={(e) => handleFieldChange('learning_insights', e.target.value)}
              placeholder="Share self-discoveries or new understanding..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>
      )
    },
    {
      title: "Support & Resources",
      icon: <CommunityIcon size={64} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What support do you need right now?
            </label>
            <textarea
              value={formData.support_needs}
              onChange={(e) => handleFieldChange('support_needs', e.target.value)}
              placeholder="Identify specific types of support that would be helpful..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
              style={{
                borderColor: errors.support_needs ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.support_needs && (
              <p className="text-sm text-red-500 mt-1">{errors.support_needs}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What support is available to you?
            </label>
            <textarea
              value={formData.available_support}
              onChange={(e) => handleFieldChange('available_support', e.target.value)}
              placeholder="List colleagues, supervisors, or resources you can access..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              Rate your comfort with seeking support (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.support_comfort}
                onChange={(e) => handleFieldChange('support_comfort', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#5C7F4F' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(92, 127, 79, 0.1)',
                  color: '#2D3A31'
                }}>
                {formData.support_comfort}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Technology & Innovation",
      icon: <NotepadIcon size={64} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              How is AI/technology impacting your work and ethics?
            </label>
            <textarea
              value={formData.ai_impact}
              onChange={(e) => handleFieldChange('ai_impact', e.target.value)}
              placeholder="Reflect on how technology is changing your field and practice..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
              style={{
                borderColor: errors.ai_impact ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.ai_impact && (
              <p className="text-sm text-red-500 mt-1">{errors.ai_impact}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What boundaries do you maintain with technology?
            </label>
            <textarea
              value={formData.tech_boundaries}
              onChange={(e) => handleFieldChange('tech_boundaries', e.target.value)}
              placeholder="Describe how you manage technology use and digital boundaries..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What opportunities for innovation do you see?
            </label>
            <textarea
              value={formData.innovation_thoughts}
              onChange={(e) => handleFieldChange('innovation_thoughts', e.target.value)}
              placeholder="Share ideas for improving practice or addressing challenges..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>
      )
    },
    {
      title: "Commitments & Actions",
      icon: <Sparkles className="w-5 h-5" style={{ color: '#5C7F4F' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What ethical practice or principle would you like to focus on this week?
            </label>
            <textarea
              value={formData.ethical_commitment}
              onChange={(e) => handleFieldChange('ethical_commitment', e.target.value)}
              placeholder="Identify one specific ethical practice or principle to uphold..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
              style={{
                borderColor: errors.ethical_commitment ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.ethical_commitment && (
              <p className="text-sm text-red-500 mt-1">{errors.ethical_commitment}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What boundary will you strengthen or maintain?
            </label>
            <textarea
              value={formData.boundary_commitment}
              onChange={(e) => handleFieldChange('boundary_commitment', e.target.value)}
              placeholder="Choose one boundary to focus on protecting..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              What growth commitment will you pursue?
            </label>
            <textarea
              value={formData.growth_commitment}
              onChange={(e) => handleFieldChange('growth_commitment', e.target.value)}
              placeholder="Identify one area for professional or personal development..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-brand-primary"
              style={{
                borderColor: errors.growth_commitment ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.growth_commitment && (
              <p className="text-sm text-red-500 mt-1">{errors.growth_commitment}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3A31' }}>
              How resilient are you feeling overall right now? (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.overall_resilience}
                onChange={(e) => handleFieldChange('overall_resilience', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#5C7F4F' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(92, 127, 79, 0.1)',
                  color: '#2D3A31'
                }}>
                {formData.overall_resilience}
              </span>
            </div>
          </div>

          {showSummary && (
            <div className="mt-8">
              <p className="text-sm font-medium mb-4" style={{ color: '#2D3A31' }}>
                Thank you for taking time to reflect on your values and boundaries. Here's your summary:
              </p>
              
              <div 
                className="p-4 rounded-lg font-mono text-xs"
                style={{
                  backgroundColor: '#F8FBF6',
                  border: '1px solid rgba(92, 127, 79, 0.2)',
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
                  background: 'linear-gradient(135deg, #5C7F4F, #4A6A3F)',
                  boxShadow: '0 2px 8px rgba(107, 139, 96, 0.3)'
                }}
              >
                <TargetIcon size={64} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  Values Alignment Check-In
                </h2>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  Navigate values, boundaries, and purpose in your work
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #5C7F4F, #4A6A3F)' }}
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
                    backgroundColor: index <= currentSection ? '#5C7F4F' : '#E8E5E0',
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
                backgroundColor: '#E8F3E5',
                color: '#5C7F4F',
                border: '1px solid #5C7F4F'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E8F3E5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E8F3E5';
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
                background: 'linear-gradient(135deg, #5C7F4F, #4A6A3F)',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(92, 127, 79, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(92, 127, 79, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(92, 127, 79, 0.3)';
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
                  : 'linear-gradient(135deg, #5C7F4F, #4A6A3F)',
                color: '#FFFFFF',
                boxShadow: isSaving 
                  ? 'none' 
                  : '0 2px 8px rgba(92, 127, 79, 0.3)',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(92, 127, 79, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(92, 127, 79, 0.3)';
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
                  Complete Check-In
                  <Check className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EthicsMeaningCheckAccessible;
