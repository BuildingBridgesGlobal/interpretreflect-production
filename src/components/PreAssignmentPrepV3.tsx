/**
 * Pre-Assignment Prep V3 Component
 * 
 * Enhanced with improved questions, better color contrast,
 * and streamlined user experience
 * 
 * @module PreAssignmentPrepV3
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
  Loader2,
  BookOpen,
  Compass,
  Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateGrowthInsightsForUser, generateRecommendations } from '../services/growthInsightsService';

/**
 * Enhanced Question Set with Role-Space, Neuroscience, and Ethics
 */
const QUESTIONS = [
  {
    id: 'context_background',
    icon: BookOpen,
    category: 'Context',
    text: "What is the assignment context and what are the participants' backgrounds?",
    placeholder: "Describe the setting, participants, and any relevant background information...",
    helpText: "Understanding context helps you prepare mentally and practically",
    type: 'textarea' as const,
    required: true
  },
  {
    id: 'materials_review',
    icon: BookOpen,
    category: 'Preparation',
    text: "Which materials, documents, or terminology should you review before this assignment?",
    placeholder: "List specific materials, glossaries, or documents you need to review...",
    helpText: "Thorough preparation reduces cognitive load during the assignment",
    type: 'textarea' as const,
    required: true
  },
  {
    id: 'readiness_levels',
    icon: Activity,
    category: 'Wellness',
    text: "What are your emotional and physical readiness levels?",
    placeholder: "Rate and describe your current emotional state and physical energy...",
    helpText: "Self-awareness is crucial for performance",
    type: 'textarea' as const,
    required: true
  },
  {
    id: 'anticipated_demands',
    icon: AlertCircle,
    category: 'Demands',
    text: "Which demands (Environmental, Interpersonal, Paralinguistic, Intrapersonal) do you anticipate?",
    placeholder: "Consider noise levels, relationship dynamics, tone/pace challenges, and internal pressures...",
    helpText: "Anticipating demands helps you prepare coping strategies",
    type: 'textarea' as const,
    required: true
  },
  {
    id: 'control_strategies',
    icon: Shield,
    category: 'Strategies',
    text: "What control strategies do you have available for anticipated demands?",
    placeholder: "List specific strategies for each type of demand you anticipate...",
    helpText: "Having strategies ready reduces stress in the moment",
    type: 'textarea' as const,
    required: true
  },
  {
    id: 'role_space',
    icon: Users,
    category: 'Role-Space',
    text: "How do your role, alignment with participants, and interaction management responsibilities show up in this assignment?",
    placeholder: "Describe your professional boundaries, positioning, and role clarity strategies...",
    helpText: "Clear role boundaries protect your professional integrity",
    type: 'textarea' as const,
    required: true
  },
  {
    id: 'neuroscience_practices',
    icon: Brain,
    category: 'Neuroscience',
    text: "What practices (mindfulness, attention reset, etc.) will you use for focus and regulation?",
    placeholder: "List specific techniques like breathing exercises, grounding, or visualization...",
    helpText: "Mental preparation techniques improve performance and reduce anxiety",
    type: 'textarea' as const,
    required: true
  },
  {
    id: 'ethics_culture',
    icon: Compass,
    category: 'Ethics',
    text: "Are you prepared for the cultural context and potential ethical dilemmas? List any concerns.",
    placeholder: "Identify cultural considerations, ethical boundaries, or potential conflicts...",
    helpText: "Ethical awareness guides professional decision-making",
    type: 'textarea' as const,
    required: true
  },
  {
    id: 'triggers_vulnerabilities',
    icon: Heart,
    category: 'Self-Care',
    text: "What are your triggers or areas of vulnerability and how will you manage them?",
    placeholder: "Be honest about what might be challenging and your management strategies...",
    helpText: "Knowing your vulnerabilities helps you protect yourself",
    type: 'textarea' as const,
    required: true
  },
  {
    id: 'backup_plans',
    icon: Shield,
    category: 'Contingency',
    text: "What backup plans do you have for unexpected challenges?",
    placeholder: "Describe your contingency plans for technical, emotional, or content challenges...",
    helpText: "Having Plan B reduces anxiety and improves adaptability",
    type: 'textarea' as const,
    required: true
  },
  {
    id: 'growth_goals',
    icon: Target,
    category: 'Growth',
    text: "What goals do you have for professional growth in this assignment, and how will you reflect on progress?",
    placeholder: "Identify specific skills to develop and how you'll measure progress...",
    helpText: "Intentional growth turns every assignment into a learning opportunity",
    type: 'textarea' as const,
    required: true
  }
];


/**
 * Main Component
 */
export function PreAssignmentPrepV3() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;
  const isLastQuestion = step === QUESTIONS.length - 1;

  // Auto-save every 3 questions
  useEffect(() => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount > 0 && answeredCount % 3 === 0 && user) {
      autoSave();
    }
  }, [answers]);

  const autoSave = async () => {
    if (!user || autoSaving) return;
    
    setAutoSaving(true);
    try {
      const { data, error } = await supabase
        .from('pre_assignment_reflections')
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          reflection_type: 'pre_assignment_prep',
          answers,
          status: 'draft',
          metadata: {
            questions_answered: Object.keys(answers).length,
            total_questions: QUESTIONS.length,
            current_step: step
          },
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Auto-save error:', error);
        // Don't show error to user for auto-save failures
      } else {
        setLastSaved(new Date());
        setSuccessMessage(null); // Clear any previous success messages
      }
    } catch (err) {
      console.error('Auto-save error:', err);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
    setError(null);
  };

  const handleNext = () => {
    const currentAnswer = answers[currentQuestion.id];
    
    if (!currentAnswer || currentAnswer.trim().length < 10) {
      setError('Please provide a thoughtful response (minimum 10 characters)');
      return;
    }

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to save your responses');
      return;
    }

    const currentAnswer = answers[currentQuestion.id];
    if (!currentAnswer || currentAnswer.trim().length < 10) {
      setError('Please complete this question before submitting');
      return;
    }

    // Validate all required questions are answered
    const unanswered = QUESTIONS.filter(q => q.required && !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Please answer all required questions. ${unanswered.length} question(s) remaining.`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Save complete reflection to database
      const { data: reflectionData, error: saveError } = await supabase
        .from('pre_assignment_reflections')
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          reflection_type: 'pre_assignment_prep',
          answers,
          status: 'completed',
          metadata: {
            questions_answered: Object.keys(answers).length,
            total_questions: QUESTIONS.length,
            completion_time: new Date().toISOString(),
            time_spent_seconds: Math.floor((Date.now() - parseInt(sessionId.split('_')[1])) / 1000)
          },
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (saveError) {
        throw new Error(saveError.message || 'Failed to save reflection');
      }

      setSuccessMessage('Responses saved successfully!');

      // Update growth insights
      const insightsResult = await updateGrowthInsightsForUser(user.id, answers);
      
      if (insightsResult.success && insightsResult.insights) {
        // Generate recommendations based on insights
        const userRecommendations = generateRecommendations(insightsResult.insights);
        setRecommendations(userRecommendations);
        
        // Store insights reference
        await supabase
          .from('reflection_insights')
          .insert({
            user_id: user.id,
            reflection_id: reflectionData.id,
            insights: insightsResult.insights,
            recommendations: userRecommendations,
            created_at: new Date().toISOString()
          });
      } else if (!insightsResult.success) {
        console.error('Growth insights update failed:', insightsResult.error);
        // Don't fail the whole submission if insights fail
      }

      setIsComplete(true);
    } catch (err) {
      console.error('Submit error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to save your responses. Please try again.'
      );
      
      // Try to save as draft if complete save fails
      try {
        await supabase
          .from('pre_assignment_reflections')
          .upsert({
            user_id: user.id,
            session_id: sessionId,
            reflection_type: 'pre_assignment_prep',
            answers,
            status: 'draft',
            error_log: err instanceof Error ? err.message : 'Unknown error',
            updated_at: new Date().toISOString()
          });
        setError(prev => prev + ' Your responses have been saved as a draft.');
      } catch (draftErr) {
        console.error('Draft save also failed:', draftErr);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#fafbfc' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full"
        >
          <div className="text-center mb-8">
            <CheckCircle className="w-20 h-20 mx-auto mb-6" style={{ color: '#2e7d32' }} />
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#1f2937' }}>
              Pre-Assignment Prep Complete!
            </h2>
            <p className="text-lg mb-2" style={{ color: '#4b5563' }}>
              You're well-prepared for your assignment.
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Session ID: {sessionId}
            </p>
          </div>

          {recommendations.length > 0 && (
            <div className="mb-8 p-6 rounded-lg" style={{ background: '#fffef5', border: '1px solid #fbbf24' }}>
              <h3 className="font-semibold mb-4 flex items-center" style={{ color: '#92400e' }}>
                <Target className="w-5 h-5 mr-2" />
                Personalized Recommendations
              </h3>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span style={{ color: '#4b5563' }}>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-lg text-center" style={{ background: '#f3f4f6' }}>
              <p className="text-sm" style={{ color: '#6b7280' }}>Questions Answered</p>
              <p className="text-2xl font-bold" style={{ color: '#1f2937' }}>
                {Object.keys(answers).length} / {QUESTIONS.length}
              </p>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ background: '#f3f4f6' }}>
              <p className="text-sm" style={{ color: '#6b7280' }}>Time Spent</p>
              <p className="text-2xl font-bold" style={{ color: '#1f2937' }}>
                {Math.floor((Date.now() - parseInt(sessionId.split('_')[1])) / 60000)} min
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/growth-insights')}
              className="px-8 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{ 
                background: '#fff7dc',
                color: '#1f2937',
                border: '2px solid #fbbf24',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              View Growth Insights
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{ 
                background: '#ffffff',
                color: '#374151',
                border: '2px solid #d1d5db'
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#fafbfc' }}>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-2 z-50" style={{ background: '#d1d5db' }}>
        <motion.div
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #00695c, #00897b)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b pt-4 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#1f2937' }}>
                Pre-Assignment Prep
              </h1>
              <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                Question {step + 1} of {QUESTIONS.length} • {currentQuestion.category}
              </p>
            </div>
            {lastSaved && (
              <div className="flex items-center text-sm" style={{ color: '#6b7280' }}>
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
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Question Header */}
            <div 
              className="p-6 text-white"
              style={{ 
                background: `linear-gradient(135deg, #00695c, #00897b)`
              }}
            >
              <div className="flex items-start">
                <currentQuestion.icon className="w-6 h-6 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {currentQuestion.text}
                  </h2>
                  {currentQuestion.helpText && (
                    <p className="text-white/90 text-sm">
                      {currentQuestion.helpText}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Question Body */}
            <div className="p-6">
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={currentQuestion.placeholder}
                rows={6}
                className="w-full px-4 py-3 text-base border-2 rounded-lg transition-all duration-200 resize-none"
                style={{
                  borderColor: error ? '#dc2626' : '#6b7280',
                  backgroundColor: error ? '#fef2f2' : '#ffffff',
                  color: '#1f2937',
                  fontSize: '16px'
                }}
                aria-label={currentQuestion.text}
                aria-invalid={!!error}
                aria-describedby={error ? 'error-message' : undefined}
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="error-message"
                  className="mt-3 p-3 rounded-lg flex items-start"
                  style={{ 
                    background: '#fef2f2',
                    borderLeft: '4px solid #dc2626'
                  }}
                >
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" style={{ color: '#991b1b' }} />
                  <span style={{ color: '#991b1b' }}>{error}</span>
                </motion.div>
              )}

              <div className="mt-2 text-sm" style={{ color: '#6b7280' }}>
                {answers[currentQuestion.id]?.length || 0} characters
              </div>
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 flex justify-between items-center" style={{ background: '#f9fafb' }}>
              <button
                onClick={handleBack}
                disabled={step === 0}
                className="flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: step === 0 ? '#e5e7eb' : '#fff7dc',
                  color: step === 0 ? '#9ca3af' : '#1f2937',
                  border: '2px solid #fbbf24'
                }}
                aria-label="Previous question"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </button>

              {(loading || autoSaving) && (
                <div className="flex items-center" style={{ color: '#6b7280' }}>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {loading ? 'Submitting...' : 'Auto-saving...'}
                </div>
              )}
              
              {successMessage && !loading && (
                <div className="flex items-center" style={{ color: '#2e7d32' }}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {successMessage}
                </div>
              )}

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !answers[currentQuestion.id]}
                  className="flex items-center px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: loading || !answers[currentQuestion.id] 
                      ? '#e5e7eb' 
                      : '#fff7dc',
                    color: loading || !answers[currentQuestion.id]
                      ? '#9ca3af'
                      : '#1f2937',
                    border: `2px solid ${loading || !answers[currentQuestion.id] ? '#d1d5db' : '#fbbf24'}`,
                    boxShadow: loading || !answers[currentQuestion.id] 
                      ? 'none' 
                      : '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  aria-label="Submit assessment"
                >
                  Submit
                  <CheckCircle className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.id]}
                  className="flex items-center px-6 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: !answers[currentQuestion.id] 
                      ? '#e5e7eb' 
                      : '#fff7dc',
                    color: !answers[currentQuestion.id]
                      ? '#9ca3af'
                      : '#1f2937',
                    border: `2px solid ${!answers[currentQuestion.id] ? '#d1d5db' : '#fbbf24'}`,
                    boxShadow: !answers[currentQuestion.id] 
                      ? 'none' 
                      : '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  aria-label="Next question"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Category Progress */}
        <div className="mt-8 grid grid-cols-3 md:grid-cols-6 gap-3">
          {['Context', 'Preparation', 'Role-Space', 'Neuroscience', 'Ethics', 'Growth'].map((category) => {
            const categoryQuestions = QUESTIONS.filter(q => 
              q.category.toLowerCase().includes(category.toLowerCase())
            );
            const answeredCount = categoryQuestions.filter(q => answers[q.id]).length;
            const isComplete = answeredCount === categoryQuestions.length && categoryQuestions.length > 0;
            
            return (
              <div
                key={category}
                className="bg-white rounded-lg p-3 text-center shadow-sm"
                style={{
                  borderTop: `3px solid ${isComplete ? '#2e7d32' : '#d1d5db'}`
                }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
                  {category}
                </p>
                {isComplete && <CheckCircle className="w-4 h-4 mx-auto" style={{ color: '#2e7d32' }} />}
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center border-t">
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Take your time with each question. Thoughtful preparation leads to better outcomes.
        </p>
      </footer>
    </div>
  );
}

export default PreAssignmentPrepV3;