import { RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface WebhookLog {
	id: string;
	source: string;
	event_type: string;
	payload: any;
	created_at: string;
	processed: boolean;
}

export function WebhookLogsTable() {
	const [logs, setLogs] = useState<WebhookLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<"all" | "stripe" | "pabbly" | "encharge">("all");

	useEffect(() => {
		loadLogs();
	}, [filter]);

	const loadLogs = async () => {
		setLoading(true);
		try {
			let query = supabase
				.from("webhook_logs")
				.select("*")
				.order("created_at", { ascending: false })
				.limit(50);

			if (filter !== "all") {
				query = query.eq("source", filter);
			}

			const { data, error } = await query;

			if (error) throw error;
			setLogs(data || []);
		} catch (error) {
			console.error("Error loading webhook logs:", error);
		} finally {
			setLoading(false);
		}
	};

	const getSourceColor = (source: string) => {
		switch (source) {
			case "stripe":
				return { bg: "rgba(99, 102, 241, 0.1)", text: "#6366F1" };
			case "pabbly":
				return { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" };
			case "encharge":
				return { bg: "rgba(245, 158, 11, 0.1)", text: "#F59E0B" };
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
						Webhook Activity
					</h2>
					<div className="flex gap-2">
						{["all", "stripe", "pabbly", "encharge"].map((src) => (
							<button
								key={src}
								onClick={() => setFilter(src as any)}
								className="px-3 py-1 rounded-lg text-sm font-medium transition-all"
								style={{
									backgroundColor: filter === src ? "#5B9378" : "#F9F9F9",
									color: filter === src ? "#FFFFFF" : "#666",
								}}
							>
								{src.charAt(0).toUpperCase() + src.slice(1)}
							</button>
						))}
						<button
							onClick={loadLogs}
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
								Source
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
								Customer
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
								Time
							</th>
						</tr>
					</thead>
					<tbody className="divide-y" style={{ divideColor: "#E5E5E5" }}>
						{logs.length === 0 ? (
							<tr>
								<td colSpan={5} className="px-6 py-8 text-center text-sm" style={{ color: "#666" }}>
									No webhook logs found
								</td>
							</tr>
						) : (
							logs.map((log) => {
								const sourceColor = getSourceColor(log.source);
								const customerEmail = log.payload?.customer_email || log.payload?.email || "N/A";

								return (
									<tr key={log.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className="px-2 py-1 text-xs font-medium rounded-full"
												style={{
													backgroundColor: sourceColor.bg,
													color: sourceColor.text,
												}}
											>
												{log.source}
											</span>
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm"
											style={{ color: "#1A1A1A" }}
										>
											{log.event_type}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm"
											style={{ color: "#666" }}
										>
											{customerEmail}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className="px-2 py-1 text-xs rounded-full"
												style={{
													backgroundColor: log.processed
														? "rgba(16, 185, 129, 0.1)"
														: "rgba(239, 68, 68, 0.1)",
													color: log.processed ? "#10B981" : "#EF4444",
												}}
											>
												{log.processed ? "Processed" : "Failed"}
											</span>
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm"
											style={{ color: "#666" }}
										>
											{new Date(log.created_at).toLocaleString()}
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