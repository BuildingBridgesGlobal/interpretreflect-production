"use client"
import React from 'react'

export default function StatusPage() {
  const [data, setData] = React.useState<any>()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string>()

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.supabase?.error || 'Service unavailable')
      }
      setData(json)
    } catch (e: any) {
      setError(e?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Status</h1>
      <div>
        <button onClick={load} className="px-3 py-2 rounded bg-black text-white">
          {loading ? 'Checking…' : 'Refresh'}
        </button>
      </div>
      <div className="space-y-2">
        <div>App OK: {data?.ok ? 'true' : 'false'}</div>
        <div>Supabase OK: {data?.supabase?.ok ? 'true' : 'false'}</div>
        <div>Env Supabase URL set: {data?.env?.urlSet ? 'true' : 'false'}</div>
        <div>Env Supabase Key set: {data?.env?.anonSet ? 'true' : 'false'}</div>
        {error && <div className="text-red-600">{error}</div>}
      </div>
    </div>
  )
}

