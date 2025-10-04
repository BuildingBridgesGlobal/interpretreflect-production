import { ArrowLeft, Shield } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export function PrivacyPolicy() {
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
								className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all"
								style={{
									background:
										"linear-gradient(135deg, var(--color-green-600), var(--color-green-500))",
									color: "#FFFFFF",
									boxShadow: "0 2px 8px rgba(45, 95, 63, 0.2)",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform = "translateY(-1px)";
									e.currentTarget.style.boxShadow =
										"0 4px 12px rgba(45, 95, 63, 0.3)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = "translateY(0)";
									e.currentTarget.style.boxShadow =
										"0 2px 8px rgba(45, 95, 63, 0.2)";
								}}
							>
								<ArrowLeft className="h-5 w-5" style={{ color: "#FFFFFF" }} />
								<Shield className="h-5 w-5" style={{ color: "#FFFFFF" }} />
								<span className="text-base">InterpretReflect™</span>
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Content */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Title and Intro */}
				<div className="text-center mb-8">
					<h1
						className="text-4xl md:text-5xl font-bold mb-3"
						style={{ color: "#1A1A1A" }}
					>
						Privacy Policy
					</h1>
					<p className="text-sm mb-4" style={{ color: "#6B7C6B" }}>
						Last updated: January 2025
					</p>
					<p
						className="text-base font-medium mb-6"
						style={{ color: "#2D5F3F" }}
					>
						Your Privacy Matters
					</p>
				</div>

				<div
					className="rounded-2xl p-6 mb-6"
					style={{
						backgroundColor: "#FFFFFF",
						boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
					}}
				>
					<p className="text-base leading-relaxed" style={{ color: "#3A3A3A" }}>
						InterpretReflect is committed to protecting your personal
						information and transparency in how we handle your data. This policy
						explains what we collect, how we use it, and your rights.
					</p>
				</div>

				{/* 1. What We Collect */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-3"
							style={{ color: "#1A1A1A" }}
						>
							1. What We Collect
						</h2>
						<div className="space-y-2" style={{ color: "#3A3A3A" }}>
							<p className="text-sm font-semibold">Account Information</p>
							<p className="text-sm mb-2">
								Email, name, interpreting credentials.
							</p>

							<p className="text-sm font-semibold">Wellness Responses</p>
							<p className="text-sm mb-2">
								Your entries in reflections, assessments, or journaling tools.
							</p>

							<p className="text-sm font-semibold">Service Usage</p>
							<p className="text-sm mb-2">
								Non-identifiable analytics only; we do not track you across
								sites.
							</p>

							<p className="text-sm font-semibold">Payments</p>
							<p className="text-sm mb-2">
								Managed securely by Stripe; we do not store your payment
								details.
							</p>

							<p
								className="mt-3 text-sm font-medium"
								style={{ color: "#2D5F3F" }}
							>
								Important: We do not collect information about your own clients
								or assignments unless you share it in a reflection.
							</p>
						</div>
					</div>
				</section>

				{/* 2. How We Protect Your Data */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-3"
							style={{ color: "#1A1A1A" }}
						>
							2. How We Protect Your Data
						</h2>
						<div className="space-y-1.5 text-sm" style={{ color: "#3A3A3A" }}>
							<p>
								• <strong>Encryption:</strong> All data is encrypted in transit
								and at rest.
							</p>
							<p>
								• <strong>Access:</strong> Only you (and no one else) can view
								your personal reflections.
							</p>
							<p>
								• <strong>Industry Best Practices:</strong> Security protocols
								are in place and regularly reviewed.
							</p>
							<p>
								• <strong>Audit & Updates:</strong> Security is regularly
								checked, and we work to improve protections.
							</p>
						</div>
					</div>
				</section>

				{/* 3. Compliance Notice */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6"
						style={{
							backgroundColor: "rgba(92, 127, 79, 0.05)",
							border: "2px solid rgba(45, 95, 63, 0.2)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-3"
							style={{ color: "#1A1A1A" }}
						>
							3. Compliance Notice
						</h2>
						<div className="space-y-2 text-sm" style={{ color: "#3A3A3A" }}>
							<p>
								<strong>Not Medical/Clinical:</strong> InterpretReflect is a
								wellness tool, not a substitute for healthcare or counseling.
							</p>
							<p>
								<strong>GDPR:</strong> GDPR compliance features are in
								development.
							</p>
						</div>
					</div>
				</section>

				{/* 4. Your Choices & Rights */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-3"
							style={{ color: "#1A1A1A" }}
						>
							4. Your Choices & Rights
						</h2>
						<div className="space-y-1.5 text-sm" style={{ color: "#3A3A3A" }}>
							<p>
								• <strong>Privacy First:</strong> We never sell or share your
								data with third parties for marketing.
							</p>
							<p>
								• <strong>Opt-In Research:</strong> We may use de-identified,
								aggregated data for research—but only with your explicit
								permission.
							</p>
							<p>
								• <strong>Manage or Delete Data:</strong> To access or delete
								your data, email us at hello@huviatechnologies.com.
							</p>
							<p>
								• <strong>Features:</strong> Data export and two-factor
								authentication are in our roadmap.
							</p>
						</div>
					</div>
				</section>

				{/* 5. Cookies */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-3"
							style={{ color: "#1A1A1A" }}
						>
							5. Cookies
						</h2>
						<div className="space-y-1.5 text-sm" style={{ color: "#3A3A3A" }}>
							<p>
								<strong>Essential Cookies:</strong> For login and security.
							</p>
							<p>
								<strong>Analytics Cookies:</strong> Anonymous usage insights;
								you can control these in your browser settings.
							</p>
						</div>
					</div>
				</section>

				{/* 6. Contact */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6 text-center"
						style={{
							background:
								"linear-gradient(145deg, rgba(107, 139, 96, 0.05) 0%, rgba(92, 127, 79, 0.05) 100%)",
							border: "2px solid rgba(45, 95, 63, 0.2)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-3"
							style={{ color: "#1A1A1A" }}
						>
							6. Contact
						</h2>
						<p className="mb-2 text-sm" style={{ color: "#3A3A3A" }}>
							Got questions about your data or privacy? Contact us at
						</p>
						<a
							href="mailto:hello@huviatechnologies.com"
							className="font-semibold text-base hover:underline"
							style={{ color: "#2D5F3F" }}
						>
							hello@huviatechnologies.com
						</a>
					</div>
				</section>

				{/* Footer */}
				<div
					className="mt-12 pt-6 text-center"
					style={{ borderTop: "1px solid #E8E5E0" }}
				>
					<button
						onClick={() => navigate("/")}
						className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold transition-all text-sm"
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
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Home
					</button>
				</div>
			</div>
		</div>
	);
}
