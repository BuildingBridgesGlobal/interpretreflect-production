import { CheckCircle, Sparkles, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { enchargeService } from "../services/enchargeService";

interface WaitlistModalProps {
	isOpen: boolean;
	onClose: () => void;
	plan: "professional" | "organizations";
}

const WaitlistModal: React.FC<WaitlistModalProps> = ({
	isOpen,
	onClose,
	plan,
}) => {
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [organization, setOrganization] = useState("");
	const [message, setMessage] = useState("");
	const [submitted, setSubmitted] = useState(false);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Store waitlist data in localStorage for now
		const waitlistData = {
			plan,
			email,
			name,
			organization: plan === "organizations" ? organization : "",
			message,
			timestamp: new Date().toISOString(),
		};

		const existing = localStorage.getItem("waitlist") || "[]";
		const waitlist = JSON.parse(existing);
		waitlist.push(waitlistData);
		localStorage.setItem("waitlist", JSON.stringify(waitlist));

		// Add to Encharge waitlist
		try {
			await enchargeService.addToWaitlist(
				email,
				name,
				plan === "professional" ? "professional_plan" : "organizations_plan"
			);
			console.log("Successfully added to Encharge waitlist");
		} catch (error) {
			console.error("Failed to add to Encharge waitlist:", error);
		}

		setSubmitted(true);

		// Auto-close after 3 seconds
		setTimeout(() => {
			onClose();
			setSubmitted(false);
			setEmail("");
			setName("");
			setOrganization("");
			setMessage("");
		}, 3000);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
				<div className="p-6 border-b border-gray-200 bg-gradient-to-r from-sage-50 to-green-50 rounded-t-2xl">
					<button
						onClick={onClose}
						className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
						aria-label="Close modal"
					>
						<X className="w-5 h-5 text-gray-500" />
					</button>

					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-gradient-to-br from-sage-500 to-green-500 rounded-lg flex items-center justify-center">
							<Sparkles className="w-5 h-5 text-white" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-gray-900">
								Join the{" "}
								{plan === "professional" ? "Professional" : "Organizations"}{" "}
								Waitlist
							</h2>
							<p className="text-sm text-gray-600 mt-1">
								{plan === "professional"
									? "Be first to access advanced features in Q2 2026"
									: "Let's discuss your organization's needs"}
							</p>
						</div>
					</div>
				</div>

				{!submitted ? (
					<form onSubmit={handleSubmit} className="p-6 space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Name *
							</label>
							<input
								type="text"
								id="name"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
								placeholder="Your name"
							/>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Email *
							</label>
							<input
								type="email"
								id="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
								placeholder="your@email.com"
							/>
						</div>

						{plan === "organizations" && (
							<div>
								<label
									htmlFor="organization"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Organization *
								</label>
								<input
									type="text"
									id="organization"
									required
									value={organization}
									onChange={(e) => setOrganization(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
									placeholder="Your organization name"
								/>
							</div>
						)}

						<div>
							<label
								htmlFor="message"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Message (Optional)
							</label>
							<textarea
								id="message"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								rows={3}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
								placeholder={
									plan === "professional"
										? "Tell us what features you're most excited about..."
										: "Tell us about your team's needs..."
								}
							/>
						</div>

						<button
							type="submit"
							className="w-full py-3 bg-gradient-to-r from-sage-500 to-green-500 text-white rounded-lg font-semibold hover:from-sage-600 hover:to-green-600 transition-all"
						>
							Join Waitlist
						</button>

						<p className="text-xs text-center text-gray-500">
							We'll notify you as soon as the{" "}
							{plan === "professional"
								? "Professional plan"
								: "Organizations plan"}{" "}
							is available. No spam, ever.
						</p>
					</form>
				) : (
					<div className="p-8 text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<CheckCircle className="w-8 h-8 text-green-500" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							You're on the list!
						</h3>
						<p className="text-gray-600">
							We'll email you at <strong>{email}</strong> when the{" "}
							{plan === "professional" ? "Professional" : "Organizations"} plan
							launches.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default WaitlistModal;
