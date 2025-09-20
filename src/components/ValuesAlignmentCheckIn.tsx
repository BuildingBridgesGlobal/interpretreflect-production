/**
 * Values Alignment Check-In Component
 *
 * Helps interpreters realign with their values after challenging decisions
 * Follows the design pattern of other reflection components with sage green color scheme
 *
 * @module ValuesAlignmentCheckIn
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Compass,
  Heart,
  Scale,
  Target,
  AlertTriangle,
  Check,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { reflectionService } from '../services/reflectionService';

interface ValuesAlignmentCheckInProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

export const ValuesAlignmentCheckIn: React.FC<ValuesAlignmentCheckInProps> = ({ onClose, onComplete }) => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    // Section 1: Challenging Decision Context
    decision_context: '',
    decision_difficulty: '',

    // Section 2: Values Tension
    values_conflict: '',
    compromised_values: '',

    // Section 3: Emotional Impact
    emotional_response: '',
    physical_sensation: '',

    // Section 4: Alignment Assessment
    alignment_score: 5,
    misalignment_areas: '',

    // Section 5: Learning & Growth
    lesson_learned: '',
    boundary_clarification: '',

    // Section 6: Moving Forward
    future_approach: '',
    support_needed: ''
  });

  // Section definitions
  const sections = [
    {
      title: "Challenging Decision Context",
      icon: <AlertTriangle className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'decision_context',
          label: "Briefly describe the challenging decision or situation",
          type: 'textarea',
          placeholder: "What happened that made you question your values alignment?",
          required: true
        },
        {
          id: 'decision_difficulty',
          label: "What made this particularly difficult?",
          type: 'textarea',
          placeholder: "What factors created the challenge?",
          required: true
        }
      ]
    },
    {
      title: "Values Tension",
      icon: <Scale className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'values_conflict',
          label: "Which of your core values were in tension?",
          type: 'textarea',
          placeholder: "Identify the values that seemed to conflict",
          required: true
        },
        {
          id: 'compromised_values',
          label: "Did you feel you had to compromise any values? If so, which ones?",
          type: 'textarea',
          placeholder: "Describe any compromises you felt you made",
          required: true
        }
      ]
    },
    {
      title: "Emotional & Physical Response",
      icon: <Heart className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'emotional_response',
          label: "What emotions are you experiencing about this situation?",
          type: 'textarea',
          placeholder: "Name and describe your emotional response",
          required: true
        },
        {
          id: 'physical_sensation',
          label: "Where do you feel this in your body?",
          type: 'textarea',
          placeholder: "Describe any physical sensations or tension",
          required: true
        }
      ]
    },
    {
      title: "Alignment Assessment",
      icon: <Compass className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'alignment_score',
          label: "How aligned do you feel with your values right now? (1-10)",
          type: 'slider',
          min: 1,
          max: 10,
          required: true
        },
        {
          id: 'misalignment_areas',
          label: "Where do you feel most out of alignment?",
          type: 'textarea',
          placeholder: "Identify specific areas of misalignment",
          required: true
        }
      ]
    },
    {
      title: "Learning & Growth",
      icon: <Target className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'lesson_learned',
          label: "What have you learned about your values from this experience?",
          type: 'textarea',
          placeholder: "Reflect on insights gained",
          required: true
        },
        {
          id: 'boundary_clarification',
          label: "What boundaries need to be clarified or strengthened?",
          type: 'textarea',
          placeholder: "Identify boundaries for future situations",
          required: true
        }
      ]
    },
    {
      title: "Moving Forward",
      icon: <ChevronRight className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'future_approach',
          label: "How will you approach similar situations differently?",
          type: 'textarea',
          placeholder: "Describe your future approach",
          required: true
        },
        {
          id: 'support_needed',
          label: "What support do you need to stay aligned with your values?",
          type: 'textarea',
          placeholder: "Identify support systems or resources",
          required: true
        }
      ]
    }
  ];

  const currentSectionData = sections[currentSection];
  const isLastSection = currentSection === sections.length - 1;

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate current section
  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: Record<string, string> = {};
    const section = sections[sectionIndex];

    section.fields.forEach(field => {
      if (field.required && !formData[field.id as keyof typeof formData]) {
        newErrors[field.id] = `Please complete this field`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  // Handle navigation
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

  // Handle form submission
  const handleSubmit = async () => {
    console.log('ValuesAlignmentCheckIn - handleSubmit called');
    if (!validateSection(currentSection)) {
      console.log('ValuesAlignmentCheckIn - Validation failed');
      return;
    }
    if (!user) {
      console.error('No user logged in');
      return;
    }
    console.log('ValuesAlignmentCheckIn - Starting save for user:', user.id);

    setIsSubmitting(true);
    setErrors({});

    try {
      // Calculate time spent
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      console.log('ValuesAlignmentCheckIn - Saving with reflectionService...');

      // Prepare data to save
      const dataToSave = {
        ...formData,
        completed_at: new Date().toISOString(),
        time_spent_seconds: timeSpent,
        // Add fields for getDisplayName fallback
        values_reflection: formData.values_check || formData.alignment_reflection || 'Values alignment completed',
        ethical_considerations: formData.ethical_tension || formData.decision_values || 'Values check completed'
      };

      const result = await reflectionService.saveReflection(
        user.id,
        'values_alignment', // Use correct entry_kind that matches config
        dataToSave
      );

      if (!result.success) {
        console.error('ValuesAlignmentCheckIn - Error saving:', result.error);
        throw new Error(result.error || 'Failed to save reflection');
      }

      console.log('ValuesAlignmentCheckIn - Save successful');

      // Show summary
      setShowSummary(true);

      // Complete after delay
      setTimeout(() => {
        if (onComplete) {
          onComplete(dataToSave);
        }
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error saving reflection:', error);
      setErrors({ save: 'Failed to save reflection. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render field based on type
  const renderField = (field: any) => {
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              {field.label}
            </label>
            <textarea
              value={formData[field.id as keyof typeof formData] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all resize-none"
              style={{
                borderColor: errors[field.id] ? '#EF4444' : '#E8E5E0',
                backgroundColor: '#FFFFFF',
                color: '#1A1A1A'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6B8B60';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107, 139, 96, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors[field.id] ? '#EF4444' : '#E8E5E0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors[field.id] && (
              <p className="text-sm text-red-500 mt-1">{errors[field.id]}</p>
            )}
          </div>
        );

      case 'slider':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              {field.label}
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm" style={{ color: '#5A5A5A' }}>1</span>
              <input
                type="range"
                min={field.min}
                max={field.max}
                value={formData[field.id as keyof typeof formData] || 5}
                onChange={(e) => handleInputChange(field.id, parseInt(e.target.value))}
                className="flex-1"
                style={{
                  accentColor: '#6B8B60'
                }}
              />
              <span className="text-sm" style={{ color: '#5A5A5A' }}>10</span>
              <span className="ml-2 font-semibold" style={{ color: '#2D5F3F' }}>
                {formData[field.id as keyof typeof formData] || 5}
              </span>
            </div>
            {errors[field.id] && (
              <p className="text-sm text-red-500 mt-1">{errors[field.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

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
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  Values Alignment Check-In
                </h2>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  Realign with your values after challenging decisions
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
          {showSummary ? (
            <div className="text-center py-8">
              <div className="mb-6">
                <Check className="w-16 h-16 mx-auto" style={{ color: '#6B8B60' }} />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                Values Check-In Complete
              </h3>
              <p style={{ color: '#5A5A5A' }}>
                Thank you for taking time to reflect on your values alignment.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center space-x-2">
                {currentSectionData.icon}
                <h3 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
                  {currentSectionData.title}
                </h3>
              </div>

              {/* Render fields for current section */}
              {currentSectionData.fields.map(field => renderField(field))}
            </>
          )}
        </div>

        {/* Footer */}
        {!showSummary && (
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
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg flex items-center transition-all"
                style={{
                  background: isSubmitting
                    ? '#CCCCCC'
                    : 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                  color: '#FFFFFF',
                  boxShadow: isSubmitting
                    ? 'none'
                    : '0 2px 8px rgba(107, 139, 96, 0.3)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 139, 96, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 139, 96, 0.3)';
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-1 animate-spin" />
                    Saving...
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
        )}
      </div>
    </div>
  );
};

export default ValuesAlignmentCheckIn;