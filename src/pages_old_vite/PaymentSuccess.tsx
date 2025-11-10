import { ArrowRight, CheckCircle } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const PaymentSuccess: React.FC = () => {
	const navigate = useNavigate();
	const [userEmail, setUserEmail] = useState<string>("");

	useEffect(() => {
		// Get email from localStorage
		const email = localStorage.getItem('signup_email') || "";
		if (email) {
			setUserEmail(email);
		}
	}, []);

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
					<p className="text-gray-600">Your account has been created</p>
				</div>

				<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
					<p className="text-sm text-gray-800 leading-relaxed mb-3">
						Thank you for subscribing! Your account has been created and your subscription is now active.
					</p>
					<p className="text-sm text-gray-700 font-medium">
						Please sign in with your email and password to get started.
					</p>
				</div>

				{userEmail && (
					<div className="bg-gray-50 rounded-lg p-4 mb-6">
						<p className="text-xs text-gray-500 mb-1">Your email:</p>
						<p className="text-sm font-medium text-gray-900">{userEmail}</p>
					</div>
				)}

				<button
					onClick={() => {
						navigate("/");
					}}
					className="w-full text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
					style={{
						background: "#5C7F4F",
					}}
				>
					Sign In to Get Started
					<ArrowRight className="w-5 h-5 ml-2" />
				</button>

				<div className="mt-6 pt-6 border-t border-gray-200">
					<p className="text-sm text-gray-500">
						Need help?{" "}
						<a
							href="mailto:info@interpretreflect.com"
							className="hover:underline"
							style={{ color: "#5C7F4F" }}
						>
							info@interpretreflect.com
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};
