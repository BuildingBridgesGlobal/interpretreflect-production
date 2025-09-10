/**
 * Custom hook for managing reflections with Supabase
 * Handles both local storage and Supabase sync
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  saveReflectionToSupabase, 
  getUserReflections,
  getReflectionStats,
  getReflectionInsights
} from '../services/reflectionService';

interface LocalReflection {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: string;
}

export function useSupabaseReflections(timePeriod: 'week' | 'month' | '90days' = 'month') {
  const { user } = useAuth();
  const [savedReflections, setSavedReflections] = useState<LocalReflection[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);

  // Load reflections from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('savedReflections');
    if (stored) {
      try {
        setSavedReflections(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing stored reflections:', error);
      }
    }
  }, []);

  // Fetch reflections from Supabase
  const fetchReflections = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch reflections
      const { reflections } = await getUserReflections(user.id, 50, timePeriod);
      if (reflections) {
        const formattedReflections = reflections.map(r => ({
          id: r.id || Date.now().toString(),
          type: r.type,
          data: r.data,
          timestamp: r.timestamp
        }));
        setSavedReflections(formattedReflections);
        localStorage.setItem('savedReflections', JSON.stringify(formattedReflections));
      }

      // Fetch stats
      const { stats: reflectionStats } = await getReflectionStats(user.id);
      if (reflectionStats) {
        setStats(reflectionStats);
      }

      // Fetch insights
      const { insights: reflectionInsights } = await getReflectionInsights(user.id, timePeriod);
      if (reflectionInsights) {
        setInsights(reflectionInsights);
      }
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      setLoading(false);
    }
  }, [user, timePeriod]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    if (user) {
      fetchReflections();
    }
  }, [user, timePeriod, fetchReflections]);

  // Save reflection function
  const saveReflection = useCallback(async (type: string, data: Record<string, any>) => {
    // Create local reflection
    const newReflection: LocalReflection = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date().toISOString(),
    };
    
    // Update local state and localStorage immediately
    const updatedReflections = [newReflection, ...savedReflections].slice(0, 50);
    setSavedReflections(updatedReflections);
    localStorage.setItem('savedReflections', JSON.stringify(updatedReflections));
    
    // Save to Supabase if authenticated
    if (user) {
      try {
        const result = await saveReflectionToSupabase(user.id, type, data);
        if (result.success) {
          console.log('Reflection saved to Supabase');
          // Refresh data to get updated stats and insights
          fetchReflections();
        } else {
          console.error('Failed to save to Supabase:', result.error);
        }
      } catch (error) {
        console.error('Error saving reflection:', error);
      }
    }
    
    return newReflection;
  }, [user, savedReflections, fetchReflections]);

  // Delete reflection function
  const deleteReflection = useCallback(async (reflectionId: string) => {
    // Remove from local state
    const updated = savedReflections.filter(r => r.id !== reflectionId);
    setSavedReflections(updated);
    localStorage.setItem('savedReflections', JSON.stringify(updated));
    
    // If using Supabase, delete from database
    if (user) {
      try {
        // You would implement deleteReflection in reflectionService.ts
        console.log('Deleting from Supabase:', reflectionId);
      } catch (error) {
        console.error('Error deleting reflection:', error);
      }
    }
  }, [user, savedReflections]);

  return {
    savedReflections,
    loading,
    stats,
    insights,
    saveReflection,
    deleteReflection,
    refreshReflections: fetchReflections
  };
}