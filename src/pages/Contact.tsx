import { ArrowLeft, Mail, MessageSquare } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export function Contact() {
	const navigate = useNavigate();

	return (
		<div style={{ backgroundColor: "#FAF9F6", minHeight: "100vh" }}>
			{/* Header */}
			<nav
				className="sticky top-0 z-50"
				style={{
					backgroundColor: "rgba(250, 249, 246, 0.95)",
					backdropFilter: "blur(10px)",
					borderBottom: "1px solid rgba(45, 95, 63, 0.2)",
				}}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<button
								onClick={() => navigate("/")}
								className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
							>
								<ArrowLeft className="h-5 w-5" style={{ color: "#5B9378" }} />
								<div className="flex items-center space-x-3">
									<div
										className="p-2 rounded-lg"
										style={{
											background:
												"linear-gradient(145deg, #5B9378 0%, #5F7F55 100%)",
											boxShadow: "0 2px 8px rgba(107, 139, 96, 0.3)",
										}}
									>
										<MessageSquare
											className="h-6 w-6"
											style={{ color: "#FFFFFF" }}
										/>
									</div>
									<span
										className="text-xl font-bold"
										style={{ color: "#1A1A1A" }}
									>
										InterpretReflect™
									</span>
								</div>
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Content */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<h1 className="text-4xl font-bold mb-4" style={{ color: "#1A1A1A" }}>
					Contact Us
				</h1>

				<p className="text-lg mb-8" style={{ color: "#5A5A5A" }}>
					We're here to support your wellness journey. Reach out with questions,
					feedback, or partnership inquiries.
				</p>

				{/* Primary Contact Info */}
				<div
					className="rounded-2xl p-8 mb-8"
					style={{
						backgroundColor: "#FFFFFF",
						boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
					}}
				>
					<div className="flex items-start mb-4">
						<Mail className="h-6 w-6 mr-3 mt-1" style={{ color: "#5B9378" }} />
						<div className="flex-1">
							<p className="font-semibold mb-2" style={{ color: "#1A1A1A" }}>
								<strong>Email:</strong>{" "}
								<a
									href="mailto:hello@huviatechnologies.com"
									className="hover:underline"
									style={{ color: "#5B9378" }}
								>
									hello@huviatechnologies.com
								</a>
							</p>
							<p style={{ color: "#5A5A5A" }}>
								<strong>Response Time:</strong> Within 48 hours during business
								days (Eastern Time)
							</p>
						</div>
					</div>
				</div>

				{/* Communication Accessibility */}
				<div
					className="rounded-xl p-6 mb-6"
					style={{
						backgroundColor: "rgba(107, 139, 96, 0.1)",
						border: "1px solid rgba(107, 139, 96, 0.2)",
					}}
				>
					<h3
						className="text-lg font-semibold mb-2"
						style={{ color: "#5C7F4F" }}
					>
						Communication Accessibility
					</h3>
					<p style={{ color: "#1A1A1A" }}>
						We welcome contact from all interpreters and will communicate in
						your preferred format - just let us know how we can best assist you.
					</p>
				</div>

				{/* Emergency Disclaimer */}
				<div
					className="rounded-xl p-6 mb-8"
					style={{
						backgroundColor: "rgba(244, 67, 54, 0.05)",
						border: "1px solid rgba(244, 67, 54, 0.2)",
					}}
				>
					<h3
						className="text-lg font-semibold mb-2"
						style={{ color: "#8B4444" }}
					>
						Important Notice
					</h3>
					<p style={{ color: "#1A1A1A" }}>
						For mental health emergencies, please contact your local crisis
						hotline or emergency services immediately.
					</p>
				</div>

				{/* What We Can Help With */}
				<div
					className="rounded-2xl p-8 mb-8"
					style={{
						backgroundColor: "#FFFFFF",
						boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
					}}
				>
					<h2 className="text-xl font-bold mb-4" style={{ color: "#1A1A1A" }}>
						What We Can Help With:
					</h2>
					<ul className="space-y-2" style={{ color: "#5A5A5A" }}>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>Account issues, billing, and technical support</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>Getting started with InterpretReflect tools</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>
								Partnership opportunities (agencies, schools, organizations)
							</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>Privacy concerns and legal inquiries</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>Media requests</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">•</span>
							<span>General wellness platform questions</span>
						</li>
					</ul>
				</div>

				{/* Helpful Resources */}
				<div
					className="rounded-2xl p-8 mb-12"
					style={{
						backgroundColor: "#FFFFFF",
						boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
					}}
				>
					<h2 className="text-xl font-bold mb-4" style={{ color: "#1A1A1A" }}>
						Helpful Resources
					</h2>

					<div>
						<h3 className="font-semibold mb-3" style={{ color: "#5C7F4F" }}>
							Common Topics:
						</h3>
						<ul className="space-y-2" style={{ color: "#5A5A5A" }}>
							<li className="flex items-start">
								<span className="mr-2">•</span>
								<span>Understanding your burnout assessment</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2">•</span>
								<span>Using reflection tools effectively</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2">•</span>
								<span>Managing your subscription</span>
							</li>
							<li className="flex items-start">
								<span className="mr-2">•</span>
								<span>Privacy and data security</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Office Location */}
				<div className="mt-12 text-center">
					<h3
						className="text-lg font-semibold mb-2"
						style={{ color: "#1A1A1A" }}
					>
						InterpretReflect
					</h3>
					<p style={{ color: "#5A5A5A" }}>
						Supporting interpreter wellness worldwide
					</p>
				</div>

				{/* Footer */}
				<div
					className="mt-16 pt-8 text-center"
					style={{ borderTop: "1px solid #E8E5E0" }}
				>
					<button
						onClick={() => navigate("/")}
						className="inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all"
						style={{
							backgroundColor: "#FFFFFF",
							color: "#5B9378",
							border: "2px solid #5B9378",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = "#F8FBF6";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = "#FFFFFF";
						}}
					>
						<ArrowLeft className="h-5 w-5 mr-2" />
						Back to Home
					</button>
				</div>
			</div>
		</div>
	);
}
