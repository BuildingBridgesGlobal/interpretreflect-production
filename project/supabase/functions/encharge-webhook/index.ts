import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-encharge-signature",
};

// Encharge webhook secret (set this in environment variables)
const ENCHARGE_WEBHOOK_SECRET = Deno.env.get("ENCHARGE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify webhook signature (optional but recommended)
    const signature = req.headers.get("x-encharge-signature");
    if (ENCHARGE_WEBHOOK_SECRET && signature) {
      // Verify signature here if Encharge provides one
      // This would typically involve HMAC verification
    }

    // Parse webhook payload
    const payload = await req.json();
    console.log("Received Encharge webhook:", payload);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract event details
    const eventType = payload.event || payload.type;
    const email = payload.email || payload.person?.email;
    const personId = payload.person?.id;

    if (!eventType || !email) {
      return new Response(
        JSON.stringify({ error: "Missing event type or email" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle different event types
    let result;

    switch (eventType) {
      case "person.unsubscribed":
      case "unsubscribed":
        // User unsubscribed in Encharge
        console.log(`User ${email} unsubscribed`);

        // Call our function to handle unsubscribe
        const { data: unsubResult, error: unsubError } = await supabase.rpc(
          "handle_encharge_webhook",
          {
            p_event_type: "unsubscribed",
            p_email: email,
            p_payload: payload,
          }
        );

        if (unsubError) {
          console.error("Error handling unsubscribe:", unsubError);
        } else {
          console.log("Unsubscribe handled:", unsubResult);
        }

        result = unsubResult;
        break;

      case "person.bounced":
      case "email.bounced":
        // Email bounced
        console.log(`Email bounced for ${email}`);

        const { data: bounceResult, error: bounceError } = await supabase.rpc(
          "handle_encharge_webhook",
          {
            p_event_type: "bounced",
            p_email: email,
            p_payload: payload,
          }
        );

        if (bounceError) {
          console.error("Error handling bounce:", bounceError);
        } else {
          console.log("Bounce handled:", bounceResult);
        }

        result = bounceResult;
        break;

      case "person.tagged":
        // Person was tagged in Encharge
        const tags = payload.tags || [];
        console.log(`User ${email} tagged with:`, tags);

        // You can handle specific tags here
        if (tags.includes("notifications-disabled")) {
          // Update preferences to disable notifications
          const { data: userData } = await supabase
            .from("auth.users")
            .select("id")
            .eq("email", email)
            .single();

          if (userData) {
            await supabase
              .from("email_preferences")
              .update({
                email_notifications: false,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", userData.id);
          }
        }

        result = { success: true, message: "Tags processed" };
        break;

      case "person.field_updated":
        // Custom field was updated
        console.log(`Fields updated for ${email}:`, payload.fields);

        // Record the event
        await supabase.from("encharge_webhook_events").insert({
          event_type: eventType,
          email: email,
          payload: payload,
          processed: true,
          processed_at: new Date().toISOString(),
        });

        result = { success: true, message: "Field update recorded" };
        break;

      default:
        // Unknown event type - just log it
        console.log(`Unknown event type: ${eventType}`);

        await supabase.from("encharge_webhook_events").insert({
          event_type: eventType,
          email: email,
          payload: payload,
          processed: false,
        });

        result = { success: true, message: "Event recorded" };
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Webhook processed: ${eventType}`,
        result: result,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing Encharge webhook:", error);

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