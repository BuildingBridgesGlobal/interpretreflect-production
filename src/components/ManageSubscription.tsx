import {
	AlertCircle,
	ArrowDownRight,
	ArrowUpRight,
	Calendar,
	CheckCircle,
	ChevronRight,
	CreditCard,
	Download,
	FileText,
	HelpCircle,
	Mail,
	Package,
	Shield,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface SubscriptionData {
	plan_name: "essential" | "professional" | "organization" | "free";
	price: number;
	status: "active" | "inactive" | "trial" | "cancelled";
	next_billing_date: string | null;
	payment_method: {
		type: "card";
		brand: string;
		last4: string;
	} | null;
	stripe_customer_id?: string;
	stripe_subscription_id?: string;
	trial_ends_at?: string;
	cancelled_at?: string;
}

interface Invoice {
	id: string;
	date: string;
	amount: number;
	status: "paid" | "pending";
	invoice_pdf: string;
	description: string;
}

const PLAN_DETAILS = {
	free: {
		display: "Free",
		price: 0,
		features: ["Basic features", "Limited reflections"],
	},
	essential: {
		display: "Essential",
		price: 12,
		features: ["All core features", "Unlimited reflections", "Email support"],
	},
	professional: {
		display: "Professional",
		price: 24,
		features: [
			"Everything in Essential",
			"Team features",
			"Priority support",
			"Advanced analytics",
		],
	},
	organization: {
		display: "Organization",
		price: null,
		features: [
			"Custom pricing",
			"Enterprise features",
			"Dedicated support",
			"Custom integrations",
		],
	},
};

export const ManageSubscription: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [subscription, setSubscription] = useState<SubscriptionData | null>(
		null,
	);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [showCancelModal, setShowCancelModal] = useState(false);
	const [cancelling, setCancelling] = useState(false);

	useEffect(() => {
		if (user) {
			fetchSubscriptionData();
			fetchInvoices();
		}
	}, [user]);

	const fetchSubscriptionData = async () => {
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("subscriptions")
				.select("*")
				.eq("user_id", user?.id)
				.single();

			if (data) {
				setSubscription(data);
			} else {
				// Default to free plan if no subscription
				setSubscription({
					plan_name: "free",
					price: 0,
					status: "active",
					next_billing_date: null,
					payment_method: null,
				});
			}
		} catch (error) {
			console.error("Error fetching subscription:", error);
			toast.error("Failed to load subscription data");
		} finally {
			setLoading(false);
		}
	};

	const fetchInvoices = async () => {
		try {
			const { data, error } = await supabase
				.from("invoices")
				.select("*")
				.eq("user_id", user?.id)
				.order("date", { ascending: false })
				.limit(12);

			if (data) {
				setInvoices(data);
			}
		} catch (error) {
			console.error("Error fetching invoices:", error);
		}
	};

	const handleCancelSubscription = async () => {
		setCancelling(true);
		try {
			// Call your backend API to cancel the subscription
			const { error } = await supabase.rpc("cancel_subscription", {
				user_id: user?.id,
			});

			if (error) throw error;

			toast.success("Subscription cancelled successfully");
			setShowCancelModal(false);
			await fetchSubscriptionData();

			// Announce to screen readers
			const announcement = document.createElement("div");
			announcement.setAttribute("role", "status");
			announcement.setAttribute("aria-live", "polite");
			announcement.textContent =
				"Your subscription has been cancelled. You will retain access until the end of your billing period.";
			document.body.appendChild(announcement);
			setTimeout(() => document.body.removeChild(announcement), 3000);
		} catch (error) {
			console.error("Error cancelling subscription:", error);
			toast.error("Failed to cancel subscription. Please contact support.");
		} finally {
			setCancelling(false);
		}
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatPrice = (price: number | null) => {
		if (price === null) return "Custom";
		if (price === 0) return "Free";
		return `$${price}/month`;
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "text-green-600";
			case "trial":
				return "text-blue-600";
			case "cancelled":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "active":
				return CheckCircle;
			case "cancelled":
				return XCircle;
			default:
				return AlertCircle;
		}
	};

	if (loading) {
		return (
			<div
				className="min-h-screen bg-gray-50 flex items-center justify-center"
				role="status"
				aria-live="polite"
			>
				<div className="text-center">
					<div
						className="animate-spin rounded-full h-12 w-12 border-b-2"
						style={{ borderColor: "#5C7F4F" }}
					></div>
					<p className="mt-4 text-gray-600">Loading subscription details...</p>
				</div>
			</div>
		);
	}

	const StatusIcon = subscription
		? getStatusIcon(subscription.status)
		: AlertCircle;

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			{/* Skip to main content link */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 text-white px-4 py-2 rounded"
				style={{ backgroundColor: "#5C7F4F" }}
			>
				Skip to main content
			</a>

			<main id="main-content" className="max-w-6xl mx-auto px-4">
				<div className="bg-white shadow-xl rounded-lg">
					{/* Header */}
					<div className="px-6 py-6 border-b border-gray-200">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<Package
									className="h-8 w-8 mr-3"
									aria-hidden="true"
									style={{ color: "#5C7F4F" }}
								/>
								<div>
									<h1 className="text-2xl font-bold text-gray-900">
										Manage Subscription
									</h1>
									<p className="text-gray-600 mt-1">
										Easily control your plan and billing options. Change,
										cancel, or review your current plan anytime, hassle-free.
									</p>
								</div>
							</div>
						</div>
					</div>

					{subscription && (
						<>
							{/* Current Plan Summary */}
							<section
								className="px-6 py-6 border-b border-gray-200"
								aria-labelledby="current-plan"
							>
								<h2
									id="current-plan"
									className="text-lg font-semibold text-gray-900 mb-4"
								>
									Current Plan Summary
								</h2>

								<div
									className="bg-gray-50 rounded-lg p-6"
									role="region"
									aria-label="Subscription details"
								>
									<div className="grid md:grid-cols-2 gap-6">
										{/* Plan Details */}
										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Plan
												</label>
												<div className="mt-1 flex items-center">
													<span className="text-lg font-semibold text-gray-900">
														{PLAN_DETAILS[subscription.plan_name].display}
													</span>
													<StatusIcon
														className={`h-5 w-5 ml-2 ${getStatusColor(subscription.status)}`}
														aria-label={`Status: ${subscription.status}`}
													/>
													<span
														className={`ml-2 text-sm ${getStatusColor(subscription.status)}`}
													>
														{subscription.status.charAt(0).toUpperCase() +
															subscription.status.slice(1)}
													</span>
												</div>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700">
													Monthly Price
												</label>
												<p className="mt-1 text-lg font-semibold text-gray-900">
													{formatPrice(subscription.price)}
												</p>
											</div>

											{subscription.next_billing_date && (
												<div>
													<label className="block text-sm font-medium text-gray-700">
														<Calendar
															className="inline h-4 w-4 mr-1"
															aria-hidden="true"
														/>
														Next Billing Date
													</label>
													<p className="mt-1 text-gray-900">
														{formatDate(subscription.next_billing_date)}
													</p>
												</div>
											)}
										</div>

										{/* Payment Method */}
										<div className="space-y-4">
											{subscription.payment_method ? (
												<div>
													<label className="block text-sm font-medium text-gray-700">
														<CreditCard
															className="inline h-4 w-4 mr-1"
															aria-hidden="true"
														/>
														Payment Method
													</label>
													<div className="mt-1 flex items-center">
														<CreditCard
															className="h-5 w-5 text-gray-400 mr-2"
															aria-hidden="true"
														/>
														<span className="text-gray-900">
															{subscription.payment_method.brand} ending in{" "}
															{subscription.payment_method.last4}
														</span>
														<span className="sr-only">
															{subscription.payment_method.brand} card ending in{" "}
															{subscription.payment_method.last4}
														</span>
													</div>
												</div>
											) : (
												<div>
													<label className="block text-sm font-medium text-gray-700">
														Payment Method
													</label>
													<p className="mt-1 text-gray-500">
														No payment method on file
													</p>
												</div>
											)}

											{subscription.trial_ends_at &&
												subscription.status === "trial" && (
													<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
														<p className="text-sm text-blue-900">
															<AlertCircle
																className="inline h-4 w-4 mr-1"
																aria-hidden="true"
															/>
															Trial ends on{" "}
															{formatDate(subscription.trial_ends_at)}
														</p>
													</div>
												)}

											{subscription.cancelled_at && (
												<div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
													<p className="text-sm text-amber-900">
														<AlertCircle
															className="inline h-4 w-4 mr-1"
															aria-hidden="true"
														/>
														Access continues until{" "}
														{formatDate(subscription.next_billing_date)}
													</p>
												</div>
											)}
										</div>
									</div>
								</div>
							</section>

							{/* Actions */}
							<section
								className="px-6 py-6 border-b border-gray-200"
								aria-labelledby="subscription-actions"
							>
								<h2
									id="subscription-actions"
									className="text-lg font-semibold text-gray-900 mb-4"
								>
									Actions
								</h2>

								<div className="grid md:grid-cols-3 gap-4">
									{/* Upgrade/Downgrade */}
									<button
										onClick={() => navigate("/pricing")}
										className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
										aria-label="Change your subscription plan"
									>
										<div className="flex items-center">
											{subscription.plan_name === "free" ? (
												<ArrowUpRight
													className="h-5 w-5 text-green-700 mr-3"
													aria-hidden="true"
												/>
											) : (
												<ArrowDownRight
													className="h-5 w-5 text-green-700 mr-3"
													aria-hidden="true"
												/>
											)}
											<div className="text-left">
												<p className="font-medium text-gray-900">
													{subscription.plan_name === "free"
														? "Upgrade Plan"
														: "Change Plan"}
												</p>
												<p className="text-sm text-gray-500">Compare plans</p>
											</div>
										</div>
										<ChevronRight
											className="h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
									</button>

									{/* Cancel Subscription */}
									{subscription.status === "active" &&
										subscription.plan_name !== "free" && (
											<button
												onClick={() => setShowCancelModal(true)}
												className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
												aria-label="Cancel your subscription"
											>
												<div className="flex items-center">
													<XCircle
														className="h-5 w-5 text-red-600 mr-3"
														aria-hidden="true"
													/>
													<div className="text-left">
														<p className="font-medium text-gray-900">
															Cancel Subscription
														</p>
														<p className="text-sm text-gray-500">
															Cancel anytime
														</p>
													</div>
												</div>
												<ChevronRight
													className="h-5 w-5 text-gray-400"
													aria-hidden="true"
												/>
											</button>
										)}

									{/* Download Invoices */}
									<button
										onClick={() =>
											document
												.getElementById("invoices-section")
												?.scrollIntoView({ behavior: "smooth" })
										}
										className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
										aria-label="View and download invoices"
									>
										<div className="flex items-center">
											<Download
												className="h-5 w-5 text-green-700 mr-3"
												aria-hidden="true"
											/>
											<div className="text-left">
												<p className="font-medium text-gray-900">
													Download Invoices
												</p>
												<p className="text-sm text-gray-500">Billing history</p>
											</div>
										</div>
										<ChevronRight
											className="h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
									</button>
								</div>
							</section>
						</>
					)}

					{/* Invoices Section */}
					<section
						id="invoices-section"
						className="px-6 py-6 border-b border-gray-200"
						aria-labelledby="invoices"
					>
						<h2
							id="invoices"
							className="text-lg font-semibold text-gray-900 mb-4"
						>
							<FileText
								className="inline h-5 w-5 mr-2 text-green-700"
								aria-hidden="true"
							/>
							Billing History
						</h2>

						{invoices.length > 0 ? (
							<div className="overflow-x-auto">
								<table
									className="min-w-full divide-y divide-gray-200"
									role="table"
									aria-label="Invoice history"
								>
									<thead className="bg-gray-50">
										<tr>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Date
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Description
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Amount
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Status
											</th>
											<th scope="col" className="relative px-6 py-3">
												<span className="sr-only">Actions</span>
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{invoices.map((invoice) => (
											<tr key={invoice.id}>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{formatDate(invoice.date)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{invoice.description}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													${invoice.amount.toFixed(2)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span
														className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
															invoice.status === "paid"
																? "bg-green-100 text-green-800"
																: "bg-yellow-100 text-yellow-800"
														}`}
													>
														{invoice.status.charAt(0).toUpperCase() +
															invoice.status.slice(1)}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
													<a
														href={invoice.invoice_pdf}
														download={`invoice-${invoice.date}.pdf`}
														className="text-green-700 hover:text-green-900 flex items-center justify-end"
														aria-label={`Download invoice from ${formatDate(invoice.date)}`}
													>
														<Download
															className="h-4 w-4 mr-1"
															aria-hidden="true"
														/>
														Download
													</a>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<p className="text-gray-500 text-center py-8">
								No invoices available yet.
							</p>
						)}
					</section>

					{/* Policy Highlights */}
					<section
						className="px-6 py-6 border-b border-gray-200"
						aria-labelledby="policies"
					>
						<h2
							id="policies"
							className="text-lg font-semibold text-gray-900 mb-4"
						>
							<HelpCircle
								className="inline h-5 w-5 mr-2 text-green-700"
								aria-hidden="true"
							/>
							Policy Highlights
						</h2>

						<ul className="space-y-3" role="list">
							<li className="flex items-start">
								<CheckCircle
									className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
									aria-hidden="true"
								/>
								<span className="text-gray-700">
									No long-term contracts. Cancel anytime.
								</span>
							</li>
							<li className="flex items-start">
								<CheckCircle
									className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
									aria-hidden="true"
								/>
								<span className="text-gray-700">
									7-day money-back guarantee for first-time subscribers.
								</span>
							</li>
							<li className="flex items-start">
								<CheckCircle
									className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
									aria-hidden="true"
								/>
								<span className="text-gray-700">
									We'll notify you at least 30 days in advance about any price
									changes.
								</span>
							</li>
							<li className="flex items-start">
								<Mail
									className="h-5 w-5 text-green-700 mt-0.5 mr-3 flex-shrink-0"
									aria-hidden="true"
								/>
								<span className="text-gray-700">
									Support email for billing issues:{" "}
									<a
										href="mailto:hello@huviatechnologies.com"
										className="text-green-700 hover:text-green-600 underline"
										aria-label="Email support at hello@huviatechnologies.com"
									>
										hello@huviatechnologies.com
									</a>
								</span>
							</li>
						</ul>
					</section>

					{/* Security & Accessibility */}
					<section className="px-6 py-6" aria-labelledby="security">
						<h2
							id="security"
							className="text-lg font-semibold text-gray-900 mb-4"
						>
							<Shield
								className="inline h-5 w-5 mr-2 text-green-700"
								aria-hidden="true"
							/>
							Security & Accessibility
						</h2>

						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<p className="text-sm text-blue-900 mb-2">
								All billing is securely processed through Stripe. PCI-compliant,
								never stored on InterpretReflect servers.
							</p>
							<p className="text-sm text-blue-900">
								All actions and information are screen reader-friendly, fully
								keyboard navigable, with visible focus indicators. High-contrast
								tables/cards, clear headings, and large, labeled action buttons
								ensure accessibility for all users.
							</p>
						</div>
					</section>
				</div>
			</main>

			{/* Cancel Subscription Modal */}
			{showCancelModal && (
				<div
					className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
					role="dialog"
					aria-modal="true"
					aria-labelledby="modal-title"
				>
					<div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
						<div className="px-6 py-4 border-b border-gray-200">
							<h3
								id="modal-title"
								className="text-lg font-semibold text-gray-900"
							>
								Cancel Subscription
							</h3>
						</div>

						<div className="px-6 py-4">
							<div className="flex items-start mb-4">
								<AlertCircle
									className="h-6 w-6 text-amber-500 mt-0.5 mr-3 flex-shrink-0"
									aria-hidden="true"
								/>
								<div>
									<p className="text-gray-700">
										Are you sure you want to cancel? You will retain access
										until{" "}
										<strong>
											{subscription?.next_billing_date
												? formatDate(subscription.next_billing_date)
												: "the end of your billing period"}
										</strong>
										.
									</p>
									<p className="text-sm text-gray-600 mt-2">
										Your reflections remain secure and exportable even after
										canceling.
									</p>
								</div>
							</div>
						</div>

						<div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
							<button
								type="button"
								onClick={() => setShowCancelModal(false)}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								aria-label="Keep subscription"
							>
								Keep Subscription
							</button>
							<button
								type="button"
								onClick={handleCancelSubscription}
								disabled={cancelling}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
								aria-label={
									cancelling
										? "Cancelling subscription..."
										: "Confirm cancellation"
								}
							>
								{cancelling ? "Cancelling..." : "Yes, Cancel"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
