'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext.next';
import { createClient } from '@/lib/supabase/client';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Building2,
  FileText,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import type {
  AssignmentFormData,
  AssignmentType,
  Platform,
  CognitiveLoad,
} from '@/types/assignment';
import {
  ASSIGNMENT_TYPES,
  PLATFORMS,
  COGNITIVE_LOADS,
  KEY_CONSIDERATIONS,
  DEFAULT_PREP_CHECKLIST,
} from '@/types/assignment';

export default function NewAssignmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AssignmentFormData>({
    assignment_name: '',
    assignment_type: 'conference',
    assignment_date: '',
    start_time: '',
    end_time: '',
    setup_time: '',
    timezone: 'America/New_York',
    is_remote: true,
    platform: 'zoom',
    meeting_link: '',
    meeting_id: '',
    meeting_passcode: '',
    physical_location: '',
    client_organization: '',
    coordinator_name: '',
    coordinator_email: '',
    coordinator_phone: '',
    client_background: '',
    client_website: '',
    deaf_participants: '',
    hearing_participants: '',
    languages: ['ASL', 'English'],
    participant_notes: '',
    is_team_assignment: false,
    team_interpreter_name: '',
    team_interpreter_email: '',
    team_interpreter_phone: '',
    turn_rotation_minutes: 20,
    subject_topic: '',
    expected_cognitive_load: 'moderate',
    key_considerations: [],
    prep_notes: '',
    cognitive_load_factors: '',
    support_strategies: '',
    is_template: false,
    template_name: '',
  });

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    client: false,
    participants: false,
    team: false,
    context: false,
    checklist: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('assistant.draft')
      if (raw) {
        const d = JSON.parse(raw)
        setFormData(prev=> ({
          ...prev,
          assignment_name: d.assignment_name || prev.assignment_name,
          assignment_date: d.assignment_date || prev.assignment_date,
          start_time: d.start_time || prev.start_time,
          end_time: d.end_time || prev.end_time,
          assignment_type: d.assignment_type || prev.assignment_type,
          is_team_assignment: !!d.is_team_assignment,
          team_interpreter_email: d.team_interpreter_email || prev.team_interpreter_email,
          turn_rotation_minutes: d.turn_rotation_minutes || prev.turn_rotation_minutes,
          subject_topic: d.subject_topic || prev.subject_topic,
          expected_cognitive_load: d.expected_cognitive_load || prev.expected_cognitive_load,
          key_considerations: d.key_considerations?.length ? d.key_considerations : prev.key_considerations,
          prep_notes: d.vocab_terms?.length ? `Vocab: ${d.vocab_terms.join(', ')}` : prev.prep_notes,
          coordinator_email: d.agency_contact_email || prev.coordinator_email,
        }))
        localStorage.removeItem('assistant.draft')
      }
    } catch {}
  }, [])

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantStep, setAssistantStep] = useState(1);
  const [assistantData, setAssistantData] = useState<any>({
    assignment_name: '',
    assignment_date: '',
    start_time: '',
    end_time: '',
    assignment_type: 'conference',
    is_team_assignment: false,
    team_interpreter_email: '',
    turn_rotation_minutes: 20,
    subject_topic: '',
    expected_cognitive_load: 'moderate',
    key_considerations: [] as string[],
    vocab_terms: [] as string[],
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user) throw new Error('Not authenticated');

      const supabase = createClient();

      // Check subscription tier and assignment limit
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('subscription_tier, assignments_used_this_month')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const isFree = !profile || profile.subscription_tier === 'free';
      const assignmentsUsed = profile?.assignments_used_this_month || 0;

      // Enforce Free tier limit (5 assignments/month)
      if (isFree && assignmentsUsed >= 5) {
        setError('You\'ve reached the Free tier limit of 5 assignments per month. Upgrade to Pro for unlimited assignments!');
        router.push('/pricing');
        return;
      }

      // Prepare assignment data
      const assignmentData = {
        creator_id: user.id,
        primary_interpreter_id: user.id,
        assignment_name: formData.assignment_name,
        assignment_type: formData.assignment_type,
        assignment_date: formData.assignment_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        setup_time: formData.setup_time || null,
        timezone: formData.timezone,
        is_remote: formData.is_remote,
        platform: formData.platform || null,
        meeting_link: formData.meeting_link || null,
        meeting_id: formData.meeting_id || null,
        meeting_passcode: formData.meeting_passcode || null,
        physical_location: formData.physical_location || null,
        client_organization: formData.client_organization || null,
        coordinator_name: formData.coordinator_name || null,
        coordinator_email: formData.coordinator_email || null,
        coordinator_phone: formData.coordinator_phone || null,
        client_background: formData.client_background || null,
        client_website: formData.client_website || null,
        deaf_participants: formData.deaf_participants || null,
        hearing_participants: formData.hearing_participants || null,
        languages: formData.languages,
        participant_notes: formData.participant_notes || null,
        is_team_assignment: formData.is_team_assignment,
        team_interpreter_name: formData.team_interpreter_name || null,
        team_interpreter_email: formData.team_interpreter_email || null,
        team_interpreter_phone: formData.team_interpreter_phone || null,
        turn_rotation_minutes: formData.turn_rotation_minutes || null,
        subject_topic: formData.subject_topic || null,
        expected_cognitive_load: formData.expected_cognitive_load || null,
        key_considerations: formData.key_considerations,
        prep_notes: formData.prep_notes || null,
        cognitive_load_factors: formData.cognitive_load_factors || null,
        support_strategies: formData.support_strategies || null,
        prep_checklist: DEFAULT_PREP_CHECKLIST,
        is_template: formData.is_template,
        template_name: formData.template_name || null,
        status: 'upcoming',
      };

      const { data, error: insertError } = await supabase
        .from('assignments')
        .insert([assignmentData])
        .select()
        .single();

      if (insertError) throw insertError;

      // Increment assignment counter for Free tier users
      if (isFree) {
        await supabase
          .from('user_profiles')
          .update({ assignments_used_this_month: assignmentsUsed + 1 })
          .eq('id', user.id);
      }

      // Auto-share to team if requested via assistant
      try {
        const autoShareRaw = localStorage.getItem('assistant.auto_share')
        const doShare = autoShareRaw ? JSON.parse(autoShareRaw) : false
        if (doShare && formData.is_team_assignment && formData.team_interpreter_email) {
          const shareToken = crypto.randomUUID()
          await supabase
            .from('assignment_shares')
            .insert({
              assignment_id: data.id,
              shared_by: user.id,
              shared_with_email: formData.team_interpreter_email,
              access_level: 'edit',
              share_token: shareToken,
              is_active: true,
            })
          await supabase
            .from('assignments')
            .update({ shared_with_emails: [formData.team_interpreter_email] })
            .eq('id', data.id)
        }
      } catch {}

      // Clear assistant temp storage
      try {
        localStorage.removeItem('assistant.auto_share')
        localStorage.removeItem('assistant.vocab_terms')
      } catch {}

      // Redirect to assignment detail page
      router.push(`/dashboard/assignments/${data.id}`);
    } catch (err: any) {
      console.error('Error creating assignment:', err);
      setError(err.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      key_considerations: prev.key_considerations.includes(value)
        ? prev.key_considerations.filter(v => v !== value)
        : [...prev.key_considerations, value],
    }));
  };

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-brand-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-primary font-sans">
                New Assignment
              </h1>
              <p className="text-brand-gray-600 mt-1 font-body">
                Organize prep, coordinate with team, optimize performance
              </p>
            </div>
            <div className="flex gap-3">
              <a href="/dashboard/assignments/new/assistant" className="px-3 py-2 bg-brand-electric text-white rounded-data font-semibold">Use Assistant</a>
              <button
                onClick={() => router.back()}
                className="text-brand-gray-600 hover:text-brand-primary font-body"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-data p-4 mb-6">
            <p className="text-red-700 font-body">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFORMATION */}
          <CollapsibleSection
            title="Basic Information"
            icon={<FileText className="w-5 h-5" />}
            expanded={expandedSections.basic}
            onToggle={() => toggleSection('basic')}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                  Assignment Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.assignment_name}
                  onChange={e => setFormData({ ...formData, assignment_name: e.target.value })}
                  placeholder="e.g., Client Project Kickoff"
                  className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.assignment_date}
                    onChange={e => setFormData({ ...formData, assignment_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                    Assignment Type *
                  </label>
                  <select
                    required
                    value={formData.assignment_type}
                    onChange={e => setFormData({ ...formData, assignment_type: e.target.value as AssignmentType })}
                    className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                  >
                    {ASSIGNMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                    Setup Time
                  </label>
                  <input
                    type="time"
                    value={formData.setup_time}
                    onChange={e => setFormData({ ...formData, setup_time: e.target.value })}
                    placeholder="15 min before"
                    className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                  Location/Platform
                </label>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_remote: true })}
                    className={`flex-1 py-3 rounded-data font-semibold font-body transition-all ${
                      formData.is_remote
                        ? 'bg-brand-electric text-white'
                        : 'bg-white text-brand-gray-600 border-2 border-brand-gray-200'
                    }`}
                  >
                    Remote
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_remote: false })}
                    className={`flex-1 py-3 rounded-data font-semibold font-body transition-all ${
                      !formData.is_remote
                        ? 'bg-brand-electric text-white'
                        : 'bg-white text-brand-gray-600 border-2 border-brand-gray-200'
                    }`}
                  >
                    In-Person
                  </button>
                </div>

                {formData.is_remote ? (
                  <div className="space-y-4">
                    <select
                      value={formData.platform}
                      onChange={e => setFormData({ ...formData, platform: e.target.value as Platform })}
                      className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                    >
                      {PLATFORMS.filter(p => p.value !== 'in_person').map(platform => (
                        <option key={platform.value} value={platform.value}>
                          {platform.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="url"
                      value={formData.meeting_link}
                      onChange={e => setFormData({ ...formData, meeting_link: e.target.value })}
                      placeholder="Meeting link (e.g., Zoom URL)"
                      className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={formData.meeting_id}
                        onChange={e => setFormData({ ...formData, meeting_id: e.target.value })}
                        placeholder="Meeting ID"
                        className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                      />
                      <input
                        type="text"
                        value={formData.meeting_passcode}
                        onChange={e => setFormData({ ...formData, meeting_passcode: e.target.value })}
                        placeholder="Passcode"
                        className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                      />
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.physical_location}
                    onChange={e => setFormData({ ...formData, physical_location: e.target.value })}
                    placeholder="Physical address"
                    className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                  />
                )}
              </div>
            </div>
          </CollapsibleSection>

          {/* CLIENT & ORGANIZATION */}
          <CollapsibleSection
            title="Client & Organization"
            icon={<Building2 className="w-5 h-5" />}
            expanded={expandedSections.client}
            onToggle={() => toggleSection('client')}
          >
            <div className="space-y-4">
              <input
                type="text"
                value={formData.client_organization}
                onChange={e => setFormData({ ...formData, client_organization: e.target.value })}
                placeholder="Organization/Client name"
                className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.coordinator_name}
                  onChange={e => setFormData({ ...formData, coordinator_name: e.target.value })}
                  placeholder="Coordinator name"
                  className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                />
                <input
                  type="email"
                  value={formData.coordinator_email}
                  onChange={e => setFormData({ ...formData, coordinator_email: e.target.value })}
                  placeholder="Coordinator email"
                  className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                />
              </div>

              <input
                type="tel"
                value={formData.coordinator_phone}
                onChange={e => setFormData({ ...formData, coordinator_phone: e.target.value })}
                placeholder="Coordinator phone"
                className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
              />

              <textarea
                value={formData.client_background}
                onChange={e => setFormData({ ...formData, client_background: e.target.value })}
                placeholder="Organization background or notes"
                rows={3}
                className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body resize-none"
              />
            </div>
          </CollapsibleSection>

          {/* PARTICIPANTS */}
          <CollapsibleSection
            title="Participants"
            icon={<Users className="w-5 h-5" />}
            expanded={expandedSections.participants}
            onToggle={() => toggleSection('participants')}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                  Deaf Participants
                </label>
                <textarea
                  value={formData.deaf_participants}
                  onChange={e => setFormData({ ...formData, deaf_participants: e.target.value })}
                  placeholder="e.g., Names and roles (IT Department)"
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                  Hearing Participants
                </label>
                <textarea
                  value={formData.hearing_participants}
                  onChange={e => setFormData({ ...formData, hearing_participants: e.target.value })}
                  placeholder="e.g., Names and roles (Development Team)"
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body resize-none"
                />
              </div>

              <textarea
                value={formData.participant_notes}
                onChange={e => setFormData({ ...formData, participant_notes: e.target.value })}
                placeholder="Notes about participants (accents, preferences, roles)"
                rows={2}
                className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body resize-none"
              />
            </div>
          </CollapsibleSection>

          {/* TEAM INTERPRETING */}
          <CollapsibleSection
            title="Team Interpreting"
            icon={<Users className="w-5 h-5" />}
            expanded={expandedSections.team}
            onToggle={() => toggleSection('team')}
          >
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_team_assignment: false })}
                  className={`flex-1 py-3 rounded-data font-semibold font-body transition-all ${
                    !formData.is_team_assignment
                      ? 'bg-brand-electric text-white'
                      : 'bg-white text-brand-gray-600 border-2 border-brand-gray-200'
                  }`}
                >
                  Solo
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_team_assignment: true })}
                  className={`flex-1 py-3 rounded-data font-semibold font-body transition-all ${
                    formData.is_team_assignment
                      ? 'bg-brand-electric text-white'
                      : 'bg-white text-brand-gray-600 border-2 border-brand-gray-200'
                  }`}
                >
                  Team
                </button>
              </div>

              {formData.is_team_assignment && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.team_interpreter_name}
                    onChange={e => setFormData({ ...formData, team_interpreter_name: e.target.value })}
                    placeholder="Team interpreter name"
                    className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="email"
                      value={formData.team_interpreter_email}
                      onChange={e => setFormData({ ...formData, team_interpreter_email: e.target.value })}
                      placeholder="Team interpreter email"
                      className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                    />
                    <input
                      type="tel"
                      value={formData.team_interpreter_phone}
                      onChange={e => setFormData({ ...formData, team_interpreter_phone: e.target.value })}
                      placeholder="Phone"
                      className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                      Turn Rotation (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.turn_rotation_minutes}
                      onChange={e => setFormData({ ...formData, turn_rotation_minutes: parseInt(e.target.value) })}
                      min="5"
                      max="60"
                      className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                    />
                    {formData.team_interpreter_email && (()=>{
                      try { const mem = localStorage.getItem(`team.pref.${formData.team_interpreter_email}`)
                        if (mem) {
                          return <button type="button" onClick={()=>{ const parsed = JSON.parse(mem); setFormData(prev=> ({...prev, turn_rotation_minutes: parsed.turn_rotation_minutes || prev.turn_rotation_minutes})) }} className="mt-2 px-3 py-2 bg-brand-gray-100 rounded-data text-brand-primary">Use saved preferences</button>
                        }
                      } catch {}
                      return null
                    })()}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* CONTEXT & PREP */}
          <CollapsibleSection
            title="Assignment Context & Prep"
            icon={<FileText className="w-5 h-5" />}
            expanded={expandedSections.context}
            onToggle={() => toggleSection('context')}
          >
            <div className="space-y-4">
              <input
                type="text"
                value={formData.subject_topic}
                onChange={e => setFormData({ ...formData, subject_topic: e.target.value })}
                placeholder="Subject/Topic"
                className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
              />

              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                  Expected Cognitive Load
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COGNITIVE_LOADS.map(load => (
                    <button
                      key={load.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, expected_cognitive_load: load.value })}
                      className={`py-3 rounded-data font-semibold font-body transition-all ${
                        formData.expected_cognitive_load === load.value
                          ? 'bg-brand-electric text-white'
                          : 'bg-white text-brand-gray-600 border-2 border-brand-gray-200'
                      }`}
                    >
                      {load.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-3 font-body">
                  Key Considerations
                </label>
                <div className="space-y-2">
                  {KEY_CONSIDERATIONS.map(consideration => (
                    <label key={consideration.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.key_considerations.includes(consideration.value)}
                        onChange={() => handleCheckboxToggle(consideration.value)}
                        className="w-5 h-5 text-brand-electric border-brand-gray-300 rounded focus:ring-brand-electric"
                      />
                      <span className="font-body text-brand-gray-700">{consideration.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                  Prep Notes
                </label>
                <textarea
                  value={formData.prep_notes}
                  onChange={e => setFormData({ ...formData, prep_notes: e.target.value })}
                  placeholder="Free-form notes about this assignment..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body resize-none"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-brand-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 bg-white text-brand-gray-700 border-2 border-brand-gray-200 rounded-data font-semibold hover:bg-brand-gray-50 transition-all font-body"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-brand-primary to-brand-slate text-white rounded-data font-semibold hover:shadow-glow transition-all disabled:opacity-50 font-body"
            >
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-data shadow-card border border-brand-gray-200">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-brand-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-brand-electric">{icon}</div>
          <h2 className="text-xl font-bold text-brand-primary font-sans">{title}</h2>
        </div>
        {expanded ? (
          <ChevronUp className="w-6 h-6 text-brand-gray-400" />
        ) : (
          <ChevronDown className="w-6 h-6 text-brand-gray-400" />
        )}
      </button>
      {expanded && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}
