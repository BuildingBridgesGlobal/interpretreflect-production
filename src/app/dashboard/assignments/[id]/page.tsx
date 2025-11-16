'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext.next';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  CheckSquare,
  Share2,
  Edit,
  Trash2,
  ExternalLink,
  ChevronLeft,
  Brain,
} from 'lucide-react';
import type { AssignmentWithRelations } from '@/types/assignment';
import { ShareAssignmentModal } from '@/components/assignments/ShareAssignmentModal';

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<AssignmentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadAssignment();
    }
  }, [id, user]);

  const loadAssignment = async () => {
    try {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Assignment not found');

      setAssignment(data as AssignmentWithRelations);
    } catch (err: any) {
      console.error('Error loading assignment:', err);
      setError(err.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!assignment || !user) return;
    try {
      setCopying(true);
      const supabase = createClient();
      const shareToken = crypto.randomUUID();
      const { error } = await supabase
        .from('assignment_shares')
        .insert({
          assignment_id: assignment.id,
          shared_by: user.id,
          shared_with_email: assignment.team_interpreter_email || null,
          access_level: 'edit',
          share_token: shareToken,
          is_active: true,
        });
      if (error) throw error;
      const url = `${window.location.origin}/shared/assignments/${shareToken}`;
      await navigator.clipboard.writeText(url);
      alert('Invite link copied to clipboard');
    } catch (e:any) {
      alert(e?.message || 'Failed to create invite link');
    } finally {
      setCopying(false);
    }
  };

  const handleChecklistToggle = async (index: number) => {
    if (!assignment) return;

    try {
      const supabase = createClient();
      const updatedChecklist = [...(assignment.prep_checklist || [])];
      updatedChecklist[index] = {
        ...updatedChecklist[index],
        completed: !updatedChecklist[index].completed,
        completed_at: !updatedChecklist[index].completed ? new Date().toISOString() : undefined,
      };

      const { error: updateError } = await supabase
        .from('assignments')
        .update({ prep_checklist: updatedChecklist })
        .eq('id', assignment.id);

      if (updateError) throw updateError;

      setAssignment({ ...assignment, prep_checklist: updatedChecklist });
    } catch (err: any) {
      console.error('Error updating checklist:', err);
    }
  };

  const handleDelete = async () => {
    if (!assignment) return;
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('assignments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', assignment.id);

      if (deleteError) throw deleteError;

      router.push('/dashboard/assignments');
    } catch (err: any) {
      console.error('Error deleting assignment:', err);
      alert('Failed to delete assignment');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-electric border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-gray-600 font-body">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-body mb-4">{error || 'Assignment not found'}</p>
          <Link
            href="/dashboard/assignments"
            className="text-brand-electric hover:underline font-body"
          >
            ← Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  const checklistCompleted = assignment.prep_checklist?.filter(item => item.completed).length || 0;
  const checklistTotal = assignment.prep_checklist?.length || 0;
  const checklistPercentage = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-brand-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/dashboard/assignments"
            className="flex items-center gap-2 text-brand-gray-600 hover:text-brand-primary mb-4 font-body"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Assignments
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-brand-primary mb-2 font-sans">
                {assignment.assignment_name}
              </h1>
              <div className="flex items-center gap-4 text-brand-gray-600 font-body">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(assignment.assignment_date)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatTime(assignment.start_time)} - {formatTime(assignment.end_time)}
                </span>
                {assignment.platform && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {assignment.platform.charAt(0).toUpperCase() + assignment.platform.slice(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(assignment.assignment_type)}`}>
                  {assignment.assignment_type.charAt(0).toUpperCase() + assignment.assignment_type.slice(1)}
                </span>
                {assignment.is_team_assignment && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-energy-light text-brand-energy text-xs font-semibold">
                    <Users className="w-3 h-3" />
                    Team
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/dashboard/assignments/${assignment.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-brand-gray-200 text-brand-gray-700 rounded-data font-semibold hover:bg-brand-gray-50 transition-all font-body"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-electric text-white rounded-data font-semibold hover:bg-brand-electric-hover transition-all font-body"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-white border-2 border-red-200 text-red-600 rounded-data hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <h2 className="text-lg font-bold text-brand-primary mb-4 font-sans">
                Quick Actions
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {assignment.meeting_link && (
                  <a
                    href={assignment.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-4 bg-brand-electric-light text-brand-electric rounded-data hover:bg-brand-electric hover:text-white transition-all"
                  >
                    <ExternalLink className="w-6 h-6" />
                    <span className="text-sm font-semibold font-body">Join Meeting</span>
                  </a>
                )}
                <button className="flex flex-col items-center gap-2 p-4 bg-brand-energy-light text-brand-energy rounded-data hover:bg-brand-energy hover:text-white transition-all">
                  <Clock className="w-6 h-6" />
                  <span className="text-sm font-semibold font-body">Start Assignment</span>
                </button>
                <Link
                  href={`/dashboard/quick-reflect?assignment_id=${assignment.id}&perf=&load=&notes=`}
                  className="flex flex-col items-center gap-2 p-4 bg-green-100 text-green-700 rounded-data hover:bg-green-600 hover:text-white transition-all"
                >
                  <CheckSquare className="w-6 h-6" />
                  <span className="text-sm font-semibold font-body">Complete Reflect</span>
                </Link>
              </div>
              {assignment.is_team_assignment && (
                <div className="mt-4">
                  <button onClick={handleCopyInvite} disabled={copying} className="px-4 py-2 bg-brand-gray-100 text-brand-primary rounded-data border-2 border-brand-gray-200 hover:bg-brand-gray-200">
                    {copying ? 'Creating…' : 'Copy Invite Link'}
                  </button>
                </div>
              )}
            </div>

            {/* Assignment Details */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <h2 className="text-lg font-bold text-brand-primary mb-4 font-sans">
                Assignment Details
              </h2>
              <div className="space-y-4">
                {assignment.client_organization && (
                  <div>
                    <h3 className="text-sm font-semibold text-brand-gray-600 mb-1 font-body">Client</h3>
                    <p className="text-brand-gray-800 font-body">{assignment.client_organization}</p>
                  </div>
                )}

                {assignment.coordinator_name && (
                  <div>
                    <h3 className="text-sm font-semibold text-brand-gray-600 mb-1 font-body">Coordinator</h3>
                    <p className="text-brand-gray-800 font-body">{assignment.coordinator_name}</p>
                    {assignment.coordinator_email && (
                      <a href={`mailto:${assignment.coordinator_email}`} className="text-sm text-brand-electric hover:underline font-body">
                        {assignment.coordinator_email}
                      </a>
                    )}
                    {assignment.coordinator_phone && (
                      <p className="text-sm text-brand-gray-600 font-body">{assignment.coordinator_phone}</p>
                    )}
                  </div>
                )}

                {assignment.meeting_id && (
                  <div>
                    <h3 className="text-sm font-semibold text-brand-gray-600 mb-1 font-body">Meeting Access</h3>
                    <p className="text-brand-gray-800 font-mono text-sm">
                      ID: {assignment.meeting_id}
                      {assignment.meeting_passcode && ` • Passcode: ${assignment.meeting_passcode}`}
                    </p>
                  </div>
                )}

                {(assignment.deaf_participants || assignment.hearing_participants) && (
                  <div>
                    <h3 className="text-sm font-semibold text-brand-gray-600 mb-1 font-body">Participants</h3>
                    {assignment.deaf_participants && (
                      <p className="text-sm text-brand-gray-800 font-body mb-1">
                        <strong>Deaf:</strong> {assignment.deaf_participants}
                      </p>
                    )}
                    {assignment.hearing_participants && (
                      <p className="text-sm text-brand-gray-800 font-body">
                        <strong>Hearing:</strong> {assignment.hearing_participants}
                      </p>
                    )}
                  </div>
                )}

                {assignment.subject_topic && (
                  <div>
                    <h3 className="text-sm font-semibold text-brand-gray-600 mb-1 font-body">Subject/Topic</h3>
                    <p className="text-brand-gray-800 font-body">{assignment.subject_topic}</p>
                  </div>
                )}

                {assignment.prep_notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-brand-gray-600 mb-1 font-body">Prep Notes</h3>
                    <p className="text-brand-gray-800 font-body whitespace-pre-wrap">{assignment.prep_notes}</p>
                  </div>
                )}

                {assignment.key_considerations && assignment.key_considerations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-brand-gray-600 mb-2 font-body">Key Considerations</h3>
                    <div className="flex flex-wrap gap-2">
                      {assignment.key_considerations.map(consideration => (
                        <span
                          key={consideration}
                          className="px-3 py-1 bg-brand-gray-100 text-brand-gray-700 rounded-full text-xs font-semibold font-body"
                        >
                          {consideration.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Team Interpreter */}
            {assignment.is_team_assignment && assignment.team_interpreter_name && (
              <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
                <h2 className="text-lg font-bold text-brand-primary mb-4 font-sans flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Interpreter
                </h2>
                <div className="space-y-2">
                  <p className="text-brand-gray-800 font-semibold font-body">{assignment.team_interpreter_name}</p>
                  {assignment.team_interpreter_email && (
                    <a href={`mailto:${assignment.team_interpreter_email}`} className="text-sm text-brand-electric hover:underline block font-body">
                      {assignment.team_interpreter_email}
                    </a>
                  )}
                  {assignment.team_interpreter_phone && (
                    <p className="text-sm text-brand-gray-600 font-body">{assignment.team_interpreter_phone}</p>
                  )}
                  {assignment.turn_rotation_minutes && (
                    <p className="text-sm text-brand-gray-600 font-body mt-3">
                      Turn rotation: Every {assignment.turn_rotation_minutes} minutes
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prep Checklist */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <h2 className="text-lg font-bold text-brand-primary mb-4 font-sans flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Prep Checklist ({checklistCompleted}/{checklistTotal})
              </h2>

              <div className="mb-4">
                <div className="w-full bg-brand-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-brand-energy to-brand-electric rounded-full h-3 transition-all duration-500"
                    style={{ width: `${checklistPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center font-bold text-brand-primary font-mono">
                  {checklistPercentage}% Complete
                </p>
              </div>

              <div className="space-y-3">
                {assignment.prep_checklist?.map((item, index) => (
                  <label key={index} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleChecklistToggle(index)}
                      className="w-5 h-5 mt-0.5 text-brand-electric border-brand-gray-300 rounded focus:ring-brand-electric"
                    />
                    <span className={`font-body text-sm ${item.completed ? 'text-brand-gray-400 line-through' : 'text-brand-gray-700 group-hover:text-brand-primary'}`}>
                      {item.task}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Catalyst AI Recommendations */}
            <div className="bg-gradient-to-br from-brand-info-light to-brand-electric-light rounded-data p-6 border-2 border-brand-electric">
              <h2 className="text-lg font-bold text-brand-primary mb-4 font-sans flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Catalyst AI Recommendations
              </h2>
              <p className="text-sm text-brand-gray-600 font-body mb-4">
                AI-powered prep recommendations based on your performance data will appear here.
              </p>
              <button className="w-full py-2 bg-brand-electric text-white rounded-data font-semibold hover:bg-brand-electric-hover transition-all font-body text-sm">
                Generate Recommendations
              </button>
            </div>

            {/* Post-Assignment */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <h2 className="text-lg font-bold text-brand-primary mb-4 font-sans">
                Post-Assignment
              </h2>
              {assignment.quick_reflect_id ? (
                <div className="text-center py-4">
                  <CheckSquare className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-sm text-green-700 font-semibold font-body mb-3">
                    Quick Reflect Completed
                  </p>
                  <Link
                    href={`/dashboard/quick-reflect/${assignment.quick_reflect_id}`}
                    className="text-sm text-brand-electric hover:underline font-body"
                  >
                    View Reflection →
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-brand-gray-600 font-body mb-4">
                    After your assignment, complete a Quick Reflect to track performance and growth insights.
                  </p>
                  <Link
                    href={`/dashboard/quick-reflect?assignment_id=${assignment.id}`}
                    className="block w-full py-2 bg-gradient-to-r from-brand-primary to-brand-slate text-white rounded-data font-semibold hover:shadow-glow transition-all text-center font-body"
                  >
                    Complete Quick Reflect
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {assignment && (
        <ShareAssignmentModal
          assignmentId={assignment.id}
          assignmentName={assignment.assignment_name}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onSuccess={() => {
            // Optionally reload assignment to show updated shared_with_emails
            loadAssignment();
          }}
        />
      )}
    </div>
  );
}
