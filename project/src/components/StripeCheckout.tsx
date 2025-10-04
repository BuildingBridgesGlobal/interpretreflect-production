import { Loader } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { stripePromise } from "../lib/stripe";

interface StripeCheckoutProps {
	priceId: string;
	buttonText?: string;
	className?: string;
	onSuccess?: () => void;
	onError?: (error: string) => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
	priceId,
	buttonText = "Subscribe Now",
	className = "",
	onSuccess,
	onError,
}) => {
	const [loading, setLoading] = useState(false);
	const { user } = useAuth();

	const handleCheckout = async () => {
		try {
			setLoading(true);

			if (!user) {
				const error = "Please sign in to continue";
				onError?.(error);
				return;
			}

			if (!stripePromise) {
				const error = "Payment system is not configured";
				onError?.(error);
				return;
			}

			const stripe = await stripePromise;

			// Create checkout session
			// In production, this should be done on your backend
			const response = await fetch("/api/create-checkout-session", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					priceId,
					userId: user.id,
					userEmail: user.email,
					successUrl: `${window.location.origin}/payment-success`,
					cancelUrl: window.location.href,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create checkout session");
			}

			const { sessionId } = await response.json();

			// Redirect to Stripe Checkout
			const { error: stripeError } = await stripe!.redirectToCheckout({
				sessionId,
			});

			if (stripeError) {
				throw stripeError;
			}

			onSuccess?.();
		} catch (err) {
			console.error("Checkout error:", err);
			const errorMessage =
				err instanceof Error ? err.message : "Failed to start checkout";
			onError?.(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			onClick={handleCheckout}
			disabled={loading}
			className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
		>
			{loading ? (
				<>
					<Loader className="w-5 h-5 animate-spin mr-2" />
					Processing...
				</>
			) : (
				buttonText
			)}
		</button>
	);
};
