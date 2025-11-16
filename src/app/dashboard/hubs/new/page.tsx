'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Users, Save } from 'lucide-react'

export default function NewHubPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    assignment_name: '',
    assignment_type: 'community',
    assignment_date: new Date().toISOString().slice(0, 10),
    start_time: '10:00',
    end_time: '11:00',
    platform: 'zoom',
    prep_notes: '',
    key_considerations: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      let resolved = false
      const timeout = setTimeout(() => {
        if (!resolved) setError('Authentication timed out')
      }, 8000)
      const { data: { user } } = await supabase.auth.getUser()
      resolved = true
      clearTimeout(timeout)
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('assignments')
        .insert({
          creator_id: user.id,
          primary_interpreter_id: user.id,
          assignment_name: form.assignment_name,
          assignment_type: form.assignment_type,
          assignment_date: form.assignment_date,
          start_time: form.start_time,
          end_time: form.end_time,
          platform: form.platform,
          is_team_assignment: true,
          prep_notes: form.prep_notes || null,
          key_considerations: form.key_considerations,
        })
        .select('id')
        .single()

      if (error) throw error
      router.push(`/dashboard/hubs/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create hub')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-electric-light rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-brand-electric" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">New Collaboration Hub</h1>
          <p className="text-brand-gray-600">Create a team assignment and shared prep space</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border-2 border-brand-gray-200 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-brand-primary mb-2">Hub Name *</label>
          <input
            required
            value={form.assignment_name}
            onChange={(e) => setForm({ ...form, assignment_name: e.target.value })}
            className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-lg"
            placeholder="AIIC Committee Meeting"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-2">Date *</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-gray-600" />
              <input
                type="date"
                required
                value={form.assignment_date}
                onChange={(e) => setForm({ ...form, assignment_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-2">Platform</label>
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-lg"
            >
              <option value="zoom">Zoom</option>
              <option value="teams">Microsoft Teams</option>
              <option value="google_meet">Google Meet</option>
              <option value="in_person">In Person</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-2">Start Time *</label>
            <input
              type="time"
              required
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-primary mb-2">End Time *</label>
            <input
              type="time"
              required
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-primary mb-2">Prep Notes</label>
          <textarea
            value={form.prep_notes}
            onChange={(e) => setForm({ ...form, prep_notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-lg"
            placeholder="Goals, logistics, turn-taking, technical terminology…"
          />
        </div>

        <button type="submit" disabled={loading || !form.assignment_name} className="px-6 py-3 bg-brand-electric text-white rounded-lg font-semibold flex items-center gap-2">
          <Save className="w-4 h-4" /> {loading ? 'Creating…' : 'Create Hub'}
        </button>
      </form>
    </div>
  )
}
