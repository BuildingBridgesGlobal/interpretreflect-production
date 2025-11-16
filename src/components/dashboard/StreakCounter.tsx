'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Flame, TrendingUp, Calendar } from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalReflections: number;
  lastReflectionDate: string | null;
  weeklyGoal: number;
  weeklyProgress: number;
}

export function StreakCounter({ userId }: { userId: string }) {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalReflections: 0,
    lastReflectionDate: null,
    weeklyGoal: 3,
    weeklyProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadStreakData();
  }, [userId]);

  const loadStreakData = async () => {
    try {
      const supabase = createClient();

      // Get all Quick Reflect entries ordered by date
      const { data: reflections, error } = await supabase
        .from('quick_reflect_entries')
        .select('assignment_date, created_at')
        .eq('user_id', userId)
        .order('assignment_date', { ascending: false });

      if (error) throw error;

      if (!reflections || reflections.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate streak
      const currentStreak = calculateStreak(reflections.map(r => r.assignment_date));
      const longestStreak = calculateLongestStreak(reflections.map(r => r.assignment_date));

      // Get this week's reflections
      const weekStart = getWeekStart();
      const weeklyReflections = reflections.filter(r =>
        new Date(r.assignment_date) >= weekStart
      );

      setStreakData({
        currentStreak,
        longestStreak,
        totalReflections: reflections.length,
        lastReflectionDate: reflections[0]?.assignment_date || null,
        weeklyGoal: 3, // Could come from user preferences
        weeklyProgress: weeklyReflections.length,
      });
    } catch (error) {
      console.error('Error loading streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;

    const uniqueDates = [...new Set(dates)].sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      const reflectionDate = new Date(uniqueDates[i]);
      reflectionDate.setHours(0, 0, 0, 0);

      if (reflectionDate.getTime() === checkDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateLongestStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;

    const uniqueDates = [...new Set(dates)].sort((a, b) =>
      new Date(a).getTime() - new Date(b).getTime()
    );

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);

      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  };

  const getWeekStart = (): Date => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  const getStreakMessage = (): string => {
    if (streakData.currentStreak === 0) {
      return "Start your streak today!";
    } else if (streakData.currentStreak === 1) {
      return "Great start! Keep it going!";
    } else if (streakData.currentStreak < 7) {
      return `${streakData.currentStreak} days strong!`;
    } else if (streakData.currentStreak < 30) {
      return `🔥 ${streakData.currentStreak} day streak!`;
    } else {
      return `🔥🔥 ${streakData.currentStreak} days! Unstoppable!`;
    }
  };

  const weeklyPercentage = (streakData.weeklyProgress / streakData.weeklyGoal) * 100;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border-2 border-brand-gray-200 p-6 animate-pulse">
        <div className="h-24 bg-brand-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-brand-energy-light via-white to-brand-electric-light rounded-xl shadow-md border-2 border-brand-energy p-6">
      {/* Current Streak */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            streakData.currentStreak > 0 ? 'bg-brand-energy' : 'bg-brand-gray-200'
          }`}>
            <Flame className={`w-6 h-6 ${
              streakData.currentStreak > 0 ? 'text-white' : 'text-brand-gray-400'
            }`} />
          </div>
          <div>
            <p className="text-3xl font-bold text-brand-primary font-mono">
              {streakData.currentStreak}
            </p>
            <p className="text-xs text-brand-gray-600 font-body">Day Streak</p>
          </div>
        </div>

        {/* Best Streak */}
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end mb-1">
            <TrendingUp className="w-4 h-4 text-brand-electric" />
            <span className="text-xl font-bold text-brand-electric font-mono">
              {streakData.longestStreak}
            </span>
          </div>
          <p className="text-xs text-brand-gray-600 font-body">Best Streak</p>
        </div>
      </div>

      {/* Streak Message */}
      <p className="text-sm font-semibold text-brand-primary mb-4 font-body">
        {getStreakMessage()}
      </p>

      {/* Weekly Goal Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-gray-600" />
            <span className="text-sm font-semibold text-brand-gray-700 font-body">
              Weekly Goal
            </span>
          </div>
          <span className="text-sm font-bold text-brand-primary font-mono">
            {streakData.weeklyProgress}/{streakData.weeklyGoal}
          </span>
        </div>
        <div className="w-full bg-brand-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-brand-energy to-brand-electric rounded-full h-3 transition-all duration-500"
            style={{ width: `${Math.min(weeklyPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Total Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-brand-gray-200">
        <span className="text-xs text-brand-gray-600 font-body">Total Reflections</span>
        <span className="text-sm font-bold text-brand-primary font-mono">
          {streakData.totalReflections}
        </span>
      </div>
    </div>
  );
}
