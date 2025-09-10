import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Users,
  MessageSquare,
  HandHeart,
  MapPin,
  Info,
  AlertCircle,
  Shield,
  Eye,
  Target,
  Heart
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface InSessionTeamSyncProps {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

export const InSessionTeamSync: React.FC<InSessionTeamSyncProps> = ({ onClose, onComplete }) => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state for all fields
  const [formData, setFormData] = useState({
    // Section 1: Communication Check
    communication_system: '',
    communication_rating: 5,
    
    // Section 2: Role Management
    role_switching: '',
    switch_timing: '',
    
    // Section 3: Mutual Support
    support_needs: '',
    support_rating: 5,
    
    // Section 4: Positioning & Environment
    positioning: '',
    environment_notes: '',
    
    // Section 5: Information Sharing
    info_needs: '',
    clarification_priority: '',
    
    // Section 6: Content Management
    challenging_content: '',
    content_strategy: '',
    
    // Section 7: Professional Standards
    standards_check: '',
    boundaries_maintained: 'yes',
    
    // Section 8: Environmental Factors
    environmental_concerns: '',
    joint_attention: '',
    
    // Section 9: Collaboration Optimization
    optimization_ideas: '',
    participant_needs: '',
    
    // Section 10: Team Effectiveness
    team_support: '',
    effectiveness_rating: 5,
    team_commitment: ''
  });

  // Section definitions
  const sections = [
    {
      title: "Communication Check",
      icon: <MessageSquare className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'communication_system',
          label: "Is our communication and support system working effectively?",
          type: 'textarea',
          placeholder: "Assess current communication effectiveness and any adjustments needed...",
          required: true
        },
        {
          id: 'communication_rating',
          label: "Rate current communication effectiveness",
          type: 'slider',
          min: 1,
          max: 10,
          step: 1
        }
      ]
    },
    {
      title: "Role Management",
      icon: <Users className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'role_switching',
          label: "When should we switch roles and how will we signal this?",
          type: 'textarea',
          placeholder: "Define switching criteria and signals...",
          required: true
        },
        {
          id: 'switch_timing',
          label: "Next planned switch (if applicable)",
          type: 'text',
          placeholder: "e.g., In 15 minutes, After next break, When fatigue shows"
        }
      ]
    },
    {
      title: "Mutual Support",
      icon: <HandHeart className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'support_needs',
          label: "How can we best support each other right now?",
          type: 'textarea',
          placeholder: "Identify specific support needs and strategies...",
          required: true
        },
        {
          id: 'support_rating',
          label: "Current support level",
          type: 'slider',
          min: 1,
          max: 10,
          step: 1
        }
      ]
    },
    {
      title: "Positioning & Environment",
      icon: <MapPin className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'positioning',
          label: "Are we maintaining appropriate positioning and environment management?",
          type: 'textarea',
          placeholder: "Assess positioning, sightlines, and environmental control...",
          required: true
        },
        {
          id: 'environment_notes',
          label: "Environmental adjustments needed",
          type: 'text',
          placeholder: "Note any changes needed to optimize the space"
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: <Info className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'info_needs',
          label: "What information or clarification does my partner need?",
          type: 'textarea',
          placeholder: "Identify key information to share or clarify...",
          required: true
        },
        {
          id: 'clarification_priority',
          label: "Priority clarifications",
          type: 'text',
          placeholder: "List most urgent items to clarify"
        }
      ]
    },
    {
      title: "Content Management",
      icon: <AlertCircle className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'challenging_content',
          label: "How are we handling challenging or sensitive content together?",
          type: 'textarea',
          placeholder: "Assess approach to difficult material and support strategies...",
          required: true
        },
        {
          id: 'content_strategy',
          label: "Content management strategy",
          type: 'text',
          placeholder: "Note specific strategies for current content"
        }
      ]
    },
    {
      title: "Professional Standards",
      icon: <Shield className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'standards_check',
          label: "Are we both maintaining professional standards and boundaries?",
          type: 'textarea',
          placeholder: "Review adherence to professional standards...",
          required: true
        },
        {
          id: 'boundaries_maintained',
          label: "Boundaries status",
          type: 'select',
          options: [
            { value: 'yes', label: 'Both maintaining well' },
            { value: 'needs_attention', label: 'Needs attention' },
            { value: 'concern', label: 'Immediate concern' }
          ]
        }
      ]
    },
    {
      title: "Environmental Factors",
      icon: <Eye className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'environmental_concerns',
          label: "What environmental factors need our joint attention?",
          type: 'textarea',
          placeholder: "Identify environmental issues requiring team coordination...",
          required: true
        },
        {
          id: 'joint_attention',
          label: "Priority environmental items",
          type: 'text',
          placeholder: "List factors needing immediate team attention"
        }
      ]
    },
    {
      title: "Collaboration Optimization",
      icon: <Target className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'optimization_ideas',
          label: "How can we optimize our collaboration for the participants?",
          type: 'textarea',
          placeholder: "Identify ways to improve team effectiveness for participants...",
          required: true
        },
        {
          id: 'participant_needs',
          label: "Participant-focused adjustments",
          type: 'text',
          placeholder: "Note specific adjustments to better serve participants"
        }
      ]
    },
    {
      title: "Team Effectiveness",
      icon: <Heart className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      fields: [
        {
          id: 'team_support',
          label: "Are we both feeling supported and able to perform effectively?",
          type: 'textarea',
          placeholder: "Assess mutual support and performance capacity...",
          required: true
        },
        {
          id: 'effectiveness_rating',
          label: "Team effectiveness rating",
          type: 'slider',
          min: 1,
          max: 10,
          step: 1
        },
        {
          id: 'team_commitment',
          label: "Our team commitment/action for the remainder of this assignment",
          type: 'textarea',
          placeholder: "What specific action will we take together to maintain or improve our teamwork?",
          required: true
        }
      ]
    }
  ];

  // Validation
  const validateSection = (sectionIndex: number): boolean => {
    const section = sections[sectionIndex];
    const newErrors: Record<string, string> = {};
    
    section.fields.forEach((field) => {
      if (field.required && !formData[field.id as keyof typeof formData]) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setErrors({});
    }
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateSection(currentSection)) return;
    
    setIsSubmitting(true);
    
    try {
      const reflectionData = {
        ...formData,
        completed_at: new Date().toISOString(),
        module_type: 'in_session_team_sync'
      };

      // Save to Supabase if authenticated
      if (user) {
        const { error } = await supabase
          .from('interpreter_reflections')
          .insert({
            user_id: user.id,
            reflection_type: 'in_session_team_sync',
            reflection_data: reflectionData,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error saving team sync:', error);
        }
      }

      // Save to localStorage as well
      localStorage.setItem('lastTeamSync', JSON.stringify(reflectionData));
      
      if (onComplete) {
        onComplete(reflectionData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting team sync:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Input change handler
  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Render field based on type
  const renderField = (field: any) => {
    const value = formData[field.id as keyof typeof formData];
    const error = errors[field.id];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              {field.label}
            </label>
            <textarea
              value={value || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-4 py-3 rounded-lg border ${
                error ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-sage-500`}
              rows={4}
              style={{ backgroundColor: '#FFFFFF' }}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'text':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              {field.label}
            </label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-4 py-3 rounded-lg border ${
                error ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-sage-500`}
              style={{ backgroundColor: '#FFFFFF' }}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              {field.label}
            </label>
            <select
              value={value || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                error ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-sage-500`}
              style={{ backgroundColor: '#FFFFFF' }}
            >
              {field.options.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'slider':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              {field.label}
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm" style={{ color: '#5F7F55' }}>{field.min}</span>
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={value || field.min}
                onChange={(e) => handleInputChange(field.id, parseInt(e.target.value))}
                className="flex-1"
                style={{
                  accentColor: '#6B8B60'
                }}
              />
              <span className="text-sm" style={{ color: '#5F7F55' }}>{field.max}</span>
              <span className="ml-4 px-3 py-1 rounded-full text-sm font-medium" 
                style={{ backgroundColor: '#E8F0E8', color: '#2D5F3F' }}>
                {value}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentSectionData = sections[currentSection];
  const progress = ((currentSection + 1) / sections.length) * 100;
  
  // Debug logging
  console.log('Current section:', currentSection);
  console.log('Total sections:', sections.length);
  console.log('Is last section?', currentSection === sections.length - 1);
  console.log('Button should show:', currentSection === sections.length - 1 ? 'Complete Sync' : 'Next');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b flex-shrink-0" style={{ backgroundColor: '#FAF9F6' }}>
        onClick={(e) => e.stopPropagation()}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                In-Session Team Sync
              </h2>
              <p className="text-sm mt-1" style={{ color: '#5F7F55' }}>
                Boosting coordination and mutual support, one break at a time.
              </p>
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

          {/* Research Foundation */}
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#E8F0E8' }}>
            <p className="text-sm" style={{ color: '#2D5F3F' }}>
              <strong>Research Foundation:</strong> Effective team communication improves interpretation quality by 20-25% 
              (Team Dynamics in Healthcare Interpreting, 2023). Regular team check-ins during assignments enhance 
              coordination, reduce errors, and improve participant satisfaction.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: '#5F7F55' }}>
                Section {currentSection + 1} of {sections.length}
              </span>
              <span style={{ color: '#5F7F55' }}>
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${progress}%`,
                  background: 'linear-gradient(135deg, #1b5e20, #2e7d32)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 overflow-y-auto flex-grow">
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#E8F0E8' }}>
              {currentSectionData.icon}
            </div>
            <h3 className="text-xl font-semibold" style={{ color: '#2D5F3F' }}>
              {currentSectionData.title}
            </h3>
          </div>

          {currentSectionData.fields.map(renderField)}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t flex-shrink-0" style={{ backgroundColor: '#FAF9F6' }}>
        onClick={(e) => e.stopPropagation()}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center
                ${currentSection === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white border border-sage-600 text-sage-700 hover:bg-sage-50'}`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg font-medium text-white transition-all flex items-center hover:opacity-90"
              style={{ 
                background: isSubmitting ? '#CCCCCC' : 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                opacity: isSubmitting ? 0.5 : 1
              }}
            >
              {isSubmitting ? (
                'Saving...'
              ) : currentSection === sections.length - 1 ? (
                'Complete Sync'
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};