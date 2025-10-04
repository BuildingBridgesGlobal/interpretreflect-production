import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
	apiVersion: "2023-10-16",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
	try {
		const { priceId, userId, userEmail, successUrl, cancelUrl, promotionCode } =
			await req.json();

		// Verify the user exists
		const supabase = createClient(supabaseUrl, supabaseServiceKey);

		const { data: user, error: userError } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", userId)
			.single();

		if (userError && userError.code !== "PGRST116") {
			throw new Error("User not found");
		}

		// Check if customer exists in Stripe
		let customerId = user?.stripe_customer_id;

		if (!customerId) {
			// Create a new customer in Stripe
			const customer = await stripe.customers.create({
				email: userEmail,
				metadata: {
					supabase_user_id: userId,
				},
			});
			customerId = customer.id;

			// Save the Stripe customer ID to the user's profile
			await supabase
				.from("profiles")
				.update({ stripe_customer_id: customerId })
				.eq("id", userId);
		}

		// Prepare session configuration
		const sessionConfig: any = {
			customer: customerId,
			payment_method_types: ["card"],
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			mode: "subscription",
			success_url: successUrl,
			cancel_url: cancelUrl,
			allow_promotion_codes: true, // Enable promotion code input on checkout
			metadata: {
				user_id: userId,
			},
			subscription_data: {
				trial_period_days: 7, // Default 7-day free trial
				metadata: {
					user_id: userId,
				},
			},
		};

		// If a promotion code is provided, apply it and customize trial
		if (promotionCode) {
			try {
				const promotionCodes = await stripe.promotionCodes.list({
					code: promotionCode,
					active: true,
					limit: 1,
				});

				if (promotionCodes.data.length > 0) {
					sessionConfig.discounts = [
						{
							promotion_code: promotionCodes.data[0].id,
						},
					];

					// If this is BETA30DAYS, add 30-day trial and special metadata
					if (promotionCode.toUpperCase() === "BETA30DAYS") {
						sessionConfig.subscription_data.trial_period_days = 30;
						sessionConfig.subscription_data.metadata = {
							...sessionConfig.subscription_data.metadata,
							user_type: "beta_tester",
							signup_source: "BETA30DAYS",
						};
					}
				}
			} catch (error) {
				console.error("Error applying promotion code:", error);
				// Continue with session creation even if promo code fails
			}
		}

		// Create checkout session
		const session = await stripe.checkout.sessions.create(sessionConfig);

		return new Response(JSON.stringify({ sessionId: session.id }), {
			headers: { "Content-Type": "application/json" },
			status: 200,
		});
	} catch (error) {
		console.error("Error creating checkout session:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			headers: { "Content-Type": "application/json" },
			status: 400,
		});
	}
});
