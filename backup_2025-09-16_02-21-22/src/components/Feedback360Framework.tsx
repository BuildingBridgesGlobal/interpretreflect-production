import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, User, Users, Building, UserCheck, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { deepDiveFrameworks } from '../data/deepDiveFrameworks';

interface Feedback360FrameworkProps {
  onClose: () => void;
  onComplete?: () => void;
}

export const Feedback360Framework: React.FC<Feedback360FrameworkProps> = ({ onClose, onComplete }) => {
  const framework = deepDiveFrameworks.feedback360;
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sectionIcons = [
    <User className="w-5 h-5" style={{ color: '#6B8B60' }} />,
    <Users className="w-5 h-5" style={{ color: '#6B8B60' }} />,
    <UserCheck className="w-5 h-5" style={{ color: '#6B8B60' }} />,
    <Building className="w-5 h-5" style={{ color: '#6B8B60' }} />,
    <TrendingUp className="w-5 h-5" style={{ color: '#6B8B60' }} />
  ];

  const handleInputChange = (questionId: string, value: string) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
    setValidationErrors(prev => {
      const newErrors = new Set(prev);
      newErrors.delete(questionId);
      return newErrors;
    });
  };

  const validateSection = (sectionIndex: number): boolean => {
    const section = framework.sections[sectionIndex];
    const errors = new Set<string>();
    
    section.questions.forEach(question => {
      if (!formData[question.id] || formData[question.id].trim() === '') {
        errors.add(question.id);
      }
    });
    
    setValidationErrors(errors);
    return errors.size === 0;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < framework.sections.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateSection(currentSection)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to save your reflection');
        return;
      }

      const { error } = await supabase
        .from('reflections')
        .insert({
          user_id: user.id,
          reflection_type: '360_feedback',
          content: formData,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;

      if (onComplete) {
        onComplete();
      }
      onClose();
    } catch (error) {
      console.error('Error saving reflection:', error);
      alert('Failed to save reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSectionData = framework.sections[currentSection];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#FAF9F6',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #E5E5E5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
              {framework.name}
            </h2>
            <p className="text-sm mt-1" style={{ color: '#666666' }}>
              {framework.description}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F0F0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-5 h-5" style={{ color: '#666666' }} />
          </button>
        </div>

        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E5E5E5',
          backgroundColor: '#FFFFFF',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {framework.sections.map((section, index) => (
              <div key={index} style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: index <= currentSection ? '#6B8B60' : '#E5E5E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.3s'
                  }}>
                    {sectionIcons[index]}
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: index === currentSection ? '#1A1A1A' : '#999999',
                    fontWeight: index === currentSection ? '600' : '400'
                  }}>
                    {section.title}
                  </span>
                </div>
                <div style={{
                  height: '4px',
                  backgroundColor: index < currentSection ? '#6B8B60' : (index === currentSection ? '#B8D4B8' : '#E5E5E5'),
                  borderRadius: '2px',
                  transition: 'background-color 0.3s'
                }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {sectionIcons[currentSection]}
            <h3 className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
              {currentSectionData.title}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {currentSectionData.questions.map(question => (
              <div key={question.id}>
                <label
                  htmlFor={question.id}
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#1A1A1A'
                  }}
                >
                  {question.question}
                </label>
                <textarea
                  id={question.id}
                  value={formData[question.id] || ''}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: validationErrors.has(question.id) ? '2px solid #EF4444' : '1px solid #E5E5E5',
                    fontSize: '14px',
                    resize: 'vertical',
                    backgroundColor: '#FFFFFF',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="Share your reflection..."
                />
                {validationErrors.has(question.id) && (
                  <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                    Please provide a response to this question
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #E5E5E5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          flexShrink: 0
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentSection === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #E5E5E5',
              backgroundColor: currentSection === 0 ? '#F5F5F5' : '#FFFFFF',
              color: currentSection === 0 ? '#999999' : '#1A1A1A',
              cursor: currentSection === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span style={{ color: '#666666', fontSize: '14px' }}>
            Section {currentSection + 1} of {framework.sections.length}
          </span>

          {currentSection === framework.sections.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isSubmitting ? '#B8D4B8' : '#6B8B60',
                color: '#FFFFFF',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isSubmitting ? 'Saving...' : 'Complete Feedback'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5F7F55'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6B8B60'}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};