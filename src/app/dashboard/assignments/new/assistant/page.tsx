'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ASSIGNMENT_TYPES, COGNITIVE_LOADS, KEY_CONSIDERATIONS } from '@/types/assignment'

export default function PreAssignmentAssistantPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<any>({
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
    agency_contact_email: '',
  })
  const [autoShare, setAutoShare] = useState(true)

  const applyAndContinue = () => {
    try {
      localStorage.setItem('assistant.draft', JSON.stringify(data))
      localStorage.setItem('assistant.vocab_terms', JSON.stringify(data.vocab_terms || []))
      localStorage.setItem('assistant.auto_share', JSON.stringify(!!autoShare))
    } catch {}
    router.push('/dashboard/assignments/new')
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-brand-primary">Pre-Assignment Assistant</h1>
          <button onClick={()=>router.push('/dashboard/assignments/new')} className="text-brand-gray-600">Cancel</button>
        </div>
        <div className="bg-white border-2 border-brand-gray-200 rounded-data p-6 space-y-4">
          {step===1 && (
            <div className="space-y-3">
              <input placeholder="Assignment name" value={data.assignment_name} onChange={(e)=>setData({...data, assignment_name:e.target.value})} className="w-full px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={data.assignment_date} onChange={(e)=>setData({...data, assignment_date:e.target.value})} className="px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
                <select value={data.assignment_type} onChange={(e)=>setData({...data, assignment_type:e.target.value})} className="px-3 py-2 border-2 border-brand-gray-200 rounded-data">
                  {ASSIGNMENT_TYPES.map(t=> (<option key={t.value} value={t.value}>{t.label}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="time" value={data.start_time} onChange={(e)=>setData({...data, start_time:e.target.value})} className="px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
                <input type="time" value={data.end_time} onChange={(e)=>setData({...data, end_time:e.target.value})} className="px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
              </div>
            </div>
          )}
          {step===2 && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button type="button" onClick={()=>setData({...data, is_team_assignment:false})} className={`px-3 py-2 rounded-data ${!data.is_team_assignment?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-primary'}`}>Solo</button>
                <button type="button" onClick={()=>setData({...data, is_team_assignment:true})} className={`px-3 py-2 rounded-data ${data.is_team_assignment?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-primary'}`}>Team</button>
              </div>
              {data.is_team_assignment && (
                <div className="space-y-3">
                  <input type="email" placeholder="Team interpreter email" value={data.team_interpreter_email} onChange={(e)=>setData({...data, team_interpreter_email:e.target.value})} className="w-full px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
                  <input type="number" min={5} max={60} placeholder="Turn rotation (minutes)" value={data.turn_rotation_minutes} onChange={(e)=>setData({...data, turn_rotation_minutes: parseInt(e.target.value) || 20})} className="w-full px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
                </div>
              )}
            </div>
          )}
          {step===3 && (
            <div className="space-y-3">
              <input placeholder="Subject/Topic" value={data.subject_topic} onChange={(e)=>setData({...data, subject_topic:e.target.value})} className="w-full px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
              <div className="grid grid-cols-4 gap-2">
                {COGNITIVE_LOADS.map(load => (
                  <button key={load.value} type="button" onClick={()=>setData({...data, expected_cognitive_load: load.value})} className={`py-2 rounded-data ${data.expected_cognitive_load===load.value?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-primary'}`}>{load.label}</button>
                ))}
              </div>
              <div>
                <div className="text-sm font-semibold text-brand-primary mb-2">Key Considerations</div>
                <div className="flex flex-wrap gap-2">
                  {KEY_CONSIDERATIONS.map(k=> (
                    <button key={k.value} type="button" onClick={()=>{
                      const inc = data.key_considerations.includes(k.value)
                      setData({...data, key_considerations: inc? data.key_considerations.filter((v:string)=>v!==k.value):[...data.key_considerations, k.value]})
                    }} className={`px-3 py-2 rounded-data ${data.key_considerations.includes(k.value)?'bg-brand-electric text-white':'bg-brand-gray-100 text-brand-primary'}`}>{k.label}</button>
                  ))}
                </div>
              </div>
              <input type="email" placeholder="Agency contact email (optional)" value={data.agency_contact_email} onChange={(e)=>setData({...data, agency_contact_email:e.target.value})} className="w-full px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
            </div>
          )}
          {step===4 && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input placeholder="Add vocabulary term" onKeyDown={(e)=>{
                  const el = e.target as HTMLInputElement
                  if (e.key==='Enter' && el.value.trim()) { e.preventDefault(); setData({...data, vocab_terms:[...data.vocab_terms, el.value.trim()]}); el.value='' }
                }} className="flex-1 px-3 py-2 border-2 border-brand-gray-200 rounded-data" />
              </div>
              <div className="flex flex-wrap gap-2">
                {data.vocab_terms.map((t:string,i:number)=> (
                  <span key={`${t}-${i}`} className="px-3 py-1 rounded-full bg-brand-gray-100 text-brand-primary">{t}</span>
                ))}
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-2 text-sm text-brand-gray-700">
                  <input type="checkbox" checked={autoShare} onChange={(e)=>setAutoShare(e.target.checked)} />
                  Send pre-assignment to team after creation
                </label>
              </div>
            </div>
          )}
          <div className="flex justify-between pt-4">
            <button type="button" onClick={()=>setStep(s=>Math.max(1, s-1))} className="px-3 py-2 bg-brand-gray-100 rounded-data text-brand-primary">Back</button>
            {step<4 ? (
              <button type="button" onClick={()=>setStep(s=>Math.min(4, s+1))} className="px-3 py-2 bg-brand-electric text-white rounded-data">Next</button>
            ) : (
              <button type="button" onClick={applyAndContinue} className="px-3 py-2 bg-brand-electric text-white rounded-data">Apply</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
