import { CheckCircle, Shield } from "lucide-react";
import React, { useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

/**
 * Quick test component for Attestation Receipts
 * Add this to any page to test the functionality
 */
export const TestAttestationReceipt: React.FC = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [receipt, setReceipt] = useState<any>(null);
	const [receipts, setReceipts] = useState<any[]>([]);
	const [message, setMessage] = useState("");

	// Generate a new attestation receipt
	const generateReceipt = async (type: string) => {
		if (!user) {
			setMessage("Please sign in first");
			return;
		}

		setLoading(true);
		setMessage("");

		try {
			// Generate unique receipt ID
			const receiptId = `rcpt_${Date.now()}_${Math.random()
				.toString(36)
				.substr(2, 9)}`;

			// Create hash (simplified for testing)
			const hashData = `${user.id}-${type}-${Date.now()}`;
			const encoder = new TextEncoder();
			const data = encoder.encode(hashData);
			const hashBuffer = await crypto.subtle.digest("SHA-256", data);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

			// Create signature (simplified HMAC for testing)
			const key = await crypto.subtle.importKey(
				"raw",
				encoder.encode("test-key-change-in-production"),
				{ name: "HMAC", hash: "SHA-256" },
				false,
				["sign"]
			);
			const signatureBuffer = await crypto.subtle.sign(
				"HMAC",
				key,
				encoder.encode(hashData)
			);
			const signatureArray = Array.from(new Uint8Array(signatureBuffer));
			const signature = signatureArray
				.map(b => b.toString(16).padStart(2, "0"))
				.join("");

			// Calculate expiration (24 hours from now)
			const expiresAt = new Date();
			expiresAt.setHours(expiresAt.getHours() + 24);

			// Insert attestation receipt
			const { data, error } = await supabase
				.from("attestation_receipts")
				.insert([
					{
						user_id: user.id,
						receipt_id: receiptId,
						artifact_hash: `sha256:${hash}`,
						payload: {
							type: type,
							attests_to: {
								state: type === "readiness" ? "ready" : "completed",
								version: "v0"
							},
							nonce: crypto.randomUUID(),
							timestamp: Date.now()
						},
						verifier_url: `${window.location.origin}/verify/${receiptId}`,
						status: "verified",
						signature: signature,
						expires_at: expiresAt.toISOString(),
						receipt_type: type
					}
				])
				.select("*")
				.single();

			if (error) throw error;

			setReceipt(data);
			setMessage(`✅ ${type} attestation generated successfully!`);

			// Refresh receipts list
			fetchReceipts();
		} catch (error) {
			console.error("Error generating receipt:", error);
			setMessage(`❌ Error: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	// Fetch user's receipts
	const fetchReceipts = async () => {
		if (!user) return;

		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("attestation_receipts")
				.select("*")
				.eq("user_id", user.id)
				.order("issued_at", { ascending: false })
				.limit(10);

			if (error) throw error;

			setReceipts(data || []);
		} catch (error) {
			console.error("Error fetching receipts:", error);
			setMessage(`❌ Error fetching receipts: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	// Verify a receipt
	const verifyReceipt = async (receiptId: string) => {
		setLoading(true);
		setMessage("");

		try {
			const { data, error } = await supabase
				.from("attestation_receipts")
				.select("*")
				.eq("receipt_id", receiptId)
				.single();

			if (error) throw error;

			// Check if expired
			const isExpired = data.expires_at && new Date(data.expires_at) < new Date();

			if (isExpired) {
				setMessage(`⚠️ Receipt ${receiptId} is expired`);
			} else {
				setMessage(`✅ Receipt ${receiptId} is valid`);
			}

			// Log verification (you could create a separate verification log table)
			console.log("Verification result:", {
				valid: !isExpired,
				receipt: data
			});

		} catch (error) {
			console.error("Error verifying receipt:", error);
			setMessage(`❌ Error: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
			<h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
				<Shield className="w-8 h-8 text-green-600" />
				Test Attestation Receipts
			</h2>

			{/* Status Message */}
			{message && (
				<div className={`p-3 mb-4 rounded-lg ${
					message.startsWith("✅") ? "bg-green-100 text-green-800" :
					message.startsWith("❌") ? "bg-red-100 text-red-800" :
					"bg-yellow-100 text-yellow-800"
				}`}>
					{message}
				</div>
			)}

			{/* Generate Buttons */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold mb-3">Generate New Receipt</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
					{[
						"readiness",
						"recovery",
						"wellness_check",
						"team_sync",
						"training_complete",
						"shift_ready",
						"break_taken",
						"debrief_complete"
					].map(type => (
						<button
							key={type}
							onClick={() => generateReceipt(type)}
							disabled={loading || !user}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
						>
							{type.replace(/_/g, " ")}
						</button>
					))}
				</div>
			</div>

			{/* Latest Receipt */}
			{receipt && (
				<div className="mb-6 p-4 bg-[rgba(107,130,104,0.05)] border-2 border-green-200 rounded-lg">
					<h3 className="font-semibold mb-2">Latest Receipt Generated</h3>
					<div className="text-sm space-y-1 font-mono">
						<p><strong>ID:</strong> {receipt.receipt_id}</p>
						<p><strong>Hash:</strong> {receipt.artifact_hash?.substring(0, 50)}...</p>
						<p><strong>Signature:</strong> {receipt.signature?.substring(0, 50)}...</p>
						<p><strong>Type:</strong> {receipt.receipt_type}</p>
						<p><strong>Status:</strong> {receipt.status}</p>
						<p><strong>Expires:</strong> {new Date(receipt.expires_at).toLocaleString()}</p>
					</div>
					<button
						onClick={() => verifyReceipt(receipt.receipt_id)}
						className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
					>
						Verify This Receipt
					</button>
				</div>
			)}

			{/* Receipts List */}
			<div>
				<div className="flex justify-between items-center mb-3">
					<h3 className="text-lg font-semibold">Your Receipts</h3>
					<button
						onClick={fetchReceipts}
						disabled={loading || !user}
						className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
					>
						Refresh
					</button>
				</div>

				{receipts.length > 0 ? (
					<div className="space-y-2">
						{receipts.map(r => (
							<div key={r.id} className="p-3 border rounded-lg flex justify-between items-center">
								<div>
									<p className="font-medium">{r.receipt_type}</p>
									<p className="text-sm text-gray-600">
										{r.receipt_id} • {new Date(r.issued_at).toLocaleString()}
									</p>
								</div>
								<div className="flex gap-2">
									<span className={`px-2 py-1 text-xs rounded-full ${
										r.status === "verified" ? "bg-green-100 text-green-700" :
										r.status === "pending" ? "bg-yellow-100 text-yellow-700" :
										"bg-red-100 text-red-700"
									}`}>
										{r.status}
									</span>
									<button
										onClick={() => verifyReceipt(r.receipt_id)}
										className="p-1 text-blue-600 hover:bg-blue-50 rounded"
									>
										<CheckCircle className="w-4 h-4" />
									</button>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500 text-center py-8">
						{user ? "No receipts yet. Generate one above!" : "Please sign in to view receipts"}
					</p>
				)}
			</div>

			{!user && (
				<div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<p className="text-yellow-800">Please sign in to test attestation receipts</p>
				</div>
			)}
		</div>
	);
};