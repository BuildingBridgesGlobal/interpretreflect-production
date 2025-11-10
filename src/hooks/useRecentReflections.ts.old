/**
 * Custom hook for fetching and managing recent reflections
 * Auto-refreshes when new reflections are added
 */

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface Reflection {
	id: string;
	type: string;
	answers: Record<string, any>;
	status: string;
	metadata?: Record<string, any>;
	created_at: string;
	updated_at: string;
}

interface UseRecentReflectionsOptions {
	limit?: number;
	types?: string[];
	autoRefresh?: boolean;
	refreshInterval?: number;
}

export function useRecentReflections(
	options: UseRecentReflectionsOptions = {},
) {
	const {
		limit = 10,
		types = [],
		autoRefresh = true,
		refreshInterval = 30000, // 30 seconds
	} = options;

	const { user } = useAuth();
	const [reflections, setReflections] = useState<Reflection[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastFetched, setLastFetched] = useState<Date | null>(null);

	const fetchReflections = useCallback(async () => {
		if (!user) {
			setReflections([]);
			setIsLoading(false);
			return;
		}

		try {
			setError(null);

			let query = supabase
				.from("reflections")
				.select("*")
				.eq("user_id", user.id)
				.order("created_at", { ascending: false })
				.limit(limit);

			// Filter by types if specified
			if (types.length > 0) {
				query = query.in("type", types);
			}

			const { data, error } = await query;

			if (error) throw error;

			setReflections(data || []);
			setLastFetched(new Date());
		} catch (err) {
			console.error("Error fetching reflections:", err);
			setError(
				err instanceof Error ? err.message : "Failed to fetch reflections",
			);
		} finally {
			setIsLoading(false);
		}
	}, [user, limit, types]);

	// Initial fetch
	useEffect(() => {
		fetchReflections();
	}, [fetchReflections]);

	// Set up real-time subscription
	useEffect(() => {
		if (!user || !autoRefresh) return;

		// Subscribe to reflection events
		const channel = supabase
			.channel("reflection-updates")
			.on("broadcast", { event: "reflection_completed" }, (payload) => {
				if (payload.payload.userId === user.id) {
					// Refresh reflections when a new one is completed
					fetchReflections();
				}
			})
			.subscribe();

		// Also subscribe to database changes
		const subscription = supabase
			.channel("reflection-changes")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "reflections",
					filter: `user_id=eq.${user.id}`,
				},
				() => {
					fetchReflections();
				},
			)
			.subscribe();

		return () => {
			channel.unsubscribe();
			subscription.unsubscribe();
		};
	}, [user, autoRefresh, fetchReflections]);

	// Auto-refresh at intervals
	useEffect(() => {
		if (!autoRefresh || refreshInterval <= 0) return;

		const interval = setInterval(() => {
			fetchReflections();
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [autoRefresh, refreshInterval, fetchReflections]);

	const refresh = useCallback(() => {
		setIsLoading(true);
		return fetchReflections();
	}, [fetchReflections]);

	const deleteReflection = useCallback(
		async (reflectionId: string) => {
			if (!user) return;

			try {
				const { error } = await supabase
					.from("reflections")
					.delete()
					.eq("id", reflectionId)
					.eq("user_id", user.id);

				if (error) throw error;

				// Remove from local state
				setReflections((prev) => prev.filter((r) => r.id !== reflectionId));

				return { success: true };
			} catch (err) {
				console.error("Error deleting reflection:", err);
				return {
					success: false,
					error:
						err instanceof Error ? err.message : "Failed to delete reflection",
				};
			}
		},
		[user],
	);

	return {
		reflections,
		isLoading,
		error,
		lastFetched,
		refresh,
		deleteReflection,
	};
}
