'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext.next'
import { AllReflectionsView } from '@/components/AllReflectionsView'

export default function ReflectionsPage() {
  const { user, loading: authLoading } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && user) setOpen(true)
  }, [authLoading, user])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-electric border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-brand-gray-600">Please sign in to view reflections.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {open && (
        <AllReflectionsView
          userId={user.id}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

