import React, { useState } from 'react';
import { 
  X, Users, Check, ChevronRight, ChevronLeft, 
  Eye, Heart 
} from 'lucide-react';
import { TEAMING_PREP } from '../config/teaming_prep.config';
import { supabase, TeamingPrepData, ReflectionEntry } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FieldConfig {
  id: string;
  type: 'slider' | 'text' | 'select' | 'radio' | 'checkbox';
  label: string;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  ariaLabel?: string;
  options?: string[];
}

interface TeamingPrepReflectionProps {
  onClose: () => void;
  onComplete?: (data: TeamingPrepData) => void;
}

export const TeamingPrepReflection: React.FC<TeamingPrepReflectionProps> = ({ 
  onClose, 
  onComplete 
}) => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state for all fields
  const [formData, setFormData] = useState<TeamingPrepData>({
    self_focus: 5,
    partner_focus: 5,
    one_word_feeling: '',
    signal_type: '',
    signal_custom: '',
    stressors: [],
    plan_if_sideways: '',
    viz_done: 'Done!',
    micro_intention: ''
  });

  const handleFieldChange = (fieldId: string, value: string | number | string[] | "Done!") => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    // Clear error for this field when user makes a change
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const handleMultiSelect = (option: string) => {
    setFormData(prev => ({
      ...prev,
      stressors: prev.stressors.includes(option)
        ? prev.stressors.filter(s => s !== option)
        : [...prev.stressors, option]
    }));
  };

  const validateSection = (sectionIndex: number): boolean => {
    const section = TEAMING_PREP.sections[sectionIndex];
    const newErrors: Record<string, string> = {};

    switch (section.id) {
      case 'readiness':
        if (!formData.one_word_feeling.trim()) {
          newErrors.one_word_feeling = 'Please enter how you feel';
        }
        break;
      case 'signal_plan':
        if (!formData.signal_type) {
          newErrors.signal_type = 'Please select a signal type';
        }
        if (formData.signal_type === 'Other' && !formData.signal_custom?.trim()) {
          newErrors.signal_custom = 'Please describe your custom signal';
        }
        break;
      case 'anticipate_adapt':
        if (!formData.plan_if_sideways) {
          newErrors.plan_if_sideways = 'Please select a fallback plan';
        }
        break;
      case 'micro_intention':
        if (!formData.micro_intention.trim()) {
          newErrors.micro_intention = 'Please complete your intention';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < TEAMING_PREP.sections.length - 1) {
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
    // Validate all sections
    let isValid = true;
    for (let i = 0; i <= currentSection; i++) {
      if (!validateSection(i)) {
        isValid = false;
      }
    }

    if (!isValid) {
      return;
    }

    setIsSaving(true);
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const entry: ReflectionEntry = {
        user_id: user.id,
        reflection_id: TEAMING_PREP.id,
        entry_kind: 'teaming_prep',
        team_id: undefined, // For future team features
        session_id: undefined, // For future shared sessions
        data: formData,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('reflection_entries')
        .insert([entry]);

      if (error) throw error;

      // Show success message
      if (onComplete) {
        onComplete(formData);
      }
      
      // Show completion screen briefly then close
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error saving reflection:', error);
      setErrors({ save: 'Failed to save reflection. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSectionContent = (section: typeof TEAMING_PREP.sections[0]) => {
    switch (section.kind) {
      case 'sliders+text':
        return (
          <div className="space-y-6">
            <p className="text-lg" style={{ color: '#1A1A1A' }}>
              {section.promptMain}
            </p>
            {section.hint && (
              <p className="text-sm italic" style={{ color: '#5A5A5A' }}>
                {section.hint}
              </p>
            )}
            
            {section.fields?.map((field: FieldConfig) => (
              <div key={field.id} className="space-y-2">
                {field.type === 'slider' && (
                  <>
                    <label className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                      {field.label}
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={formData[field.id as keyof TeamingPrepData] as number}
                        onChange={(e) => handleFieldChange(field.id, Number(e.target.value))}
                        className="flex-1"
                        style={{
                          accentColor: '#6B8B60'
                        }}
                      />
                      <span className="w-12 text-center font-semibold" style={{ color: '#1A1A1A' }}>
                        {formData[field.id as keyof TeamingPrepData]}
                      </span>
                    </div>
                  </>
                )}
                
                {field.type === 'text' && (
                  <>
                    <label className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={formData[field.id as keyof TeamingPrepData] as string}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      maxLength={field.maxLength}
                      placeholder={field.label}
                      aria-label={field.ariaLabel || field.label}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                      style={{
                        borderColor: errors[field.id] ? '#ef4444' : '#E8E5E0'
                      }}
                    />
                    {errors[field.id] && (
                      <p className="text-sm text-red-500">{errors[field.id]}</p>
                    )}
                  </>
                )}
              </div>
            ))}
            
            {section.microcopy && (
              <p className="text-sm italic" style={{ color: '#6B8B60' }}>
                {section.microcopy}
              </p>
            )}
          </div>
        );

      case 'choice+text':
        return (
          <div className="space-y-6">
            <p className="text-lg" style={{ color: '#1A1A1A' }}>
              {section.promptMain}
            </p>
            {section.hint && (
              <p className="text-sm italic" style={{ color: '#5A5A5A' }}>
                {section.hint}
              </p>
            )}
            
            {section.fields?.map((field: FieldConfig) => (
              <div key={field.id} className="space-y-2">
                {field.type === 'select' && (
                  <>
                    <label className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                      {field.label}
                    </label>
                    <select
                      value={formData.signal_type}
                      onChange={(e) => handleFieldChange('signal_type', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sage-500"
                      style={{
                        borderColor: errors.signal_type ? '#ef4444' : '#E8E5E0'
                      }}
                    >
                      <option value="">Select a signal...</option>
                      {field.options.map((option: string) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.signal_type && (
                      <p className="text-sm text-red-500">{errors.signal_type}</p>
                    )}
                  </>
                )}
                
                {field.type === 'text' && formData.signal_type === 'Other' && (
                  <>
                    <label className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={formData.signal_custom || ''}
                      onChange={(e) => handleFieldChange('signal_custom', e.target.value)}
                      maxLength={field.maxLength}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sage-500"
                      style={{
                        borderColor: errors.signal_custom ? '#ef4444' : '#E8E5E0'
                      }}
                    />
                    {errors.signal_custom && (
                      <p className="text-sm text-red-500">{errors.signal_custom}</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        );

      case 'multichoice+choice':
        return (
          <div className="space-y-6">
            <p className="text-lg" style={{ color: '#1A1A1A' }}>
              {section.promptMain}
            </p>
            
            {section.checklist && (
              <div className="space-y-3">
                <label className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                  {section.checklist.label}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {section.checklist.options.map((option: string) => (
                    <label
                      key={option}
                      className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor: formData.stressors.includes(option) ? '#6B8B60' : '#E8E5E0',
                        backgroundColor: formData.stressors.includes(option) ? 'rgba(107, 139, 96, 0.05)' : '#FFFFFF'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.stressors.includes(option)}
                        onChange={() => handleMultiSelect(option)}
                        className="rounded"
                        style={{ accentColor: '#6B8B60' }}
                      />
                      <span className="text-sm" style={{ color: '#1A1A1A' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {section.fallbackPlan && (
              <div className="space-y-3">
                <label className="text-sm font-medium" style={{ color: '#2D5F3F' }}>
                  {section.fallbackPlan.label}
                </label>
                <div className="space-y-2">
                  {section.fallbackPlan.options.map((option: string) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      style={{
                        borderColor: formData.plan_if_sideways === option ? '#6B8B60' : '#E8E5E0',
                        backgroundColor: formData.plan_if_sideways === option ? 'rgba(107, 139, 96, 0.05)' : '#FFFFFF'
                      }}
                    >
                      <input
                        type="radio"
                        name="fallback"
                        value={option}
                        checked={formData.plan_if_sideways === option}
                        onChange={(e) => handleFieldChange('plan_if_sideways', e.target.value)}
                        style={{ accentColor: '#6B8B60' }}
                      />
                      <span className="text-sm" style={{ color: '#1A1A1A' }}>{option}</span>
                    </label>
                  ))}
                </div>
                {errors.plan_if_sideways && (
                  <p className="text-sm text-red-500">{errors.plan_if_sideways}</p>
                )}
              </div>
            )}
            
            {section.hint && (
              <p className="text-sm italic" style={{ color: '#6B8B60' }}>
                {section.hint}
              </p>
            )}
          </div>
        );

      case 'action_check':
        return (
          <div className="space-y-6">
            <div 
              className="p-6 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)',
                border: '1px solid rgba(107, 139, 96, 0.2)'
              }}
            >
              <Eye className="h-8 w-8 mb-4" style={{ color: '#6B8B60' }} />
              <p className="text-lg mb-6" style={{ color: '#1A1A1A' }}>
                {section.promptMain}
              </p>
              
              {section.confirmField && (
                <div className="mt-4">
                  <label
                    className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-white transition-colors"
                    style={{
                      borderColor: formData.viz_done === 'Done!' ? '#6B8B60' : '#E8E5E0',
                      backgroundColor: formData.viz_done === 'Done!' ? '#FFFFFF' : 'transparent'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.viz_done === 'Done!'}
                      onChange={(e) => handleFieldChange('viz_done', 'Done!')}
                      className="rounded"
                      style={{ accentColor: '#6B8B60' }}
                    />
                    <span className="font-medium" style={{ color: '#1A1A1A' }}>
                      Yes, I've completed the visualization
                    </span>
                  </label>
                </div>
              )}
            </div>
            
            {section.microcopy && (
              <p className="text-sm italic" style={{ color: '#6B8B60' }}>
                {section.microcopy}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-6">
            <p className="text-lg" style={{ color: '#1A1A1A' }}>
              {section.promptMain}
            </p>
            
            {section.stem && (
              <p className="text-lg font-semibold" style={{ color: '#2D5F3F' }}>
                {section.stem}
              </p>
            )}
            
            <textarea
              value={formData.micro_intention}
              onChange={(e) => handleFieldChange('micro_intention', e.target.value)}
              placeholder={section.placeholder}
              maxLength={section.maxLength}
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.micro_intention ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.micro_intention && (
              <p className="text-sm text-red-500">{errors.micro_intention}</p>
            )}
            
            {section.affirmation && (
              <div 
                className="p-4 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(107, 139, 96, 0.1) 0%, rgba(92, 127, 79, 0.05) 100%)',
                  border: '1px solid rgba(107, 139, 96, 0.2)'
                }}
              >
                <Heart className="h-5 w-5 mb-2" style={{ color: '#6B8B60' }} />
                <p className="text-sm italic" style={{ color: '#2D5F3F' }}>
                  {section.affirmation}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const currentSectionData = TEAMING_PREP.sections[currentSection];
  const isLastSection = currentSection === TEAMING_PREP.sections.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        style={{ backgroundColor: '#FAF9F6' }}
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
                  background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                  boxShadow: '0 2px 8px rgba(107, 139, 96, 0.3)'
                }}
              >
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  {TEAMING_PREP.title}
                </h2>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  {TEAMING_PREP.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" style={{ color: '#5A5A5A' }} />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex space-x-2">
              {TEAMING_PREP.sections.map((_, index) => (
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
              Step {currentSection + 1} of {TEAMING_PREP.sections.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A1A1A' }}>
              {currentSectionData.title}
            </h3>
          </div>

          {renderSectionContent(currentSectionData)}
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
                background: 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
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
              disabled={isSaving}
              className="px-6 py-2 rounded-lg flex items-center transition-all"
              style={{
                background: isSaving 
                  ? 'linear-gradient(145deg, #9CA3AF 0%, #6B7280 100%)'
                  : 'linear-gradient(145deg, #6B8B60 0%, #5F7F55 100%)',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(107, 139, 96, 0.3)',
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
              <Check className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamingPrepReflection;