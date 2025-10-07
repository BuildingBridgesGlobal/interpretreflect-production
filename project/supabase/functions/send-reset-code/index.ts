import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate a 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Store the code in database with expiry (15 minutes)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    const { error: dbError } = await supabaseClient
      .from('password_reset_codes')
      .insert({
        email: email.toLowerCase(),
        code: resetCode,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate reset code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Send email using Resend API
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'InterpretReflect <noreply@interpretreflect.com>',
        to: email,
        subject: 'Password Reset Code - InterpretReflect',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { background-color: #2D5F3F; color: #ffffff; padding: 20px 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { padding: 30px; text-align: center; }
              .code-box { background-color: #f0f4f0; border: 2px dashed #2D5F3F; border-radius: 8px; padding: 20px; margin: 30px 0; }
              .code { font-size: 32px; font-weight: bold; color: #2D5F3F; letter-spacing: 8px; }
              .footer { background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>InterpretReflect</h1>
              </div>
              <div class="content">
                <h2>Password Reset Code</h2>
                <p>You requested to reset your password. Use this code:</p>
                <div class="code-box">
                  <div class="code">${resetCode}</div>
                </div>
                <p>This code will expire in 15 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 InterpretReflect. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Email error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to send reset email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Reset code sent to email' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})