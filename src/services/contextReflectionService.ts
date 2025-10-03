/**
 * Context-Specific Reflection Service
 * Handles context-specific reflections and integrates with Growth Insights and Elya
 */

import { supabase } from '../lib/supabase';
import { deepDiveFrameworks } from '../data/deepDiveFrameworks';

export interface ContextReflection {
  id: string;
  user_id: string;
  reflection_type: string;
  context_type: string; // medical, legal, educational, mental_health, community
  content: Record<string, string>;
  insights?: ContextInsights;
  timestamp: string;
}

export interface ContextInsights {
  strengths: string[];
  challenges: string[];
  patterns: string[];
  recommendations: string[];
  skillsUsed: string[];
  growthAreas: string[];
}

export interface ContextStatistics {
  totalReflections: number;
  byContext: Record<string, number>;
  topChallenges: Array<{ challenge: string; frequency: number }>;
  topSkills: Array<{ skill: string; frequency: number }>;
  growthTrajectory: Array<{ date: string; score: number }>;
  contextSpecificMetrics: {
    medical?: MedicalMetrics;
    legal?: LegalMetrics;
    educational?: EducationalMetrics;
    mentalHealth?: MentalHealthMetrics;
    community?: CommunityMetrics;
  };
}

interface MedicalMetrics {
  terminologyAccuracy: number;
  emotionalManagement: number;
  protocolAdherence: number;
  familyDynamics: number;
}

interface LegalMetrics {
  accuracyScore: number;
  impartialityScore: number;
  technicalProficiency: number;
  stressManagement: number;
}

interface EducationalMetrics {
  learningSupport: number;
  communicationClarity: number;
  parentEngagement: number;
  academicTerminology: number;
}

interface MentalHealthMetrics {
  emotionalBoundaries: number;
  therapeuticPresence: number;
  nuanceConveyance: number;
  selfCare: number;
}

interface CommunityMetrics {
  culturalCompetence: number;
  groupDynamics: number;
  adaptability: number;
  accessibilitySupport: number;
}

/**
 * Save context-specific reflection with analysis
 */
export async function saveContextReflection(
  userId: string,
  reflectionType: string,
  content: Record<string, string>
): Promise<{ success: boolean; error?: string; reflection?: ContextReflection }> {
  try {
    // Determine context type from the reflection content
    const contextType = determineContextType(content);
    
    // Generate insights from the reflection
    const insights = generateContextInsights(content, contextType);
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('reflections')
      .insert({
        user_id: userId,
        reflection_type: reflectionType,
        type: `context_${contextType}`,
        answers: content,
        metadata: {
          context_type: contextType,
          insights,
          framework_used: reflectionType,
          completed_at: new Date().toISOString()
        },
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update context-specific metrics
    await updateContextMetrics(userId, contextType, insights);

    return {
      success: true,
      reflection: {
        id: data.id,
        user_id: userId,
        reflection_type: reflectionType,
        context_type: contextType,
        content,
        insights,
        timestamp: data.created_at
      }
    };
  } catch (error) {
    console.error('Error saving context reflection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save context reflection'
    };
  }
}

/**
 * Determine context type from reflection content
 */
function determineContextType(content: Record<string, string>): string {
  const contentStr = JSON.stringify(content).toLowerCase();
  
  // Check for context-specific keywords
  if (contentStr.includes('medical') || contentStr.includes('patient') || contentStr.includes('clinical')) {
    return 'medical';
  }
  if (contentStr.includes('legal') || contentStr.includes('court') || contentStr.includes('attorney')) {
    return 'legal';
  }
  if (contentStr.includes('education') || contentStr.includes('student') || contentStr.includes('teacher')) {
    return 'educational';
  }
  if (contentStr.includes('therapy') || contentStr.includes('mental health') || contentStr.includes('counseling')) {
    return 'mental_health';
  }
  if (contentStr.includes('community') || contentStr.includes('social') || contentStr.includes('public')) {
    return 'community';
  }
  
  return 'general';
}

/**
 * Generate insights from context-specific reflection
 */
function generateContextInsights(
  content: Record<string, string>,
  contextType: string
): ContextInsights {
  const insights: ContextInsights = {
    strengths: [],
    challenges: [],
    patterns: [],
    recommendations: [],
    skillsUsed: [],
    growthAreas: []
  };

  // Analyze content for strengths
  const strengthKeywords = ['successfully', 'effectively', 'well', 'managed', 'maintained', 'established'];
  const challengeKeywords = ['difficult', 'struggled', 'challenging', 'hard', 'complex', 'overwhelming'];
  const skillKeywords = ['terminology', 'accuracy', 'boundaries', 'cultural', 'emotional', 'technical'];

  Object.values(content).forEach(answer => {
    const lowerAnswer = answer.toLowerCase();
    
    // Identify strengths
    strengthKeywords.forEach(keyword => {
      if (lowerAnswer.includes(keyword)) {
        const sentence = extractSentenceWithKeyword(answer, keyword);
        if (sentence && !insights.strengths.includes(sentence)) {
          insights.strengths.push(sentence.substring(0, 100));
        }
      }
    });

    // Identify challenges
    challengeKeywords.forEach(keyword => {
      if (lowerAnswer.includes(keyword)) {
        const sentence = extractSentenceWithKeyword(answer, keyword);
        if (sentence && !insights.challenges.includes(sentence)) {
          insights.challenges.push(sentence.substring(0, 100));
        }
      }
    });

    // Identify skills used
    skillKeywords.forEach(keyword => {
      if (lowerAnswer.includes(keyword)) {
        insights.skillsUsed.push(keyword);
      }
    });
  });

  // Generate context-specific recommendations
  insights.recommendations = generateContextRecommendations(contextType, insights);
  
  // Identify growth areas
  insights.growthAreas = identifyGrowthAreas(contextType, content);
  
  // Detect patterns
  insights.patterns = detectPatterns(content);

  return insights;
}

/**
 * Extract sentence containing keyword
 */
function extractSentenceWithKeyword(text: string, keyword: string): string {
  const sentences = text.split(/[.!?]+/);
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(keyword)) {
      return sentence.trim();
    }
  }
  return '';
}

/**
 * Generate context-specific recommendations
 */
function generateContextRecommendations(
  contextType: string,
  insights: ContextInsights
): string[] {
  const recommendations: string[] = [];

  switch (contextType) {
    case 'medical':
      recommendations.push('Review medical terminology flashcards weekly');
      if (insights.challenges.some(c => c.includes('emotional'))) {
        recommendations.push('Practice emotional regulation techniques before medical assignments');
      }
      recommendations.push('Attend medical interpreting continuing education');
      break;

    case 'legal':
      recommendations.push('Study legal glossaries for your common case types');
      if (insights.challenges.some(c => c.includes('simultaneous'))) {
        recommendations.push('Practice simultaneous interpreting with legal recordings');
      }
      recommendations.push('Review court procedures and protocols quarterly');
      break;

    case 'educational':
      recommendations.push('Familiarize yourself with grade-level academic vocabulary');
      recommendations.push('Learn about IEP processes and special education terminology');
      if (insights.challenges.some(c => c.includes('parent'))) {
        recommendations.push('Develop strategies for parent-teacher conference interpreting');
      }
      break;

    case 'mental_health':
      recommendations.push('Study therapeutic communication techniques');
      recommendations.push('Practice self-care after emotionally intensive sessions');
      if (insights.challenges.some(c => c.includes('boundaries'))) {
        recommendations.push('Review professional boundary guidelines for mental health settings');
      }
      break;

    case 'community':
      recommendations.push('Enhance cultural competency through community engagement');
      recommendations.push('Practice managing group interpretation dynamics');
      if (insights.challenges.some(c => c.includes('literacy'))) {
        recommendations.push('Develop plain language interpretation strategies');
      }
      break;

    default:
      recommendations.push('Continue regular reflection practice');
      recommendations.push('Seek mentorship in challenging areas');
  }

  return recommendations;
}

/**
 * Identify growth areas based on context and content
 */
function identifyGrowthAreas(contextType: string, content: Record<string, string>): string[] {
  const growthAreas: string[] = [];
  const contentStr = JSON.stringify(content).toLowerCase();

  // Common growth areas
  if (contentStr.includes('wish') || contentStr.includes('could have')) {
    growthAreas.push('Preparation strategies');
  }
  if (contentStr.includes('next time')) {
    growthAreas.push('Continuous improvement mindset');
  }

  // Context-specific growth areas
  switch (contextType) {
    case 'medical':
      if (!contentStr.includes('terminology')) {
        growthAreas.push('Medical terminology expansion');
      }
      break;
    case 'legal':
      if (!contentStr.includes('accuracy')) {
        growthAreas.push('Legal accuracy enhancement');
      }
      break;
    case 'educational':
      if (!contentStr.includes('learning')) {
        growthAreas.push('Educational support strategies');
      }
      break;
    case 'mental_health':
      if (!contentStr.includes('boundaries')) {
        growthAreas.push('Therapeutic boundary management');
      }
      break;
    case 'community':
      if (!contentStr.includes('cultural')) {
        growthAreas.push('Cultural competency development');
      }
      break;
  }

  return growthAreas;
}

/**
 * Detect patterns in reflection content
 */
function detectPatterns(content: Record<string, string>): string[] {
  const patterns: string[] = [];
  const contentStr = JSON.stringify(content).toLowerCase();

  // Emotional patterns
  if (contentStr.includes('stress') || contentStr.includes('overwhelm')) {
    patterns.push('Stress response pattern detected');
  }
  if (contentStr.includes('confident') || contentStr.includes('comfortable')) {
    patterns.push('Growing confidence pattern');
  }

  // Professional patterns
  if (contentStr.includes('boundary') || contentStr.includes('professional')) {
    patterns.push('Strong professional boundary awareness');
  }
  if (contentStr.includes('accuracy') || contentStr.includes('precise')) {
    patterns.push('Focus on accuracy and precision');
  }

  // Learning patterns
  if (contentStr.includes('learned') || contentStr.includes('realized')) {
    patterns.push('Active learning and growth');
  }
  if (contentStr.includes('challenge') && contentStr.includes('overcome')) {
    patterns.push('Resilience in facing challenges');
  }

  return patterns;
}

/**
 * Update context-specific metrics in database
 */
async function updateContextMetrics(
  userId: string,
  contextType: string,
  insights: ContextInsights
): Promise<void> {
  try {
    // Calculate scores based on insights
    const scores = calculateContextScores(contextType, insights);
    
    // Update or insert metrics
    await supabase
      .from('context_metrics')
      .upsert({
        user_id: userId,
        context_type: contextType,
        metrics: scores,
        last_updated: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error updating context metrics:', error);
  }
}

/**
 * Calculate context-specific scores
 */
function calculateContextScores(
  contextType: string,
  insights: ContextInsights
): Record<string, number> {
  const baseScore = 70; // Starting score
  const scores: Record<string, number> = {};

  // Adjust based on strengths and challenges
  const strengthBonus = insights.strengths.length * 5;
  const challengePenalty = insights.challenges.length * 3;
  const overallScore = Math.min(100, Math.max(0, baseScore + strengthBonus - challengePenalty));

  switch (contextType) {
    case 'medical':
      scores.terminologyAccuracy = overallScore + (insights.skillsUsed.includes('terminology') ? 10 : 0);
      scores.emotionalManagement = overallScore + (insights.skillsUsed.includes('emotional') ? 10 : 0);
      scores.protocolAdherence = overallScore;
      scores.familyDynamics = overallScore;
      break;

    case 'legal':
      scores.accuracyScore = overallScore + (insights.skillsUsed.includes('accuracy') ? 10 : 0);
      scores.impartialityScore = overallScore;
      scores.technicalProficiency = overallScore + (insights.skillsUsed.includes('technical') ? 10 : 0);
      scores.stressManagement = overallScore;
      break;

    case 'educational':
      scores.learningSupport = overallScore;
      scores.communicationClarity = overallScore;
      scores.parentEngagement = overallScore;
      scores.academicTerminology = overallScore + (insights.skillsUsed.includes('terminology') ? 10 : 0);
      break;

    case 'mental_health':
      scores.emotionalBoundaries = overallScore + (insights.skillsUsed.includes('boundaries') ? 10 : 0);
      scores.therapeuticPresence = overallScore;
      scores.nuanceConveyance = overallScore;
      scores.selfCare = overallScore + (insights.skillsUsed.includes('emotional') ? 10 : 0);
      break;

    case 'community':
      scores.culturalCompetence = overallScore + (insights.skillsUsed.includes('cultural') ? 10 : 0);
      scores.groupDynamics = overallScore;
      scores.adaptability = overallScore;
      scores.accessibilitySupport = overallScore;
      break;

    default:
      scores.overall = overallScore;
  }

  return scores;
}

/**
 * Get context-specific statistics for Growth Insights
 */
export async function getContextStatistics(
  userId: string,
  timePeriod?: 'week' | 'month' | '90days'
): Promise<{ success: boolean; error?: string; statistics?: ContextStatistics }> {
  try {
    // Build query
    let query = supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId)
      .like('type', 'context_%');

    // Apply time filter
    if (timePeriod) {
      const now = new Date();
      let startDate: Date;

      switch (timePeriod) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    // Process statistics
    const statistics: ContextStatistics = {
      totalReflections: data?.length || 0,
      byContext: {},
      topChallenges: [],
      topSkills: [],
      growthTrajectory: [],
      contextSpecificMetrics: {}
    };

    // Count by context type
    const contextCounts: Record<string, number> = {};
    const challengeMap: Record<string, number> = {};
    const skillMap: Record<string, number> = {};

    data?.forEach(reflection => {
      const contextType = reflection.metadata?.context_type || 'general';
      contextCounts[contextType] = (contextCounts[contextType] || 0) + 1;

      // Extract challenges and skills from insights
      const insights = reflection.metadata?.insights;
      if (insights) {
        insights.challenges?.forEach((challenge: string) => {
          challengeMap[challenge] = (challengeMap[challenge] || 0) + 1;
        });
        insights.skillsUsed?.forEach((skill: string) => {
          skillMap[skill] = (skillMap[skill] || 0) + 1;
        });
      }
    });

    statistics.byContext = contextCounts;
    
    // Top challenges
    statistics.topChallenges = Object.entries(challengeMap)
      .map(([challenge, frequency]) => ({ challenge, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Top skills
    statistics.topSkills = Object.entries(skillMap)
      .map(([skill, frequency]) => ({ skill, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Fetch context-specific metrics
    const { data: metricsData } = await supabase
      .from('context_metrics')
      .select('*')
      .eq('user_id', userId);

    if (metricsData) {
      metricsData.forEach(metric => {
        statistics.contextSpecificMetrics[metric.context_type] = metric.metrics;
      });
    }

    return { success: true, statistics };
  } catch (error) {
    console.error('Error fetching context statistics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics'
    };
  }
}

/**
 * Prepare context data for Elya integration
 */
export async function prepareContextDataForElya(
  userId: string,
  timePeriod?: 'week' | 'month' | '90days'
): Promise<{
  success: boolean;
  error?: string;
  elyaContextData?: {
    contextDistribution: Record<string, number>;
    topChallenges: Array<{ challenge: string; frequency: number }>;
    skillProfile: Array<{ skill: string; frequency: number }>;
    contextMetrics: Record<string, any>;
    recommendations: string[];
    learningPathSuggestions: string[];
  };
}> {
  try {
    const { statistics } = await getContextStatistics(userId, timePeriod);
    if (!statistics) {
      throw new Error('Unable to fetch context statistics');
    }

    // Generate learning path suggestions based on context distribution
    const learningPathSuggestions: string[] = [];
    
    Object.entries(statistics.byContext).forEach(([context, count]) => {
      if (count > 5) {
        switch (context) {
          case 'medical':
            learningPathSuggestions.push('Advanced Medical Interpreting Certification');
            learningPathSuggestions.push('Medical Terminology Specialization');
            break;
          case 'legal':
            learningPathSuggestions.push('Court Interpreting Certification');
            learningPathSuggestions.push('Legal Translation Workshop');
            break;
          case 'educational':
            learningPathSuggestions.push('Educational Interpreting Certificate');
            learningPathSuggestions.push('Special Education Terminology Training');
            break;
          case 'mental_health':
            learningPathSuggestions.push('Mental Health Interpreting Specialization');
            learningPathSuggestions.push('Trauma-Informed Interpreting Training');
            break;
          case 'community':
            learningPathSuggestions.push('Community Interpreting Certificate');
            learningPathSuggestions.push('Cultural Mediation Training');
            break;
        }
      }
    });

    // Generate personalized recommendations
    const recommendations: string[] = [];
    
    // Based on top challenges
    statistics.topChallenges.forEach(({ challenge }) => {
      if (challenge.includes('terminology')) {
        recommendations.push('Focus on specialized vocabulary building');
      }
      if (challenge.includes('emotional')) {
        recommendations.push('Practice emotional regulation techniques');
      }
      if (challenge.includes('boundary')) {
        recommendations.push('Review professional boundary guidelines');
      }
    });

    // Based on skills used
    statistics.topSkills.forEach(({ skill }) => {
      recommendations.push(`Continue developing ${skill} expertise`);
    });

    return {
      success: true,
      elyaContextData: {
        contextDistribution: statistics.byContext,
        topChallenges: statistics.topChallenges,
        skillProfile: statistics.topSkills,
        contextMetrics: statistics.contextSpecificMetrics,
        recommendations,
        learningPathSuggestions
      }
    };
  } catch (error) {
    console.error('Error preparing context data for Elya:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to prepare Elya data'
    };
  }
}