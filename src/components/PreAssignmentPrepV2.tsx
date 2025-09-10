/**
 * Pre-Assignment Prep V2 Component
 * 
 * Enhanced pre-assignment questionnaire with:
 * - Role-Space awareness questions
 * - Neuroscience-based mental readiness assessment
 * - Ethics and reflective practice rubrics
 * - Linear flow with one question per screen
 * - Accessible design with WCAG AAA compliance
 * - Real-time Supabase data persistence
 * 
 * @author InterpretReflect Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Brain, 
  Shield, 
  Users, 
  Heart,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Compass
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PreAssignmentPrepData } from '../lib/supabase';

/**
 * Question Categories with Icons and Colors
 * Each category has a unique theme for visual differentiation
 */
const CATEGORIES = {
  ROLE_SPACE: {
    id: 'role_space',
    label: 'Role-Space Awareness',
    icon: Users,
    color: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-yellow-50',
    borderColor: 'border-teal-500'
  },
  NEUROSCIENCE: {
    id: 'neuroscience',
    label: 'Mental Readiness',
    icon: Brain,
    color: 'from-purple-500 to-indigo-600',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-500'
  },
  ETHICS: {
    id: 'ethics',
    label: 'Ethics & Reflection',
    icon: Shield,
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-500'
  },
  EMOTIONAL: {
    id: 'emotional',
    label: 'Emotional Readiness',
    icon: Heart,
    color: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    borderColor: 'border-rose-500'
  },
  STRATEGIC: {
    id: 'strategic',
    label: 'Strategic Planning',
    icon: Target,
    color: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-500'
  }
};

/**
 * Question Interface
 * Defines the structure of each question
 */
interface Question {
  id: string;
  category: keyof typeof CATEGORIES;
  text: string;
  subText?: string;
  type: 'text' | 'textarea' | 'scale' | 'multiselect' | 'radio';
  options?: string[];
  required: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  helpText?: string;
  validation?: (value: any) => string | null;
}

/**
 * Complete Question Set
 * Organized by category with progressive difficulty
 */
const QUESTIONS: Question[] = [
  // ROLE-SPACE AWARENESS QUESTIONS
  {
    id: 'role_boundaries',
    category: 'ROLE_SPACE',
    text: 'How clearly can you define your professional boundaries for this assignment?',
    subText: 'Consider the distinction between your role as interpreter and the participants\' roles',
    type: 'scale',
    required: true,
    helpText: 'Rate from 1 (very unclear) to 10 (crystal clear)'
  },
  {
    id: 'role_challenges',
    category: 'ROLE_SPACE',
    text: 'What role-related challenges do you anticipate?',
    subText: 'Think about potential boundary crossings or role confusion',
    type: 'textarea',
    required: true,
    placeholder: 'E.g., Managing requests outside my interpreter role, maintaining neutrality when content is emotionally charged...',
    minLength: 50,
    maxLength: 500,
    helpText: 'Be specific about scenarios that might challenge your professional boundaries'
  },
  {
    id: 'role_strategies',
    category: 'ROLE_SPACE',
    text: 'What strategies will you use to maintain role clarity?',
    type: 'multiselect',
    options: [
      'Pre-session role clarification with participants',
      'Using professional introduction scripts',
      'Redirecting out-of-scope requests',
      'Setting physical positioning boundaries',
      'Maintaining emotional distance',
      'Using third-person language',
      'Documenting boundary issues',
      'Seeking supervisor support when needed'
    ],
    required: true,
    helpText: 'Select all strategies you plan to employ'
  },

  // NEUROSCIENCE/MENTAL READINESS QUESTIONS
  {
    id: 'attention_reset',
    category: 'NEUROSCIENCE',
    text: 'What attention reset practice will you use before the assignment?',
    subText: 'Your brain needs a clear transition to perform optimally',
    type: 'radio',
    options: [
      '5-minute mindfulness meditation',
      'Deep breathing exercises (4-7-8 technique)',
      'Progressive muscle relaxation',
      'Brief physical movement/stretching',
      'Visualization of successful completion',
      'Grounding exercises (5-4-3-2-1 sensory)',
      'Power posing for confidence',
      'None planned'
    ],
    required: true,
    helpText: 'Research shows pre-performance rituals improve focus and reduce anxiety'
  },
  {
    id: 'cognitive_load_assessment',
    category: 'NEUROSCIENCE',
    text: 'Rate your current cognitive load',
    subText: 'How much mental capacity do you have available right now?',
    type: 'scale',
    required: true,
    helpText: '1 = Completely overwhelmed, 10 = Clear and ready'
  },
  {
    id: 'mental_preparation',
    category: 'NEUROSCIENCE',
    text: 'Describe your mental preparation routine',
    type: 'textarea',
    required: true,
    placeholder: 'How do you prepare your mind for complex cognitive work? Include specific techniques...',
    minLength: 30,
    maxLength: 300,
    helpText: 'Include both immediate and day-before preparation strategies'
  },

  // ETHICS & REFLECTIVE PRACTICE QUESTIONS
  {
    id: 'ethical_concerns',
    category: 'ETHICS',
    text: 'Identify any ethical concerns for this assignment',
    subText: 'Consider confidentiality, impartiality, accuracy, and cultural sensitivity',
    type: 'textarea',
    required: true,
    placeholder: 'Describe any ethical considerations or potential dilemmas...',
    minLength: 40,
    maxLength: 400
  },
  {
    id: 'ethical_framework',
    category: 'ETHICS',
    text: 'Which ethical principles will guide your decisions?',
    type: 'multiselect',
    options: [
      'Accuracy above all else',
      'Do no harm (non-maleficence)',
      'Respect for autonomy',
      'Confidentiality and privacy',
      'Cultural humility',
      'Professional integrity',
      'Beneficence (promoting wellbeing)',
      'Justice and fairness',
      'Transparency about limitations'
    ],
    required: true,
    helpText: 'Select your primary guiding principles'
  },
  {
    id: 'reflective_practice',
    category: 'ETHICS',
    text: 'How will you engage in reflective practice during this assignment?',
    subText: 'Real-time self-monitoring is crucial for ethical practice',
    type: 'textarea',
    required: true,
    placeholder: 'Describe your plan for self-monitoring and real-time reflection...',
    minLength: 50,
    maxLength: 400
  },

  // EMOTIONAL READINESS QUESTIONS
  {
    id: 'emotional_state',
    category: 'EMOTIONAL',
    text: 'Select words that describe your current emotional state',
    type: 'multiselect',
    options: [
      'Calm', 'Anxious', 'Confident', 'Uncertain',
      'Energized', 'Tired', 'Focused', 'Scattered',
      'Optimistic', 'Worried', 'Prepared', 'Overwhelmed',
      'Curious', 'Resistant', 'Grounded', 'Activated'
    ],
    required: true,
    helpText: 'Select all that apply - be honest with yourself'
  },
  {
    id: 'emotional_regulation',
    category: 'EMOTIONAL',
    text: 'What emotional regulation strategies will you have ready?',
    subText: 'Prepare for moments of emotional intensity',
    type: 'textarea',
    required: true,
    placeholder: 'Describe specific techniques you\'ll use if emotions arise...',
    minLength: 40,
    maxLength: 400
  },
  {
    id: 'self_care_plan',
    category: 'EMOTIONAL',
    text: 'What is your post-assignment self-care plan?',
    type: 'textarea',
    required: true,
    placeholder: 'How will you decompress and process after the assignment?',
    minLength: 30,
    maxLength: 300,
    helpText: 'Include immediate and evening recovery practices'
  },

  // STRATEGIC PLANNING QUESTIONS
  {
    id: 'success_metrics',
    category: 'STRATEGIC',
    text: 'How will you measure success for this assignment?',
    subText: 'Define clear, achievable metrics',
    type: 'textarea',
    required: true,
    placeholder: 'List 3-5 specific success indicators...',
    minLength: 50,
    maxLength: 400
  },
  {
    id: 'contingency_planning',
    category: 'STRATEGIC',
    text: 'What contingency plans do you have?',
    type: 'multiselect',
    options: [
      'Technical failure backup plan',
      'Content complexity strategies',
      'Fatigue management protocol',
      'Emotional overwhelm response',
      'Time management adjustments',
      'Support person on standby',
      'Exit strategy if needed',
      'Documentation system ready'
    ],
    required: true,
    helpText: 'Select all contingencies you\'ve prepared'
  },
  {
    id: 'growth_intention',
    category: 'STRATEGIC',
    text: 'What skill do you intend to strengthen through this assignment?',
    subText: 'Every assignment is a learning opportunity',
    type: 'textarea',
    required: true,
    placeholder: 'Identify one specific skill or area for intentional growth...',
    minLength: 30,
    maxLength: 300
  }
];

/**
 * Main Component
 */
export function PreAssignmentPrepV2() {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const currentCategory = CATEGORIES[currentQuestion.category];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  /**
   * Auto-save to Supabase every 3 answers
   */
  useEffect(() => {
    const answerCount = Object.keys(answers).length;
    if (answerCount > 0 && answerCount % 3 === 0 && user) {
      saveToSupabase();
    }
  }, [answers]);

  /**
   * Save responses to Supabase
   */
  const saveToSupabase = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const prepData: Partial<PreAssignmentPrepData> = {
        ...answers,
        timestamp: new Date().toISOString(),
        completion_time: Math.floor((Date.now() - startTime) / 1000)
      };

      const { error } = await supabase
        .from('pre_assignment_prep')
        .upsert({
          user_id: user.id,
          data: prepData,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        setLastSaved(new Date());
      } else {
        console.error('Save error:', error);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const [startTime] = useState(Date.now());

  /**
   * Validate current answer
   */
  const validateAnswer = (value: any): boolean => {
    const question = currentQuestion;
    
    if (question.required && !value) {
      setErrors({ [question.id]: 'This field is required' });
      return false;
    }

    if (question.type === 'textarea' || question.type === 'text') {
      const textValue = value as string;
      if (question.minLength && textValue.length < question.minLength) {
        setErrors({ [question.id]: `Minimum ${question.minLength} characters required` });
        return false;
      }
      if (question.maxLength && textValue.length > question.maxLength) {
        setErrors({ [question.id]: `Maximum ${question.maxLength} characters allowed` });
        return false;
      }
    }

    if (question.type === 'multiselect' && question.required) {
      const selected = value as string[];
      if (!selected || selected.length === 0) {
        setErrors({ [question.id]: 'Please select at least one option' });
        return false;
      }
    }

    if (question.validation) {
      const validationError = question.validation(value);
      if (validationError) {
        setErrors({ [question.id]: validationError });
        return false;
      }
    }

    setErrors({});
    return true;
  };

  /**
   * Handle navigation
   */
  const handleNext = () => {
    const currentAnswer = answers[currentQuestion.id];
    
    if (!validateAnswer(currentAnswer)) {
      return;
    }

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete the assessment
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setErrors({});
    }
  };

  const handleComplete = async () => {
    await saveToSupabase();
    setIsComplete(true);
  };

  /**
   * Render question input based on type
   */
  const renderQuestionInput = () => {
    const value = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            placeholder={currentQuestion.placeholder}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200"
            aria-label={currentQuestion.text}
            aria-describedby={`${currentQuestion.id}-help`}
          />
        );

      case 'textarea':
        const textLength = (value as string)?.length || 0;
        return (
          <div className="space-y-2">
            <textarea
              value={value || ''}
              onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
              placeholder={currentQuestion.placeholder}
              rows={4}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 resize-none"
              aria-label={currentQuestion.text}
              aria-describedby={`${currentQuestion.id}-help`}
            />
            {(currentQuestion.minLength || currentQuestion.maxLength) && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>{textLength} characters</span>
                <span>
                  {currentQuestion.minLength && `Min: ${currentQuestion.minLength} | `}
                  {currentQuestion.maxLength && `Max: ${currentQuestion.maxLength}`}
                </span>
              </div>
            )}
          </div>
        );

      case 'scale':
        const scaleValue = value || 5;
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">1</span>
              <input
                type="range"
                min="1"
                max="10"
                value={scaleValue}
                onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: parseInt(e.target.value) })}
                className="flex-1 mx-4 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                aria-label={currentQuestion.text}
                aria-valuenow={scaleValue}
                aria-valuemin={1}
                aria-valuemax={10}
              />
              <span className="text-lg font-medium">10</span>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-teal-600">{scaleValue}</span>
            </div>
          </div>
        );

      case 'multiselect':
        const selected = (value as string[]) || [];
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option}
                className={`
                  flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                  ${selected.includes(option) 
                    ? 'border-teal-500 bg-yellow-50 shadow-md' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAnswers({ ...answers, [currentQuestion.id]: [...selected, option] });
                    } else {
                      setAnswers({ ...answers, [currentQuestion.id]: selected.filter(s => s !== option) });
                    }
                  }}
                  className="sr-only"
                  aria-label={option}
                />
                <div className={`
                  w-5 h-5 mr-3 rounded border-2 flex items-center justify-center
                  ${selected.includes(option) ? 'border-teal-500 bg-teal-500' : 'border-gray-400'}
                `}>
                  {selected.includes(option) && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-base">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option}
                className={`
                  flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                  ${value === option 
                    ? 'border-teal-500 bg-yellow-50 shadow-md' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                  className="sr-only"
                  aria-label={option}
                />
                <div className={`
                  w-5 h-5 mr-3 rounded-full border-2 flex items-center justify-center
                  ${value === option ? 'border-teal-500' : 'border-gray-400'}
                `}>
                  {value === option && (
                    <div className="w-3 h-3 rounded-full bg-teal-500" />
                  )}
                </div>
                <span className="text-base">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Pre-Assignment Prep Complete!</h2>
          <p className="text-lg text-gray-600 mb-6">
            You're well-prepared for your assignment. Your responses have been saved and will help track your growth over time.
          </p>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Time taken</p>
              <p className="text-xl font-semibold">
                {Math.floor((Date.now() - startTime) / 60000)} minutes
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 font-semibold"
            >
              Return to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-2 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-500 to-cyan-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 pt-4 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${currentCategory.bgLight}`}>
                <currentCategory.icon className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{currentCategory.label}</p>
                <p className="text-lg font-semibold">
                  Question {currentQuestionIndex + 1} of {QUESTIONS.length}
                </p>
              </div>
            </div>
            {lastSaved && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Question Header */}
            <div className={`bg-gradient-to-r ${currentCategory.color} p-6 text-white`}>
              <h2 className="text-2xl font-bold mb-2">{currentQuestion.text}</h2>
              {currentQuestion.subText && (
                <p className="text-white/90">{currentQuestion.subText}</p>
              )}
            </div>

            {/* Question Body */}
            <div className="p-6 space-y-6">
              {currentQuestion.helpText && (
                <div 
                  id={`${currentQuestion.id}-help`}
                  className="flex items-start space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{currentQuestion.helpText}</span>
                </div>
              )}

              {renderQuestionInput()}

              {errors[currentQuestion.id] && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors[currentQuestion.id]}</span>
                </motion.div>
              )}
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`
                  flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${currentQuestionIndex === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }
                `}
                aria-label="Previous question"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Previous
              </button>

              {isSaving && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-teal-600 mr-2" />
                  Saving...
                </div>
              )}

              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 font-medium"
                aria-label={currentQuestionIndex === QUESTIONS.length - 1 ? 'Complete assessment' : 'Next question'}
              >
                {currentQuestionIndex === QUESTIONS.length - 1 ? (
                  <>
                    Complete
                    <CheckCircle className="w-5 h-5 ml-1" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Category Progress Indicators */}
        <div className="mt-8 grid grid-cols-5 gap-2">
          {Object.values(CATEGORIES).map((category) => {
            const categoryQuestions = QUESTIONS.filter(q => q.category === category.id.toUpperCase());
            const answeredQuestions = categoryQuestions.filter(q => answers[q.id]);
            const progress = (answeredQuestions.length / categoryQuestions.length) * 100;
            
            return (
              <div
                key={category.id}
                className="bg-white rounded-lg p-3 text-center shadow-sm"
                aria-label={`${category.label}: ${Math.round(progress)}% complete`}
              >
                <category.icon className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <p className="text-xs text-gray-600 mb-1">{category.label}</p>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${category.color}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Custom Styles */}
      <style jsx>{`
        /* Custom range slider styles */
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #14b8a6, #06b6d4);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #14b8a6, #06b6d4);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          border: none;
        }

        /* Focus styles for accessibility */
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible {
          outline: 3px solid #14b8a6;
          outline-offset: 2px;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .slider::-webkit-slider-thumb {
            border: 2px solid #000;
          }
          .slider::-moz-range-thumb {
            border: 2px solid #000;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}