import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Email templates
const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to InterpretReflect Premium! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to InterpretReflect</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, rgba(27, 94, 32, 0.05), rgba(46, 125, 50, 0.05)); border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #1b5e20; font-size: 32px; font-weight: bold;">
                        Welcome to InterpretReflect! 🌟
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px 40px;">
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
                        Hi ${name || 'there'},
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        Thank you for joining InterpretReflect Premium! You've taken an important step in prioritizing your wellness as an interpreter.
                      </p>
                      
                      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0; border-radius: 8px;">
                        <h2 style="margin: 0 0 15px 0; color: #1b5e20; font-size: 20px;">
                          What's Included in Your Premium Subscription:
                        </h2>
                        <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.8;">
                          <li>Unlimited access to Elya AI wellness companion</li>
                          <li>Daily burnout assessments and early warning system</li>
                          <li>Advanced growth insights and analytics</li>
                          <li>3-minute wellness exercises between assignments</li>
                          <li>Guided reflection and trauma-informed tools</li>
                          <li>Priority email support</li>
                        </ul>
                      </div>
                      
                      <h3 style="margin: 30px 0 15px 0; color: #1b5e20; font-size: 18px;">
                        Get Started in 3 Easy Steps:
                      </h3>
                      
                      <ol style="margin: 0 0 25px 0; padding-left: 20px; color: #374151; line-height: 1.8;">
                        <li><strong>Complete your first check-in</strong> to establish your wellness baseline</li>
                        <li><strong>Chat with Elya</strong> about any challenges you're facing</li>
                        <li><strong>Explore the Growth Insights</strong> to track your progress</li>
                      </ol>
                      
                      <!-- CTA Button -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="https://interpretreflect.com/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50)); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px;">
                              Go to Your Dashboard →
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 25px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If you have any questions or need assistance, reply to this email or contact us at 
                        <a href="mailto:hello@huviatechnologies.com" style="color: #1b5e20;">hello@huviatechnologies.com</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                        © ${new Date().getFullYear()} InterpretReflect. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        <a href="https://interpretreflect.com/privacy" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a> | 
                        <a href="https://interpretreflect.com/terms" style="color: #6b7280; text-decoration: underline;">Terms of Service</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  }),
  
  paymentSuccess: (name: string, amount: string, invoiceUrl?: string) => ({
    subject: 'Payment Confirmation - InterpretReflect',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background-color: #f0fdf4; border-radius: 12px 12px 0 0;">
                      <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                      <h1 style="margin: 0; color: #1b5e20; font-size: 28px;">
                        Payment Successful
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px 40px;">
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
                        Hi ${name || 'there'},
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        Your payment has been successfully processed. Thank you for your continued subscription to InterpretReflect Premium.
                      </p>
                      
                      <!-- Payment Details -->
                      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h3 style="margin: 0 0 15px 0; color: #1b5e20; font-size: 18px;">
                          Payment Details
                        </h3>
                        <table width="100%" style="color: #374151; font-size: 14px;">
                          <tr>
                            <td style="padding: 8px 0;">Amount Paid:</td>
                            <td style="padding: 8px 0; text-align: right; font-weight: bold;">${amount}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">Date:</td>
                            <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString()}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">Subscription:</td>
                            <td style="padding: 8px 0; text-align: right;">InterpretReflect Premium</td>
                          </tr>
                        </table>
                      </div>
                      
                      ${invoiceUrl ? `
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 25px 0;">
                        <tr>
                          <td align="center">
                            <a href="${invoiceUrl}" style="display: inline-block; padding: 12px 28px; background-color: #ffffff; color: #1b5e20; text-decoration: none; font-size: 14px; font-weight: bold; border: 2px solid #1b5e20; border-radius: 8px;">
                              Download Invoice
                            </a>
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                      
                      <p style="margin: 25px 0 0 0; color: #6b7280; font-size: 14px;">
                        This receipt is for your records. No action is required.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        Questions? Contact us at <a href="mailto:hello@huviatechnologies.com" style="color: #1b5e20;">hello@huviatechnologies.com</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  }),
  
  subscriptionCanceled: (name: string) => ({
    subject: 'Subscription Canceled - We\'ll Miss You',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Subscription Canceled</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px;">
                  <tr>
                    <td style="padding: 40px;">
                      <h1 style="margin: 0 0 20px 0; color: #1b5e20; font-size: 28px;">
                        We're Sorry to See You Go
                      </h1>
                      
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
                        Hi ${name || 'there'},
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        Your InterpretReflect Premium subscription has been canceled. You'll continue to have access to premium features until the end of your current billing period.
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        We'd love to understand how we could have served you better. If you have a moment, please reply to this email with any feedback.
                      </p>
                      
                      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <p style="margin: 0; color: #374151; font-size: 14px;">
                          <strong>Remember:</strong> You can reactivate your subscription anytime by visiting your account settings.
                        </p>
                      </div>
                      
                      <p style="margin: 25px 0 0 0; color: #6b7280; font-size: 14px;">
                        Thank you for being part of the InterpretReflect community.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  }),
  
  paymentFailed: (name: string, retryDate?: string) => ({
    subject: 'Payment Failed - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Failed</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px;">
                  <tr>
                    <td style="padding: 40px;">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 48px;">⚠️</div>
                      </div>
                      
                      <h1 style="margin: 0 0 20px 0; color: #dc2626; font-size: 28px; text-align: center;">
                        Payment Failed
                      </h1>
                      
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
                        Hi ${name || 'there'},
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        We were unable to process your payment for InterpretReflect Premium. To avoid interruption to your service, please update your payment method.
                      </p>
                      
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 25px 0;">
                        <tr>
                          <td align="center">
                            <a href="https://interpretreflect.com/account/billing" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50)); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 8px;">
                              Update Payment Method
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      ${retryDate ? `
                      <p style="margin: 25px 0; padding: 15px; background-color: #fef3c7; border-radius: 8px; color: #92400e; font-size: 14px;">
                        <strong>Note:</strong> We'll automatically retry your payment on ${retryDate}. Update your payment method before then to ensure uninterrupted service.
                      </p>
                      ` : ''}
                      
                      <p style="margin: 25px 0 0 0; color: #6b7280; font-size: 14px;">
                        Need help? Contact us at <a href="mailto:hello@huviatechnologies.com" style="color: #1b5e20;">hello@huviatechnologies.com</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  }),
  
  trialEnding: (name: string, daysLeft: number) => ({
    subject: `Your free trial ends in ${daysLeft} days`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Trial Ending Soon</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding: 40px 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px;">
                  <tr>
                    <td style="padding: 40px;">
                      <h1 style="margin: 0 0 20px 0; color: #1b5e20; font-size: 28px;">
                        Your Free Trial Ends in ${daysLeft} Days
                      </h1>
                      
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
                        Hi ${name || 'there'},
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        We hope you've been enjoying InterpretReflect Premium! Your free trial will end in ${daysLeft} days.
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        To continue accessing all premium features, your subscription will automatically begin at just $12.99/month. No action is needed if you want to continue.
                      </p>
                      
                      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h3 style="margin: 0 0 10px 0; color: #1b5e20; font-size: 16px;">
                          Don't lose access to:
                        </h3>
                        <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.6;">
                          <li>Elya AI wellness companion</li>
                          <li>Advanced growth insights</li>
                          <li>All premium wellness tools</li>
                        </ul>
                      </div>
                      
                      <p style="margin: 25px 0 0 0; color: #6b7280; font-size: 14px;">
                        You can manage your subscription anytime in your account settings.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  })
}

serve(async (req) => {
  try {
    const { type, to, data } = await req.json()
    
    if (!to || !type) {
      throw new Error('Missing required fields: to and type')
    }

    // Get the appropriate email template
    let emailContent
    switch (type) {
      case 'welcome':
        emailContent = emailTemplates.welcome(data?.name)
        break
      case 'payment_success':
        emailContent = emailTemplates.paymentSuccess(data?.name, data?.amount, data?.invoiceUrl)
        break
      case 'subscription_canceled':
        emailContent = emailTemplates.subscriptionCanceled(data?.name)
        break
      case 'payment_failed':
        emailContent = emailTemplates.paymentFailed(data?.name, data?.retryDate)
        break
      case 'trial_ending':
        emailContent = emailTemplates.trialEnding(data?.name, data?.daysLeft || 3)
        break
      default:
        throw new Error(`Unknown email type: ${type}`)
    }

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'InterpretReflect <noreply@interpretreflect.com>',
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
        reply_to: 'hello@huviatechnologies.com'
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send email: ${error}`)
    }

    const result = await response.json()
    
    // Log email sent to database for tracking
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    await supabase.from('email_logs').insert({
      to,
      type,
      status: 'sent',
      email_id: result.id,
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})