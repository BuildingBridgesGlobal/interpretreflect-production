/**
 * Wellness Check-In Accessible Component
 * 
 * Matches exact design pattern of Mentoring Prep with sage green color scheme
 * and consistent styling across all reflection components
 * 
 * @module WellnessCheckInAccessible
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Heart,
  Brain,
  Activity,
  Shield,
  Users,
  Target,
  Compass,
  Sparkles,
  X,
  Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { reflectionService } from '../services/reflectionService';

interface WellnessCheckInProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

/**
 * Main Component
 */
export const WellnessCheckInAccessible: React.FC<WellnessCheckInProps> = ({ onClose, onComplete }) => {
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
    // Section 1: Current State
    check_in_reason: 'routine',
    current_energy: 5,
    stressLevel: 5,
    energyLevel: 5,
    overall_feeling: '',
    
    // Section 2: Emotional Awareness
    primary_emotions: '',
    emotional_intensity: 5,
    emotional_triggers: '',
    
    // Section 3: Physical Wellbeing
    physical_state: '',
    physical_symptoms: '',
    sleep_quality: 5,
    
    // Section 4: Mental Clarity
    mental_clarity: 5,
    focus_level: '',
    cognitive_load: '',
    
    // Section 5: Professional Balance
    workload_sustainability: 5,
    work_satisfaction: '',
    professional_stressors: '',
    
    // Section 6: Social Connection
    connection_quality: 5,
    support_availability: '',
    relationship_needs: '',
    
    // Section 7: Needs & Resources
    immediate_needs: '',
    available_resources: '',
    support_required: '',
    
    // Section 8: Intentions & Commitments
    self_care_commitment: '',
    wellness_priority: '',
    gratitude_note: '',
    overall_wellness_rating: 5,
    
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
      case 0: // Current State
        if (!formData.overall_feeling.trim()) {
          newErrors.overall_feeling = 'Please describe how you are feeling';
        }
        break;
      
      case 1: // Emotional Awareness
        if (!formData.primary_emotions.trim()) {
          newErrors.primary_emotions = 'Please identify your current emotions';
        }
        break;
      
      case 2: // Physical Wellbeing
        if (!formData.physical_state.trim()) {
          newErrors.physical_state = 'Please describe your physical state';
        }
        break;
      
      case 3: // Mental Clarity
        if (!formData.focus_level.trim()) {
          newErrors.focus_level = 'Please describe your focus level';
        }
        break;
      
      case 4: // Professional Balance
        if (!formData.work_satisfaction.trim()) {
          newErrors.work_satisfaction = 'Please reflect on work satisfaction';
        }
        break;
      
      case 5: // Social Connection
        if (!formData.support_availability.trim()) {
          newErrors.support_availability = 'Please describe available support';
        }
        break;
      
      case 6: // Needs & Resources
        if (!formData.immediate_needs.trim()) {
          newErrors.immediate_needs = 'Please identify your current needs';
        }
        break;
      
      case 7: // Intentions & Commitments
        if (!formData.self_care_commitment.trim()) {
          newErrors.self_care_commitment = 'Please make a self-care commitment';
        }
        if (!formData.gratitude_note.trim()) {
          newErrors.gratitude_note = 'Please share something you are grateful for';
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

    // Prevent double-submission
    if (isSaving) {
      console.log('WellnessCheckIn - Already saving, ignoring duplicate click');
      return;
    }

    console.log('WellnessCheckIn - handleSubmit called');
    console.log('WellnessCheckIn - User:', { id: user.id, email: user.email });

    setIsSaving(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      console.log('WellnessCheckIn - Starting save...');

      // Prepare the data with all the required fields including stress and energy levels
      const dataToSave = {
        ...formData,
        timestamp: new Date().toISOString(),
        time_spent_seconds: timeSpent,
        sections_completed: 8,
        // Add stress and energy levels if they exist in formData
        stressLevel: formData.stressLevel || 5,
        energyLevel: formData.energyLevel || 5,
        // Add fields for getDisplayName fallback
        current_feeling: formData.overall_feeling || formData.primary_emotions || 'Wellness check completed',
        wellness_score: formData.wellness_rating || 7,
        stress_level: formData.stressLevel || 5
      };

      console.log('WellnessCheckIn - Data to save:', dataToSave);

      // Use the reflection service which handles auth properly
      const result = await reflectionService.saveReflection(
        user.id,
        'wellness_checkin',
        dataToSave
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to save wellness check-in');
      }

      console.log('WellnessCheckIn - Save successful!', result);

      // Set saving to false immediately after successful save
      setIsSaving(false);

      // Skip growth insights update - it hangs due to Supabase client
      console.log('WellnessCheckIn - Skipping growth insights update (uses hanging Supabase client)');

      // Show summary
      setShowSummary(true);

      // Log successful save
      console.log('Wellness Check-In Results:', dataToSave);

      // Call onComplete if provided
      if (onComplete) {
        onComplete(dataToSave);
      }
    } catch (error) {
      console.error('WellnessCheckIn - Error in handleSubmit:', error);
      setIsSaving(false);
      setErrors({ save: error instanceof Error ? error.message : 'Failed to save check-in. Please try again.' });
    }
  };

  const generateSummary = () => {
    return `WELLNESS CHECK-IN SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERALL FEELING:
${formData.overall_feeling}

PRIMARY EMOTIONS:
${formData.primary_emotions}

PHYSICAL STATE:
${formData.physical_state}

IMMEDIATE NEEDS:
${formData.immediate_needs}

SELF-CARE COMMITMENT:
${formData.self_care_commitment}

GRATITUDE:
${formData.gratitude_note}

ENERGY LEVEL: ${formData.current_energy}/10
MENTAL CLARITY: ${formData.mental_clarity}/10
OVERALL WELLNESS: ${formData.overall_wellness_rating}/10
    `.trim();
  };

  const sections = [
    {
      title: "Current State",
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
              Taking a Moment for You
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              This wellness check-in is your dedicated time to pause, reflect, and reconnect 
              with yourself. Your wellbeing matters, and taking care of yourself enables you 
              to show up fully in all areas of your life.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What brings you to this check-in today?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'routine', label: 'Routine Check' },
                { value: 'stressed', label: 'Feeling Stressed' },
                { value: 'reflection', label: 'Need Reflection' },
                { value: 'support', label: 'Seeking Support' }
              ].map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => handleFieldChange('check_in_reason', reason.value)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    formData.check_in_reason === reason.value
                      ? 'font-semibold'
                      : ''
                  }`}
                  style={{
                    backgroundColor: formData.check_in_reason === reason.value 
                      ? 'rgba(107, 139, 96, 0.2)' 
                      : '#F8FBF6',
                    color: formData.check_in_reason === reason.value 
                      ? '#2D5F3F' 
                      : '#5A5A5A',
                    border: `1px solid ${formData.check_in_reason === reason.value ? '#6B8B60' : '#E8E5E0'}`
                  }}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate your current energy level (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energyLevel}
                onChange={(e) => handleFieldChange('energyLevel', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.energyLevel}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate your current stress level (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.stressLevel}
                onChange={(e) => handleFieldChange('stressLevel', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#DC2626' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.stressLevel}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              1 = Very relaxed, 10 = Extremely stressed
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How are you feeling overall right now?
            </label>
            <textarea
              value={formData.overall_feeling}
              onChange={(e) => handleFieldChange('overall_feeling', e.target.value)}
              placeholder="Take a moment to describe your current state..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.overall_feeling ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.overall_feeling && (
              <p className="text-sm text-red-500 mt-1">{errors.overall_feeling}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Emotional Awareness",
      icon: <Brain className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What emotions are present for you right now?
            </label>
            <textarea
              value={formData.primary_emotions}
              onChange={(e) => handleFieldChange('primary_emotions', e.target.value)}
              placeholder="Name the emotions you're experiencing (e.g., anxious, content, frustrated, hopeful)..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.primary_emotions ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.primary_emotions && (
              <p className="text-sm text-red-500 mt-1">{errors.primary_emotions}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate the intensity of these emotions (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.emotional_intensity}
                onChange={(e) => handleFieldChange('emotional_intensity', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.emotional_intensity}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What might be triggering or influencing these emotions?
            </label>
            <textarea
              value={formData.emotional_triggers}
              onChange={(e) => handleFieldChange('emotional_triggers', e.target.value)}
              placeholder="Reflect on recent events, interactions, or thoughts..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Physical Wellbeing",
      icon: <Activity className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How does your body feel right now?
            </label>
            <textarea
              value={formData.physical_state}
              onChange={(e) => handleFieldChange('physical_state', e.target.value)}
              placeholder="Notice any tension, pain, comfort, or sensations..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.physical_state ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.physical_state && (
              <p className="text-sm text-red-500 mt-1">{errors.physical_state}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Are you experiencing any physical symptoms?
            </label>
            <textarea
              value={formData.physical_symptoms}
              onChange={(e) => handleFieldChange('physical_symptoms', e.target.value)}
              placeholder="Note any headaches, fatigue, tension, or other symptoms..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate your sleep quality recently (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.sleep_quality}
                onChange={(e) => handleFieldChange('sleep_quality', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.sleep_quality}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Mental Clarity",
      icon: <Brain className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate your mental clarity right now (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.mental_clarity}
                onChange={(e) => handleFieldChange('mental_clarity', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.mental_clarity}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How would you describe your ability to focus?
            </label>
            <textarea
              value={formData.focus_level}
              onChange={(e) => handleFieldChange('focus_level', e.target.value)}
              placeholder="Reflect on your concentration and attention span..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.focus_level ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.focus_level && (
              <p className="text-sm text-red-500 mt-1">{errors.focus_level}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What's occupying your mental space?
            </label>
            <textarea
              value={formData.cognitive_load}
              onChange={(e) => handleFieldChange('cognitive_load', e.target.value)}
              placeholder="List thoughts, worries, or tasks taking up mental energy..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Professional Balance",
      icon: <Target className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate your current workload sustainability (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.workload_sustainability}
                onChange={(e) => handleFieldChange('workload_sustainability', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.workload_sustainability}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How satisfied are you with your work right now?
            </label>
            <textarea
              value={formData.work_satisfaction}
              onChange={(e) => handleFieldChange('work_satisfaction', e.target.value)}
              placeholder="Reflect on what's working well and what's challenging..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.work_satisfaction ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.work_satisfaction && (
              <p className="text-sm text-red-500 mt-1">{errors.work_satisfaction}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What professional stressors are you managing?
            </label>
            <textarea
              value={formData.professional_stressors}
              onChange={(e) => handleFieldChange('professional_stressors', e.target.value)}
              placeholder="Identify current work-related challenges or pressures..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Social Connection",
      icon: <Users className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate the quality of your social connections (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.connection_quality}
                onChange={(e) => handleFieldChange('connection_quality', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.connection_quality}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What support is available to you?
            </label>
            <textarea
              value={formData.support_availability}
              onChange={(e) => handleFieldChange('support_availability', e.target.value)}
              placeholder="Consider friends, family, colleagues, professionals..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.support_availability ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.support_availability && (
              <p className="text-sm text-red-500 mt-1">{errors.support_availability}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What do you need from your relationships right now?
            </label>
            <textarea
              value={formData.relationship_needs}
              onChange={(e) => handleFieldChange('relationship_needs', e.target.value)}
              placeholder="Think about connection, space, understanding, or support..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Needs & Resources",
      icon: <Shield className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What do you need most right now?
            </label>
            <textarea
              value={formData.immediate_needs}
              onChange={(e) => handleFieldChange('immediate_needs', e.target.value)}
              placeholder="Identify your most pressing needs (rest, support, time, etc.)..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.immediate_needs ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.immediate_needs && (
              <p className="text-sm text-red-500 mt-1">{errors.immediate_needs}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What resources are available to you?
            </label>
            <textarea
              value={formData.available_resources}
              onChange={(e) => handleFieldChange('available_resources', e.target.value)}
              placeholder="List tools, people, or strategies you can access..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What additional support would be helpful?
            </label>
            <textarea
              value={formData.support_required}
              onChange={(e) => handleFieldChange('support_required', e.target.value)}
              placeholder="Consider professional help, time off, or specific assistance..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Intentions & Commitments",
      icon: <Compass className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What self-care action will you commit to in the next 24 hours?
            </label>
            <textarea
              value={formData.self_care_commitment}
              onChange={(e) => handleFieldChange('self_care_commitment', e.target.value)}
              placeholder="Choose one specific, achievable self-care action..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.self_care_commitment ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.self_care_commitment && (
              <p className="text-sm text-red-500 mt-1">{errors.self_care_commitment}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What will you prioritize for your wellness this week?
            </label>
            <textarea
              value={formData.wellness_priority}
              onChange={(e) => handleFieldChange('wellness_priority', e.target.value)}
              placeholder="Identify one wellness focus area..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What are you grateful for right now?
            </label>
            <textarea
              value={formData.gratitude_note}
              onChange={(e) => handleFieldChange('gratitude_note', e.target.value)}
              placeholder="Share something you appreciate, no matter how small..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.gratitude_note ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.gratitude_note && (
              <p className="text-sm text-red-500 mt-1">{errors.gratitude_note}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate your overall wellness right now (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.overall_wellness_rating}
                onChange={(e) => handleFieldChange('overall_wellness_rating', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.overall_wellness_rating}
              </span>
            </div>
          </div>

          {showSummary && (
            <div className="mt-8">
              <p className="text-sm font-medium mb-4" style={{ color: '#2D5F3F' }}>
                Your check-in has been saved! Here's your summary:
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
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  Wellness Check-In
                </h2>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  Take a moment to assess and nurture your wellbeing
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
              disabled={isSaving || showSummary}
              className="px-6 py-2 rounded-lg flex items-center transition-all"
              style={{
                background: (isSaving || showSummary)
                  ? '#CCCCCC'
                  : 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                color: '#FFFFFF',
                boxShadow: (isSaving || showSummary)
                  ? 'none'
                  : '0 2px 8px rgba(107, 139, 96, 0.3)',
                cursor: (isSaving || showSummary) ? 'not-allowed' : 'pointer'
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

export default WellnessCheckInAccessible;