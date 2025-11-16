'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.next';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus, Calendar, Clock, Users, MapPin, ChevronRight, TrendingUp } from 'lucide-react';
import type { AssignmentListItem } from '@/types/assignment';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (user) {
      loadAssignments();
    }
  }, [user, filter]);

  const loadAssignments = async () => {
    try {
      const supabase = createClient();

      let query = supabase
        .from('assignments')
        .select(`
          id,
          assignment_name,
          assignment_date,
          start_time,
          end_time,
          assignment_type,
          status,
          is_team_assignment,
          team_interpreter_name,
          platform,
          client_organization,
          expected_cognitive_load,
          prep_checklist,
          quick_reflect_id,
          created_at
        `)
        .eq('primary_interpreter_id', user!.id)
        .is('deleted_at', null)
        .order('assignment_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (filter === 'upcoming') {
        query = query.gte('assignment_date', new Date().toISOString().split('T')[0]);
      } else if (filter === 'past') {
        query = query.lt('assignment_date', new Date().toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to list items
      const listItems: AssignmentListItem[] = (data || []).map(assignment => {
        const checklist = assignment.prep_checklist as any[] || [];
        const completed = checklist.filter(item => item.completed).length;
        const total = checklist.length;
        const prep_checklist_completion = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          ...assignment,
          prep_checklist_completion,
          has_quick_reflect: !!assignment.quick_reflect_id,
        };
      });

      setAssignments(listItems);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      conference: 'bg-brand-info-light text-brand-info',
      medical: 'bg-red-100 text-red-700',
      legal: 'bg-purple-100 text-purple-700',
      educational: 'bg-green-100 text-green-700',
      vrs: 'bg-brand-electric-light text-brand-electric',
      vri: 'bg-brand-electric-light text-brand-electric',
      community: 'bg-yellow-100 text-yellow-700',
      business: 'bg-blue-100 text-blue-700',
      religious: 'bg-indigo-100 text-indigo-700',
      other: 'bg-brand-gray-100 text-brand-gray-600',
    };
    return colors[type] || colors.other;
  };

  const getCognitiveLoadColor = (load?: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-600',
      moderate: 'text-yellow-600',
      high: 'text-orange-600',
      very_high: 'text-red-600',
    };
    return load ? colors[load] : 'text-brand-gray-400';
  };

  const upcomingAssignments = assignments.filter(a =>
    new Date(a.assignment_date) >= new Date(new Date().toDateString())
  );
  const pastAssignments = assignments.filter(a =>
    new Date(a.assignment_date) < new Date(new Date().toDateString())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-electric border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-gray-600 font-body">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-brand-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-primary font-sans">
                Assignments
              </h1>
              <p className="text-brand-gray-600 mt-1 font-body">
                Organize prep, coordinate with team, optimize performance
              </p>
            </div>
            <Link
              href="/dashboard/assignments/new"
              className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-slate text-white px-6 py-3 rounded-data font-semibold hover:shadow-glow transition-all font-body"
            >
              <Plus className="w-5 h-5" />
              New Assignment
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-3 rounded-data font-semibold font-body transition-all ${
              filter === 'upcoming'
                ? 'bg-brand-electric text-white'
                : 'bg-white text-brand-gray-600 hover:bg-brand-gray-50'
            }`}
          >
            Upcoming ({upcomingAssignments.length})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-3 rounded-data font-semibold font-body transition-all ${
              filter === 'past'
                ? 'bg-brand-electric text-white'
                : 'bg-white text-brand-gray-600 hover:bg-brand-gray-50'
            }`}
          >
            Past ({pastAssignments.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-data font-semibold font-body transition-all ${
              filter === 'all'
                ? 'bg-brand-electric text-white'
                : 'bg-white text-brand-gray-600 hover:bg-brand-gray-50'
            }`}
          >
            All ({assignments.length})
          </button>
        </div>

        {/* Empty State */}
        {assignments.length === 0 && (
          <div className="bg-white rounded-data shadow-card p-12 text-center border border-brand-gray-200">
            <Calendar className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-brand-primary mb-2 font-sans">
              {filter === 'upcoming' ? 'No upcoming assignments' : 'No assignments yet'}
            </h3>
            <p className="text-brand-gray-600 mb-6 font-body max-w-md mx-auto">
              Start organizing your assignment prep, coordinating with team interpreters,
              and tracking performance data all in one place.
            </p>
            <Link
              href="/dashboard/assignments/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-slate text-white px-6 py-3 rounded-data font-semibold hover:shadow-glow transition-all font-body"
            >
              <Plus className="w-5 h-5" />
              Create First Assignment
            </Link>
          </div>
        )}

        {/* Assignment List */}
        {filter === 'upcoming' && upcomingAssignments.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-brand-primary font-sans">
              Upcoming Assignments
            </h2>
            {upcomingAssignments.map(assignment => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}

        {filter === 'past' && pastAssignments.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-brand-primary font-sans">
              Past Assignments
            </h2>
            {pastAssignments.map(assignment => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}

        {filter === 'all' && assignments.length > 0 && (
          <div className="space-y-8">
            {upcomingAssignments.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-brand-primary font-sans">
                  Upcoming ({upcomingAssignments.length})
                </h2>
                {upcomingAssignments.map(assignment => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            )}

            {pastAssignments.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-brand-primary font-sans">
                  Past ({pastAssignments.length})
                </h2>
                {pastAssignments.slice(0, 5).map(assignment => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
                {pastAssignments.length > 5 && (
                  <p className="text-sm text-brand-gray-600 text-center font-body">
                    And {pastAssignments.length - 5} more past assignments
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Assignment Analytics */}
        {assignments.length > 0 && (
          <div className="mt-12 bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
            <h3 className="text-lg font-bold text-brand-primary mb-4 font-sans flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Assignment Analytics
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-bold text-brand-electric font-mono">
                  {assignments.length}
                </p>
                <p className="text-sm text-brand-gray-600 font-body">Total Assignments</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-brand-electric font-mono">
                  {Math.round(assignments.reduce((sum, a) => sum + a.prep_checklist_completion, 0) / assignments.length)}%
                </p>
                <p className="text-sm text-brand-gray-600 font-body">Avg Prep Completion</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-brand-electric font-mono">
                  {assignments.filter(a => a.is_team_assignment).length}
                </p>
                <p className="text-sm text-brand-gray-600 font-body">Team Assignments</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AssignmentCard({ assignment }: { assignment: AssignmentListItem }) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      conference: 'bg-brand-info-light text-brand-info',
      medical: 'bg-red-100 text-red-700',
      legal: 'bg-purple-100 text-purple-700',
      educational: 'bg-green-100 text-green-700',
      vrs: 'bg-brand-electric-light text-brand-electric',
      vri: 'bg-brand-electric-light text-brand-electric',
      community: 'bg-yellow-100 text-yellow-700',
      business: 'bg-blue-100 text-blue-700',
      religious: 'bg-indigo-100 text-indigo-700',
      other: 'bg-brand-gray-100 text-brand-gray-600',
    };
    return colors[type] || colors.other;
  };

  return (
    <Link href={`/dashboard/assignments/${assignment.id}`}>
      <div className="bg-white rounded-data shadow-card p-6 hover:shadow-card-hover transition-all border border-brand-gray-200 hover:border-brand-electric group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-brand-primary mb-2 font-sans group-hover:text-brand-electric transition-colors">
              {assignment.assignment_name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-brand-gray-600 font-body">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(assignment.assignment_date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(assignment.start_time)} - {formatTime(assignment.end_time)}
              </span>
              {assignment.platform && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {assignment.platform.charAt(0).toUpperCase() + assignment.platform.slice(1)}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-brand-gray-400 group-hover:text-brand-electric group-hover:translate-x-1 transition-all" />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(assignment.assignment_type)}`}>
            {assignment.assignment_type.charAt(0).toUpperCase() + assignment.assignment_type.slice(1)}
          </span>
          {assignment.is_team_assignment && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-energy-light text-brand-energy text-xs font-semibold">
              <Users className="w-3 h-3" />
              Team
            </span>
          )}
          {assignment.has_quick_reflect && (
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              ✓ Reflected
            </span>
          )}
        </div>

        {/* Prep Checklist Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-brand-gray-700 font-body">
              Prep Progress
            </span>
            <span className="text-sm font-bold text-brand-primary font-mono">
              {assignment.prep_checklist_completion}%
            </span>
          </div>
          <div className="w-full bg-brand-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-brand-energy to-brand-electric rounded-full h-2 transition-all duration-500"
              style={{ width: `${assignment.prep_checklist_completion}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
}
