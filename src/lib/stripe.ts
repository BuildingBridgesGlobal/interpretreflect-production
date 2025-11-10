import { loadStripe } from "@stripe/stripe-js";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
	console.warn(
		"Stripe publishable key is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file",
	);
}

export const stripePromise = stripePublishableKey
	? loadStripe(stripePublishableKey)
	: null;

export const STRIPE_PRICING_TABLE_ID = "prctbl_your_pricing_table_id"; // Replace with your actual pricing table ID
export const STRIPE_PUBLISHABLE_KEY = stripePublishableKey;

// InterpretReflect Premium Subscription
export const STRIPE_PRODUCT = {
	monthly: {
		priceId: "price_1S37dPIouyG60O9hzikj2c9h", // Live monthly price ID
		price: 12.99,
		interval: "month" as const,
	},
	annual: {
		priceId: "price_1SCiv8IouyG60O9hrqSi0tK4", // Live annual price ID
		price: 125.00,
		interval: "year" as const,
		savings: 31, // Amount saved compared to monthly ($155.88 - $125)
	},
	paymentLink: "", // Not needed for integrated checkout
	name: "InterpretReflect Essential",
	features: [
		"Access to all wellness tools",
		"Daily burnout gauge",
		"Breathing exercises",
		"Assessment tools",
		"Reflection guides",
		"AI-powered Elya wellness companion",
		"Progress tracking & insights",
		"Email support",
	],
};

// Legacy support - keep the old priceId reference
export const STRIPE_PRICE_ID = STRIPE_PRODUCT.monthly.priceId;

// Keep for backwards compatibility
export const STRIPE_PRODUCTS = {
	BASIC: STRIPE_PRODUCT,
};
