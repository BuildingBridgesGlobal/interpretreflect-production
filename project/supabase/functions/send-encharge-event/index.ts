import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const ENCHARGE_API_KEY = Deno.env.get("ENCHARGE_API_KEY")!;
const ENCHARGE_API_URL = "https://api.encharge.io/v1";
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface EnchargeEvent {
	userId: string;
	eventType: string;
	eventData: any;
	userEmail?: string;
}

serve(async (req) => {
	try {
		const { userId, eventType, eventData, userEmail } =
			(await req.json()) as EnchargeEvent;

		const supabase = createClient(supabaseUrl, supabaseServiceKey);

		// Get user email if not provided
		let email = userEmail;
		if (!email && userId) {
			const { data: user } = await supabase.auth.admin.getUserById(userId);
			email = user?.user?.email;
		}

		if (!email) {
			throw new Error("User email not found");
		}

		// Map internal events to Encharge events and tags
		const enchargeMapping: Record<
			string,
			{ event: string; tags?: string[]; fields?: any }
		> = {
			subscription_created: {
				event: "Subscription Started",
				tags: ["premium-subscriber", "active"],
				fields: {
					subscription_status: "active",
					plan_name: eventData.planName || "Premium",
					subscription_amount: eventData.amount,
					subscription_date: new Date().toISOString(),
				},
			},
			payment_success: {
				event: "Payment Successful",
				tags: ["paying-customer"],
				fields: {
					last_payment_amount: eventData.amount,
					last_payment_date: new Date().toISOString(),
					invoice_url: eventData.invoiceUrl,
				},
			},
			subscription_cancelled: {
				event: "Subscription Cancelled",
				tags: ["cancelled"],
				fields: {
					subscription_status: "cancelled",
					cancellation_date: new Date().toISOString(),
				},
			},
			payment_failed: {
				event: "Payment Failed",
				tags: ["payment-issue"],
				fields: {
					failed_payment_amount: eventData.amount,
					failed_payment_date: new Date().toISOString(),
					retry_date: eventData.retryDate,
				},
			},
			trial_ending: {
				event: "Trial Ending Soon",
				tags: ["trial-ending"],
				fields: {
					trial_end_date: eventData.trialEndDate,
					days_until_trial_ends: eventData.daysRemaining,
				},
			},
			user_signup: {
				event: "User Signed Up",
				tags: ["new-user", "trial"],
				fields: {
					signup_date: new Date().toISOString(),
					signup_source: eventData.source || "web",
				},
			},
			check_in_completed: {
				event: "Check-In Completed",
				tags: ["engaged-user"],
				fields: {
					last_check_in: new Date().toISOString(),
					check_in_count: eventData.checkInCount || 1,
				},
			},
			reflection_submitted: {
				event: "Reflection Submitted",
				tags: ["active-user"],
				fields: {
					last_reflection: new Date().toISOString(),
					reflection_count: eventData.reflectionCount || 1,
				},
			},
		};

		const mapping = enchargeMapping[eventType];
		if (!mapping) {
			throw new Error(`Unknown event type: ${eventType}`);
		}

		// Create or update user in Encharge
		const userPayload = {
			email,
			userId,
			fields: {
				...mapping.fields,
				...eventData.customFields,
				last_activity: new Date().toISOString(),
			},
			tags: mapping.tags,
		};

		// Update or create user
		const userResponse = await fetch(`${ENCHARGE_API_URL}/people`, {
			method: "POST",
			headers: {
				"X-Encharge-Token": ENCHARGE_API_KEY,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userPayload),
		});

		if (!userResponse.ok) {
			const error = await userResponse.text();
			console.error("Failed to update user in Encharge:", error);
			throw new Error(`Encharge user update failed: ${error}`);
		}

		// Trigger the event in Encharge
		const eventPayload = {
			name: mapping.event,
			user: {
				email,
				userId,
			},
			properties: {
				...eventData,
				timestamp: new Date().toISOString(),
			},
		};

		const eventResponse = await fetch(`${ENCHARGE_API_URL}/events`, {
			method: "POST",
			headers: {
				"X-Encharge-Token": ENCHARGE_API_KEY,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(eventPayload),
		});

		if (!eventResponse.ok) {
			const error = await eventResponse.text();
			console.error("Failed to send event to Encharge:", error);
			throw new Error(`Encharge event failed: ${error}`);
		}

		// Log the event in our database
		await supabase.from("email_logs").insert({
			user_id: userId,
			email_type: eventType,
			recipient_email: email,
			subject: `Encharge Event: ${mapping.event}`,
			status: "sent",
			metadata: {
				encharge_event: mapping.event,
				tags: mapping.tags,
				fields: mapping.fields,
				event_data: eventData,
			},
		});

		console.log(
			`Successfully sent ${eventType} event to Encharge for ${email}`,
		);

		return new Response(
			JSON.stringify({
				success: true,
				message: `Event ${mapping.event} sent to Encharge`,
				email,
				tags: mapping.tags,
			}),
			{
				headers: { "Content-Type": "application/json" },
				status: 200,
			},
		);
	} catch (error) {
		console.error("Error in send-encharge-event:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			headers: { "Content-Type": "application/json" },
			status: 500,
		});
	}
});
