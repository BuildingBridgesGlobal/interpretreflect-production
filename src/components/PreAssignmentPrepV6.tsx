/**
 * Pre-Assignment Prep V6 Component
 * 
 * Matches exact Team Interpreting Preparation design pattern
 * with sage green color scheme and consistent styling
 * 
 * @module PreAssignmentPrepV6
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Activity, 
  AlertCircle, 
  Shield, 
  Users, 
  Brain, 
  Compass, 
  Heart, 
  Target,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// import { updateGrowthInsightsForUser } from '../services/growthInsightsService'; // Commented out - uses hanging Supabase client
import { directInsertReflection, directSelectReflections, getSessionToken } from '../services/directSupabaseApi';

interface PreAssignmentPrepV6Props {
  onClose: () => void;
  onComplete?: (data: any) => void;
}

/**
 * Main Component
 */
export function PreAssignmentPrepV6({ onClose, onComplete }: PreAssignmentPrepV6Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    // Section 1: Opening Context
    context_background: '',
    materials_review: '',
    
    // Section 2: Readiness Assessment
    readiness_levels: '',
    anticipated_demands: '',
    
    // Section 3: Control Strategies
    control_strategies: '',
    backup_plans: '',
    
    // Section 4: Role-Space Awareness
    role_space: '',
    
    // Section 5: Mental Preparation
    neuroscience_practices: '',
    triggers_vulnerabilities: '',
    
    // Section 6: Ethics & Culture
    ethics_culture: '',
    
    // Section 7: Growth & Closing
    growth_goals: '',
    intention_statement: '',
    confidence_rating: 5,
    feeling_word: '',
    
    // Metadata
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
      case 0: // Context & Background
        if (!formData.context_background.trim()) {
          newErrors.context_background = 'Please describe the assignment context';
        }
        if (!formData.materials_review.trim()) {
          newErrors.materials_review = 'Please list materials to review';
        }
        break;
      
      case 1: // Readiness Assessment
        if (!formData.readiness_levels.trim()) {
          newErrors.readiness_levels = 'Please describe your readiness levels';
        }
        if (!formData.anticipated_demands.trim()) {
          newErrors.anticipated_demands = 'Please describe anticipated demands';
        }
        break;
      
      case 2: // Control Strategies
        if (!formData.control_strategies.trim()) {
          newErrors.control_strategies = 'Please describe your control strategies';
        }
        if (!formData.backup_plans.trim()) {
          newErrors.backup_plans = 'Please describe backup plans';
        }
        break;
      
      case 3: // Role-Space
        if (!formData.role_space.trim()) {
          newErrors.role_space = 'Please describe your role-space approach';
        }
        break;
      
      case 4: // Mental Preparation
        if (!formData.neuroscience_practices.trim()) {
          newErrors.neuroscience_practices = 'Please describe your mental preparation practices';
        }
        if (!formData.triggers_vulnerabilities.trim()) {
          newErrors.triggers_vulnerabilities = 'Please describe triggers and management strategies';
        }
        break;
      
      case 5: // Ethics & Culture
        if (!formData.ethics_culture.trim()) {
          newErrors.ethics_culture = 'Please describe ethical and cultural considerations';
        }
        break;
      
      case 6: // Growth & Closing
        if (!formData.growth_goals.trim()) {
          newErrors.growth_goals = 'Please describe your growth goals';
        }
        if (!formData.intention_statement.trim()) {
          newErrors.intention_statement = 'Please craft an intention statement';
        }
        if (!formData.feeling_word.trim()) {
          newErrors.feeling_word = 'Please share how you feel in one word';
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
      console.log('PreAssignmentPrepV6 - Already saving, ignoring duplicate click');
      return;
    }

    console.log('PreAssignmentPrepV6 - handleSubmit called');
    console.log('PreAssignmentPrepV6 - User details:', {
      id: user.id,
      email: user.email
    });

    setIsSaving(true);
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      console.log('PreAssignmentPrepV6 - Starting save with sessionId:', sessionId);

      // Prepare answers object
      const answers = {
        context_background: formData.context_background,
        materials_review: formData.materials_review,
        readiness_levels: formData.readiness_levels,
        anticipated_demands: formData.anticipated_demands,
        control_strategies: formData.control_strategies,
        role_space: formData.role_space,
        neuroscience_practices: formData.neuroscience_practices,
        ethics_culture: formData.ethics_culture,
        triggers_vulnerabilities: formData.triggers_vulnerabilities,
        backup_plans: formData.backup_plans,
        growth_goals: formData.growth_goals
      };

      // Save to database using direct API
      console.log('PreAssignmentPrepV6 - Attempting to save to reflection_entries table using direct API');

      // Get the session token
      const accessToken = await getSessionToken();
      console.log('PreAssignmentPrepV6 - Got access token:', !!accessToken);

      // First, test if we can read from the database (auth check)
      console.log('PreAssignmentPrepV6 - Testing database connection with direct API...');
      const { data: testData, error: testError } = await directSelectReflections(user.id, accessToken || undefined);

      console.log('PreAssignmentPrepV6 - Test query result:', { testData, testError });

      if (testError) {
        console.error('PreAssignmentPrepV6 - Cannot read from database:', testError);
        throw new Error(`Database connection issue: ${testError}`);
      }

      // Create a simpler data object
      const reflectionData = {
        user_id: user.id,
        reflection_id: sessionId,
        entry_kind: 'pre_assignment_prep',
        data: formData // Just save the raw form data
      };

      console.log('PreAssignmentPrepV6 - Data to save:', reflectionData);
      console.log('PreAssignmentPrepV6 - Starting insert with direct API...');

      // Try using Supabase client for insert (it might work even if select doesn't)
      console.log('PreAssignmentPrepV6 - Trying Supabase client insert...');

      try {
        // Set a short timeout for the Supabase client
        const insertPromise = supabase
          .from('reflection_entries')
          .insert([reflectionData])
          .select();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Supabase client timeout')), 5000)
        );

        const { data: supabaseData, error: supabaseError } = await Promise.race([
          insertPromise,
          timeoutPromise
        ]) as any;

        if (!supabaseError && supabaseData) {
          console.log('PreAssignmentPrepV6 - Supabase client insert successful!', supabaseData);
          const data = supabaseData[0];
          console.log('PreAssignmentPrepV6 - Save successful!', data);
        } else {
          throw supabaseError || new Error('No data returned');
        }
      } catch (clientError) {
        console.log('PreAssignmentPrepV6 - Supabase client failed, trying direct API...');

        // Fall back to direct API
        const { data, error } = await directInsertReflection(reflectionData, accessToken || undefined);
        console.log('PreAssignmentPrepV6 - Direct API response:', { data, error });

        if (error) {
          console.error('PreAssignmentPrepV6 - Error saving to database:', error);
          throw error;
        }

        console.log('PreAssignmentPrepV6 - Save successful via direct API!', data);
      }

      // Set saving to false immediately after successful save
      setIsSaving(false);

      // Skip growth insights update - it hangs due to Supabase client
      console.log('PreAssignmentPrepV6 - Skipping growth insights update (uses hanging Supabase client)');

      // Close immediately after successful save
      if (onComplete) {
        onComplete(formData);
      }
      setTimeout(() => {
        onClose();
      }, 100); // Small delay to ensure state updates

    } catch (error) {
      console.error('PreAssignmentPrepV6 - Caught error in try/catch:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preparation';
      console.error('PreAssignmentPrepV6 - Error message:', errorMessage);
      setErrors({ save: errorMessage });
      alert(`Error saving reflection: ${errorMessage}`); // Show alert to see the error
    } finally {
      console.log('PreAssignmentPrepV6 - Finally block, setting isSaving to false');
      setIsSaving(false);
    }
  };

  const generateSummary = () => {
    return `PRE-ASSIGNMENT PREPARATION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTEXT:
${formData.context_background}

MATERIALS TO REVIEW:
${formData.materials_review}

MY READINESS:
${formData.readiness_levels}

ROLE-SPACE APPROACH:
${formData.role_space}

MENTAL PREPARATION:
${formData.neuroscience_practices}

MY INTENTION:
${formData.intention_statement}

CONFIDENCE: ${formData.confidence_rating}/10
FEELING: ${formData.feeling_word}
    `.trim();
  };

  const sections = [
    {
      title: "Opening Context",
      icon: <BookOpen className="w-5 h-5" style={{ color: '#6B8B60' }} />,
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
              Setting Your Foundation
            </h3>
            <p className="mb-6" style={{ color: '#5A5A5A' }}>
              Before you begin your interpreting assignment, let's explore the context and materials 
              you'll need. Understanding these elements helps reduce cognitive load and allows you 
              to focus on delivering quality interpretation.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What is the assignment context and participants' backgrounds?
            </label>
            <textarea
              value={formData.context_background}
              onChange={(e) => handleFieldChange('context_background', e.target.value)}
              placeholder="Describe the setting, participants, and any relevant background information..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.context_background ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.context_background && (
              <p className="text-sm text-red-500 mt-1">{errors.context_background}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Which materials, documents, or terminology should you review?
            </label>
            <textarea
              value={formData.materials_review}
              onChange={(e) => handleFieldChange('materials_review', e.target.value)}
              placeholder="List specific materials, glossaries, or documents..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.materials_review ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.materials_review && (
              <p className="text-sm text-red-500 mt-1">{errors.materials_review}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Readiness Assessment",
      icon: <Activity className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What are your emotional and physical readiness levels?
            </label>
            <textarea
              value={formData.readiness_levels}
              onChange={(e) => handleFieldChange('readiness_levels', e.target.value)}
              placeholder="Rate and describe your current state..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.readiness_levels ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.readiness_levels && (
              <p className="text-sm text-red-500 mt-1">{errors.readiness_levels}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Which demands do you anticipate?
            </label>
            <textarea
              value={formData.anticipated_demands}
              onChange={(e) => handleFieldChange('anticipated_demands', e.target.value)}
              placeholder="Environmental, Interpersonal, Paralinguistic, Intrapersonal..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.anticipated_demands ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.anticipated_demands && (
              <p className="text-sm text-red-500 mt-1">{errors.anticipated_demands}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Control & Contingency Planning",
      icon: <Shield className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What control strategies do you have for anticipated demands?
            </label>
            <textarea
              value={formData.control_strategies}
              onChange={(e) => handleFieldChange('control_strategies', e.target.value)}
              placeholder="List specific strategies for each type of demand..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.control_strategies ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.control_strategies && (
              <p className="text-sm text-red-500 mt-1">{errors.control_strategies}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What backup plans do you have for unexpected challenges?
            </label>
            <textarea
              value={formData.backup_plans}
              onChange={(e) => handleFieldChange('backup_plans', e.target.value)}
              placeholder="Describe contingency plans..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.backup_plans ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.backup_plans && (
              <p className="text-sm text-red-500 mt-1">{errors.backup_plans}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Role-Space Awareness",
      icon: <Users className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How do your role, alignment, and interaction management show up in this assignment?
            </label>
            <textarea
              value={formData.role_space}
              onChange={(e) => handleFieldChange('role_space', e.target.value)}
              placeholder="Describe your professional boundaries and positioning..."
              rows={6}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.role_space ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.role_space && (
              <p className="text-sm text-red-500 mt-1">{errors.role_space}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Mental Preparation & Self-Care",
      icon: <Brain className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What practices will you use for focus and regulation?
            </label>
            <textarea
              value={formData.neuroscience_practices}
              onChange={(e) => handleFieldChange('neuroscience_practices', e.target.value)}
              placeholder="Mindfulness, breathing, grounding techniques..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.neuroscience_practices ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.neuroscience_practices && (
              <p className="text-sm text-red-500 mt-1">{errors.neuroscience_practices}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What are your triggers or vulnerabilities and how will you manage them?
            </label>
            <textarea
              value={formData.triggers_vulnerabilities}
              onChange={(e) => handleFieldChange('triggers_vulnerabilities', e.target.value)}
              placeholder="Be honest about challenges and management strategies..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.triggers_vulnerabilities ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.triggers_vulnerabilities && (
              <p className="text-sm text-red-500 mt-1">{errors.triggers_vulnerabilities}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Ethics & Cultural Awareness",
      icon: <Compass className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Are you prepared for the cultural context and potential ethical dilemmas?
            </label>
            <textarea
              value={formData.ethics_culture}
              onChange={(e) => handleFieldChange('ethics_culture', e.target.value)}
              placeholder="Identify cultural considerations and ethical boundaries..."
              rows={5}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.ethics_culture ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.ethics_culture && (
              <p className="text-sm text-red-500 mt-1">{errors.ethics_culture}</p>
            )}
          </div>
        </div>
      )
    },
    {
      title: "Closing Commitment",
      icon: <Target className="w-5 h-5" style={{ color: '#6B8B60' }} />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              What goals do you have for professional growth in this assignment?
            </label>
            <textarea
              value={formData.growth_goals}
              onChange={(e) => handleFieldChange('growth_goals', e.target.value)}
              placeholder="Identify specific skills to develop..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.growth_goals ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.growth_goals && (
              <p className="text-sm text-red-500 mt-1">{errors.growth_goals}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Craft a one-sentence intention for this assignment
            </label>
            <input
              type="text"
              value={formData.intention_statement}
              onChange={(e) => handleFieldChange('intention_statement', e.target.value)}
              placeholder="I will..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.intention_statement ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.intention_statement && (
              <p className="text-sm text-red-500 mt-1">{errors.intention_statement}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              Rate your confidence level (1-10)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.confidence_rating}
                onChange={(e) => handleFieldChange('confidence_rating', parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#6B8B60' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(107, 139, 96, 0.1)',
                  color: '#2D5F3F'
                }}>
                {formData.confidence_rating}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2D5F3F' }}>
              How are you feeling right now? (one word)
            </label>
            <input
              type="text"
              value={formData.feeling_word}
              onChange={(e) => handleFieldChange('feeling_word', e.target.value)}
              placeholder="e.g., ready, nervous, excited, focused..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sage-500"
              style={{
                borderColor: errors.feeling_word ? '#ef4444' : '#E8E5E0'
              }}
            />
            {errors.feeling_word && (
              <p className="text-sm text-red-500 mt-1">{errors.feeling_word}</p>
            )}
          </div>

          {showSummary && (
            <div className="mt-8">
              <p className="text-sm font-medium mb-4" style={{ color: '#2D5F3F' }}>
                Your preparation has been saved! Here's your summary:
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
    <>
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
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>
                  Pre-Assignment Preparation
                </h2>
                <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                  Thoughtful preparation for interpreting success
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
                  Complete Preparation
                  <Check className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default PreAssignmentPrepV6;