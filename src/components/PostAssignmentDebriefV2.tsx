/**
 * Post-Assignment Debrief V2
 * 
 * Uses the shared ReflectionBase component with unified design system
 * Includes comparative analysis with pre-assignment data
 * 
 * @module PostAssignmentDebriefV2
 */

import React from 'react';
import { 
  Brain, 
  Heart, 
  Shield, 
  Target, 
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  Users,
  Lightbulb,
  Activity
} from 'lucide-react';
import { ReflectionBase, ReflectionQuestion } from './shared/ReflectionBase';
import { REFLECTION_THEME } from '../styles/reflectionTheme';
import { useNavigate } from 'react-router-dom';

/**
 * Post-Assignment Debrief Questions
 * Organized by category with progressive flow
 */
const POST_ASSIGNMENT_QUESTIONS: ReflectionQuestion[] = [
  // QUICK INSIGHT CAPTURE
  {
    id: 'experience_word',
    category: 'Quick Insight',
    text: 'Describe this assignment experience in one word',
    type: 'text',
    required: true,
    placeholder: 'e.g., Challenging, Rewarding, Intense...',
    maxLength: 30,
    icon: Lightbulb,
    helpText: 'Your first instinct is often the most honest'
  },
  {
    id: 'most_unexpected',
    category: 'Quick Insight',
    text: 'What was the most unexpected aspect of this assignment?',
    type: 'textarea',
    required: true,
    placeholder: 'What surprised you or caught you off guard?',
    minLength: 50,
    maxLength: 300,
    icon: AlertTriangle
  },
  {
    id: 'performance_satisfaction',
    category: 'Quick Insight',
    text: 'How satisfied are you with your performance?',
    type: 'scale',
    required: true,
    min: 1,
    max: 10,
    icon: Target,
    helpText: '1 = Very dissatisfied, 10 = Very satisfied'
  },

  // REVISITING PREDICTIONS
  {
    id: 'confidence_accuracy',
    category: 'Reflection',
    text: 'How accurate was your pre-assignment confidence level?',
    subText: 'Compare how you thought you\'d feel vs. how you actually felt',
    type: 'radio',
    required: true,
    options: [
      'Much more confident than predicted',
      'Somewhat more confident than predicted',
      'About as confident as predicted',
      'Somewhat less confident than predicted',
      'Much less confident than predicted'
    ],
    icon: Brain
  },
  {
    id: 'challenges_reflection',
    category: 'Reflection',
    text: 'Which anticipated challenges actually occurred?',
    subText: 'Reflect on your predictions vs. reality',
    type: 'textarea',
    required: true,
    placeholder: 'Describe which challenges you predicted correctly and which didn\'t materialize...',
    minLength: 50,
    maxLength: 400,
    icon: Shield
  },
  {
    id: 'preparation_effectiveness',
    category: 'Reflection',
    text: 'How effective was your preparation?',
    type: 'scale',
    required: true,
    min: 1,
    max: 10,
    helpText: 'Consider mental, emotional, and practical preparation',
    icon: CheckSquare
  },

  // ASSIGNMENT EXECUTION
  {
    id: 'assignment_unfolded',
    category: 'Execution',
    text: 'How did the assignment unfold?',
    subText: 'Provide a brief narrative of key moments',
    type: 'textarea',
    required: true,
    placeholder: 'Describe the flow of the assignment, including any pivotal moments...',
    minLength: 100,
    maxLength: 500,
    icon: Activity
  },
  {
    id: 'strategies_used',
    category: 'Execution',
    text: 'Which strategies did you actually use?',
    type: 'multiselect',
    required: true,
    options: [
      'Pre-session role clarification',
      'Professional introduction scripts',
      'Boundary redirections',
      'Emotional regulation techniques',
      'Mindfulness/grounding exercises',
      'Note-taking for accuracy',
      'Clarification requests',
      'Self-advocacy when needed',
      'Break requests',
      'Support system activation'
    ],
    icon: Target
  },
  {
    id: 'technical_accuracy',
    category: 'Execution',
    text: 'Rate your technical accuracy',
    type: 'scale',
    required: true,
    min: 1,
    max: 10,
    helpText: 'How accurately did you convey information?',
    icon: CheckSquare
  },
  {
    id: 'communication_effectiveness',
    category: 'Execution',
    text: 'Rate your communication effectiveness',
    type: 'scale',
    required: true,
    min: 1,
    max: 10,
    helpText: 'How well did you facilitate understanding?',
    icon: Users
  },

  // EMOTIONAL & PHYSICAL EXPERIENCE
  {
    id: 'emotions_during',
    category: 'Emotional',
    text: 'Select emotions you experienced during the assignment',
    type: 'multiselect',
    required: true,
    options: [
      'Calm', 'Anxious', 'Confident', 'Overwhelmed',
      'Focused', 'Scattered', 'Energized', 'Drained',
      'Satisfied', 'Frustrated', 'Proud', 'Disappointed',
      'Connected', 'Detached', 'Empowered', 'Vulnerable'
    ],
    icon: Heart
  },
  {
    id: 'body_experience',
    category: 'Emotional',
    text: 'How did your body feel during and after?',
    type: 'textarea',
    required: true,
    placeholder: 'Describe physical sensations, tension, energy levels...',
    minLength: 50,
    maxLength: 300,
    icon: Activity
  },
  {
    id: 'flow_struggle_moments',
    category: 'Emotional',
    text: 'Describe moments of flow vs. struggle',
    type: 'textarea',
    required: true,
    placeholder: 'When did things feel effortless? When did you struggle?',
    minLength: 50,
    maxLength: 400,
    icon: Brain
  },

  // CHALLENGES & ADAPTATIONS
  {
    id: 'unexpected_challenges',
    category: 'Challenges',
    text: 'What unexpected challenges arose?',
    type: 'textarea',
    required: true,
    placeholder: 'Describe challenges you didn\'t anticipate...',
    minLength: 50,
    maxLength: 400,
    icon: AlertTriangle
  },
  {
    id: 'real_time_adaptations',
    category: 'Challenges',
    text: 'How did you adapt in real-time?',
    subText: 'Describe your problem-solving in action',
    type: 'textarea',
    required: true,
    placeholder: 'What adjustments did you make on the fly?',
    minLength: 50,
    maxLength: 400,
    icon: Lightbulb
  },
  {
    id: 'would_do_differently',
    category: 'Challenges',
    text: 'What would you do differently?',
    type: 'textarea',
    required: true,
    placeholder: 'With hindsight, what would you change?',
    minLength: 50,
    maxLength: 400,
    icon: TrendingUp
  },

  // GROWTH & LEARNING
  {
    id: 'skills_strengthened',
    category: 'Growth',
    text: 'Which skills did you strengthen?',
    type: 'multiselect',
    required: true,
    options: [
      'Technical accuracy',
      'Cultural sensitivity',
      'Emotional regulation',
      'Boundary maintenance',
      'Stress management',
      'Active listening',
      'Memory and recall',
      'Simultaneous processing',
      'Self-advocacy',
      'Professional presence',
      'Conflict navigation',
      'Time management'
    ],
    icon: TrendingUp
  },
  {
    id: 'new_capabilities',
    category: 'Growth',
    text: 'What new capabilities did you discover?',
    type: 'textarea',
    required: true,
    placeholder: 'What surprised you about your abilities?',
    minLength: 50,
    maxLength: 300,
    icon: Lightbulb
  },
  {
    id: 'pattern_recognition',
    category: 'Growth',
    text: 'What patterns are you noticing in your practice?',
    subText: 'Consider recurring themes across assignments',
    type: 'textarea',
    required: true,
    placeholder: 'What keeps coming up for you?',
    minLength: 50,
    maxLength: 400,
    icon: Brain
  },

  // RECOVERY & INTEGRATION
  {
    id: 'recovery_practices',
    category: 'Recovery',
    text: 'What recovery practices will you use?',
    type: 'multiselect',
    required: true,
    options: [
      'Physical movement/exercise',
      'Meditation/mindfulness',
      'Journaling/writing',
      'Talking with someone',
      'Creative expression',
      'Nature/outdoor time',
      'Rest/sleep',
      'Comfort activities',
      'Professional supervision',
      'Peer support'
    ],
    icon: Heart
  },
  {
    id: 'completion_needs',
    category: 'Recovery',
    text: 'What do you need to feel complete with this assignment?',
    type: 'textarea',
    required: true,
    placeholder: 'What would help you close this chapter?',
    minLength: 50,
    maxLength: 300,
    icon: CheckSquare
  },
  {
    id: 'celebration_acknowledgment',
    category: 'Recovery',
    text: 'How will you celebrate or acknowledge your work?',
    type: 'textarea',
    required: true,
    placeholder: 'How will you honor your effort and contribution?',
    minLength: 30,
    maxLength: 300,
    icon: Heart
  },

  // CLOSING SYNTHESIS
  {
    id: 'three_insights',
    category: 'Synthesis',
    text: 'What are your three key insights from this assignment?',
    subText: 'Distill your learning into three clear points',
    type: 'textarea',
    required: true,
    placeholder: '1.\n2.\n3.',
    minLength: 50,
    maxLength: 400,
    icon: Lightbulb
  },
  {
    id: 'proudest_moment',
    category: 'Synthesis',
    text: 'What moment are you most proud of?',
    type: 'textarea',
    required: true,
    placeholder: 'Describe a moment that exemplified your best work...',
    minLength: 50,
    maxLength: 300,
    icon: Target
  },
  {
    id: 'future_confidence',
    category: 'Synthesis',
    text: 'How confident do you feel about future assignments?',
    type: 'scale',
    required: true,
    min: 1,
    max: 10,
    helpText: 'Based on this experience, rate your readiness for what\'s next',
    icon: TrendingUp
  }
];

/**
 * Post-Assignment Debrief V2 Component
 */
export function PostAssignmentDebriefV2() {
  const navigate = useNavigate();

  const handleComplete = (data: any) => {
    // Navigate to growth insights after completion
    setTimeout(() => {
      navigate('/growth-insights');
    }, 2000);
  };

  const headerComponent = (
    <div 
      className="px-4 py-3 text-center"
      style={{ 
        background: `linear-gradient(135deg, ${REFLECTION_THEME.colors.accents.purple}, ${REFLECTION_THEME.colors.accents.teal})`,
        color: REFLECTION_THEME.colors.neutral.white
      }}
    >
      <p className="text-sm">
        💡 Tip: Take your time with each question. Your honest reflection contributes to your growth.
      </p>
    </div>
  );

  const footerComponent = (
    <div className="px-4 py-6 mt-12 text-center border-t">
      <p className="text-sm text-gray-600">
        Need support? Contact your supervisor or access our wellness resources.
      </p>
    </div>
  );

  return (
    <ReflectionBase
      title="Post-Assignment Debrief"
      subtitle="Process and integrate your assignment experience"
      questions={POST_ASSIGNMENT_QUESTIONS}
      reflectionType="post_assignment_debrief_v2"
      onComplete={handleComplete}
      allowReview={true}
      autoSaveInterval={3}
      customTheme={REFLECTION_THEME}
      headerComponent={headerComponent}
      footerComponent={footerComponent}
    />
  );
}

export default PostAssignmentDebriefV2;