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
		const { userId, returnUrl } = await req.json();

		// Get the user's Stripe customer ID
		const supabase = createClient(supabaseUrl, supabaseServiceKey);

		const { data: user, error: userError } = await supabase
			.from("profiles")
			.select("stripe_customer_id")
			.eq("id", userId)
			.single();

		if (userError || !user?.stripe_customer_id) {
			throw new Error("Customer not found");
		}

		// Create a portal session
		const session = await stripe.billingPortal.sessions.create({
			customer: user.stripe_customer_id,
			return_url: returnUrl,
		});

		return new Response(JSON.stringify({ url: session.url }), {
			headers: { "Content-Type": "application/json" },
			status: 200,
		});
	} catch (error) {
		console.error("Error creating portal session:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			headers: { "Content-Type": "application/json" },
			status: 400,
		});
	}
});
