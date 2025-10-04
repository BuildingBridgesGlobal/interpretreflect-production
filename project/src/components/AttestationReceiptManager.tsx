import {
	Award,
	CheckCircle,
	Clock,
	Download,
	ExternalLink,
	FileCheck,
	RefreshCw,
	Shield,
	UserCheck,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import {
	attestRecovery,
	attestWellnessActivity,
	checkReadinessStatus,
	formatAttestation,
	generateAttestationReceipt,
	getUserAttestations,
	getVerificationUrl,
	type AttestationReceipt,
	type ReceiptType,
	type UserAttestation,
	verifyAttestationReceipt,
} from "../services/attestationReceiptService";

interface AttestationReceiptManagerProps {
	onClose?: () => void;
	autoGenerate?: boolean;
	activityType?: "wellness_check" | "team_sync" | "training" | "break" | "debrief";
	stressLevel?: number;
}

export const AttestationReceiptManager: React.FC<
	AttestationReceiptManagerProps
> = ({ onClose, autoGenerate = false, activityType, stressLevel }) => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [attestations, setAttestations] = useState<UserAttestation[]>([]);
	const [selectedReceipt, setSelectedReceipt] = useState<AttestationReceipt | null>(null);
	const [verificationResult, setVerificationResult] = useState<any>(null);
	const [isReady, setIsReady] = useState(false);
	const [showGenerateModal, setShowGenerateModal] = useState(false);

	useEffect(() => {
		if (user) {
			loadAttestations();
			checkReadiness();

			// Auto-generate if requested
			if (autoGenerate && activityType) {
				handleAutoGenerate();
			}
		}
	}, [user, autoGenerate, activityType]);

	const loadAttestations = async () => {
		if (!user) return;
		setLoading(true);

		const result = await getUserAttestations(user.id, 10);
		if (result.success && result.data) {
			setAttestations(result.data);
		}

		setLoading(false);
	};

	const checkReadiness = async () => {
		if (!user) return;

		const result = await checkReadinessStatus(user.id);
		setIsReady(result.isReady);
	};

	const handleAutoGenerate = async () => {
		if (!user || !activityType) return;

		setLoading(true);

		// Check if this is a recovery attestation
		if (activityType === "wellness_check" && stressLevel !== undefined && stressLevel <= 5) {
			const result = await attestRecovery(user.id, stressLevel);
			if (result.success && result.data) {
				setSelectedReceipt(result.data);
				await loadAttestations();
			}
		} else {
			// Generate regular activity attestation
			const result = await attestWellnessActivity(user.id, activityType);
			if (result.success && result.data) {
				setSelectedReceipt(result.data);
				await loadAttestations();
			}
		}

		setLoading(false);
	};

	const handleGenerateReceipt = async (type: ReceiptType) => {
		if (!user) return;

		setLoading(true);
		const result = await generateAttestationReceipt(user.id, type);

		if (result.success && result.data) {
			setSelectedReceipt(result.data);
			await loadAttestations();
			setShowGenerateModal(false);
		}

		setLoading(false);
	};

	const handleVerifyReceipt = async (receiptId: string) => {
		setLoading(true);
		const result = await verifyAttestationReceipt(receiptId, user?.id);

		if (result.success && result.data) {
			setVerificationResult(result.data);
		}

		setLoading(false);
	};

	const downloadReceipt = (receipt: AttestationReceipt) => {
		const receiptData = {
			...receipt,
			disclaimer: "This is a cryptographically signed attestation receipt. No personal health information is contained within.",
			verify_at: getVerificationUrl(receipt.receipt_id),
		};

		const blob = new Blob([JSON.stringify(receiptData, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `attestation-${receipt.type}-${receipt.receipt_id}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const getReceiptIcon = (type: string) => {
		const icons: Record<string, React.ReactNode> = {
			readiness: <UserCheck className="w-5 h-5" />,
			recovery: <RefreshCw className="w-5 h-5" />,
			wellness_check: <CheckCircle className="w-5 h-5" />,
			team_sync: <Shield className="w-5 h-5" />,
			training_complete: <Award className="w-5 h-5" />,
			shift_ready: <FileCheck className="w-5 h-5" />,
			break_taken: <Clock className="w-5 h-5" />,
			debrief_complete: <FileCheck className="w-5 h-5" />,
		};
		return icons[type] || <CheckCircle className="w-5 h-5" />;
	};

	return (
		<div className="bg-white rounded-xl shadow-lg p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<Shield className="w-8 h-8 text-green-600" />
					<div>
						<h2 className="text-2xl font-bold text-gray-900">
							Attestation Receipts
						</h2>
						<p className="text-sm text-gray-600">
							Zero-knowledge wellness verification
						</p>
					</div>
				</div>
				{onClose && (
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						×
					</button>
				)}
			</div>

			{/* Readiness Status */}
			<div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{isReady ? (
							<CheckCircle className="w-6 h-6 text-green-600" />
						) : (
							<Clock className="w-6 h-6 text-yellow-600" />
						)}
						<div>
							<h3 className="font-semibold text-gray-900">
								Readiness Status
							</h3>
							<p className="text-sm text-gray-600">
								{isReady
									? "You have a valid readiness attestation"
									: "No active readiness attestation"}
							</p>
						</div>
					</div>
					{!isReady && (
						<button
							onClick={() => handleGenerateReceipt("readiness")}
							disabled={loading}
							className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
						>
							Generate Readiness
						</button>
					)}
				</div>
			</div>

			{/* Selected Receipt Display */}
			{selectedReceipt && (
				<div className="mb-6 p-4 border-2 border-green-500 rounded-lg bg-green-50">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h3 className="font-semibold text-gray-900 mb-2">
								New Attestation Generated
							</h3>
							<div className="space-y-1 text-sm">
								<p>
									<span className="font-medium">Type:</span>{" "}
									{selectedReceipt.type}
								</p>
								<p>
									<span className="font-medium">Receipt ID:</span>{" "}
									<code className="bg-white px-2 py-1 rounded text-xs">
										{selectedReceipt.receipt_id}
									</code>
								</p>
								<p>
									<span className="font-medium">Hash:</span>{" "}
									<code className="bg-white px-2 py-1 rounded text-xs">
										{selectedReceipt.receipt_hash.substring(0, 16)}...
									</code>
								</p>
								<p>
									<span className="font-medium">Valid Until:</span>{" "}
									{selectedReceipt.valid_until
										? new Date(selectedReceipt.valid_until).toLocaleString()
										: "No expiration"}
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<button
								onClick={() => downloadReceipt(selectedReceipt)}
								className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
								title="Download Receipt"
							>
								<Download className="w-5 h-5" />
							</button>
							<button
								onClick={() => handleVerifyReceipt(selectedReceipt.receipt_id)}
								className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
								title="Verify Receipt"
							>
								<Shield className="w-5 h-5" />
							</button>
							<a
								href={selectedReceipt.verification_url}
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
								title="Open Verification URL"
							>
								<ExternalLink className="w-5 h-5" />
							</a>
						</div>
					</div>
				</div>
			)}

			{/* Verification Result */}
			{verificationResult && (
				<div
					className={`mb-6 p-4 rounded-lg ${
						verificationResult.valid
							? "bg-green-100 border-green-500"
							: "bg-red-100 border-red-500"
					} border`}
				>
					<h3 className="font-semibold text-gray-900 mb-2">
						Verification Result
					</h3>
					<div className="space-y-1 text-sm">
						<p>
							<span className="font-medium">Status:</span>{" "}
							{verificationResult.valid ? "✅ Valid" : "❌ Invalid"}
						</p>
						<p>
							<span className="font-medium">Reason:</span>{" "}
							{verificationResult.reason}
						</p>
						{verificationResult.verification_count && (
							<p>
								<span className="font-medium">Verification Count:</span>{" "}
								{verificationResult.verification_count}
							</p>
						)}
					</div>
				</div>
			)}

			{/* Recent Attestations */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-900">
						Recent Attestations
					</h3>
					<button
						onClick={() => setShowGenerateModal(true)}
						className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Generate New
					</button>
				</div>

				{loading ? (
					<div className="text-center py-8 text-gray-500">Loading...</div>
				) : attestations.length > 0 ? (
					<div className="space-y-3">
						{attestations.map((attestation) => (
							<div
								key={attestation.receipt_id}
								className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
							>
								<div className="flex items-center gap-3">
									{getReceiptIcon(attestation.type)}
									<div>
										<p className="font-medium text-gray-900">
											{formatAttestation(attestation)}
										</p>
										<p className="text-xs text-gray-500">
											Verified {attestation.verification_count} times
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{attestation.is_valid ? (
										<span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
											Valid
										</span>
									) : (
										<span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
											Expired
										</span>
									)}
									<button
										onClick={() => handleVerifyReceipt(attestation.receipt_id)}
										className="p-1 text-blue-600 hover:bg-blue-50 rounded"
									>
										<Shield className="w-4 h-4" />
									</button>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-8 text-gray-500">
						No attestations yet. Generate your first one above!
					</div>
				)}
			</div>

			{/* Generate Modal */}
			{showGenerateModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl p-6 max-w-md w-full">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Generate Attestation Receipt
						</h3>
						<div className="space-y-2">
							{[
								"readiness",
								"wellness_check",
								"team_sync",
								"training_complete",
								"shift_ready",
								"break_taken",
								"debrief_complete",
							].map((type) => (
								<button
									key={type}
									onClick={() => handleGenerateReceipt(type as ReceiptType)}
									className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 flex items-center gap-3"
								>
									{getReceiptIcon(type)}
									<span className="capitalize">
										{type.replace(/_/g, " ")}
									</span>
								</button>
							))}
						</div>
						<button
							onClick={() => setShowGenerateModal(false)}
							className="w-full mt-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
						>
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	);
};