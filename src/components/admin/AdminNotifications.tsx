import { AlertCircle, CheckCircle, RefreshCw, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface AdminNotification {
	id: string;
	type: string;
	message: string;
	metadata: any;
	read: boolean;
	created_at: string;
}

export function AdminNotifications() {
	const [notifications, setNotifications] = useState<AdminNotification[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<"all" | "unread">("unread");

	useEffect(() => {
		loadNotifications();
	}, [filter]);

	const loadNotifications = async () => {
		setLoading(true);
		try {
			let query = supabase
				.from("admin_notifications")
				.select("*")
				.order("created_at", { ascending: false })
				.limit(20);

			if (filter === "unread") {
				query = query.eq("read", false);
			}

			const { data, error } = await query;

			if (error) throw error;
			setNotifications(data || []);
		} catch (error) {
			console.error("Error loading notifications:", error);
		} finally {
			setLoading(false);
		}
	};

	const markAsRead = async (id: string) => {
		try {
			const { error } = await supabase
				.from("admin_notifications")
				.update({ read: true })
				.eq("id", id);

			if (error) throw error;

			// Update local state
			setNotifications(prev =>
				prev.map(notif =>
					notif.id === id ? { ...notif, read: true } : notif
				)
			);
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	};

	const markAllAsRead = async () => {
		try {
			const { error } = await supabase
				.from("admin_notifications")
				.update({ read: true })
				.eq("read", false);

			if (error) throw error;

			loadNotifications();
		} catch (error) {
			console.error("Error marking all as read:", error);
		}
	};

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "cancellation":
				return { icon: AlertCircle, color: "#EF4444" };
			case "payment_failed":
				return { icon: AlertCircle, color: "#F59E0B" };
			case "payment_recovered":
				return { icon: CheckCircle, color: "#10B981" };
			default:
				return { icon: AlertCircle, color: "#5B9378" };
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<RefreshCw className="w-8 h-8 animate-spin" style={{ color: "#5B9378" }} />
			</div>
		);
	}

	return (
		<div
			className="rounded-xl overflow-hidden"
			style={{
				backgroundColor: "#FFFFFF",
				boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
			}}
		>
			<div className="p-6 border-b" style={{ borderColor: "#E5E5E5" }}>
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-3">
						<h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>
							Notifications
						</h2>
						{filter === "unread" && notifications.length > 0 && (
							<span
								className="px-2 py-1 text-xs font-bold rounded-full"
								style={{
									backgroundColor: "#EF4444",
									color: "#FFFFFF",
								}}
							>
								{notifications.length}
							</span>
						)}
					</div>
					<div className="flex gap-2">
						{["all", "unread"].map((f) => (
							<button
								key={f}
								onClick={() => setFilter(f as any)}
								className="px-3 py-1 rounded-lg text-sm font-medium transition-all"
								style={{
									backgroundColor: filter === f ? "#5B9378" : "#F9F9F9",
									color: filter === f ? "#FFFFFF" : "#666",
								}}
							>
								{f.charAt(0).toUpperCase() + f.slice(1)}
							</button>
						))}
						{notifications.some(n => !n.read) && (
							<button
								onClick={markAllAsRead}
								className="px-3 py-1 rounded-lg text-sm font-medium transition-all"
								style={{
									backgroundColor: "#F9F9F9",
									color: "#666",
								}}
							>
								Mark all read
							</button>
						)}
						<button
							onClick={loadNotifications}
							className="px-3 py-1 rounded-lg text-sm font-medium transition-all"
							style={{
								backgroundColor: "#F9F9F9",
								color: "#666",
							}}
						>
							<RefreshCw className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			<div className="divide-y" style={{ divideColor: "#E5E5E5" }}>
				{notifications.length === 0 ? (
					<div className="px-6 py-12 text-center">
						<CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "#10B981" }} />
						<p className="text-sm" style={{ color: "#666" }}>
							{filter === "unread" ? "No unread notifications" : "No notifications"}
						</p>
					</div>
				) : (
					notifications.map((notification) => {
						const { icon: Icon, color } = getNotificationIcon(notification.type);

						return (
							<div
								key={notification.id}
								className="p-6 hover:bg-gray-50 transition-colors"
								style={{
									backgroundColor: notification.read ? "transparent" : "rgba(107, 139, 96, 0.03)",
								}}
							>
								<div className="flex items-start gap-4">
									<div
										className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
										style={{ backgroundColor: `${color}15` }}
									>
										<Icon className="w-5 h-5" style={{ color }} />
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1">
												<p
													className="text-sm font-medium mb-1"
													style={{ color: "#1A1A1A" }}
												>
													{notification.message}
												</p>
												{notification.metadata && (
													<div className="text-xs space-y-1" style={{ color: "#666" }}>
														{notification.metadata.email && (
															<p>Email: {notification.metadata.email}</p>
														)}
														{notification.metadata.subscription_id && (
															<p className="font-mono text-xs">
																ID: {notification.metadata.subscription_id.substring(0, 20)}...
															</p>
														)}
														{notification.metadata.plan_amount && (
															<p>
																Amount: ${(notification.metadata.plan_amount / 100).toFixed(2)}
															</p>
														)}
													</div>
												)}
												<p className="text-xs mt-2" style={{ color: "#999" }}>
													{new Date(notification.created_at).toLocaleString()}
												</p>
											</div>

											{!notification.read && (
												<button
													onClick={() => markAsRead(notification.id)}
													className="p-1 hover:bg-gray-200 rounded transition-colors"
													title="Mark as read"
												>
													<X className="w-4 h-4" style={{ color: "#666" }} />
												</button>
											)}
										</div>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}