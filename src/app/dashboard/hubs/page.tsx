'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Users, Plus, Share2, Calendar } from 'lucide-react'
import { ShareAssignmentModal } from '@/components/assignments/ShareAssignmentModal'

export default function HubsListPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<any[]>([])
  const [shareFor, setShareFor] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      let resolved = false
      const timeout = setTimeout(() => {
        if (!resolved) setLoading(false)
      }, 8000)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        resolved = true
        clearTimeout(timeout)
        if (!user) { setLoading(false); return }
        setUser(user)
        const { data } = await supabase
          .from('assignments')
          .select('*')
          .or(`creator_id.eq.${user.id},primary_interpreter_id.eq.${user.id}`)
          .eq('is_team_assignment', true)
          .order('assignment_date', { ascending: false })
        setAssignments(data || [])
      } catch {
        resolved = true
        clearTimeout(timeout)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-energy-light rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-brand-energy" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">Collaboration Hubs</h1>
            <p className="text-brand-gray-600">Team assignments, shared prep, and invites</p>
          </div>
        </div>
        <Link href="/dashboard/hubs/new" className="px-4 py-2 bg-brand-electric text-white rounded-lg font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Hub
        </Link>
      </div>

      {loading ? (
        <div className="text-brand-gray-600">Loading hubs…</div>
      ) : assignments.length === 0 ? (
        <div className="border-2 border-brand-gray-200 rounded-xl p-8 text-center">
          <p className="text-brand-gray-600 mb-4">No hubs yet. Create your first team assignment.</p>
          <Link href="/dashboard/hubs/new" className="px-4 py-2 bg-brand-electric text-white rounded-lg font-semibold">Create Hub</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {assignments.map(a => (
            <div key={a.id} className="bg-white border-2 border-brand-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Link href={`/dashboard/hubs/${a.id}`} className="text-xl font-bold text-brand-primary hover:text-brand-electric">
                  {a.assignment_name}
                </Link>
                <button onClick={() => setShareFor({ id: a.id, name: a.assignment_name })} className="px-3 py-2 bg-brand-gray-100 rounded-lg text-brand-primary hover:bg-brand-gray-200 flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
              <div className="text-sm text-brand-gray-600 flex items-center gap-3">
                <Calendar className="w-4 h-4" /> {new Date(a.assignment_date).toLocaleDateString()}
              </div>
              {a.prep_notes && (<p className="text-brand-gray-700 mt-3 line-clamp-2">{a.prep_notes}</p>)}
              <div className="mt-4 flex gap-3">
                <Link href={`/dashboard/hubs/${a.id}`} className="px-3 py-2 bg-brand-electric text-white rounded-lg font-semibold">Open Hub</Link>
                <Link href={`/shared/assignments/${a.sharing_token || ''}`} className="px-3 py-2 border-2 border-brand-gray-200 rounded-lg text-brand-primary">Public Link</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {shareFor && (
        <ShareAssignmentModal
          assignmentId={shareFor.id}
          assignmentName={shareFor.name}
          isOpen={!!shareFor}
          onClose={() => setShareFor(null)}
        />
      )}
    </div>
  )
}
