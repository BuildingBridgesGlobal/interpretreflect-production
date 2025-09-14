/**
 * Data processing and aggregation utilities
 */

import type { BurnoutData } from '../types';

/**
 * Get reflection summary from reflection data
 */
export const getReflectionSummary = (reflection: Record<string, unknown>): string => {
  const type = reflection.type as string || 'Reflection';
  const date = reflection.date ? new Date(reflection.date as string).toLocaleDateString() : 'Recent';
  const name = reflection.name as string || 'Unknown';
  
  const summaryMap: Record<string, string> = {
    'Wellness Check-in': `Wellness check on ${date}`,
    'Pre-Assignment Prep': `Prepared for ${name} on ${date}`,
    'Post-Assignment Debrief': `Debriefed ${name} on ${date}`,
    'Teaming Reflection': `Team reflection on ${date}`,
    'Mentoring Reflection': `Mentoring session on ${date}`,
  };
  
  return summaryMap[type] || `${type} on ${date}`;
};

/**
 * Aggregate burnout data by time period
 */
export const getAggregatedBurnoutData = (
  burnoutData: BurnoutData[],
  viewMode: 'weekly' | 'monthly'
): BurnoutData[] => {
  const sorted = [...burnoutData].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  if (viewMode === 'weekly') {
    // Group by week
    const weeks: Record<string, BurnoutData[]> = {};
    
    sorted.forEach(item => {
      const date = new Date(item.timestamp);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(item);
    });
    
    return Object.entries(weeks).map(([weekKey, items]) => ({
      timestamp: weekKey,
      riskLevel: getMostCommonRiskLevel(items),
      scores: getAverageScores(items),
      notes: items[items.length - 1].notes,
    }));
  } else {
    // Group by month
    const months: Record<string, BurnoutData[]> = {};
    
    sorted.forEach(item => {
      const date = new Date(item.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = [];
      }
      months[monthKey].push(item);
    });
    
    return Object.entries(months).map(([monthKey, items]) => ({
      timestamp: `${monthKey}-01`,
      riskLevel: getMostCommonRiskLevel(items),
      scores: getAverageScores(items),
      notes: items[items.length - 1].notes,
    }));
  }
};

/**
 * Get most common risk level from items
 */
export const getMostCommonRiskLevel = (items: BurnoutData[]): 'low' | 'moderate' | 'high' | 'severe' => {
  const counts = items.reduce(
    (acc, item) => {
      acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  
  const mostCommon = Object.entries(counts).sort(([,a], [,b]) => b - a)[0];
  return (mostCommon?.[0] || 'moderate') as 'low' | 'moderate' | 'high' | 'severe';
};

/**
 * Calculate average scores from multiple data points
 */
export const getAverageScores = (items: BurnoutData[]): Record<string, number> => {
  if (items.length === 0) return {};
  
  const sumScores: Record<string, number> = {};
  const countScores: Record<string, number> = {};
  
  items.forEach(item => {
    Object.entries(item.scores).forEach(([key, value]) => {
      sumScores[key] = (sumScores[key] || 0) + value;
      countScores[key] = (countScores[key] || 0) + 1;
    });
  });
  
  const avgScores: Record<string, number> = {};
  Object.keys(sumScores).forEach(key => {
    avgScores[key] = Math.round(sumScores[key] / countScores[key]);
  });
  
  return avgScores;
};

/**
 * Calculate recovery balance index
 */
export const calculateRecoveryBalance = (
  recoveryHabits: Array<{ type: string; timestamp: string; value?: unknown }>,
  savedReflections: Array<{ type: string; timestamp: string }>
): number => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const recentBreaks = recoveryHabits.filter(
    h => h.type === 'break' && new Date(h.timestamp) > weekAgo
  ).length;
  
  const recentSleep = recoveryHabits.filter(
    h => h.type === 'sleep' && new Date(h.timestamp) > weekAgo
  );
  
  const goodSleep = recentSleep.filter(
    h => typeof h.value === 'string' && !h.value.includes('poor')
  ).length;
  
  // Calculate score: breaks (up to 7) + good sleep (up to 7) + wellness checks
  const breakScore = Math.min(recentBreaks, 7) * 7; // Max 49%
  const sleepScore = Math.min(goodSleep, 7) * 7; // Max 49%
  const wellnessScore = savedReflections.filter(
    r => r.type === 'Wellness Check-in' && new Date(r.timestamp) > weekAgo
  ).length * 2; // Max ~14%
  
  return Math.min(breakScore + sleepScore + wellnessScore, 100);
};

/**
 * Filter and sort reflections by date
 */
export const getRecentReflections = (
  reflections: Array<Record<string, unknown>>,
  limit: number = 10
): Array<Record<string, unknown>> => {
  return [...reflections]
    .sort((a, b) => {
      const dateA = new Date(a.timestamp as string || a.date as string || 0);
      const dateB = new Date(b.timestamp as string || b.date as string || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit);
};