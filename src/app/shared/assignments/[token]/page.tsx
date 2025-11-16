'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building2,
  CheckSquare,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import type { AssignmentWithRelations } from '@/types/assignment';

export default function SharedAssignmentPage() {
  const { token } = useParams();
  const [assignment, setAssignment] = useState<AssignmentWithRelations | null>(null);
  const [shareInfo, setShareInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSharedAssignment();
    }
  }, [token]);

  const loadSharedAssignment = async () => {
    try {
      const supabase = createClient();

      // Get share record and assignment
      const { data: share, error: shareError } = await supabase
        .from('assignment_shares')
        .select(`
          *,
          assignments (*)
        `)
        .eq('share_token', token)
        .eq('is_active', true)
        .single();

      if (shareError) throw shareError;
      if (!share) throw new Error('Share link not found or expired');

      // Check expiration
      if (share.expires_at && new Date(share.expires_at) < new Date()) {
        throw new Error('Share link has expired');
      }

      // Update access tracking
      await supabase
        .from('assignment_shares')
        .update({
          viewed_at: share.viewed_at || new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
          access_count: (share.access_count || 0) + 1,
        })
        .eq('id', share.id);

      setShareInfo(share);
      setAssignment(share.assignments as any);
    } catch (err: any) {
      console.error('Error loading shared assignment:', err);
      setError(err.message || 'Failed to load shared assignment');
    } finally {
      setLoading(false);
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
          <p className="text-brand-gray-600 font-body">Loading shared assignment...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <p className="text-red-600 font-body mb-4 text-lg">{error || 'Assignment not found'}</p>
          <p className="text-brand-gray-600 font-body mb-6">
            This share link may have expired or been revoked. Contact the person who shared this with you.
          </p>
          <Link
            href="/"
            className="text-brand-electric hover:underline font-body"
          >
            ← Go to InterpretReflect Home
          </Link>
        </div>
      </div>
    );
  }

  const checklistCompleted = assignment.prep_checklist?.filter(item => item.completed).length || 0;
  const checklistTotal = assignment.prep_checklist?.length || 0;

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-primary to-brand-slate text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-brand-electric" />
              <span className="text-lg font-bold font-sans">InterpretReflect</span>
            </div>
            <span className="text-sm font-body opacity-90">
              Shared by {shareInfo?.shared_by || 'Team Member'}
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2 font-sans">
              {assignment.assignment_name}
            </h1>
            <div className="flex items-center gap-4 text-white/90 font-body">
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
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(assignment.assignment_type)} bg-white`}>
                {assignment.assignment_type.charAt(0).toUpperCase() + assignment.assignment_type.slice(1)}
              </span>
              {assignment.is_team_assignment && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-energy text-white text-xs font-semibold">
                  <Users className="w-3 h-3" />
                  Team Assignment
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Personal Message */}
        {shareInfo?.personal_message && (
          <div className="bg-brand-electric-light border-l-4 border-brand-electric rounded-data p-6 mb-8">
            <h3 className="text-sm font-semibold text-brand-electric mb-2 font-body">
              Message from your team partner:
            </h3>
            <p className="text-brand-gray-800 font-body whitespace-pre-wrap">
              {shareInfo.personal_message}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            {assignment.meeting_link && (
              <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
                <h2 className="text-lg font-bold text-brand-primary mb-4 font-sans">
                  Quick Access
                </h2>
                <a
                  href={assignment.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-brand-electric-light text-brand-electric rounded-data hover:bg-brand-electric hover:text-white transition-all group"
                >
                  <span className="font-semibold font-body">Join Meeting</span>
                  <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                {assignment.meeting_id && (
                  <div className="mt-4 p-4 bg-brand-gray-50 rounded-data">
                    <p className="text-sm font-semibold text-brand-gray-700 mb-1 font-body">
                      Meeting Access
                    </p>
                    <p className="text-sm text-brand-gray-600 font-mono">
                      ID: {assignment.meeting_id}
                      {assignment.meeting_passcode && ` • Passcode: ${assignment.meeting_passcode}`}
                    </p>
                  </div>
                )}
              </div>
            )}

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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prep Checklist */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <h2 className="text-lg font-bold text-brand-primary mb-4 font-sans flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Prep Checklist ({checklistCompleted}/{checklistTotal})
              </h2>

              <div className="space-y-3">
                {assignment.prep_checklist?.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center ${
                      item.completed ? 'bg-brand-electric border-brand-electric' : 'border-brand-gray-300'
                    }`}>
                      {item.completed && (
                        <CheckSquare className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className={`font-body text-sm ${item.completed ? 'text-brand-gray-400 line-through' : 'text-brand-gray-700'}`}>
                      {item.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA to Sign Up */}
            <div className="bg-gradient-to-br from-brand-info-light to-brand-electric-light rounded-data p-6 border-2 border-brand-electric">
              <h2 className="text-lg font-bold text-brand-primary mb-3 font-sans">
                Want to track your own assignments?
              </h2>
              <p className="text-sm text-brand-gray-600 font-body mb-4">
                InterpretReflect helps you optimize performance with AI coaching, track cognitive load, and earn RID-approved CEUs.
              </p>
              <Link
                href="/auth/signup"
                className="block w-full py-3 bg-gradient-to-r from-brand-primary to-brand-slate text-white rounded-data font-semibold hover:shadow-glow transition-all text-center font-body"
              >
                Start Free Trial
              </Link>
              <Link
                href="/"
                className="block text-center text-sm text-brand-electric hover:underline mt-3 font-body"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
