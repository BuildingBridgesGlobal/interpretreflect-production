import {
	AlertCircle,
	Calendar,
	CheckCircle,
	ChevronRight,
	CreditCard,
	Download,
	ExternalLink,
	FileText,
	Info,
	Lock,
	Mail,
	Package,
	RefreshCw,
	Shield,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface PlanDetails {
	name: "essential" | "professional" | "organization" | "free";
	price: number;
	status: "active" | "trial" | "cancelled" | "inactive";
	features: string[];
	next_billing_date: string | null;
	trial_ends_at?: string;
	cancelled_at?: string;
}

interface PaymentMethod {
	type: "card";
	brand: string;
	last4: string;
	exp_month: number;
	exp_year: number;
}

interface Invoice {
	id: string;
	date: string;
	amount: number;
	status: "paid" | "pending" | "refunded";
	invoice_pdf: string;
	description: string;
	invoice_number: string;
}

const PLAN_FEATURES = {
	free: [
		"Basic reflection tools",
		"Limited monthly entries",
		"Community support",
	],
	essential: [
		"Unlimited reflections",
		"All wellness tools",
		"Data export",
		"Email support",
		"Basic analytics",
	],
	professional: [
		"Everything in Essential",
		"Team collaboration",
		"Advanced analytics",
		"Priority support",
		"Custom integrations",
		"Quarterly wellness reports",
	],
	organization: [
		"Everything in Professional",
		"Custom pricing",
		"Dedicated account manager",
		"Enterprise SSO",
		"Custom training",
		"SLA guarantee",
	],
};

const PLAN_DISPLAY_NAMES = {
	free: "Free",
	essential: "Essential",
	professional: "Professional",
	organization: "Organization",
};

export const BillingPlanDetails: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
		null,
	);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [showFeaturesModal, setShowFeaturesModal] = useState(false);
	const [updatingPayment, setUpdatingPayment] = useState(false);

	useEffect(() => {
		if (user) {
			fetchBillingData();
		}
	}, [user]);

	const fetchBillingData = async () => {
		setLoading(true);
		try {
			// Fetch subscription details
			const { data: subscription, error: subError } = await supabase
				.from("subscriptions")
				.select("*")
				.eq("user_id", user?.id)
				.single();

			if (subscription) {
				setPlanDetails({
					name: subscription.plan_name,
					price: subscription.price,
					status: subscription.status,
					features: PLAN_FEATURES[subscription.plan_name],
					next_billing_date: subscription.next_billing_date,
					trial_ends_at: subscription.trial_ends_at,
					cancelled_at: subscription.cancelled_at,
				});

				if (subscription.payment_method) {
					setPaymentMethod(subscription.payment_method);
				}
			} else {
				// Default to free plan
				setPlanDetails({
					name: "free",
					price: 0,
					status: "active",
					features: PLAN_FEATURES.free,
					next_billing_date: null,
				});
			}

			// Fetch invoices
			const { data: invoiceData, error: invError } = await supabase
				.from("invoices")
				.select("*")
				.eq("user_id", user?.id)
				.order("date", { ascending: false })
				.limit(24);

			if (invoiceData) {
				setInvoices(invoiceData);
			}
		} catch (error) {
			console.error("Error fetching billing data:", error);
			toast.error("Failed to load billing information");
		} finally {
			setLoading(false);
		}
	};

	const handleUpdatePayment = async () => {
		setUpdatingPayment(true);
		try {
			// Create a Stripe checkout session for updating payment method
			const { data, error } = await supabase.functions.invoke(
				"create-update-payment-session",
				{
					body: { user_id: user?.id },
				},
			);

			if (error) throw error;

			if (data?.url) {
				window.location.href = data.url;
			}
		} catch (error) {
			console.error("Error updating payment:", error);
			toast.error("Failed to update payment method");
		} finally {
			setUpdatingPayment(false);
		}
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "numeric",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatPrice = (price: number) => {
		if (price === 0) return "Free";
		return `$${price}/mo`;
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "text-green-600 bg-green-100";
			case "trial":
				return "text-blue-600 bg-blue-100";
			case "cancelled":
				return "text-red-600 bg-red-100";
			case "paid":
				return "text-green-600 bg-green-100";
			case "pending":
				return "text-yellow-600 bg-yellow-100";
			case "refunded":
				return "text-gray-600 bg-gray-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	const getCardBrandIcon = (brand: string) => {
		const brandLower = brand.toLowerCase();
		if (brandLower.includes("visa")) return "💳";
		if (brandLower.includes("master")) return "💳";
		if (brandLower.includes("amex")) return "💳";
		if (brandLower.includes("discover")) return "💳";
		return "💳";
	};

	if (loading) {
		return (
			<div
				className="min-h-screen bg-gray-50 flex items-center justify-center"
				role="status"
				aria-live="polite"
			>
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading billing details...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			{/* Skip to main content link */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded"
			>
				Skip to main content
			</a>

			<main id="main-content" className="max-w-6xl mx-auto px-4">
				<div className="bg-white shadow-xl rounded-lg">
					{/* Header */}
					<div className="px-6 py-6 border-b border-gray-200">
						<div className="flex items-center">
							<FileText
								className="h-8 w-8 text-indigo-600 mr-3"
								aria-hidden="true"
							/>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									Billing & Plan Details
								</h1>
								<p className="text-gray-600 mt-1">
									Review your payment information and plan history in one place.
									We're committed to transparent billing and keeping your
									information secure at all times.
								</p>
							</div>
						</div>
					</div>

					{planDetails && (
						<>
							{/* Active Plan Overview */}
							<section
								className="px-6 py-6 border-b border-gray-200"
								aria-labelledby="plan-overview"
							>
								<h2
									id="plan-overview"
									className="text-lg font-semibold text-gray-900 mb-4 flex items-center"
								>
									<Package
										className="h-5 w-5 mr-2 text-indigo-600"
										aria-hidden="true"
									/>
									Active Plan Overview
								</h2>

								<div
									className="bg-gray-50 rounded-lg p-6"
									role="region"
									aria-label="Current plan details"
								>
									<div className="grid md:grid-cols-2 gap-6">
										{/* Plan Info */}
										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Current Plan
												</label>
												<div className="flex items-center justify-between">
													<div className="flex items-center">
														<span className="text-xl font-bold text-gray-900">
															{PLAN_DISPLAY_NAMES[planDetails.name]}
														</span>
														<span className="ml-2 text-lg text-gray-600">
															{planDetails.price > 0
																? formatPrice(planDetails.price)
																: ""}
														</span>
													</div>
													<span
														className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(planDetails.status)}`}
													>
														{planDetails.status.charAt(0).toUpperCase() +
															planDetails.status.slice(1)}
													</span>
												</div>
											</div>

											{/* Plan Features Button */}
											<button
												onClick={() => setShowFeaturesModal(true)}
												className="flex items-center justify-between w-full p-3 text-left border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
												aria-label="View plan features"
											>
												<div className="flex items-center">
													<Info
														className="h-5 w-5 text-indigo-600 mr-2"
														aria-hidden="true"
													/>
													<span className="text-sm font-medium text-gray-900">
														View Plan Features
													</span>
												</div>
												<ChevronRight
													className="h-4 w-4 text-gray-400"
													aria-hidden="true"
												/>
											</button>

											{/* Trial or Cancellation Notice */}
											{planDetails.trial_ends_at &&
												planDetails.status === "trial" && (
													<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
														<p className="text-sm text-blue-900">
															<AlertCircle
																className="inline h-4 w-4 mr-1"
																aria-hidden="true"
															/>
															Trial ends on{" "}
															{formatDate(planDetails.trial_ends_at)}
														</p>
													</div>
												)}

											{planDetails.cancelled_at && (
												<div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
													<p className="text-sm text-amber-900">
														<AlertCircle
															className="inline h-4 w-4 mr-1"
															aria-hidden="true"
														/>
														Access continues until{" "}
														{formatDate(planDetails.next_billing_date)}
													</p>
												</div>
											)}
										</div>

										{/* Payment Method */}
										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													<CreditCard
														className="inline h-4 w-4 mr-1"
														aria-hidden="true"
													/>
													Saved Payment Method
												</label>
												{paymentMethod ? (
													<div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
														<div className="flex items-center">
															<span
																className="text-2xl mr-3"
																aria-hidden="true"
															>
																{getCardBrandIcon(paymentMethod.brand)}
															</span>
															<div>
																<p className="font-medium text-gray-900">
																	{paymentMethod.brand} ****{" "}
																	{paymentMethod.last4}
																</p>
																<p className="text-sm text-gray-500">
																	Expires {paymentMethod.exp_month}/
																	{paymentMethod.exp_year}
																</p>
																<span className="sr-only">
																	{paymentMethod.brand} card ending in{" "}
																	{paymentMethod.last4}, expires{" "}
																	{paymentMethod.exp_month}/
																	{paymentMethod.exp_year}
																</span>
															</div>
														</div>
													</div>
												) : (
													<p className="text-gray-500 italic">
														No payment method on file
													</p>
												)}
											</div>

											{planDetails.next_billing_date && (
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														<Calendar
															className="inline h-4 w-4 mr-1"
															aria-hidden="true"
														/>
														Next Billing Date
													</label>
													<p className="text-lg font-semibold text-gray-900">
														{formatDate(planDetails.next_billing_date)}
													</p>
												</div>
											)}

											{/* Update Payment Button */}
											<button
												onClick={handleUpdatePayment}
												disabled={
													updatingPayment || planDetails.name === "free"
												}
												className="w-full flex items-center justify-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
												aria-label="Update payment information"
											>
												{updatingPayment ? (
													<>
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
														Updating...
													</>
												) : (
													<>
														<RefreshCw
															className="h-4 w-4 mr-2"
															aria-hidden="true"
														/>
														Update Payment Info
													</>
												)}
											</button>
										</div>
									</div>
								</div>
							</section>

							{/* Invoice History */}
							<section
								className="px-6 py-6 border-b border-gray-200"
								aria-labelledby="invoice-history"
							>
								<h2
									id="invoice-history"
									className="text-lg font-semibold text-gray-900 mb-4 flex items-center"
								>
									<FileText
										className="h-5 w-5 mr-2 text-indigo-600"
										aria-hidden="true"
									/>
									Invoice History
								</h2>

								{invoices.length > 0 ? (
									<div className="overflow-x-auto">
										<table
											className="min-w-full divide-y divide-gray-200"
											role="table"
											aria-label="Invoice history table"
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
														Invoice Number
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
														<span className="sr-only">Download</span>
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{invoices.map((invoice) => (
													<tr key={invoice.id} className="hover:bg-gray-50">
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
															{formatDate(invoice.date)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
															{invoice.invoice_number ||
																`INV-${invoice.id.slice(0, 8).toUpperCase()}`}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
															${invoice.amount.toFixed(2)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<span
																className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}
															>
																{invoice.status.charAt(0).toUpperCase() +
																	invoice.status.slice(1)}
															</span>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
															<a
																href={invoice.invoice_pdf}
																download={`invoice-${invoice.invoice_number || invoice.date}.pdf`}
																className="inline-flex items-center text-indigo-600 hover:text-indigo-900 focus:outline-none focus:underline"
																aria-label={`Download invoice for ${formatDate(invoice.date)}`}
															>
																<Download
																	className="h-4 w-4 mr-1"
																	aria-hidden="true"
																/>
																Download PDF
															</a>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<div className="text-center py-8">
										<FileText
											className="h-12 w-12 text-gray-400 mx-auto mb-3"
											aria-hidden="true"
										/>
										<p className="text-gray-500">No invoices available yet.</p>
										<p className="text-sm text-gray-400 mt-1">
											Invoices will appear here after your first payment.
										</p>
									</div>
								)}
							</section>

							{/* Security & Policy Notes */}
							<section className="px-6 py-6" aria-labelledby="security-notes">
								<h2
									id="security-notes"
									className="text-lg font-semibold text-gray-900 mb-4 flex items-center"
								>
									<Shield
										className="h-5 w-5 mr-2 text-indigo-600"
										aria-hidden="true"
									/>
									Security & Policy Notes
								</h2>

								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
									<div className="flex items-start">
										<Lock
											className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
											aria-hidden="true"
										/>
										<p className="text-sm text-blue-900">
											All credit card information is securely processed via
											Stripe and never stored on our servers.
										</p>
									</div>

									<div className="flex items-start">
										<Shield
											className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
											aria-hidden="true"
										/>
										<p className="text-sm text-blue-900">
											Your transactions are encrypted end-to-end.
										</p>
									</div>

									<div className="flex items-start">
										<Mail
											className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
											aria-hidden="true"
										/>
										<p className="text-sm text-blue-900">
											Need a custom receipt or see a billing issue? Contact us:{" "}
											<a
												href="mailto:hello@huviatechnologies.com"
												className="text-indigo-600 hover:text-indigo-500 underline font-medium"
												aria-label="Email support at hello@huviatechnologies.com"
											>
												hello@huviatechnologies.com
											</a>
										</p>
									</div>
								</div>
							</section>
						</>
					)}
				</div>
			</main>

			{/* Plan Features Modal */}
			{showFeaturesModal && planDetails && (
				<div
					className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby="features-modal-title"
				>
					<div className="bg-white rounded-lg max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
						<div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
							<h3
								id="features-modal-title"
								className="text-lg font-semibold text-gray-900"
							>
								{PLAN_DISPLAY_NAMES[planDetails.name]} Plan Features
							</h3>
						</div>

						<div className="px-6 py-4">
							<ul className="space-y-3" role="list">
								{planDetails.features.map((feature, index) => (
									<li key={index} className="flex items-start">
										<CheckCircle
											className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
											aria-hidden="true"
										/>
										<span className="text-gray-700">{feature}</span>
									</li>
								))}
							</ul>

							{planDetails.name !== "organization" && (
								<div className="mt-6 pt-4 border-t border-gray-200">
									<button
										onClick={() => navigate("/pricing")}
										className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
										aria-label="Compare all plans"
									>
										Compare All Plans
										<ExternalLink className="h-4 w-4 ml-2" aria-hidden="true" />
									</button>
								</div>
							)}
						</div>

						<div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
							<button
								type="button"
								onClick={() => setShowFeaturesModal(false)}
								className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
								aria-label="Close features modal"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
