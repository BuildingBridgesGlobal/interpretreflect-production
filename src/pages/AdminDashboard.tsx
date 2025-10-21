import {
	AlertCircle,
	DollarSign,
	Download,
	RefreshCw,
	TrendingUp,
	Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AdminNotifications } from "../components/admin/AdminNotifications";
import { SubscriptionEventsTable } from "../components/admin/SubscriptionEventsTable";
import { WebhookLogsTable } from "../components/admin/WebhookLogsTable";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface RevenueMetrics {
	totalRevenue: number;
	mrr: number;
	activeSubscriptions: number;
	trialUsers: number;
	churnRate: number;
	newSubscriptions: number;
	canceledSubscriptions: number;
	failedPayments: number;
}

interface RecentPayment {
	id: string;
	customer_email: string;
	amount: number;
	status: string;
	created_at: string;
}

export function AdminDashboard() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [metrics, setMetrics] = useState<RevenueMetrics>({
		totalRevenue: 0,
		mrr: 0,
		activeSubscriptions: 0,
		trialUsers: 0,
		churnRate: 0,
		newSubscriptions: 0,
		canceledSubscriptions: 0,
		failedPayments: 0,
	});
	const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
	const [timeRange, setTimeRange] = useState("30d");

	useEffect(() => {
		checkAdminAccess();
		loadMetrics();
		loadRecentPayments();
	}, [user, timeRange]);

	const checkAdminAccess = async () => {
		// Check if user is admin
		if (!user) {
			navigate("/");
			return;
		}

		// In production, check admin role from database
		const adminEmails = [
			"info@interpretreflect.com",
			"admin@interpretreflect.com",
		];
		if (!adminEmails.includes(user.email || "")) {
			navigate("/");
			return;
		}
	};

	const loadMetrics = async () => {
		try {
			// Load revenue metrics
			const today = new Date();
			const startDate = new Date();

			if (timeRange === "7d") {
				startDate.setDate(today.getDate() - 7);
			} else if (timeRange === "30d") {
				startDate.setDate(today.getDate() - 30);
			} else if (timeRange === "90d") {
				startDate.setDate(today.getDate() - 90);
			}

			// Get active subscriptions
			const { data: subscriptions } = await supabase
				.from("subscriptions")
				.select("*")
				.eq("status", "active");

			// Get recent payments
			const { data: payments } = await supabase
				.from("payments")
				.select("*")
				.gte("created_at", startDate.toISOString())
				.eq("status", "succeeded");

			// Get failed payments
			const { data: failedPayments } = await supabase
				.from("failed_payments")
				.select("*")
				.gte("created_at", startDate.toISOString())
				.eq("recovered", false);

			// Calculate metrics
			const totalRevenue =
				payments?.reduce((sum, p) => sum + p.amount_paid / 100, 0) || 0;
			const activeCount = subscriptions?.length || 0;
			const mrr = activeCount * 12.99;

			setMetrics({
				totalRevenue,
				mrr,
				activeSubscriptions: activeCount,
				trialUsers:
					subscriptions?.filter((s) => s.status === "trialing").length || 0,
				churnRate: 0, // Calculate based on your business logic
				newSubscriptions: 0, // Calculate from date range
				canceledSubscriptions: 0, // Calculate from date range
				failedPayments: failedPayments?.length || 0,
			});
		} catch (error) {
			console.error("Error loading metrics:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadRecentPayments = async () => {
		try {
			const { data } = await supabase
				.from("payments")
				.select(
					`
          id,
          amount_paid,
          status,
          created_at,
          customers (email)
        `,
				)
				.order("created_at", { ascending: false })
				.limit(10);

			if (data) {
				setRecentPayments(
					data.map((p) => ({
						id: p.id,
						customer_email: p.customers?.email || "Unknown",
						amount: p.amount_paid / 100,
						status: p.status,
						created_at: p.created_at,
					})),
				);
			}
		} catch (error) {
			console.error("Error loading payments:", error);
		}
	};

	const exportData = async () => {
		// Export functionality for accounting
		alert("Export functionality will download CSV of all transactions");
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<RefreshCw
					className="w-8 h-8 animate-spin"
					style={{ color: "#5B9378" }}
				/>
			</div>
		);
	}

	return (
		<div style={{ backgroundColor: "#FAF9F6", minHeight: "100vh" }}>
			{/* Header */}
			<div
				className="p-6"
				style={{
					background:
						"linear-gradient(135deg, rgba(27, 94, 32, 0.05), rgba(46, 125, 50, 0.05))",
					borderBottom: "1px solid rgba(92, 127, 79, 0.15)",
				}}
			>
				<div className="max-w-7xl mx-auto">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>
								Admin Dashboard
							</h1>
							<p className="text-sm mt-1" style={{ color: "#666" }}>
								Revenue and subscription analytics
							</p>
						</div>

						<div className="flex gap-4">
							{/* Time Range Selector */}
							<select
								value={timeRange}
								onChange={(e) => setTimeRange(e.target.value)}
								className="px-4 py-2 rounded-lg"
								style={{
									backgroundColor: "#FFFFFF",
									border: "1px solid #E5E5E5",
									color: "#1A1A1A",
								}}
							>
								<option value="7d">Last 7 days</option>
								<option value="30d">Last 30 days</option>
								<option value="90d">Last 90 days</option>
							</select>

							<button
								onClick={exportData}
								className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
								style={{
									backgroundColor: "#FFFFFF",
									border: "1px solid #5B9378",
									color: "#5B9378",
								}}
							>
								<Download size={16} />
								Export
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto p-6">
				{/* Metrics Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{/* Total Revenue */}
					<div
						className="rounded-xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<div className="flex items-center justify-between mb-4">
							<div
								className="w-12 h-12 rounded-lg flex items-center justify-center"
								style={{ backgroundColor: "rgba(27, 94, 32, 0.1)" }}
							>
								<DollarSign className="w-6 h-6" style={{ color: "#5C7F4F" }} />
							</div>
							<span
								className="text-xs font-semibold"
								style={{ color: "#10B981" }}
							>
								+12.5%
							</span>
						</div>
						<h3 className="text-sm font-medium mb-1" style={{ color: "#666" }}>
							Total Revenue
						</h3>
						<p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
							{formatCurrency(metrics.totalRevenue)}
						</p>
					</div>

					{/* MRR */}
					<div
						className="rounded-xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<div className="flex items-center justify-between mb-4">
							<div
								className="w-12 h-12 rounded-lg flex items-center justify-center"
								style={{ backgroundColor: "rgba(107, 139, 96, 0.1)" }}
							>
								<TrendingUp className="w-6 h-6" style={{ color: "#5B9378" }} />
							</div>
							<span
								className="text-xs font-semibold"
								style={{ color: "#10B981" }}
							>
								+8.3%
							</span>
						</div>
						<h3 className="text-sm font-medium mb-1" style={{ color: "#666" }}>
							Monthly Recurring Revenue
						</h3>
						<p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
							{formatCurrency(metrics.mrr)}
						</p>
					</div>

					{/* Active Subscriptions */}
					<div
						className="rounded-xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<div className="flex items-center justify-between mb-4">
							<div
								className="w-12 h-12 rounded-lg flex items-center justify-center"
								style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
							>
								<Users className="w-6 h-6" style={{ color: "#3B82F6" }} />
							</div>
							<span
								className="text-xs font-semibold"
								style={{ color: "#10B981" }}
							>
								+45
							</span>
						</div>
						<h3 className="text-sm font-medium mb-1" style={{ color: "#666" }}>
							Active Subscriptions
						</h3>
						<p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
							{metrics.activeSubscriptions}
						</p>
					</div>

					{/* Failed Payments */}
					<div
						className="rounded-xl p-6"
						style={{
							backgroundColor: "#FFFFFF",
							boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						}}
					>
						<div className="flex items-center justify-between mb-4">
							<div
								className="w-12 h-12 rounded-lg flex items-center justify-center"
								style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
							>
								<AlertCircle className="w-6 h-6" style={{ color: "#EF4444" }} />
							</div>
							{metrics.failedPayments > 0 && (
								<span
									className="text-xs font-semibold"
									style={{ color: "#EF4444" }}
								>
									Needs attention
								</span>
							)}
						</div>
						<h3 className="text-sm font-medium mb-1" style={{ color: "#666" }}>
							Failed Payments
						</h3>
						<p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
							{metrics.failedPayments}
						</p>
					</div>
				</div>

				{/* Admin Notifications */}
				<div className="mb-8">
					<AdminNotifications />
				</div>

				{/* Webhook Logs */}
				<div className="mb-8">
					<WebhookLogsTable />
				</div>

				{/* Subscription Events */}
				<div className="mb-8">
					<SubscriptionEventsTable />
				</div>

				{/* Recent Payments Table */}
				<div
					className="rounded-xl overflow-hidden"
					style={{
						backgroundColor: "#FFFFFF",
						boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
					}}
				>
					<div className="p-6 border-b" style={{ borderColor: "#E5E5E5" }}>
						<h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>
							Recent Payments
						</h2>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr style={{ backgroundColor: "#F9F9F9" }}>
									<th
										className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
										style={{ color: "#666" }}
									>
										Customer
									</th>
									<th
										className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
										style={{ color: "#666" }}
									>
										Amount
									</th>
									<th
										className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
										style={{ color: "#666" }}
									>
										Status
									</th>
									<th
										className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
										style={{ color: "#666" }}
									>
										Date
									</th>
								</tr>
							</thead>
							<tbody className="divide-y" style={{ divideColor: "#E5E5E5" }}>
								{recentPayments.map((payment) => (
									<tr key={payment.id} className="hover:bg-gray-50">
										<td
											className="px-6 py-4 whitespace-nowrap text-sm"
											style={{ color: "#1A1A1A" }}
										>
											{payment.customer_email}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm font-medium"
											style={{ color: "#1A1A1A" }}
										>
											{formatCurrency(payment.amount)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className="px-2 py-1 text-xs rounded-full"
												style={{
													backgroundColor:
														payment.status === "succeeded"
															? "rgba(16, 185, 129, 0.1)"
															: "rgba(239, 68, 68, 0.1)",
													color:
														payment.status === "succeeded"
															? "#10B981"
															: "#EF4444",
												}}
											>
												{payment.status}
											</span>
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm"
											style={{ color: "#666" }}
										>
											{new Date(payment.created_at).toLocaleDateString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
