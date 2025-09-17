import React, { useState } from 'react';
import {
  ChevronLeft,
  AlertTriangle,
  Activity,
  Brain,
  Heart,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AssessmentQuestion {
  id: string;
  category: string;
  categoryIcon: React.ReactNode;
  question: string;
  options: {
    value: number;
    label: string;
    description: string;
  }[];
}

interface AssessmentProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (results: AssessmentResults) => void;
}

interface AssessmentResults {
  totalScore: number;
  category: 'resilient' | 'stressed' | 'strained' | 'severe';
  physicalScore: number;
  emotionalScore: number;
  professionalScore: number;
  recoveryScore: number;
  topIssues: string[];
}

const questions: AssessmentQuestion[] = [
  // Physical Stress (Questions 1-3)
  {
    id: 'q1_physical_symptoms',
    category: 'Physical Stress',
    categoryIcon: <Activity className="h-5 w-5" />,
    question:
      'How often do you experience physical symptoms (headaches, muscle tension, stomach issues) related to your interpreting work?',
    options: [
      { value: 0, label: 'Rarely', description: 'Almost never' },
      { value: 1, label: 'Sometimes', description: '1-2 times per week' },
      { value: 2, label: 'Often', description: '3-4 times per week' },
      { value: 3, label: 'Daily', description: 'Most days' },
    ],
  },
  {
    id: 'q2_energy_levels',
    category: 'Physical Stress',
    categoryIcon: <Activity className="h-5 w-5" />,
    question: 'How would you describe your energy levels after a typical work day?',
    options: [
      { value: 0, label: 'Good', description: 'Still have energy for personal activities' },
      { value: 1, label: 'Manageable', description: 'Tired but functional' },
      { value: 2, label: 'Depleted', description: 'Too exhausted for much else' },
      { value: 3, label: 'Completely drained', description: 'Can barely function' },
    ],
  },
  {
    id: 'q3_sleep_quality',
    category: 'Physical Stress',
    categoryIcon: <Activity className="h-5 w-5" />,
    question: 'How often does work stress affect your sleep?',
    options: [
      { value: 0, label: 'Rarely', description: 'Sleep well most nights' },
      { value: 1, label: 'Sometimes', description: '1-2 nights per week' },
      { value: 2, label: 'Often', description: '3-4 nights per week' },
      { value: 3, label: 'Nightly', description: 'Most nights disrupted' },
    ],
  },
  // Emotional Processing (Questions 4-6)
  {
    id: 'q4_assignment_anticipation',
    category: 'Emotional Processing',
    categoryIcon: <Heart className="h-5 w-5" />,
    question: 'How do you feel when thinking about upcoming difficult assignments?',
    options: [
      { value: 0, label: 'Prepared', description: 'Ready to handle them' },
      { value: 1, label: 'Slightly anxious', description: 'Some worry but manageable' },
      { value: 2, label: 'Very anxious', description: 'Significant dread or worry' },
      { value: 3, label: 'Overwhelmed', description: 'Want to avoid them entirely' },
    ],
  },
  {
    id: 'q5_trauma_processing',
    category: 'Emotional Processing',
    categoryIcon: <Heart className="h-5 w-5" />,
    question: 'After interpreting challenging or emotionally demanding content, how long does it typically stay with you?',
    options: [
      { value: 0, label: 'Hours', description: 'Process it same day' },
      { value: 1, label: 'Days', description: '2-3 days to process' },
      { value: 2, label: 'Weeks', description: 'Lingers for a week or more' },
      { value: 3, label: 'Indefinitely', description: 'Accumulates without release' },
    ],
  },
  {
    id: 'q6_emotional_boundaries',
    category: 'Emotional Processing',
    categoryIcon: <Heart className="h-5 w-5" />,
    question: 'How well can you maintain emotional boundaries during assignments?',
    options: [
      { value: 0, label: 'Very well', description: 'Clear separation maintained' },
      { value: 1, label: 'Usually well', description: 'Occasional difficulty' },
      { value: 2, label: 'Struggle often', description: 'Frequently absorb emotions' },
      { value: 3, label: 'Cannot separate', description: 'Always deeply affected' },
    ],
  },
  // Professional Impact (Questions 7-9)
  {
    id: 'q7_focus_accuracy',
    category: 'Professional Impact',
    categoryIcon: <Brain className="h-5 w-5" />,
    question: 'Have you noticed changes in your focus or accuracy at work?',
    options: [
      { value: 0, label: 'No changes', description: 'Performing as usual' },
      { value: 1, label: 'Minor lapses', description: 'Occasional concentration issues' },
      { value: 2, label: 'Frequent issues', description: 'Regular mistakes or gaps' },
      { value: 3, label: 'Major decline', description: 'Significant performance impact' },
    ],
  },
  {
    id: 'q8_leaving_thoughts',
    category: 'Professional Impact',
    categoryIcon: <Brain className="h-5 w-5" />,
    question: 'How connected do you feel to your interpreting career goals?',
    options: [
      { value: 0, label: 'Very connected', description: 'Strong commitment to growth' },
      { value: 1, label: 'Mostly connected', description: 'Generally satisfied with path' },
      { value: 2, label: 'Questioning direction', description: 'Uncertain about future' },
      { value: 3, label: 'Disconnected', description: 'Considering other paths' },
    ],
  },
  {
    id: 'q9_purpose_connection',
    category: 'Professional Impact',
    categoryIcon: <Brain className="h-5 w-5" />,
    question: 'How connected do you feel to the purpose of your work?',
    options: [
      { value: 0, label: 'Very connected', description: 'Strong sense of meaning' },
      { value: 1, label: 'Mostly connected', description: 'Generally meaningful' },
      { value: 2, label: 'Disconnected', description: 'Lost sense of purpose' },
      { value: 3, label: 'Completely detached', description: 'Just going through motions' },
    ],
  },
  // Recovery Patterns (Questions 10-12)
  {
    id: 'q10_recovery_time',
    category: 'Recovery Patterns',
    categoryIcon: <RefreshCw className="h-5 w-5" />,
    question: 'How long does it take you to recover after a difficult assignment?',
    options: [
      { value: 0, label: 'Same day', description: 'Quick recovery' },
      { value: 1, label: '1-2 days', description: "Need a night's rest" },
      { value: 2, label: 'Several days', description: '3-4 days to feel normal' },
      { value: 3, label: 'Never fully recover', description: 'Effects accumulate' },
    ],
  },
  {
    id: 'q11_self_care',
    category: 'Recovery Patterns',
    categoryIcon: <RefreshCw className="h-5 w-5" />,
    question: 'How consistently do you practice self-care or stress management?',
    options: [
      { value: 0, label: 'Daily', description: 'Regular routine' },
      { value: 1, label: 'Few times a week', description: 'When I can' },
      { value: 2, label: 'Rarely', description: 'Too busy or tired' },
      { value: 3, label: 'Never', description: 'No time or energy' },
    ],
  },
  {
    id: 'q12_support_system',
    category: 'Recovery Patterns',
    categoryIcon: <Users className="h-5 w-5" />,
    question: 'Do you have colleagues or friends who understand your work challenges?',
    options: [
      { value: 0, label: 'Strong support', description: 'Multiple understanding people' },
      { value: 1, label: 'Some support', description: '1-2 people who get it' },
      { value: 2, label: 'Limited support', description: 'Feel mostly alone' },
      { value: 3, label: 'No support', description: 'Completely isolated' },
    ],
  },
];

export const BurnoutAssessment: React.FC<AssessmentProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(
    () => `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  if (!isOpen) return null;

  const handleAnswer = (value: number) => {
    const question = questions[currentQuestion];
    setAnswers((prev) => ({ ...prev, [question.id]: value }));

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion((prev) => prev + 1), 300);
    } else {
      calculateResults();
    }
  };

  const calculateResults = async () => {
    const physicalScore =
      (answers.q1_physical_symptoms || 0) +
      (answers.q2_energy_levels || 0) +
      (answers.q3_sleep_quality || 0);

    const emotionalScore =
      (answers.q4_assignment_anticipation || 0) +
      (answers.q5_trauma_processing || 0) +
      (answers.q6_emotional_boundaries || 0);

    const professionalScore =
      (answers.q7_focus_accuracy || 0) +
      (answers.q8_leaving_thoughts || 0) +
      (answers.q9_purpose_connection || 0);

    const recoveryScore =
      (answers.q10_recovery_time || 0) +
      (answers.q11_self_care || 0) +
      (answers.q12_support_system || 0);

    const totalScore = physicalScore + emotionalScore + professionalScore + recoveryScore;

    let category: 'resilient' | 'stressed' | 'strained' | 'severe';
    if (totalScore <= 9) category = 'resilient';
    else if (totalScore <= 18) category = 'stressed';
    else if (totalScore <= 27) category = 'strained';
    else category = 'severe';

    const topIssues = [];
    if (physicalScore >= 6) topIssues.push('Physical Stress Response');
    if (emotionalScore >= 6) topIssues.push('Emotional Processing');
    if (professionalScore >= 6) topIssues.push('Professional Impact');
    if (recoveryScore >= 6) topIssues.push('Recovery Patterns');

    const assessmentResults: AssessmentResults = {
      totalScore,
      category,
      physicalScore,
      emotionalScore,
      professionalScore,
      recoveryScore,
      topIssues,
    };

    setResults(assessmentResults);

    // Save to Supabase
    try {
      setLoading(true);
      await supabase.from('assessment_responses').insert({
        session_id: sessionId,
        ...answers,
      });

      // Handle error silently for production
    } catch {
      // Error occurred during save
    } finally {
      setLoading(false);
      setShowResults(true);
    }

    // Show results for 3 seconds, then trigger completion
    setTimeout(() => {
      if (onComplete) {
        onComplete(assessmentResults);
      }
    }, 3000);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#FAF9F6' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b" style={{ borderColor: '#E8E5E0' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
              2-Minute Wellness Check-In
            </h2>
            <p className="text-sm mt-2" style={{ color: '#5A5A5A' }}>
              Understanding your unique experience as an interpreter - there are no right or wrong answers
            </p>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" style={{ color: '#1A1A1A' }} />
            </button>
          </div>

          {/* Progress bar */}
          <div
            className="mt-4 h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: '#E8E5E0' }}
          >
            <div
              className="h-full transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
              }}
            />
          </div>
          <p className="text-sm mt-2" style={{ color: '#5A5A5A' }}>
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {/* Content */}
        {!showResults ? (
          <div className="p-8">
            {/* Category indicator */}
            <div className="flex items-center mb-4" style={{ color: '#6B8B60' }}>
              {question.categoryIcon}
              <span className="ml-2 text-sm font-semibold">{question.category}</span>
            </div>

            {/* Question */}
            <h3 className="text-xl font-semibold mb-6" style={{ color: '#1A1A1A' }}>
              {question.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-4 rounded-xl text-left transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #E8E5E0',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#5C7F4F';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(92, 127, 79, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E8E5E0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="font-semibold" style={{ color: '#1A1A1A' }}>
                    {option.label}
                  </div>
                  <div className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                    {option.description}
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            {currentQuestion > 0 && (
              <button
                onClick={() => setCurrentQuestion((prev) => prev - 1)}
                className="mt-6 flex items-center text-sm font-medium transition-colors"
                style={{ color: '#6B8B60' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#5F7F55';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6B8B60';
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous question
              </button>
            )}
          </div>
        ) : (
          <AssessmentResults results={results!} onClose={onClose} loading={loading} />
        )}
      </div>
    </div>
  );
};

const AssessmentResults: React.FC<{
  results: AssessmentResults;
  onClose: () => void;
}> = ({ results, onClose }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'resilient':
        return '#4CAF50';
      case 'stressed':
        return '#FFC107';
      case 'strained':
        return '#FF9800';
      case 'severe':
        return '#F44336';
      default:
        return '#6B8B60';
    }
  };

  const getCategoryMessage = (category: string) => {
    switch (category) {
      case 'resilient':
        return "You're managing stress well. InterpretReflect can help you maintain your edge.";
      case 'stressed':
        return "You're experiencing moderate stress. Perfect timing to build better coping strategies.";
      case 'strained':
        return "You're under significant strain. You need support to prevent burnout.";
      case 'severe':
        return "You're experiencing high stress. Priority support is recommended to help you thrive again.";
      default:
        return '';
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          Your Interpreter Stress Profile
        </h3>

        {/* Score meter */}
        <div className="mt-6 mb-4">
          <div className="text-5xl font-bold" style={{ color: getCategoryColor(results.category) }}>
            {results.totalScore}
          </div>
          <div className="text-lg font-semibold mt-2" style={{ color: '#1A1A1A' }}>
            {results.category.charAt(0).toUpperCase() + results.category.slice(1)}
          </div>
        </div>

        <p className="text-base max-w-md mx-auto" style={{ color: '#5A5A5A' }}>
          {getCategoryMessage(results.category)}
        </p>
      </div>

      {/* Top stress areas */}
      {results.topIssues.length > 0 && (
        <div className="mb-8">
          <h4 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>
            Your Highest Stress Areas:
          </h4>
          <div className="space-y-3">
            {results.topIssues.map((issue, index) => (
              <div
                key={index}
                className="flex items-start p-4 rounded-lg"
                style={{ backgroundColor: 'rgba(92, 127, 79, 0.1)' }}
              >
                <AlertTriangle
                  className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0"
                  style={{ color: '#8B4444' }}
                />
                <div>
                  <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                    {issue}
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#5A5A5A' }}>
                    InterpretReflect has specific tools to address this area.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center">
        <h4 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>
          Your Personalized Wellness Plan is Ready
        </h4>
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
            color: '#FFFFFF',
            boxShadow: '0 4px 15px rgba(107, 139, 96, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(107, 139, 96, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 139, 96, 0.3)';
          }}
        >
          Start Your Personalized Plan
        </button>
        <p className="text-sm mt-3" style={{ color: '#5A5A5A' }}>
          $12/month • Cancel anytime
        </p>
      </div>
    </div>
  );
};
