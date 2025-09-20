/**
 * Wellness Metrics Service
 * Extracts and saves wellness metrics from reflections for burnout prediction
 */

import { supabase } from '../lib/supabase';

const DEPLOYMENT_SALT = import.meta.env.VITE_ZKWV_SALT || 'interpretreflect-zkwv-2025';

/**
 * Create user hash for anonymization using Web Crypto API
 */
async function createUserHash(userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId + DEPLOYMENT_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Extract wellness metrics from reflection data
 */
function extractMetricsFromReflection(entryKind: string, data: any): {
  burnout_score?: number;
  stress_level?: number;
  energy_level?: number;
  confidence_score?: number;
  high_stress_pattern?: boolean;
  recovery_needed?: boolean;
  growth_trajectory?: boolean;
} {
  const metrics: any = {};

  // Extract stress and energy from wellness check-ins
  if (entryKind === 'wellness_checkin' || data.stressLevel || data.energyLevel) {
    if (data.stressLevel) {
      metrics.stress_level = parseFloat(data.stressLevel);
    }
    if (data.energyLevel) {
      metrics.energy_level = parseFloat(data.energyLevel);
    }
  }

  // Extract from post-assignment debriefs
  if (entryKind === 'post_assignment_debrief' || data.stressLevelBefore || data.stressLevelAfter) {
    // Use the after stress level for current state
    if (data.stressLevelAfter) {
      metrics.stress_level = parseFloat(data.stressLevelAfter);
    } else if (data.stressLevel) {
      metrics.stress_level = parseFloat(data.stressLevel);
    }

    if (data.energyLevel) {
      metrics.energy_level = parseFloat(data.energyLevel);
    }

    // Check for high stress pattern
    if (data.stressLevelBefore && parseFloat(data.stressLevelBefore) > 7) {
      metrics.high_stress_pattern = true;
    }
  }

  // Extract burnout indicators from various fields
  if (data.burnoutLevel) {
    metrics.burnout_score = parseFloat(data.burnoutLevel);
  } else if (data.overall_feeling) {
    // Infer burnout from text analysis (simplified)
    const text = data.overall_feeling.toLowerCase();
    if (text.includes('exhausted') || text.includes('overwhelmed') || text.includes('burnt out')) {
      metrics.burnout_score = 8;
      metrics.recovery_needed = true;
    } else if (text.includes('tired') || text.includes('stressed')) {
      metrics.burnout_score = 6;
    } else if (text.includes('good') || text.includes('energized')) {
      metrics.burnout_score = 3;
    }
  }

  // Extract confidence from various assessments
  if (data.confidence || data.confidenceLevel) {
    metrics.confidence_score = parseFloat(data.confidence || data.confidenceLevel);
  }

  // Check for recovery indicators
  if (data.needsBreak || data.recovery_needed) {
    metrics.recovery_needed = true;
  }

  // Check for growth trajectory
  if (data.growth_areas || data.achievements || data.professional_growth) {
    metrics.growth_trajectory = true;
  }

  return metrics;
}

/**
 * Save wellness metrics from a reflection
 */
export async function saveWellnessMetrics(
  userId: string,
  entryKind: string,
  data: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract metrics from the reflection data
    const metrics = extractMetricsFromReflection(entryKind, data);

    // Only save if we have meaningful metrics
    if (Object.keys(metrics).length === 0) {
      return { success: true }; // No metrics to save
    }

    // Create anonymized user hash
    const userHash = await createUserHash(userId);

    // Get the current week's Monday as the week_of date
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
    const weekOf = new Date(today.setDate(diff));
    weekOf.setHours(0, 0, 0, 0);

    // Check if we already have metrics for this week
    const { data: existing } = await supabase
      .from('wellness_metrics')
      .select('id, stress_level, energy_level, burnout_score')
      .eq('user_hash', userHash)
      .eq('week_of', weekOf.toISOString().split('T')[0])
      .single();

    if (existing) {
      // Update existing metrics with weighted average
      const updatedMetrics: any = {};

      if (metrics.stress_level !== undefined) {
        updatedMetrics.stress_level = existing.stress_level
          ? (existing.stress_level + metrics.stress_level) / 2
          : metrics.stress_level;
      }

      if (metrics.energy_level !== undefined) {
        updatedMetrics.energy_level = existing.energy_level
          ? (existing.energy_level + metrics.energy_level) / 2
          : metrics.energy_level;
      }

      if (metrics.burnout_score !== undefined) {
        updatedMetrics.burnout_score = existing.burnout_score
          ? Math.max(existing.burnout_score, metrics.burnout_score) // Use higher value for burnout
          : metrics.burnout_score;
      }

      // Update boolean flags (OR operation)
      if (metrics.high_stress_pattern !== undefined) {
        updatedMetrics.high_stress_pattern = metrics.high_stress_pattern;
      }
      if (metrics.recovery_needed !== undefined) {
        updatedMetrics.recovery_needed = metrics.recovery_needed;
      }
      if (metrics.growth_trajectory !== undefined) {
        updatedMetrics.growth_trajectory = metrics.growth_trajectory;
      }
      if (metrics.confidence_score !== undefined) {
        updatedMetrics.confidence_score = metrics.confidence_score;
      }

      // Update existing record
      const { error } = await supabase
        .from('wellness_metrics')
        .update(updatedMetrics)
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new metrics
      const { error } = await supabase
        .from('wellness_metrics')
        .insert({
          user_hash: userHash,
          week_of: weekOf.toISOString().split('T')[0],
          ...metrics
        });

      if (error) throw error;
    }

    // Also save to anonymized_reflections for historical tracking
    const sessionHash = await createUserHash(Date.now().toString());

    const reflectionCategory =
      entryKind === 'wellness_checkin' ? 'wellness_check' :
      entryKind === 'post_assignment_debrief' ? 'session_reflection' :
      entryKind === 'team_reflection' ? 'team_sync' :
      entryKind === 'values_alignment_check' ? 'values_alignment' :
      entryKind === 'stress_reduction_technique' ? 'stress_management' :
      'growth_assessment';

    const { error: reflectionError } = await supabase
      .from('anonymized_reflections')
      .insert({
        user_hash: userHash,
        session_hash: sessionHash,
        reflection_category: reflectionCategory,
        metrics: metrics,
        context_type: data.assignment_type || 'general'
      });

    if (reflectionError) {
      console.error('Failed to save anonymized reflection:', reflectionError);
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving wellness metrics:', error);
    return {
      success: false,
      error: 'Failed to save wellness metrics'
    };
  }
}

/**
 * Get current week's metrics for a user
 */
export async function getCurrentWeekMetrics(userId: string): Promise<{
  success: boolean;
  data?: {
    stress_level?: number;
    energy_level?: number;
    burnout_score?: number;
    confidence_score?: number;
  };
  error?: string;
}> {
  try {
    const userHash = await createUserHash(userId);

    // Get current week's Monday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekOf = new Date(today.setDate(diff));
    weekOf.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('wellness_metrics')
      .select('stress_level, energy_level, burnout_score, confidence_score')
      .eq('user_hash', userHash)
      .eq('week_of', weekOf.toISOString().split('T')[0])
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    return {
      success: true,
      data: data || {}
    };
  } catch (error) {
    console.error('Error getting current week metrics:', error);
    return {
      success: false,
      error: 'Failed to get current metrics'
    };
  }
}