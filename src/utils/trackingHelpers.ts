/**
 * Tracking and analytics utility functions
 */

interface TechniqueUsage {
  id: string;
  technique: string;
  startTime: string;
  completed: boolean;
  stressLevelBefore: number | null;
  stressLevelAfter: number | null;
  duration?: number;
  endTime?: string;
}

interface RecoveryHabit {
  id: string;
  type: string;
  value: unknown;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Track when a stress-relief technique starts
 */
export const trackTechniqueStart = (
  technique: string,
  techniqueUsage: TechniqueUsage[],
  setTechniqueUsage: (usage: TechniqueUsage[]) => void
): string => {
  const usage: TechniqueUsage = {
    id: Date.now().toString(),
    technique,
    startTime: new Date().toISOString(),
    completed: false,
    stressLevelBefore: null,
    stressLevelAfter: null,
  };
  
  const updatedUsage = [usage, ...techniqueUsage];
  setTechniqueUsage(updatedUsage);
  localStorage.setItem('techniqueUsage', JSON.stringify(updatedUsage));
  
  return usage.id;
};

/**
 * Track when a technique is completed
 */
export const trackTechniqueComplete = (
  techniqueId: string,
  duration: number,
  techniqueUsage: TechniqueUsage[],
  setTechniqueUsage: (usage: TechniqueUsage[]) => void,
  selectedTechnique: string | null,
  trackRecoveryHabitFn: (type: string, value: unknown, metadata?: Record<string, unknown>) => void
): void => {
  const updatedUsage = techniqueUsage.map(usage => {
    if (usage.id === techniqueId || 
        (usage.technique === selectedTechnique && !usage.completed && 
         new Date(usage.startTime).getTime() > Date.now() - 600000)) { // Within last 10 mins
      return {
        ...usage,
        completed: true,
        duration,
        endTime: new Date().toISOString(),
      };
    }
    return usage;
  });
  
  setTechniqueUsage(updatedUsage);
  localStorage.setItem('techniqueUsage', JSON.stringify(updatedUsage));
  
  // Track this as a recovery break
  if (duration > 50) { // If completed more than 50% of the technique
    trackRecoveryHabitFn('break', 'stress-reset', { technique: selectedTechnique, duration });
  }
};

/**
 * Track recovery habits
 */
export const trackRecoveryHabit = (
  type: string,
  value: unknown,
  metadata: Record<string, unknown> | undefined,
  recoveryHabits: RecoveryHabit[],
  setRecoveryHabits: (habits: RecoveryHabit[]) => void
): void => {
  const habit: RecoveryHabit = {
    id: Date.now().toString(),
    type,
    value,
    timestamp: new Date().toISOString(),
    metadata,
  };
  
  const updatedHabits = [habit, ...recoveryHabits];
  setRecoveryHabits(updatedHabits);
  localStorage.setItem('recoveryHabits', JSON.stringify(updatedHabits));
};

/**
 * Calculate technique usage statistics
 */
export const getTechniqueStats = (techniqueUsage: TechniqueUsage[]) => {
  const completed = techniqueUsage.filter(u => u.completed);
  const totalDuration = completed.reduce((sum, u) => sum + (u.duration || 0), 0);
  const avgDuration = completed.length > 0 ? totalDuration / completed.length : 0;
  
  const techniqueCount = completed.reduce((acc, u) => {
    acc[u.technique] = (acc[u.technique] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostUsed = Object.entries(techniqueCount).sort(([,a], [,b]) => b - a)[0];
  
  return {
    totalSessions: completed.length,
    totalDuration,
    avgDuration,
    mostUsedTechnique: mostUsed ? mostUsed[0] : null,
    techniqueCount,
  };
};

/**
 * Get recent recovery habits
 */
export const getRecentHabits = (
  habits: RecoveryHabit[],
  daysBack: number = 7
): RecoveryHabit[] => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);
  
  return habits.filter(h => new Date(h.timestamp) > cutoff);
};