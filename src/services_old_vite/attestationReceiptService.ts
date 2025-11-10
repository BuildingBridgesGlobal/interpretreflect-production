/**
 * Attestation Receipt Service v0
 * Timestamped, signed readiness/recovery receipts with NO payload
 * Part of Zero-Knowledge Wellness Verification (ZKWV) system
 */

import { supabase } from "../lib/supabase";

// Browser-compatible hashing using Web Crypto API
const DEPLOYMENT_SALT =
	import.meta.env.VITE_ZKWV_SALT || "interpretreflect-zkwv-2025";

/**
 * Create a SHA-256 hash using Web Crypto API
 */
async function createHash(input: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(input + DEPLOYMENT_SALT);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Receipt types available in the system
 */
export type ReceiptType =
	| "readiness" // Interpreter is ready for assignment
	| "recovery" // Recovery from stress/burnout achieved
	| "wellness_check" // Regular wellness check completed
	| "team_sync" // Team synchronization completed
	| "training_complete" // Training or prep session completed
	| "shift_ready" // Ready for shift/assignment
	| "break_taken" // Wellness break completed
	| "debrief_complete"; // Post-assignment debrief done

/**
 * Attestation Receipt interface
 */
export interface AttestationReceipt {
	receipt_id: string;
	receipt_hash: string;
	signature: string;
	type: ReceiptType;
	issued_at: string;
	valid_until?: string;
	verification_url: string;
}

/**
 * Verification Result interface
 */
export interface VerificationResult {
	valid: boolean;
	reason: string;
	receipt_type?: ReceiptType;
	issued_at?: string;
	valid_until?: string;
	attests_to?: Record<string, any>;
	verification_count?: number;
}

/**
 * User Attestation interface
 */
export interface UserAttestation {
	receipt_id: string;
	type: ReceiptType;
	issued_at: string;
	valid_until?: string;
	receipt_hash: string;
	verification_count: number;
	is_valid: boolean;
}

/**
 * Generate an attestation receipt for a user
 * @param userId - The user's ID (will be hashed)
 * @param receiptType - Type of attestation
 * @param validHours - How many hours the receipt is valid (0 = no expiration)
 * @returns AttestationReceipt or error
 */
export async function generateAttestationReceipt(
	userId: string,
	receiptType: ReceiptType,
	validHours: number = 24,
): Promise<{
	success: boolean;
	data?: AttestationReceipt;
	error?: string;
}> {
	try {
		// Hash the user ID for privacy
		const userHash = await createHash(userId);

		// Call the database function to generate receipt
		const { data, error } = await supabase.rpc("generate_attestation_receipt", {
			p_user_hash: userHash,
			p_receipt_type: receiptType,
			p_valid_hours: validHours,
		});

		if (error) throw error;

		return {
			success: true,
			data: data as AttestationReceipt,
		};
	} catch (error) {
		console.error("Generate attestation error:", error);
		return {
			success: false,
			error: "Failed to generate attestation receipt",
		};
	}
}

/**
 * Verify an attestation receipt
 * @param receiptId - The receipt ID to verify
 * @param verifierId - Optional verifier ID (will be hashed)
 * @returns VerificationResult
 */
export async function verifyAttestationReceipt(
	receiptId: string,
	verifierId?: string,
): Promise<{
	success: boolean;
	data?: VerificationResult;
	error?: string;
}> {
	try {
		// Hash verifier ID if provided
		const verifierHash = verifierId ? await createHash(verifierId) : null;

		// Call the database function to verify receipt
		const { data, error } = await supabase.rpc("verify_attestation_receipt", {
			p_receipt_id: receiptId,
			p_verifier_hash: verifierHash,
		});

		if (error) throw error;

		return {
			success: true,
			data: data as VerificationResult,
		};
	} catch (error) {
		console.error("Verify attestation error:", error);
		return {
			success: false,
			error: "Failed to verify attestation receipt",
		};
	}
}

/**
 * Get user's recent attestation receipts
 * @param userId - The user's ID (will be hashed)
 * @param limit - Maximum number of receipts to return
 * @returns Array of UserAttestation
 */
export async function getUserAttestations(
	userId: string,
	limit: number = 10,
): Promise<{
	success: boolean;
	data?: UserAttestation[];
	error?: string;
}> {
	try {
		// Hash the user ID for privacy
		const userHash = await createHash(userId);

		// Call the database function to get attestations
		const { data, error } = await supabase.rpc("get_user_attestations", {
			p_user_hash: userHash,
			p_limit: limit,
		});

		if (error) throw error;

		return {
			success: true,
			data: data as UserAttestation[],
		};
	} catch (error) {
		console.error("Get attestations error:", error);
		return {
			success: false,
			error: "Failed to retrieve attestation receipts",
		};
	}
}

/**
 * Generate attestation after completing a wellness activity
 * @param userId - User who completed the activity
 * @param activityType - Type of activity completed
 * @returns AttestationReceipt
 */
export async function attestWellnessActivity(
	userId: string,
	activityType:
		| "wellness_check"
		| "team_sync"
		| "training"
		| "break"
		| "debrief",
): Promise<{
	success: boolean;
	data?: AttestationReceipt;
	error?: string;
}> {
	// Map activity types to receipt types
	const receiptTypeMap: Record<string, ReceiptType> = {
		wellness_check: "wellness_check",
		team_sync: "team_sync",
		training: "training_complete",
		break: "break_taken",
		debrief: "debrief_complete",
	};

	const receiptType = receiptTypeMap[activityType];
	if (!receiptType) {
		return {
			success: false,
			error: "Invalid activity type",
		};
	}

	// Generate attestation with appropriate validity
	const validHours = activityType === "wellness_check" ? 24 : 168; // 24h for checks, 1 week for others

	return generateAttestationReceipt(userId, receiptType, validHours);
}

/**
 * Check if user has valid readiness attestation
 * @param userId - User to check
 * @returns Boolean indicating readiness status
 */
export async function checkReadinessStatus(
	userId: string,
): Promise<{
	isReady: boolean;
	attestation?: UserAttestation;
	error?: string;
}> {
	try {
		// Get user's attestations
		const result = await getUserAttestations(userId, 5);

		if (!result.success || !result.data) {
			return { isReady: false };
		}

		// Find valid readiness or shift_ready attestation
		const readinessAttestation = result.data.find(
			(att) =>
				(att.type === "readiness" || att.type === "shift_ready") &&
				att.is_valid,
		);

		return {
			isReady: !!readinessAttestation,
			attestation: readinessAttestation,
		};
	} catch (error) {
		console.error("Check readiness error:", error);
		return {
			isReady: false,
			error: "Failed to check readiness status",
		};
	}
}

/**
 * Generate recovery attestation after stress management
 * @param userId - User who recovered
 * @param stressLevel - Current stress level (must be below threshold)
 * @returns AttestationReceipt or error
 */
export async function attestRecovery(
	userId: string,
	stressLevel: number,
): Promise<{
	success: boolean;
	data?: AttestationReceipt;
	error?: string;
}> {
	// Only generate recovery attestation if stress is below threshold
	if (stressLevel > 5) {
		return {
			success: false,
			error: "Stress level too high for recovery attestation",
		};
	}

	// Generate recovery attestation valid for 72 hours
	return generateAttestationReceipt(userId, "recovery", 72);
}

/**
 * Batch verify multiple attestation receipts
 * @param receiptIds - Array of receipt IDs to verify
 * @returns Array of verification results
 */
export async function batchVerifyReceipts(
	receiptIds: string[],
): Promise<{
	success: boolean;
	data?: VerificationResult[];
	error?: string;
}> {
	try {
		const verificationPromises = receiptIds.map((id) =>
			verifyAttestationReceipt(id),
		);

		const results = await Promise.all(verificationPromises);

		const data = results
			.filter((r) => r.success && r.data)
			.map((r) => r.data!);

		return {
			success: true,
			data,
		};
	} catch (error) {
		console.error("Batch verify error:", error);
		return {
			success: false,
			error: "Failed to batch verify receipts",
		};
	}
}

/**
 * Get shareable verification URL for a receipt
 * @param receiptId - The receipt ID
 * @returns Shareable URL
 */
export function getVerificationUrl(receiptId: string): string {
	const baseUrl =
		import.meta.env.VITE_APP_URL || "https://interpretreflect.com";
	return `${baseUrl}/verify/${receiptId}`;
}

/**
 * Format attestation for display
 * @param attestation - The attestation to format
 * @returns Formatted string
 */
export function formatAttestation(attestation: UserAttestation): string {
	const typeLabels: Record<ReceiptType, string> = {
		readiness: "Ready for Assignment",
		recovery: "Recovery Achieved",
		wellness_check: "Wellness Check Complete",
		team_sync: "Team Sync Complete",
		training_complete: "Training Complete",
		shift_ready: "Shift Ready",
		break_taken: "Wellness Break Taken",
		debrief_complete: "Debrief Complete",
	};

	const label = typeLabels[attestation.type as ReceiptType] || attestation.type;
	const date = new Date(attestation.issued_at).toLocaleDateString();
	const time = new Date(attestation.issued_at).toLocaleTimeString();

	return `${label} - ${date} at ${time}`;
}

/**
 * Initialize Attestation Receipt system
 */
export function initializeAttestationReceipts(): {
	enabled: boolean;
	features: string[];
} {
	return {
		enabled: true,
		features: [
			"TIMESTAMPED_RECEIPTS",
			"DIGITAL_SIGNATURES",
			"NO_PHI_PAYLOAD",
			"VERIFICATION_AUDIT",
			"READINESS_ATTESTATION",
			"RECOVERY_ATTESTATION",
			"SHAREABLE_PROOFS",
		],
	};
}