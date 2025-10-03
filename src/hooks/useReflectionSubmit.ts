/**
 * Custom hook for handling reflection submissions
 * Provides consistent error handling, loading states, and dashboard refresh
 */

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabase";

interface SubmitReflectionParams {
	userId: string;
	reflectionType: string;
	answers: Record<string, any>;
	metadata?: Record<string, any>;
	sessionId?: string;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

interface SubmitResult {
	success: boolean;
	data?: any;
	error?: string;
}

export function useReflectionSubmit() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const navigate = useNavigate();

	const submitReflection = useCallback(
		async ({
			userId,
			reflectionType,
			answers,
			metadata = {},
			sessionId,
			onSuccess,
			onError,
		}: SubmitReflectionParams): Promise<SubmitResult> => {
			setIsSubmitting(true);
			setSubmitError(null);
			setSubmitSuccess(false);

			try {
				// Step 1: Save reflection to database
				const { data, error } = await supabase
					.from("reflections")
					.upsert({
						user_id: userId,
						session_id: sessionId || `session_${Date.now()}`,
						type: reflectionType,
						answers,
						status: "completed",
						metadata: {
							...metadata,
							completed_at: new Date().toISOString(),
						},
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					})
					.select()
					.single();

				if (error) throw error;

				// Step 2: Trigger dashboard refresh by invalidating cache
				// This will cause any components watching reflections to refetch
				await supabase.from("reflection_events").insert({
					user_id: userId,
					event_type: "reflection_completed",
					reflection_id: data.id,
					reflection_type: reflectionType,
					created_at: new Date().toISOString(),
				});

				// Step 3: Broadcast event for real-time updates
				const channel = supabase.channel("reflection-updates");
				channel.send({
					type: "broadcast",
					event: "reflection_completed",
					payload: {
						userId,
						reflectionType,
						reflectionId: data.id,
					},
				});

				setSubmitSuccess(true);

				if (onSuccess) {
					onSuccess();
				}

				return { success: true, data };
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Failed to save reflection";
				setSubmitError(errorMessage);

				if (onError) {
					onError(error as Error);
				}

				return { success: false, error: errorMessage };
			} finally {
				setIsSubmitting(false);
			}
		},
		[],
	);

	const clearError = useCallback(() => {
		setSubmitError(null);
	}, []);

	const resetState = useCallback(() => {
		setIsSubmitting(false);
		setSubmitError(null);
		setSubmitSuccess(false);
	}, []);

	return {
		submitReflection,
		isSubmitting,
		submitError,
		submitSuccess,
		clearError,
		resetState,
	};
}
