import { ArrowLeft, FileText } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export function TermsOfService() {
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
								<FileText className="h-5 w-5" style={{ color: "#FFFFFF" }} />
								<span className="text-base">InterpretReflect™</span>
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Content */}
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Title and Intro */}
				<div className="text-center mb-12">
					<h1
						className="text-4xl md:text-5xl font-bold mb-4"
						style={{ color: "#1A1A1A" }}
					>
						Terms of Service
					</h1>
					<p className="text-sm mb-6" style={{ color: "#6B7C6B" }}>
						Effective Date: January 2025
					</p>
				</div>

				{/* 1. Introduction */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-1"
							style={{ color: "#1A1A1A" }}
						>
							1. Introduction
						</h2>
						<p className="text-base leading-relaxed" style={{ color: "#3A3A3A" }}>
							These Terms of Service ("Terms") govern your access to and use of
							the InterpretReflect™ wellness platform. By using our services,
							you acknowledge and accept these Terms in full.
						</p>
					</div>
				</section>

				{/* 2. Service Description */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-1"
							style={{ color: "#1A1A1A" }}
						>
							2. Service Description
						</h2>
						<div className="space-y-3" style={{ color: "#3A3A3A" }}>
							<p className="mb-2 text-base">
								InterpretReflect is a platform designed for professional
								interpreters, offering:
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								<div className="flex items-start">
									<span className="mr-2 text-base">•</span>
									<p className="text-base">
										Burnout assessment and monitoring tools
									</p>
								</div>
								<div className="flex items-start">
									<span className="mr-2 text-base">•</span>
									<p className="text-base">Guided reflection and journaling</p>
								</div>
								<div className="flex items-start">
									<span className="mr-2 text-base">•</span>
									<p className="text-base">
										Stress management and recovery programming
									</p>
								</div>
								<div className="flex items-start">
									<span className="mr-2 text-base">•</span>
									<p className="text-base">
										Professional development tracking features
									</p>
								</div>
								<div className="flex items-start">
									<span className="mr-2 text-base">•</span>
									<p className="text-base">
										AI-powered wellness companion (Elya)
									</p>
								</div>
								<div className="flex items-start">
									<span className="mr-2 text-base">•</span>
									<p className="text-base">
										Continuing education credits (Professional Plan)
									</p>
								</div>
							</div>
							<p
								className="mt-3 text-base font-semibold"
								style={{ color: "#5C7F4F" }}
							>
								InterpretReflect is not a provider of medical or psychological
								treatment.
							</p>
						</div>
					</div>
				</section>

				{/* 3. User Obligations */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-1"
							style={{ color: "#1A1A1A" }}
						>
							3. User Obligations
						</h2>
						<div className="space-y-3" style={{ color: "#3A3A3A" }}>
							<p className="mb-2 text-base">
								By using InterpretReflect, you agree to:
							</p>
							<div className="space-y-1.5 text-base">
								<p>
									• Provide accurate information during registration and account
									maintenance
								</p>
								<p>
									• Maintain the confidentiality of your account credentials
								</p>
								<p>
									• Use the platform solely for your personal wellness and
									professional development
								</p>
								<p>
									• Respect privacy and confidentiality within any shared or
									community features
								</p>
								<p>
									• Not copy, redistribute, or otherwise misuse proprietary
									content, tools, or intellectual property
								</p>
								<p>
									• Consult qualified professionals for any serious mental
									health concerns
								</p>
							</div>
							<p
								className="mt-3 text-base font-semibold"
								style={{ color: "#5C7F4F" }}
							>
								The platform does not substitute professional medical, mental
								health, or therapeutic services.
							</p>
						</div>
					</div>
				</section>

				{/* 4. Subscription and Payment Terms */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-1"
							style={{ color: "#1A1A1A" }}
						>
							4. Subscription and Payment Terms
						</h2>
						<div className="space-y-3" style={{ color: "#3A3A3A" }}>
							<p className="mb-2 text-base">
								InterpretReflect offers the following plans:
							</p>

							<div className="space-y-2">
								<p className="text-base">
									• <strong>Essential Plan ($12/month):</strong> All core
									wellness tools and unlimited reflection
								</p>
								<p className="text-base">
									• <strong>Professional Plan ($24/month):</strong> Essential
									features plus access to the AI companion, CEU credits, and
									advanced analytics
								</p>
								<p className="text-base">
									• <strong>Custom organizational plans:</strong> Available upon
									request
								</p>
							</div>

							<div className="mt-3">
								<p className="font-semibold mb-2 text-base">
									Subscription details:
								</p>
								<div className="space-y-1.5 text-base">
									<p>• Subscriptions renew automatically each month</p>
									<p>
										• You may cancel at any time; services remain active until
										the end of the billing cycle
									</p>
									<p>
										• Users will be notified of any changes in subscription fees
										no less than 30 days prior to implementation
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* 5. Liability Limitations */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6"
						style={{
							backgroundColor: "rgba(92, 127, 79, 0.05)",
							border: "2px solid rgba(45, 95, 63, 0.2)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-1"
							style={{ color: "#1A1A1A" }}
						>
							5. Liability Limitations
						</h2>
						<div style={{ color: "#3A3A3A" }}>
							<p className="mb-2 text-base">
								InterpretReflect services are provided "as is." The following
								limitations apply:
							</p>
							<div className="space-y-1.5 text-base">
								<p>
									• InterpretReflect does not guarantee any specific outcomes or
									results from the use of its tools or services.
								</p>
								<p>
									• InterpretReflect assumes no liability for user actions,
									decisions, or outcomes resulting from use of the platform's
									resources or recommendations.
								</p>
								<p>
									• The total liability of InterpretReflect, in any claim, is
									limited to the amount paid for the service during the prior
									twelve months.
								</p>
								<p>
									• The company is not responsible for third-party content,
									services, or conduct.
								</p>
								<p>
									• Service availability may be suspended or interrupted without
									notice for maintenance, updates, or unforeseen circumstances.
								</p>
								<p>
									• In emergencies or mental health crises, users must contact
									local emergency services.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* 6. Intellectual Property */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-1"
							style={{ color: "#1A1A1A" }}
						>
							6. Intellectual Property
						</h2>
						<p className="text-base" style={{ color: "#3A3A3A" }}>
							All content, software, and materials provided via InterpretReflect
							remain the exclusive property of InterpretReflect or its
							licensors. User-generated reflections and data remain your
							property, but you grant us a limited license to process and store
							this information as needed for service provision.
						</p>
					</div>
				</section>

				{/* 7. Modifications to These Terms */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-1"
							style={{ color: "#1A1A1A" }}
						>
							7. Modifications to These Terms
						</h2>
						<p className="text-base" style={{ color: "#3A3A3A" }}>
							We may update or revise these Terms from time to time. If material
							changes occur, you will be notified by email at least 30 days
							before the changes become effective. Continued use of the platform
							constitutes acceptance of revised Terms.
						</p>
					</div>
				</section>

				{/* 8. Contact */}
				<section className="mb-8">
					<div
						className="rounded-2xl p-6 text-center"
						style={{
							background: "rgba(92, 127, 79, 0.05)",
							border: "2px solid rgba(45, 95, 63, 0.2)",
						}}
					>
						<h2
							className="text-2xl font-bold mb-1"
							style={{ color: "#1A1A1A" }}
						>
							8. Contact
						</h2>
						<p className="mb-2 text-base" style={{ color: "#3A3A3A" }}>
							For any questions or concerns related to these Terms, please
							email:
						</p>
						<a
							href="mailto:info@interpretreflect.com"
							className="font-semibold text-base hover:underline"
							style={{ color: "#5C7F4F" }}
						>
							info@interpretreflect.com
						</a>
					</div>
				</section>

				{/* Footer */}
				<div
					className="mt-16 pt-8 text-center"
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
