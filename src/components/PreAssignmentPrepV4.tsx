/**
 * Pre-Assignment Prep V4 Component
 * 
 * Uses the shared ReflectionBase component for consistency
 * with other reflection tools in the platform
 * 
 * @module PreAssignmentPrepV4
 */

import React from 'react';
import { 
  BookOpen, 
  Activity, 
  AlertCircle, 
  Shield, 
  Users, 
  Brain, 
  Compass, 
  Heart, 
  Target
} from 'lucide-react';
import { ReflectionBase, ReflectionQuestion } from './shared/ReflectionBase';
import { useNavigate } from 'react-router-dom';
import { updateGrowthInsightsForUser } from '../services/growthInsightsService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Pre-Assignment Prep Questions
 */
const PRE_ASSIGNMENT_QUESTIONS: ReflectionQuestion[] = [
  {
    id: 'context_background',
    category: 'Context',
    text: "What is the assignment context and what are the participants' backgrounds?",
    subText: "Understanding context helps you prepare mentally and practically",
    type: 'textarea',
    required: true,
    placeholder: "Describe the setting, participants, and any relevant background information...",
    minLength: 50,
    icon: BookOpen
  },
  {
    id: 'materials_review',
    category: 'Preparation',
    text: "Which materials, documents, or terminology should you review before this assignment?",
    subText: "Thorough preparation reduces cognitive load during the assignment",
    type: 'textarea',
    required: true,
    placeholder: "List specific materials, glossaries, or documents you need to review...",
    minLength: 30,
    icon: BookOpen
  },
  {
    id: 'readiness_levels',
    category: 'Wellness',
    text: "What are your emotional and physical readiness levels?",
    subText: "Self-awareness is crucial for performance",
    type: 'textarea',
    required: true,
    placeholder: "Rate and describe your current emotional state and physical energy...",
    minLength: 50,
    icon: Activity
  },
  {
    id: 'anticipated_demands',
    category: 'Demands',
    text: "Which demands (Environmental, Interpersonal, Paralinguistic, Intrapersonal) do you anticipate?",
    subText: "Anticipating demands helps you prepare coping strategies",
    type: 'textarea',
    required: true,
    placeholder: "Consider noise levels, relationship dynamics, tone/pace challenges, and internal pressures...",
    minLength: 50,
    icon: AlertCircle
  },
  {
    id: 'control_strategies',
    category: 'Strategies',
    text: "What control strategies do you have available for anticipated demands?",
    subText: "Having strategies ready reduces stress in the moment",
    type: 'textarea',
    required: true,
    placeholder: "List specific strategies for each type of demand you anticipate...",
    minLength: 50,
    icon: Shield
  },
  {
    id: 'role_space',
    category: 'Role-Space',
    text: "How do your role, alignment with participants, and interaction management responsibilities show up in this assignment?",
    subText: "Clear role boundaries protect your professional integrity",
    type: 'textarea',
    required: true,
    placeholder: "Describe your professional boundaries, positioning, and role clarity strategies...",
    minLength: 100,
    icon: Users
  },
  {
    id: 'neuroscience_practices',
    category: 'Neuroscience',
    text: "What practices (mindfulness, attention reset, etc.) will you use for focus and regulation?",
    subText: "Mental preparation techniques improve performance and reduce anxiety",
    type: 'textarea',
    required: true,
    placeholder: "List specific techniques like breathing exercises, grounding, or visualization...",
    minLength: 50,
    icon: Brain
  },
  {
    id: 'ethics_culture',
    category: 'Ethics',
    text: "Are you prepared for the cultural context and potential ethical dilemmas? List any concerns.",
    subText: "Ethical awareness guides professional decision-making",
    type: 'textarea',
    required: true,
    placeholder: "Identify cultural considerations, ethical boundaries, or potential conflicts...",
    minLength: 50,
    icon: Compass
  },
  {
    id: 'triggers_vulnerabilities',
    category: 'Self-Care',
    text: "What are your triggers or areas of vulnerability and how will you manage them?",
    subText: "Knowing your vulnerabilities helps you protect yourself",
    type: 'textarea',
    required: true,
    placeholder: "Be honest about what might be challenging and your management strategies...",
    minLength: 50,
    icon: Heart
  },
  {
    id: 'backup_plans',
    category: 'Contingency',
    text: "What backup plans do you have for unexpected challenges?",
    subText: "Having Plan B reduces anxiety and improves adaptability",
    type: 'textarea',
    required: true,
    placeholder: "Describe your contingency plans for technical, emotional, or content challenges...",
    minLength: 50,
    icon: Shield
  },
  {
    id: 'growth_goals',
    category: 'Growth',
    text: "What goals do you have for professional growth in this assignment, and how will you reflect on progress?",
    subText: "Intentional growth turns every assignment into a learning opportunity",
    type: 'textarea',
    required: true,
    placeholder: "Identify specific skills to develop and how you'll measure progress...",
    minLength: 50,
    icon: Target
  }
];

/**
 * Main Component
 */
export function PreAssignmentPrepV4() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleComplete = async (data: Record<string, any>) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Save to database with proper structure
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error: saveError } = await supabase
        .from('pre_assignment_reflections')
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          reflection_type: 'pre_assignment_prep',
          answers: data,
          status: 'completed',
          metadata: {
            questions_answered: Object.keys(data).length,
            total_questions: PRE_ASSIGNMENT_QUESTIONS.length,
            completion_time: new Date().toISOString()
          },
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (saveError) {
        console.error('Error saving reflection:', saveError);
        throw saveError;
      }

      // Update growth insights
      const insightsResult = await updateGrowthInsightsForUser(user.id, data);
      
      if (!insightsResult.success) {
        console.error('Failed to update growth insights:', insightsResult.error);
      }

      // Navigate to growth insights or dashboard
      navigate('/growth-insights');
    } catch (error) {
      console.error('Error completing pre-assignment prep:', error);
    }
  };

  return (
    <ReflectionBase
      title="Pre-Assignment Preparation"
      subtitle="Thoughtful preparation for interpreting success"
      questions={PRE_ASSIGNMENT_QUESTIONS}
      reflectionType="pre_assignment_prep"
      onComplete={handleComplete}
      allowReview={true}
      autoSaveInterval={3}
    />
  );
}

export default PreAssignmentPrepV4;