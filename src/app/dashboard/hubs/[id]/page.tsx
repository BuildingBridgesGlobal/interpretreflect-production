'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FolderPlus, Link2, MessageSquare, Share2, Plus } from 'lucide-react'
import { ShareAssignmentModal } from '@/components/assignments/ShareAssignmentModal'

export default function HubDetailPage() {
  const { id } = useParams()
  const [assignment, setAssignment] = useState<any>(null)
  const [resources, setResources] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newResource, setNewResource] = useState({ title: '', url: '' })
  const [newNote, setNewNote] = useState('')
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        let resolved = false
        const timeout = setTimeout(() => {
          if (!resolved) setError('Authentication timed out');
        }, 8000)
        const { data: { user } } = await supabase.auth.getUser()
        resolved = true
        clearTimeout(timeout)
        if (!user) throw new Error('Not authenticated')

        const { data: a, error: aErr } = await supabase
          .from('assignments')
          .select('*')
          .eq('id', id)
          .single()
        if (aErr) throw aErr
        setAssignment(a)

        const { data: res } = await supabase
          .from('assignment_resources')
          .select('*')
          .eq('assignment_id', id)
          .order('added_at', { ascending: false })
        setResources(res || [])

        const { data: ns } = await supabase
          .from('shared_assignment_notes')
          .select('*')
          .eq('assignment_id', id)
          .order('created_at', { ascending: false })
        setNotes(ns || [])
      } catch (e: any) {
        setError(e.message || 'Failed to load hub')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const addResource = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      if (!newResource.title || !newResource.url) return
      const { error } = await supabase
        .from('assignment_resources')
        .insert({
          assignment_id: id,
          title: newResource.title,
          url: newResource.url,
          added_by: user.id,
        })
      if (error) throw error
      setNewResource({ title: '', url: '' })
      const { data: res } = await supabase
        .from('assignment_resources')
        .select('*')
        .eq('assignment_id', id)
        .order('added_at', { ascending: false })
      setResources(res || [])
    } catch (e: any) {
      alert(e.message)
    }
  }

  const addNote = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      if (!newNote.trim()) return
      const profileEmail = user.email || 'team@interpretrefl.com'
      const { error } = await supabase
        .from('shared_assignment_notes')
        .insert({
          assignment_id: id,
          author_email: profileEmail,
          author_user_id: user.id,
          author_name: profileEmail,
          note_text: newNote.trim(),
        })
      if (error) throw error
      setNewNote('')
      const { data: ns } = await supabase
        .from('shared_assignment_notes')
        .select('*')
        .eq('assignment_id', id)
        .order('created_at', { ascending: false })
      setNotes(ns || [])
    } catch (e: any) {
      alert(e.message)
    }
  }

  if (loading) {
    return <div className="p-6">Loading hub…</div>
  }
  if (error || !assignment) {
    return <div className="p-6 text-red-600">{error || 'Hub not found'}</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">{assignment.assignment_name}</h1>
          <p className="text-brand-gray-600">Shared prep, resources, and team notes</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/shared/assignments/${assignment.sharing_token || ''}`} className="px-3 py-2 border-2 border-brand-gray-200 rounded-lg text-brand-primary flex items-center gap-2">
            <Link2 className="w-4 h-4" /> Public Link
          </Link>
          <button onClick={() => setShareOpen(true)} className="px-3 py-2 bg-brand-electric text-white rounded-lg font-semibold flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Invite
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resources */}
        <div className="bg-white border-2 border-brand-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-primary">Prep Resources</h2>
            <div className="flex gap-2">
              <input
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                placeholder="Title"
                className="px-3 py-2 border-2 border-brand-gray-200 rounded-lg"
              />
              <input
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                placeholder="https://link"
                className="px-3 py-2 border-2 border-brand-gray-200 rounded-lg"
              />
              <button onClick={addResource} className="px-3 py-2 bg-brand-electric text-white rounded-lg flex items-center gap-2">
                <FolderPlus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
          {resources.length === 0 ? (
            <p className="text-brand-gray-600">No resources yet.</p>
          ) : (
            <ul className="space-y-2">
              {resources.map(r => (
                <li key={r.id} className="flex items-center justify-between">
                  <a href={r.url} target="_blank" rel="noopener" className="text-brand-electric hover:underline">{r.title}</a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white border-2 border-brand-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-primary">Team Notes</h2>
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={2}
                placeholder="Add a note…"
                className="px-3 py-2 border-2 border-brand-gray-200 rounded-lg"
              />
              <button onClick={addNote} className="px-3 py-2 bg-brand-energy text-white rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
          {notes.length === 0 ? (
            <p className="text-brand-gray-600">No notes yet.</p>
          ) : (
            <ul className="space-y-3">
              {notes.map(n => (
                <li key={n.id} className="border-2 border-brand-gray-200 rounded-lg p-3">
                  <div className="text-sm text-brand-gray-600 mb-1">{n.author_name}</div>
                  <div className="text-brand-gray-800">{n.note_text}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {shareOpen && (
        <ShareAssignmentModal
          assignmentId={assignment.id}
          assignmentName={assignment.assignment_name}
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  )
}
