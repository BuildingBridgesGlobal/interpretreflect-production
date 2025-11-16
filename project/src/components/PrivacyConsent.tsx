import type React from "react";
import { useState } from "react";

import { SECURITY_CONFIG } from "../config/security";
import { AuditLogger } from "../utils/security";
import { supabase } from "../lib/supabase";

interface PrivacyConsentProps {
	isOpen: boolean;
	onAccept: () => void;
	onDecline?: () => void;
	required?: boolean;
	userId?: string;
}

const PrivacyConsent: React.FC<PrivacyConsentProps> = ({
	isOpen,
	onAccept,
	onDecline,
	required = true,
	userId,
}) => {
	const [showDetails, setShowDetails] = useState(false);

	if (!isOpen) return null;

	const handleAccept = async () => {
		const consentData = {
			timestamp: Date.now(),
			version: "1.0",
			gdpr: SECURITY_CONFIG.privacy.gdprCompliant,
			hipaa: SECURITY_CONFIG.privacy.hipaaCompliant,
		};

		// Save to localStorage as fallback
		localStorage.setItem("privacyConsent", JSON.stringify(consentData));

		// Save to Supabase if userId is available
		if (userId) {
			try {
				const { error } = await supabase
					.from("user_profiles")
					.upsert(
						{
							user_id: userId,
							privacy_consent_accepted_at: new Date().toISOString(),
						},
						{
							onConflict: "user_id",
						}
					);

				if (error) {
					console.error("Failed to save consent to database:", error);
				} else {
					console.log("✅ Privacy consent saved to database");
				}
			} catch (error) {
				console.error("Error saving consent:", error);
			}
		}

		// Log consent
		AuditLogger.log({
			action: "PRIVACY_CONSENT_ACCEPTED",
			category: "DATA",
			severity: "INFO",
			details: consentData,
		});

		onAccept();
	};

	const handleDecline = () => {
		AuditLogger.log({
			action: "PRIVACY_CONSENT_DECLINED",
			category: "DATA",
			severity: "INFO",
		});

		if (onDecline) {
			onDecline();
		}
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
			<div
				className="rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
				style={{
					backgroundColor: "#FFFFFF",
					boxShadow: "0 25px 60px rgba(0, 0, 0, 0.15)",
				}}
			>
				<div className="p-8 border-b" style={{ borderColor: "rgba(0, 0, 0, 0.05)", backgroundColor: "#FAFAF8" }}>
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold mb-2" style={{ color: "#1A1A1A" }}>
								Your Privacy & Security
							</h2>
							<p className="text-sm" style={{ color: "#525252" }}>
								We're committed to protecting your reflections and maintaining trust
							</p>
						</div>
						{!required && (
							<button
								onClick={handleDecline}
								className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
								aria-label="Close"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						)}
					</div>
				</div>

				<div className="p-8">
					{/* Quick Data Usage Summary */}
					<div className="p-4 rounded-lg mb-6" style={{ backgroundColor: "#F0F9FF", border: "1px solid #E0F2FE" }}>
						<h3 className="font-semibold mb-3" style={{ color: "#1A1A1A" }}>
							Your Data at a Glance
						</h3>
						<ul className="text-sm space-y-2" style={{ color: "#2A2A2A" }}>
							<li>• <strong>Your Reflections:</strong> Encrypted and private - only you can access them</li>
							<li>• <strong>Your Progress:</strong> Used to personalize your wellness journey</li>
							<li>• <strong>Your Privacy:</strong> Never sold, never shared without your explicit consent</li>
							<li>• <strong>Your Control:</strong> Export, delete, or modify your data anytime</li>
						</ul>
					</div>

					{/* Key Privacy Points */}
					<div className="space-y-4 mb-6">
						<div className="p-4 rounded-lg" style={{ backgroundColor: "#FAFAF8", border: "1px solid rgba(0, 0, 0, 0.05)" }}>
							<h3 className="font-semibold text-sm mb-2" style={{ color: "#1A1A1A" }}>
								Your Reflections, Your Privacy
							</h3>
							<p className="text-sm" style={{ color: "#525252", lineHeight: "1.6" }}>
								Your personal reflections are encrypted and private.
								This space for your wellness journey remains yours alone.
								We believe privacy is essential for authentic self-care.
							</p>
						</div>

						<div className="p-4 rounded-lg" style={{ backgroundColor: "#FAFAF8", border: "1px solid rgba(0, 0, 0, 0.05)" }}>
							<h3 className="font-semibold text-sm mb-2" style={{ color: "#1A1A1A" }}>
								Secure Protection
							</h3>
							<p className="text-sm" style={{ color: "#525252", lineHeight: "1.6" }}>
								Your wellness data receives enterprise-level protection.
								We follow strict privacy guidelines and notify you of any changes
								that could affect your data.
							</p>
						</div>

						<div className="p-4 rounded-lg" style={{ backgroundColor: "#FAFAF8", border: "1px solid rgba(0, 0, 0, 0.05)" }}>
							<h3 className="font-semibold text-sm mb-2" style={{ color: "#1A1A1A" }}>
								You're In Control
							</h3>
							<p className="text-sm" style={{ color: "#525252", lineHeight: "1.6" }}>
								Download, export, or delete your data anytime.
								Your information belongs to you - we're just the trusted guardians.
							</p>
						</div>
					</div>


					{/* Expandable Details */}
					<button
						onClick={() => setShowDetails(!showDetails)}
						className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors mb-4"
						style={{ backgroundColor: "#FAFAF8", border: "1px solid rgba(0, 0, 0, 0.05)" }}
					>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
								{showDetails ? "Hide" : "Learn More About"} Data Protection
							</span>
							<span style={{ color: "#525252" }}>{showDetails ? "−" : "+"}</span>
						</div>
					</button>

					{showDetails && (
						<div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600 space-y-3">
							<div>
								<strong>Your Data Collection:</strong>
								<ul className="list-disc ml-5 mt-1 space-y-1">
									<li>Your wellness reflections (encrypted just for you)</li>
									<li>Your progress patterns (to improve your experience)</li>
									<li>Technical essentials for your security</li>
									<li>Only the profile details you choose to share</li>
								</ul>
							</div>

							<div>
								<strong>What We Never Touch:</strong>
								<ul className="list-disc ml-5 mt-1 space-y-1">
									<li>Your location or movements</li>
									<li>Third-party tracking cookies</li>
									<li>Your biometric data</li>
									<li>External health records without your explicit permission</li>
								</ul>
							</div>

							<div>
								<strong>Your Rights & Control:</strong>
								<ul className="list-disc ml-5 mt-1 space-y-1">
									<li>Access all your data instantly</li>
									<li>Correct or delete anything, anytime</li>
									<li>Opt-out of optional features</li>
									<li>Get notified within 72 hours if anything affects your data</li>
									<li>Move your data wherever you want</li>
								</ul>
							</div>

							<div>
								<strong>How We Keep You Safe:</strong>
								<ul className="list-disc ml-5 mt-1 space-y-1">
									<li>Military-grade 256-bit AES encryption</li>
									<li>Regular independent security audits</li>
									<li>Strict access controls with full audit trails</li>
									<li>24/7 monitoring for your protection</li>
									<li>Automatic data anonymization after {SECURITY_CONFIG.privacy.anonymizeAfterDays} days</li>
								</ul>
							</div>
						</div>
					)}

					{/* Consent Actions */}
					<div className="p-4 rounded-lg mb-6" style={{ backgroundColor: "#FAFAF8", border: "1px solid rgba(0, 0, 0, 0.05)" }}>
						<div className="text-sm" style={{ color: "#2A2A2A" }}>
							<strong>By continuing, you acknowledge:</strong>
							<ul className="list-disc ml-5 mt-2 space-y-1">
								<li>You understand how we protect your privacy</li>
								<li>Your reflections will be encrypted and secured</li>
								<li>You can change your privacy settings anytime</li>
							</ul>
						</div>
					</div>


					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-3">
						<button
							onClick={handleAccept}
							className="flex-1 px-6 py-3 rounded-lg font-medium text-white transition-all hover:scale-105"
							style={{
								background: "linear-gradient(135deg, #2D5F3F, #5B9378)",
								boxShadow: "0 4px 15px rgba(27, 94, 32, 0.3)",
							}}
						>
							I Understand and Accept
						</button>

						{!required && (
							<button
								onClick={handleDecline}
								className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors"
								style={{
									backgroundColor: "#FFFFFF",
									border: "2px solid #E5E7EB",
									color: "#525252",
								}}
							>
								I Need More Time
							</button>
						)}
					</div>

					{/* Quick Support Access */}
					<div className="text-center mt-6 text-sm" style={{ color: "#525252" }}>
						<p>
							Questions? View our <a href="/privacy" className="underline" style={{ color: "#2D5F3F" }}>Privacy Policy</a> or <a href="/terms" className="underline" style={{ color: "#2D5F3F" }}>Terms of Service</a>
						</p>
					</div>

					{/* Trust Badges */}
					<div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-200">
						<div className="text-center">
							<span className="text-xs text-gray-600 font-medium uppercase tracking-wide block">
								HIPAA Aligned
							</span>
							<span className="text-xs text-gray-500">Professional interpreter protection</span>
						</div>
						<div className="text-center">
							<span className="text-xs text-gray-600 font-medium uppercase tracking-wide block">
								256-bit Encryption
							</span>
							<span className="text-xs text-gray-500">Military-grade security</span>
						</div>
						<div className="text-center">
							<span className="text-xs text-gray-600 font-medium uppercase tracking-wide block">
								GDPR Compliant
							</span>
							<span className="text-xs text-gray-500">Your rights protected</span>
						</div>
						<div className="text-center">
							<span className="text-xs text-gray-600 font-medium uppercase tracking-wide block">
								Auto-Logout
							</span>
							<span className="text-xs text-gray-500">Always secure</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PrivacyConsent;