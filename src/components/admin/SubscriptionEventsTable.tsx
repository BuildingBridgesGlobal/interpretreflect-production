import { RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface SubscriptionEvent {
	id: string;
	user_id: string;
	event_type: string;
	subscription_id: string;
	metadata: any;
	created_at: string;
	email?: string;
}

export function SubscriptionEventsTable() {
	const [events, setEvents] = useState<SubscriptionEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<"all" | "created" | "cancelled" | "payment_failed">("all");

	useEffect(() => {
		loadEvents();
	}, [filter]);

	const loadEvents = async () => {
		setLoading(true);
		try {
			let query = supabase
				.from("subscription_events")
				.select(`
					*,
					profiles!inner(email)
				`)
				.order("created_at", { ascending: false })
				.limit(50);

			if (filter !== "all") {
				query = query.eq("event_type", filter);
			}

			const { data, error } = await query;

			if (error) throw error;

			// Map the data to include email
			const mappedData = data?.map((event: any) => ({
				...event,
				email: event.profiles?.email || "Unknown",
			})) || [];

			setEvents(mappedData);
		} catch (error) {
			console.error("Error loading subscription events:", error);
		} finally {
			setLoading(false);
		}
	};

	const getEventColor = (eventType: string) => {
		switch (eventType) {
			case "created":
				return { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" };
			case "cancelled":
				return { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" };
			case "payment_failed":
				return { bg: "rgba(245, 158, 11, 0.1)", text: "#F59E0B" };
			case "reactivated":
				return { bg: "rgba(59, 130, 246, 0.1)", text: "#3B82F6" };
			default:
				return { bg: "rgba(107, 139, 96, 0.1)", text: "#5B9378" };
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
					<h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>
						Subscription Events
					</h2>
					<div className="flex gap-2">
						{["all", "created", "cancelled", "payment_failed"].map((type) => (
							<button
								key={type}
								onClick={() => setFilter(type as any)}
								className="px-3 py-1 rounded-lg text-sm font-medium transition-all"
								style={{
									backgroundColor: filter === type ? "#5B9378" : "#F9F9F9",
									color: filter === type ? "#FFFFFF" : "#666",
								}}
							>
								{type === "all" ? "All" : type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
							</button>
						))}
						<button
							onClick={loadEvents}
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
								Event Type
							</th>
							<th
								className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
								style={{ color: "#666" }}
							>
								Status Change
							</th>
							<th
								className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
								style={{ color: "#666" }}
							>
								Plan
							</th>
							<th
								className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
								style={{ color: "#666" }}
							>
								Time
							</th>
						</tr>
					</thead>
					<tbody className="divide-y" style={{ divideColor: "#E5E5E5" }}>
						{events.length === 0 ? (
							<tr>
								<td colSpan={5} className="px-6 py-8 text-center text-sm" style={{ color: "#666" }}>
									No subscription events found
								</td>
							</tr>
						) : (
							events.map((event) => {
								const eventColor = getEventColor(event.event_type);
								const oldStatus = event.metadata?.old_status || "-";
								const newStatus = event.metadata?.new_status || "-";
								const planName = event.metadata?.plan_name || "N/A";

								return (
									<tr key={event.id} className="hover:bg-gray-50">
										<td
											className="px-6 py-4 whitespace-nowrap text-sm"
											style={{ color: "#1A1A1A" }}
										>
											{event.email}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className="px-2 py-1 text-xs font-medium rounded-full"
												style={{
													backgroundColor: eventColor.bg,
													color: eventColor.text,
												}}
											>
												{event.event_type}
											</span>
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm"
											style={{ color: "#666" }}
										>
											{oldStatus} → {newStatus}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm"
											style={{ color: "#666" }}
										>
											{planName}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm"
											style={{ color: "#666" }}
										>
											{new Date(event.created_at).toLocaleString()}
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}