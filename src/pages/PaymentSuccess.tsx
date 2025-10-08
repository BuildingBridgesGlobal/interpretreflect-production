import { ArrowRight, CheckCircle, Loader, Mail } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

export const PaymentSuccess: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
	const [userEmail, setUserEmail] = useState<string>("");

	useEffect(() => {
		// Get email from URL params or localStorage
		const params = new URLSearchParams(window.location.search);
		const email = params.get('email') || localStorage.getItem('signup_email') || "";
		if (email) {
			setUserEmail(email);
		}

		// Verify payment status and user session
		const verifyPayment = async () => {
			try {
				// Wait a moment for auth to load
				await new Promise((resolve) => setTimeout(resolve, 2000));

				// Check if user is logged in
				if (!user) {
					console.log("No user found after payment - email verification may be required");
					// User isn't logged in, likely because email verification is required
					setEmailVerificationRequired(true);
				}

				setLoading(false);
			} catch (error) {
				console.error("Error verifying payment:", error);
				navigate("/pricing");
			}
		};

		verifyPayment();
	}, [navigate, user]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
				<div className="text-center">
					<Loader
						className="w-12 h-12 animate-spin mx-auto mb-4"
						style={{ color: "#5C7F4F" }}
					/>
					<p className="text-gray-600">Verifying your payment...</p>
				</div>
			</div>
		);
	}

	// Show welcome message if user isn't logged in yet
	if (emailVerificationRequired) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
				<div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
					<div className="mb-6">
						<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<CheckCircle
								className="w-12 h-12"
								style={{ color: "#5C7F4F" }}
							/>
						</div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Welcome to InterpretReflect!
						</h1>
						<p className="text-gray-600">Thank you for signing up</p>
					</div>

					<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
						<p className="text-sm text-gray-800 leading-relaxed">
							We're excited to help you on your interpreting journey and reduce your likelihood of burnout.
							Your wellness matters, and we're here to support you every step of the way.
						</p>
					</div>

					<div className="bg-gray-50 rounded-lg p-4 mb-6">
						<p className="text-sm text-gray-700">
							Your subscription is active! You now have full access to all premium wellness tools designed
							specifically for interpreters.
						</p>
					</div>

					<button
						onClick={() => {
							// Force reload to ensure user session is properly recognized
							window.location.href = "/";
						}}
						className="w-full text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center"
						style={{
							background: "#5C7F4F",
							cursor: "pointer",
						}}
					>
						Get Started
						<ArrowRight className="w-5 h-5 ml-2" />
					</button>

					<div className="mt-6 pt-6 border-t border-gray-200">
						<p className="text-sm text-gray-500">
							Need help?{" "}
							<a
								href="mailto:hello@huviatechnologies.com"
								className="hover:underline"
								style={{ color: "#5C7F4F" }}
							>
								hello@huviatechnologies.com
							</a>
						</p>
					</div>
				</div>
			</div>
		);
	}

	// User is logged in - show normal success page
	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
			<div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
				<div className="mb-6">
					<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<CheckCircle
							className="w-12 h-12"
							style={{ color: "#5C7F4F" }}
						/>
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Payment Successful!
					</h1>
					<p className="text-gray-600">Welcome to your wellness journey</p>
				</div>

				<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
					<p className="text-sm text-gray-800 leading-relaxed mb-2">
						We're excited to help you on your interpreting journey and reduce your likelihood of burnout.
						Your wellness matters, and we're here to support you every step of the way.
					</p>
					<p className="text-sm text-gray-700">
						You now have full access to all premium wellness tools designed specifically for interpreters.
					</p>
				</div>

				<button
					onClick={() => {
						// Force reload to ensure user session is properly recognized
						window.location.href = "/";
					}}
					className="w-full text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center"
					style={{
						background: "#5C7F4F",
						cursor: "pointer",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "#5C7F4F";
						e.currentTarget.style.opacity = "1";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = "#5C7F4F";
						e.currentTarget.style.opacity = "1";
					}}
				>
					Go to Dashboard
					<ArrowRight className="w-5 h-5 ml-2" />
				</button>

				<div className="mt-6 pt-6 border-t border-gray-200">
					<p className="text-sm text-gray-500">
						Need help? Contact our support team at{" "}
						<a
							href="mailto:hello@huviatechnologies.com"
							className="hover:underline"
							style={{ color: "#5C7F4F" }}
						>
							hello@huviatechnologies.com
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};
