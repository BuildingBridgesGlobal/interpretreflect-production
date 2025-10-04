import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-pabbly-signature",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse webhook payload
    const body = await req.text();
    const payload = JSON.parse(body);
    console.log("Received Pabbly webhook:", payload);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log webhook to database for debugging
    await supabase.from("pabbly_webhook_logs").insert({
      workflow_name: payload.workflow_name || "unknown",
      webhook_payload: payload,
      processing_status: "pending",
      created_at: new Date().toISOString(),
    });

    // Extract event details - Handle both Stripe format and custom format
    const eventType = payload.event_type || payload.type || payload.event?.type;
    const email = payload.email || payload.customer_email || payload.data?.object?.customer_email;
    
    // Handle Stripe data if it comes directly from Stripe through Pabbly
    const stripeData = payload.stripe_data || payload.data?.object || {};

    console.log(`Processing event: ${eventType} for email: ${email}`);

    // Handle different event types
    switch (eventType) {
      case "checkout.session.completed":
      case "subscription_created": {
        console.log(`Processing subscription creation for ${email}`);
        
        // Extract customer and subscription IDs from various possible locations
        const customerId = stripeData.customer || stripeData.customer_id || payload.customer;
        const subscriptionId = stripeData.subscription || stripeData.subscription_id || payload.subscription;
        
        if (email) {
          // Update subscription status
          const result = await supabase.rpc("update_subscription_status", {
            p_email: email,
            p_status: "active",
            p_stripe_customer_id: customerId,
            p_stripe_subscription_id: subscriptionId,
            p_end_date: stripeData.current_period_end || null,
          });

          console.log("Subscription created:", result);
        }
        break;
      }

      case "customer.subscription.updated":
      case "subscription_updated": {
        console.log(`Processing subscription update`);
        
        const subscriptionId = stripeData.id || stripeData.subscription_id;
        const status = stripeData.status || "active";
        
        // Find user by subscription ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("stripe_subscription_id", subscriptionId)
          .single();
        
        if (profile?.email) {
          const result = await supabase.rpc("update_subscription_status", {
            p_email: profile.email,
            p_status: status,
            p_stripe_subscription_id: subscriptionId,
            p_end_date: stripeData.current_period_end || null,
          });

          console.log("Subscription updated:", result);
        }
        break;
      }

      case "customer.subscription.deleted":
      case "subscription_cancelled": {
        console.log(`Processing subscription cancellation`);
        
        const subscriptionId = stripeData.id || stripeData.subscription_id;
        
        // Find user by subscription ID
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, email")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (profile) {
          await supabase.from("profiles").update({
            subscription_status: "cancelled",
            cancellation_date: new Date().toISOString(),
            cancellation_reason: payload.cancellation_reason || "user_initiated",
          }).eq("id", profile.id);

          // Log in audit table
          await supabase.from("subscription_audit_log").insert({
            user_id: profile.id,
            event_type: "cancelled",
            stripe_subscription_id: subscriptionId,
            old_status: "active",
            new_status: "cancelled",
            metadata: payload,
            source: "pabbly",
            created_by: "pabbly_webhook",
          });
        }
        break;
      }

      case "invoice.payment_failed":
      case "payment_failed": {
        console.log(`Processing payment failure`);
        
        const customerId = stripeData.customer || stripeData.customer_id;
        const invoiceId = stripeData.id || stripeData.invoice_id;
        const amountDue = stripeData.amount_due || 0;
        
        if (customerId) {
          // Log payment failure
          const result = await supabase.rpc("log_payment_failure", {
            p_stripe_customer_id: customerId,
            p_invoice_id: invoiceId,
            p_amount: amountDue / 100, // Convert from cents
            p_reason: stripeData.failure_message || "Payment failed",
            p_attempt_count: stripeData.attempt_count || 1,
            p_next_retry: stripeData.next_payment_attempt || null,
          });

          console.log("Payment failure logged:", result);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        console.log(`Processing payment success`);
        
        const subscriptionId = stripeData.subscription || stripeData.subscription_id;
        
        if (subscriptionId) {
          // Update subscription status to active
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("stripe_subscription_id", subscriptionId)
            .single();
          
          if (profile?.email) {
            await supabase.rpc("update_subscription_status", {
              p_email: profile.email,
              p_status: "active",
              p_stripe_subscription_id: subscriptionId,
            });
          }
        }
        break;
      }

      default:
        console.log(`Received event type: ${eventType} - logged for review`);
        
        // Log unknown events for debugging
        await supabase.from("pabbly_webhook_logs").update({
          processing_status: "unknown_event",
          error_message: `Event type: ${eventType}`,
          processed_at: new Date().toISOString(),
        }).match({
          webhook_payload: payload,
          processing_status: "pending",
        });
    }

    // Update webhook log as processed
    await supabase.from("pabbly_webhook_logs").update({
      processing_status: "success",
      processed_at: new Date().toISOString(),
    }).match({
      webhook_payload: payload,
      processing_status: "pending",
    });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Webhook processed: ${eventType}`,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing Pabbly webhook:", error);

    // Try to log error to database
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase.from("pabbly_webhook_logs").insert({
        workflow_name: "error",
        webhook_payload: { error: error.message, body: await req.text() },
        processing_status: "failed",
        error_message: error.message,
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({
        error: "Failed to process webhook",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
