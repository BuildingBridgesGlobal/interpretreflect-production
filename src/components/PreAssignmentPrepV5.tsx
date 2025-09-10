/**
 * Pre-Assignment Prep V5 Component
 * 
 * Fully matches Teaming Prep UI/UX design pattern with:
 * - Step counter (1 of 7 format)
 * - Context framing for each step
 * - Consistent colors and typography
 * - Linear flow with next/back navigation
 * - Final confidence rating and feeling word
 * 
 * @module PreAssignmentPrepV5
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircle,
  X,
  Sparkles,
  Save
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateGrowthInsightsForUser } from '../services/growthInsightsService';

interface PreAssignmentPrepV5Props {
  onClose?: () => void;
  onComplete?: (data: any) => void;
}

/**
 * Main Component
 */
export function PreAssignmentPrepV5({ onClose, onComplete }: PreAssignmentPrepV5Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const startTime = Date.now();
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Form state for all fields
  const [formData, setFormData] = useState({
    // Section 1: Context & Background
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

  // Auto-save draft every time user completes a section
  const autoSaveDraft = useCallback(async () => {
    if (!user || isAutoSaving) return;
    
    setIsAutoSaving(true);
    try {
      // Collect current answers
      const currentAnswers = {
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

      // Filter out empty answers
      const nonEmptyAnswers = Object.entries(currentAnswers)
        .filter(([_, value]) => value && value.trim())
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      if (Object.keys(nonEmptyAnswers).length > 0) {
        const { error } = await supabase
          .from('pre_assignment_reflections')
          .upsert(
            {
              user_id: user.id,
              session_id: sessionId,
              reflection_type: 'pre_assignment_prep',
              answers: nonEmptyAnswers,
              status: 'draft',
              metadata: {
                questions_answered: Object.keys(nonEmptyAnswers).length,
                total_questions: 11,
                current_section: currentSection,
                last_saved: new Date().toISOString()
              },
              updated_at: new Date().toISOString()
            },
            { 
              onConflict: 'user_id,session_id',
              ignoreDuplicates: false 
            }
          );

        if (!error) {
          setLastSaved(new Date());
        }
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [user, formData, currentSection, sessionId, isAutoSaving]);

  // Auto-save when moving between sections
  useEffect(() => {
    if (currentSection > 0) {
      autoSaveDraft();
    }
  }, [currentSection]);

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (sectionIndex) {
      case 0: // Context & Background
        if (!formData.context_background.trim() || formData.context_background.length < 50) {
          newErrors.context_background = 'Please provide at least 50 characters about the context';
        }
        if (!formData.materials_review.trim() || formData.materials_review.length < 30) {
          newErrors.materials_review = 'Please list materials to review (at least 30 characters)';
        }
        break;
      
      case 1: // Readiness Assessment
        if (!formData.readiness_levels.trim() || formData.readiness_levels.length < 50) {
          newErrors.readiness_levels = 'Please describe your readiness levels (at least 50 characters)';
        }
        if (!formData.anticipated_demands.trim() || formData.anticipated_demands.length < 50) {
          newErrors.anticipated_demands = 'Please describe anticipated demands (at least 50 characters)';
        }
        break;
      
      case 2: // Control Strategies
        if (!formData.control_strategies.trim() || formData.control_strategies.length < 50) {
          newErrors.control_strategies = 'Please describe your control strategies (at least 50 characters)';
        }
        if (!formData.backup_plans.trim() || formData.backup_plans.length < 50) {
          newErrors.backup_plans = 'Please describe backup plans (at least 50 characters)';
        }
        break;
      
      case 3: // Role-Space
        if (!formData.role_space.trim() || formData.role_space.length < 100) {
          newErrors.role_space = 'Please provide a detailed response about role-space (at least 100 characters)';
        }
        break;
      
      case 4: // Mental Preparation
        if (!formData.neuroscience_practices.trim() || formData.neuroscience_practices.length < 50) {
          newErrors.neuroscience_practices = 'Please describe your mental preparation practices (at least 50 characters)';
        }
        if (!formData.triggers_vulnerabilities.trim() || formData.triggers_vulnerabilities.length < 50) {
          newErrors.triggers_vulnerabilities = 'Please describe triggers and management strategies (at least 50 characters)';
        }
        break;
      
      case 5: // Ethics & Culture
        if (!formData.ethics_culture.trim() || formData.ethics_culture.length < 50) {
          newErrors.ethics_culture = 'Please describe ethical and cultural considerations (at least 50 characters)';
        }
        break;
      
      case 6: // Growth & Closing
        if (!formData.growth_goals.trim() || formData.growth_goals.length < 50) {
          newErrors.growth_goals = 'Please describe your growth goals (at least 50 characters)';
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

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateSection(currentSection)) return;
    if (!user) {
      alert('You must be logged in to save your preparation');
      return;
    }

    setIsSaving(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Prepare answers object matching the original question IDs
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

      // Step 1: Save to database using Supabase SDK
      const { data, error } = await supabase
        .from('pre_assignment_reflections')
        .upsert(
          {
            user_id: user.id,
            session_id: sessionId,
            reflection_type: 'pre_assignment_prep',
            answers,
            status: 'completed',
            metadata: {
              questions_answered: Object.keys(answers).length,
              total_questions: 11,
              completion_time: new Date().toISOString(),
              time_spent_seconds: timeSpent,
              confidence_rating: formData.confidence_rating,
              feeling_word: formData.feeling_word,
              intention_statement: formData.intention_statement
            },
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'user_id,session_id',
            ignoreDuplicates: false 
          }
        )
        .select()
        .single();

      if (error) throw error;

      // Step 2: Trigger Growth Insights/Analytics Update
      const insightsResult = await updateGrowthInsightsForUser(user.id, answers);
      
      if (insightsResult.success) {
        console.log('Growth insights updated successfully');
        
        // Optional: Store the insights connection
        if (data?.id) {
          await supabase
            .from('reflection_insights_link')
            .insert({
              reflection_id: data.id,
              reflection_type: 'pre_assignment_prep',
              user_id: user.id,
              insights_updated: true,
              updated_at: new Date().toISOString()
            });
        }
      } else {
        console.warn('Growth insights update failed:', insightsResult.error);
        // Don't fail the whole submission if insights fail
      }

      // Show summary
      setShowSummary(true);
      
      // Call onComplete if provided
      if (onComplete) {
        onComplete({
          ...formData,
          answers,
          sessionId,
          insightsUpdated: insightsResult.success
        });
      }
    } catch (error) {
      console.error('Error saving preparation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preparation';
      setErrors({ submit: errorMessage });
      
      // Broadcast error for user notification
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('reflection-error', { 
          detail: { message: errorMessage, type: 'pre_assignment_prep' }
        }));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    {
      title: "Context & Preparation",
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 247, 220, 0.3) 0%, rgba(255, 243, 196, 0.2) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
              Setting the Foundation
            </h3>
            <p className="mb-6" style={{ color: '#4b5563' }}>
              Understanding your assignment context and preparing materials ahead of time reduces 
              cognitive load and allows you to focus on delivering quality interpretation.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
              What is the assignment context and what are the participants' backgrounds?
            </label>
            <textarea
              value={formData.context_background}
              onChange={(e) => handleFieldChange('context_background', e.target.value)}
              placeholder="Describe the setting, participants, and any relevant background information..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2"
              style={{
                borderColor: errors.context_background ? '#ef4444' : '#fbbf24',
                backgroundColor: '#fffef5',
                color: '#1f2937'
              }}
            />
            {errors.context_background && (
              <p className="text-sm text-red-500 mt-1">{errors.context_background}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
              Which materials, documents, or terminology should you review?
            </label>
            <textarea
              value={formData.materials_review}
              onChange={(e) => handleFieldChange('materials_review', e.target.value)}
              placeholder="List specific materials, glossaries, or documents you need to review..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2"
              style={{
                borderColor: errors.materials_review ? '#ef4444' : '#fbbf24',
                backgroundColor: '#fffef5',
                color: '#1f2937'
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
      icon: <Activity className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 247, 220, 0.3) 0%, rgba(255, 243, 196, 0.2) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
              Checking In With Yourself
            </h3>
            <p className="mb-6" style={{ color: '#4b5563' }}>
              Self-awareness is crucial for performance. By acknowledging your current state and 
              anticipating challenges, you can better prepare strategies to maintain your best professional self.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
              What are your emotional and physical readiness levels?
            </label>
            <textarea
              value={formData.readiness_levels}
              onChange={(e) => handleFieldChange('readiness_levels', e.target.value)}
              placeholder="Rate and describe your current emotional state and physical energy..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2"
              style={{
                borderColor: errors.readiness_levels ? '#ef4444' : '#fbbf24',
                backgroundColor: '#fffef5',
                color: '#1f2937'
              }}
            />
            {errors.readiness_levels && (
              <p className="text-sm text-red-500 mt-1">{errors.readiness_levels}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
              Which demands do you anticipate? (Environmental, Interpersonal, Paralinguistic, Intrapersonal)
            </label>
            <textarea
              value={formData.anticipated_demands}
              onChange={(e) => handleFieldChange('anticipated_demands', e.target.value)}
              placeholder="Consider noise levels, relationship dynamics, tone/pace challenges, and internal pressures..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2"
              style={{
                borderColor: errors.anticipated_demands ? '#ef4444' : '#fbbf24',
                backgroundColor: '#fffef5',
                color: '#1f2937'
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
      icon: <Shield className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 247, 220, 0.3) 0%, rgba(255, 243, 196, 0.2) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
              Building Your Safety Net
            </h3>
            <p className="mb-6" style={{ color: '#4b5563' }}>
              Having strategies ready reduces stress in the moment. Plan B thinking helps you stay 
              adaptable and confident even when unexpected challenges arise.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
              What control strategies do you have for anticipated demands?
            </label>
            <textarea
              value={formData.control_strategies}
              onChange={(e) => handleFieldChange('control_strategies', e.target.value)}
              placeholder="List specific strategies for each type of demand you anticipate..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2"
              style={{
                borderColor: errors.control_strategies ? '#ef4444' : '#fbbf24',
                backgroundColor: '#fffef5',
                color: '#1f2937'
              }}
            />
            {errors.control_strategies && (
              <p className="text-sm text-red-500 mt-1">{errors.control_strategies}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
              What backup plans do you have for unexpected challenges?
            </label>
            <textarea
              value={formData.backup_plans}
              onChange={(e) => handleFieldChange('backup_plans', e.target.value)}
              placeholder="Describe your contingency plans for technical, emotional, or content challenges..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2"
              style={{
                borderColor: errors.backup_plans ? '#ef4444' : '#fbbf24',
                backgroundColor: '#fffef5',
                color: '#1f2937'
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
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 247, 220, 0.3) 0%, rgba(255, 243, 196, 0.2) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
              Professional Boundaries
            </h3>
            <p className="mb-6" style={{ color: '#4b5563' }}>
              Clear role boundaries protect your professional integrity. Understanding your position, 
              alignment, and responsibilities helps maintain ethical practice.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
              How do your role, alignment with participants, and interaction management responsibilities 
              show up in this assignment?
            </label>
            <textarea
              value={formData.role_space}
              onChange={(e) => handleFieldChange('role_space', e.target.value)}
              placeholder="Describe your professional boundaries, positioning, and role clarity strategies..."
              rows={6}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2"
              style={{
                borderColor: errors.role_space ? '#ef4444' : '#fbbf24',
                backgroundColor: '#fffef5',
                color: '#1f2937'
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
      icon: <Brain className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 247, 220, 0.3) 0%, rgba(255, 243, 196, 0.2) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
              Mind & Body Readiness
            </h3>
            <p className="mb-6" style={{ color: '#4b5563' }}>
              Mental preparation techniques improve performance and reduce anxiety. Knowing your 
              vulnerabilities helps you protect yourself and maintain professional wellness.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
              What practices will you use for focus and regulation? (mindfulness, attention reset, etc.)
            </label>
            <textarea
              value={formData.neuroscience_practices}
              onChange={(e) => handleFieldChange('neuroscience_practices', e.target.value)}
              placeholder="List specific techniques like breathing exercises, grounding, or visualization..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2"
              style={{
                borderColor: errors.neuroscience_practices ? '#ef4444' : '#fbbf24',
                backgroundColor: '#fffef5',
                color: '#1f2937'
              }}
            />
            {errors.neuroscience_practices && (
              <p className="text-sm text-red-500 mt-1">{errors.neuroscience_practices}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
              What are your triggers or areas of vulnerability and how will you manage them?
            </label>
            <textarea
              value={formData.triggers_vulnerabilities}
              onChange={(e) => handleFieldChange('triggers_vulnerabilities', e.target.value)}
              placeholder="Be honest about what might be challenging and your management strategies..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2"
              style={{
                borderColor: errors.triggers_vulnerabilities ? '#ef4444' : '#fbbf24',
                backgroundColor: '#fffef5',
                color: '#1f2937'
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
      icon: <Compass className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 247, 220, 0.3) 0%, rgba(255, 243, 196, 0.2) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
              Ethical Compass Check
            </h3>
            <p className="mb-6" style={{ color: '#4b5563' }}>
              Ethical awareness guides professional decision-making. Cultural sensitivity ensures 
              respectful and effective communication across diverse communities.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
              Are you prepared for the cultural context and potential ethical dilemmas? List any concerns.
            </label>
            <textarea
              value={formData.ethics_culture}
              onChange={(e) => handleFieldChange('ethics_culture', e.target.value)}
              placeholder="Identify cultural considerations, ethical boundaries, or potential conflicts..."
              rows={5}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2"
              style={{
                borderColor: errors.ethics_culture ? '#ef4444' : '#fbbf24',
                backgroundColor: '#fffef5',
                color: '#1f2937'
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
      title: "Growth Goals & Closing Commitment",
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div 
            className="p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 247, 220, 0.3) 0%, rgba(255, 243, 196, 0.2) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>
              Setting Your Intention
            </h3>
            <p className="mb-6" style={{ color: '#4b5563' }}>
              Intentional growth turns every assignment into a learning opportunity. Let's set your 
              focus for this assignment and check in with how you're feeling.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
              What goals do you have for professional growth in this assignment?
            </label>
            <textarea
              value={formData.growth_goals}
              onChange={(e) => handleFieldChange('growth_goals', e.target.value)}
              placeholder="Identify specific skills to develop and how you'll measure progress..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2"
              style={{
                borderColor: errors.growth_goals ? '#ef4444' : '#fbbf24',
                backgroundColor: '#fffef5',
                color: '#1f2937'
              }}
            />
            {errors.growth_goals && (
              <p className="text-sm text-red-500 mt-1">{errors.growth_goals}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
              Craft a one-sentence intention for this assignment
            </label>
            <input
              type="text"
              value={formData.intention_statement}
              onChange={(e) => handleFieldChange('intention_statement', e.target.value)}
              placeholder="I will..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2"
              style={{
                borderColor: errors.intention_statement ? '#ef4444' : '#fbbf24',
                backgroundColor: '#fffef5',
                color: '#1f2937'
              }}
            />
            {errors.intention_statement && (
              <p className="text-sm text-red-500 mt-1">{errors.intention_statement}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
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
                style={{ accentColor: '#fbbf24' }}
              />
              <span className="text-2xl font-bold px-4 py-2 rounded-lg" 
                style={{ 
                  backgroundColor: '#fff7dc',
                  color: '#1f2937',
                  border: '2px solid #fbbf24'
                }}>
                {formData.confidence_rating}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1f2937' }}>
              How are you feeling right now? (one word)
            </label>
            <input
              type="text"
              value={formData.feeling_word}
              onChange={(e) => handleFieldChange('feeling_word', e.target.value)}
              placeholder="e.g., ready, nervous, excited, focused..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2"
              style={{
                borderColor: errors.feeling_word ? '#ef4444' : '#fbbf24',
                backgroundColor: '#fffef5',
                color: '#1f2937'
              }}
            />
            {errors.feeling_word && (
              <p className="text-sm text-red-500 mt-1">{errors.feeling_word}</p>
            )}
          </div>
        </div>
      )
    }
  ];

  if (showSummary) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="text-center mb-8">
            <CheckCircle className="w-20 h-20 mx-auto mb-6" style={{ color: '#10b981' }} />
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#1f2937' }}>
              Pre-Assignment Prep Complete!
            </h2>
            <p className="text-lg mb-2" style={{ color: '#4b5563' }}>
              You're well-prepared for your assignment.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#fff7dc', border: '2px solid #fbbf24' }}>
              <h3 className="font-semibold mb-2" style={{ color: '#1f2937' }}>Your Intention:</h3>
              <p style={{ color: '#4b5563' }}>{formData.intention_statement}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#f3f4f6' }}>
                <p className="text-sm" style={{ color: '#6b7280' }}>Confidence Level</p>
                <p className="text-2xl font-bold" style={{ color: '#1f2937' }}>
                  {formData.confidence_rating}/10
                </p>
              </div>
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#f3f4f6' }}>
                <p className="text-sm" style={{ color: '#6b7280' }}>Current Feeling</p>
                <p className="text-2xl font-bold" style={{ color: '#1f2937' }}>
                  {formData.feeling_word}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                if (onClose) onClose();
                else navigate('/');
              }}
              className="px-8 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{ 
                background: '#fff7dc',
                color: '#1f2937',
                border: '2px solid #fbbf24'
              }}
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => navigate('/growth-insights')}
              className="px-8 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{ 
                background: '#10b981',
                color: '#ffffff'
              }}
            >
              View Growth Insights
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b flex items-center justify-between" style={{ backgroundColor: '#fafbfc' }}>
          <div className="flex-1">
            <h2 className="text-2xl font-bold" style={{ color: '#1f2937' }}>
              Pre-Assignment Preparation
            </h2>
            <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
              Step {currentSection + 1} of {sections.length}
            </p>
          </div>
          
          {/* Auto-save indicator */}
          <div className="flex items-center gap-4">
            {isAutoSaving && (
              <div className="flex items-center text-sm" style={{ color: '#6b7280' }}>
                <Save className="w-4 h-4 mr-1 animate-pulse" />
                Saving draft...
              </div>
            )}
            {!isAutoSaving && lastSaved && (
              <div className="flex items-center text-sm" style={{ color: '#10b981' }}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" style={{ color: '#6b7280' }} />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2" style={{ backgroundColor: '#e5e7eb' }}>
          <motion.div
            className="h-full"
            style={{ backgroundColor: '#fbbf24' }}
            initial={{ width: 0 }}
            animate={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-6">
                {sections[currentSection].icon}
                <h3 className="text-xl font-semibold ml-3" style={{ color: '#1f2937' }}>
                  {sections[currentSection].title}
                </h3>
              </div>
              {sections[currentSection].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="px-8 py-4 border-t" style={{ backgroundColor: '#fafbfc' }}>
          {/* Error display */}
          {errors.submit && (
            <div className="mb-4 p-4 rounded-lg flex items-start" style={{ 
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca'
            }}>
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" style={{ color: '#dc2626' }} />
              <div className="flex-1">
                <p className="font-medium" style={{ color: '#991b1b' }}>Failed to save preparation</p>
                <p className="text-sm mt-1" style={{ color: '#7f1d1d' }}>{errors.submit}</p>
              </div>
              <button
                onClick={() => setErrors(prev => ({ ...prev, submit: '' }))}
                className="ml-2 p-1 rounded hover:bg-red-200"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" style={{ color: '#dc2626' }} />
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentSection === 0 || isSaving}
              className="flex items-center px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: currentSection === 0 ? '#e5e7eb' : '#fff7dc',
                color: currentSection === 0 ? '#9ca3af' : '#1f2937',
                border: `2px solid ${currentSection === 0 ? '#d1d5db' : '#fbbf24'}`
              }}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>

            {currentSection === sections.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSaving || isAutoSaving}
                className="flex items-center px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSaving || isAutoSaving ? '#9ca3af' : '#10b981',
                  color: '#ffffff',
                  cursor: isSaving || isAutoSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isAutoSaving ? (
                  <>
                    <Save className="w-5 h-5 mr-2 animate-pulse" />
                    Auto-saving...
                  </>
                ) : (
                  <>
                    Complete Preparation
                    <CheckCircle className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isSaving || isAutoSaving}
                className="flex items-center px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSaving || isAutoSaving ? '#e5e7eb' : '#fff7dc',
                  color: isSaving || isAutoSaving ? '#9ca3af' : '#1f2937',
                  border: `2px solid ${isSaving || isAutoSaving ? '#d1d5db' : '#fbbf24'}`,
                  cursor: isSaving || isAutoSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isAutoSaving ? (
                  <>
                    <Save className="w-5 h-5 mr-2 animate-pulse" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default PreAssignmentPrepV5;