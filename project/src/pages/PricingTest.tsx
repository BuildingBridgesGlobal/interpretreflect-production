import { Check } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { STRIPE_PRODUCT } from "../lib/stripe";

export const PricingTest: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	const handleTestCheckout = () => {
		// Open Stripe Dashboard to create a payment link
		window.open(
			"https://dashboard.stripe.com/test/payment-links/create",
			"_blank",
		);
		setMessage(
			`Opening Stripe Dashboard to create a Payment Link. 
      Select your "Basic Plan" product and create the link.
      Once created, you can share that link with customers for payments!`,
		);
	};

	const handleDeployGuide = () => {
		setMessage(
			`To enable direct checkout from your app, deploy Supabase Edge Functions:
      
      1. Install: npm install -g supabase
      2. Login: supabase login  
      3. Deploy: supabase functions deploy create-checkout-session
      
      This will enable the full integrated checkout experience.`,
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Stripe Test Mode
					</h1>
					<p className="text-xl text-gray-600">
						Testing checkout without authentication
					</p>
					<p className="text-sm text-red-600 mt-2">
						⚠️ This is for testing only - remove in production
					</p>
				</div>

				{message && (
					<div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-center max-w-2xl mx-auto">
						{message}
					</div>
				)}

				<div className="max-w-md mx-auto">
					<div className="bg-white rounded-xl shadow-lg p-8 relative ring-2 ring-indigo-500">
						<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
							<span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
								TEST MODE
							</span>
						</div>

						<div className="text-center mb-8">
							<h2 className="text-3xl font-bold text-gray-900 mb-4">
								{STRIPE_PRODUCT.name}
							</h2>
							<div className="mb-4">
								<span className="text-5xl font-bold text-gray-900">
									${STRIPE_PRODUCT.price}
								</span>
								<span className="text-gray-600 text-xl">/month</span>
							</div>
						</div>

						<ul className="space-y-4 mb-8">
							{STRIPE_PRODUCT.features.map((feature, index) => (
								<li key={index} className="flex items-start">
									<Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
									<span className="text-gray-700">{feature}</span>
								</li>
							))}
						</ul>

						<button
							onClick={handleTestCheckout}
							className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
						>
							Create Payment Link in Stripe →
						</button>

						<button
							onClick={handleDeployGuide}
							className="w-full mt-3 py-3 px-6 rounded-lg font-semibold transition-colors bg-gray-200 hover:bg-gray-300 text-gray-800"
						>
							How to Enable Direct Checkout
						</button>

						<div className="mt-6 p-4 bg-gray-50 rounded-lg">
							<p className="text-sm text-gray-600 font-semibold mb-2">
								Test Card Numbers:
							</p>
							<ul className="text-xs text-gray-600 space-y-1">
								<li>✅ Success: 4242 4242 4242 4242</li>
								<li>❌ Decline: 4000 0000 0000 0002</li>
								<li>🔐 3D Secure: 4000 0025 0000 3155</li>
							</ul>
							<p className="text-xs text-gray-500 mt-2">
								Use any future date and any 3-digit CVC
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
