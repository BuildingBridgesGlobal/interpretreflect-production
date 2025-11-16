import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const completionId = params.id
    const { data: completion } = await supabase
      .from('ceu_completions')
      .select('id, user_id, program_id, ceu_awarded, completed_at, category, certificate_number')
      .eq('id', completionId)
      .single()
    if (!completion) return NextResponse.json({ error: 'Completion not found' }, { status: 404 })

    if (completion.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', completion.user_id)
      .single()

    const { data: program } = await supabase
      .from('ceu_programs')
      .select('title')
      .eq('id', completion.program_id)
      .single()

    const name = profile?.full_name || profile?.email || 'Participant'
    const title = program?.title || 'CEU Program'
    const date = completion.completed_at?.slice(0, 10) || new Date().toISOString().slice(0, 10)
    const ceu = completion.ceu_awarded || 0
    const cat = (completion as any).category || 'Professional Studies'
    const certNo = (completion as any).certificate_number || completion.id

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Certificate</title>
  <style>
    body { font-family: Arial, sans-serif; background: #F8F9FA; color: #0A2463; }
    .card { max-width: 800px; margin: 40px auto; background: #fff; border: 2px solid #DEE2E6; border-radius: 12px; padding: 32px; }
    .hdr { text-align: center; margin-bottom: 16px; }
    .h1 { font-size: 28px; font-weight: 700; }
    .meta { text-align: center; color: #6C757D; margin-bottom: 24px; }
    .field { margin: 12px 0; font-size: 16px; }
    .label { color: #495057; font-weight: 600; }
    .sig { display: flex; justify-content: space-between; margin-top: 40px; }
    .box { border-top: 1px solid #ADB5BD; padding-top: 8px; color: #6C757D; }
    .stamp { margin-top: 24px; text-align: center; color: #6C757D; font-size: 13px; }
    .rid { color: #E67E00; font-weight: 700; }
    .btn { display: inline-block; margin-top: 24px; background: #0A2463; color: #fff; padding: 10px 16px; border-radius: 8px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="hdr">
      <div class="h1">Certificate of Completion</div>
      <div class="meta">Building Bridges Global, LLC • RID Sponsor <span class="rid">#2309</span></div>
    </div>
    <div class="field"><span class="label">Participant:</span> ${name}</div>
    <div class="field"><span class="label">Program:</span> ${title}</div>
    <div class="field"><span class="label">Category:</span> ${cat}</div>
    <div class="field"><span class="label">CEUs Awarded:</span> ${ceu}</div>
    <div class="field"><span class="label">Completion Date:</span> ${date}</div>
    <div class="sig">
      <div class="box">Sponsor Representative • Signature</div>
      <div class="box">Participant • Signature</div>
    </div>
    <div class="stamp">Certificate #: ${certNo} • ID: ${completion.id}</div>
    <div style="text-align:center"><a class="btn" href="#" onclick="window.print()">Print</a></div>
  </div>
</body>
</html>`

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
