import { ArrowRight, CheckCircle, Loader } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

export const PaymentSuccess: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Verify payment status (you'd typically check with your backend)
		const verifyPayment = async () => {
			try {
				// In production, verify the payment with your backend
				// For now, we'll just simulate a delay
				await new Promise((resolve) => setTimeout(resolve, 2000));
				setLoading(false);
			} catch (error) {
				console.error("Error verifying payment:", error);
				navigate("/pricing");
			}
		};

		verifyPayment();
	}, [navigate]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
				<div className="text-center">
					<Loader
						className="w-12 h-12 animate-spin mx-auto mb-4"
						style={{ color: "#2D5F3F" }}
					/>
					<p className="text-gray-600">Verifying your payment...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
			<div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
				<div className="mb-6">
					<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<CheckCircle
							className="w-12 h-12"
							style={{ color: "#2D5F3F" }}
						/>
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Payment Successful!
					</h1>
					<p className="text-gray-600">Welcome to your wellness journey</p>
				</div>

				<div className="bg-gray-50 rounded-lg p-4 mb-6">
					<p className="text-sm text-gray-700 mb-2">
						Thank you for your subscription! You now have full access to all
						premium features.
					</p>
					<p className="text-sm text-gray-600">
						A confirmation email has been sent to {user?.email}
					</p>
				</div>

				<button
					onClick={() => navigate("/")}
					className="w-full text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center"
					style={{
						background: "#2D5F3F",
						cursor: "pointer",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "#2D5F3F";
						e.currentTarget.style.opacity = "1";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = "#2D5F3F";
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
							style={{ color: "#2D5F3F" }}
						>
							hello@huviatechnologies.com
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};
