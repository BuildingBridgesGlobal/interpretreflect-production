import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
	apiVersion: "2023-10-16",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

// Helper function to send events to Encharge
async function sendEnchargeEvent(
	userId: string,
	eventType: string,
	eventData: any,
	userEmail?: string,
) {
	try {
		const response = await fetch(
			`${supabaseUrl}/functions/v1/send-encharge-event`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${supabaseServiceKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId,
					eventType,
					eventData,
					userEmail,
				}),
			},
		);

		if (!response.ok) {
			console.error("Failed to send Encharge event:", await response.text());
		} else {
			console.log(
				`Encharge event sent successfully: ${eventType} for user ${userId}`,
			);
		}
	} catch (error) {
		console.error("Error sending Encharge event:", error);
	}
}

serve(async (req) => {
	const signature = req.headers.get("stripe-signature");

	if (!signature) {
		return new Response("No signature", { status: 400 });
	}

	try {
		const body = await req.text();
		const event = stripe.webhooks.constructEvent(
			body,
			signature,
			endpointSecret,
		);

		const supabase = createClient(supabaseUrl, supabaseServiceKey);

		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				const userId = session.metadata?.user_id;

				if (userId && session.subscription) {
					// Get subscription details
					const subscription = await stripe.subscriptions.retrieve(
						session.subscription as string,
					);

					// Save subscription to database
					await supabase.from("subscriptions").upsert({
						id: subscription.id,
						user_id: userId,
						status: subscription.status,
						price_id: subscription.items.data[0].price.id,
						plan_name: subscription.items.data[0].price.nickname || "Premium",
						plan_amount: subscription.items.data[0].price.unit_amount,
						current_period_start: new Date(
							subscription.current_period_start * 1000,
						).toISOString(),
						current_period_end: new Date(
							subscription.current_period_end * 1000,
						).toISOString(),
						cancel_at_period_end: subscription.cancel_at_period_end,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					});

					// Update user profile with subscription status
					await supabase
						.from("profiles")
						.update({
							subscription_status: subscription.status,
							subscription_tier:
								subscription.items.data[0].price.nickname || "Premium",
						})
						.eq("id", userId);

					// Send subscription created event to Encharge
					await sendEnchargeEvent(
						userId,
						"subscription_created",
						{
							customerName: session.customer_details?.name || "Valued Customer",
							planName: "Premium",
							amount: (session.amount_total || 0) / 100,
							customFields: {
								stripe_customer_id: session.customer as string,
								stripe_subscription_id: subscription.id,
							},
						},
						session.customer_email || undefined,
					);

					// Send payment success event to Encharge
					await sendEnchargeEvent(
						userId,
						"payment_success",
						{
							amount: (session.amount_total || 0) / 100,
							invoiceUrl: session.url,
							paymentMethod: session.payment_method_types?.[0] || "card",
						},
						session.customer_email || undefined,
					);
				}
				break;
			}

			case "customer.subscription.updated": {
				const subscription = event.data.object as Stripe.Subscription;
				const userId = subscription.metadata?.user_id;

				if (userId) {
					// Update subscription in database
					await supabase.from("subscriptions").upsert({
						id: subscription.id,
						user_id: userId,
						status: subscription.status,
						current_period_start: new Date(
							subscription.current_period_start * 1000,
						).toISOString(),
						current_period_end: new Date(
							subscription.current_period_end * 1000,
						).toISOString(),
						cancel_at_period_end: subscription.cancel_at_period_end,
						updated_at: new Date().toISOString(),
					});

					// Update user profile
					await supabase
						.from("profiles")
						.update({
							subscription_status: subscription.status,
						})
						.eq("id", userId);
				}
				break;
			}

			case "customer.subscription.deleted": {
				const subscription = event.data.object as Stripe.Subscription;
				const userId = subscription.metadata?.user_id;

				if (userId) {
					// Update subscription status
					await supabase
						.from("subscriptions")
						.update({
							status: "canceled",
							updated_at: new Date().toISOString(),
						})
						.eq("id", subscription.id);

					// Update user profile
					await supabase
						.from("profiles")
						.update({
							subscription_status: "canceled",
							subscription_tier: null,
						})
						.eq("id", userId);

					// Send cancellation event to Encharge
					await sendEnchargeEvent(userId, "subscription_cancelled", {
						customerName: "Valued Customer",
						cancellationReason:
							subscription.cancellation_details?.reason || "user_initiated",
					});
				}
				break;
			}

			case "invoice.payment_failed": {
				const invoice = event.data.object as Stripe.Invoice;
				const subscriptionId = invoice.subscription;

				if (subscriptionId) {
					// Update subscription status
					await supabase
						.from("subscriptions")
						.update({
							status: "past_due",
							updated_at: new Date().toISOString(),
						})
						.eq("id", subscriptionId);

					// Get user ID from subscription
					const { data: subscription } = await supabase
						.from("subscriptions")
						.select("user_id")
						.eq("id", subscriptionId)
						.single();

					if (subscription?.user_id) {
						// Send payment failed event to Encharge
						await sendEnchargeEvent(subscription.user_id, "payment_failed", {
							customerName: invoice.customer_name || "Valued Customer",
							amount: (invoice.amount_due || 0) / 100,
							retryDate: new Date(
								Date.now() + 3 * 24 * 60 * 60 * 1000,
							).toLocaleDateString(),
							failureReason:
								invoice.last_finalization_error?.message || "Payment failed",
						});
					}
				}
				break;
			}
		}

		return new Response(JSON.stringify({ received: true }), {
			headers: { "Content-Type": "application/json" },
			status: 200,
		});
	} catch (error) {
		console.error("Webhook error:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			headers: { "Content-Type": "application/json" },
			status: 400,
		});
	}
});
