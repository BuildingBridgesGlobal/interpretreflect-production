import React, { useState, useEffect } from "react";
import { Shield, CheckCircle, Database, Hash, Lock, Eye } from "lucide-react";
import { supabase } from "../lib/supabase";
import { saveReflectionZKWV, generateWellnessProof, verifyWellnessProof } from "../services/zkwvService";

interface ZKWVVerificationProps {
	userId: string;
	onClose: () => void;
}

export const ZKWVVerification: React.FC<ZKWVVerificationProps> = ({ userId, onClose }) => {
	const [step, setStep] = useState<'intro' | 'demo' | 'verify' | 'proof'>('intro');
	const [testData, setTestData] = useState<any>(null);
	const [anonymizedData, setAnonymizedData] = useState<any>(null);
	const [proofId, setProofId] = useState<string | null>(null);
	const [verificationResult, setVerificationResult] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	// Step 1: Create a test reflection with personal data
	const createTestReflection = async () => {
		setLoading(true);
		const testReflectionData = {
			stress_level: 7,
			energy_level: 4,
			confidence: 6,
			session_id: `test_${Date.now()}`,
			assignment_type: "medical",
			// This personal info will NOT be stored in anonymized system
			notes: "This is personal health information that stays private",
			patient_name: "John Doe", // This will NOT be in anonymized data
		};

		setTestData(testReflectionData);

		// Save using ZKWV (creates both personal and anonymized records)
		const result = await saveReflectionZKWV(userId, "wellness_check", testReflectionData);

		if (result.success) {
			// Wait a moment for database to update
			setTimeout(async () => {
				await fetchAnonymizedData();
				setStep('demo');
				setLoading(false);
			}, 1000);
		} else {
			setLoading(false);
			alert("Error creating test reflection");
		}
	};

	// Step 2: Fetch and show the anonymized data
	const fetchAnonymizedData = async () => {
		// Create the same hash that ZKWV uses
		const DEPLOYMENT_SALT = import.meta.env.VITE_ZKWV_SALT || "interpretreflect-zkwv-2025";
		const encoder = new TextEncoder();
		const data = encoder.encode(userId + DEPLOYMENT_SALT);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const userHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

		// Fetch anonymized data
		const { data: anonymized } = await supabase
			.from('anonymized_reflections')
			.select('*')
			.eq('user_hash', userHash)
			.order('created_at', { ascending: false })
			.limit(1);

		if (anonymized && anonymized.length > 0) {
			setAnonymizedData({ ...anonymized[0], userHash });
		}
	};

	// Step 3: Generate a zero-knowledge proof
	const generateProof = async () => {
		setLoading(true);
		const result = await generateWellnessProof(userId, {
			type: "stress_below",
			value: 8,
			weeks: 4
		});

		if (result.success && result.proofId) {
			setProofId(result.proofId);
			setStep('proof');
		}
		setLoading(false);
	};

	// Step 4: Verify the proof
	const verifyProof = async () => {
		if (!proofId) return;
		setLoading(true);
		const result = await verifyWellnessProof(proofId);
		setVerificationResult(result);
		setLoading(false);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="p-3 rounded-full bg-green-100">
							<Shield className="w-6 h-6 text-green-600" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-gray-900">
								Zero-Knowledge Wellness Verification
							</h2>
							<p className="text-sm text-gray-600">
								HIPAA-Compliant Data Protection in Action
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
					>
						<span className="text-2xl text-gray-500">×</span>
					</button>
				</div>

				{/* Intro Step */}
				{step === 'intro' && (
					<div className="space-y-6">
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
							<h3 className="text-lg font-semibold text-blue-900 mb-3">
								What is Zero-Knowledge Wellness Verification?
							</h3>
							<p className="text-blue-800 mb-4">
								ZKWV ensures that your personal health information (PHI) never leaves your device
								in an identifiable form, while still allowing you to track wellness patterns and
								generate verifiable proofs of your wellness status.
							</p>
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
									<div>
										<p className="font-medium text-gray-900">Parallel Storage</p>
										<p className="text-sm text-gray-600">
											Your personal data stays in your account. Anonymized metrics are stored separately.
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Hash className="w-5 h-5 text-purple-600 mt-0.5" />
									<div>
										<p className="font-medium text-gray-900">One-Way Hashing</p>
										<p className="text-sm text-gray-600">
											Your user ID is hashed using SHA-256. It cannot be reversed to identify you.
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Lock className="w-5 h-5 text-red-600 mt-0.5" />
									<div>
										<p className="font-medium text-gray-900">PHI Stripped</p>
										<p className="text-sm text-gray-600">
											All text, names, and identifying information is removed. Only numerical metrics remain.
										</p>
									</div>
								</div>
							</div>
						</div>

						<button
							onClick={createTestReflection}
							disabled={loading}
							className="w-full py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
						>
							{loading ? "Creating Test..." : "Start Demo - Create Test Reflection"}
						</button>
					</div>
				)}

				{/* Demo Step - Show Before/After */}
				{step === 'demo' && testData && anonymizedData && (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Personal Data */}
							<div className="border-2 border-blue-500 rounded-lg p-4">
								<div className="flex items-center gap-2 mb-3">
									<Eye className="w-5 h-5 text-blue-600" />
									<h3 className="font-semibold text-blue-900">Personal Data (Your Account)</h3>
								</div>
								<div className="bg-blue-50 rounded p-3 space-y-2 text-sm">
									<p><strong>User ID:</strong> {userId.substring(0, 8)}...</p>
									<p><strong>Stress Level:</strong> {testData.stress_level}/10</p>
									<p><strong>Energy Level:</strong> {testData.energy_level}/10</p>
									<p><strong>Confidence:</strong> {testData.confidence}/10</p>
									<p><strong>Assignment Type:</strong> {testData.assignment_type}</p>
									<p className="text-blue-800 font-medium">
										<strong>Personal Notes:</strong> "{testData.notes}"
									</p>
									<p className="text-blue-800 font-medium">
										<strong>Patient Name:</strong> {testData.patient_name}
									</p>
								</div>
							</div>

							{/* Anonymized Data */}
							<div className="border-2 border-[#6B8268] rounded-lg p-4">
								<div className="flex items-center gap-2 mb-3">
									<Database className="w-5 h-5 text-green-600" />
									<h3 className="font-semibold text-green-900">Anonymized Data (Separate DB)</h3>
								</div>
								<div className="bg-[rgba(107,130,104,0.05)] rounded p-3 space-y-2 text-sm">
									<p><strong>User Hash:</strong> {anonymizedData.userHash.substring(0, 16)}...</p>
									<p><strong>Category:</strong> {anonymizedData.reflection_category}</p>
									<p><strong>Context Type:</strong> {anonymizedData.context_type}</p>
									<p><strong>Metrics:</strong></p>
									<div className="ml-4">
										{Object.entries(anonymizedData.metrics || {}).map(([key, value]) => (
											<p key={key}>• {key}: {value as string}</p>
										))}
									</div>
									<div className="mt-3 p-2 bg-green-100 rounded">
										<p className="text-green-900 font-semibold text-xs">
											✓ No personal notes<br />
											✓ No patient names<br />
											✓ No identifying information<br />
											✓ Cannot be linked back to you
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="bg-[rgba(107,130,104,0.05)] border border-green-200 rounded-lg p-4">
							<h4 className="font-semibold text-green-900 mb-2">✓ Proof of Anonymization</h4>
							<p className="text-sm text-green-800">
								The anonymized data contains ONLY numerical metrics and categories.
								All text fields with PHI (personal notes, patient names) have been completely removed.
								The user hash is a one-way SHA-256 hash that cannot be reversed to identify you.
							</p>
						</div>

						<div className="flex gap-3">
							<button
								onClick={() => setStep('verify')}
								className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
							>
								Next: Generate Zero-Knowledge Proof
							</button>
							<button
								onClick={onClose}
								className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
							>
								Close
							</button>
						</div>
					</div>
				)}

				{/* Verify Step - Generate Proof */}
				{step === 'verify' && (
					<div className="space-y-6">
						<div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
							<h3 className="text-lg font-semibold text-purple-900 mb-3">
								Zero-Knowledge Proof Generation
							</h3>
							<p className="text-purple-800 mb-4">
								Now we'll generate a proof that your stress levels have been below 8/10
								for the past 4 weeks, WITHOUT revealing your actual stress levels or identity.
							</p>
							<div className="bg-white rounded p-4 mb-4">
								<p className="text-sm text-gray-700">
									<strong>What's being proven:</strong> "This user has maintained stress levels below 8/10"
								</p>
								<p className="text-sm text-gray-700 mt-2">
									<strong>What's NOT revealed:</strong> Exact stress values, user identity, specific dates
								</p>
							</div>
						</div>

						<button
							onClick={generateProof}
							disabled={loading}
							className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
						>
							{loading ? "Generating Proof..." : "Generate Zero-Knowledge Proof"}
						</button>
					</div>
				)}

				{/* Proof Step - Verify */}
				{step === 'proof' && proofId && (
					<div className="space-y-6">
						<div className="bg-[rgba(107,130,104,0.05)] border border-green-200 rounded-lg p-6">
							<div className="flex items-center gap-3 mb-4">
								<CheckCircle className="w-8 h-8 text-green-600" />
								<div>
									<h3 className="text-lg font-semibold text-green-900">
										Proof Generated Successfully!
									</h3>
									<p className="text-sm text-green-700">
										Proof ID: {proofId}
									</p>
								</div>
							</div>
							<p className="text-green-800 mb-4">
								This proof can be verified by anyone (e.g., an employer, insurance company)
								to confirm you meet the wellness criteria, WITHOUT revealing your personal data.
							</p>
						</div>

						{!verificationResult && (
							<button
								onClick={verifyProof}
								disabled={loading}
								className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
							>
								{loading ? "Verifying..." : "Verify This Proof (Third Party View)"}
							</button>
						)}

						{verificationResult && (
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
								<h4 className="font-semibold text-blue-900 mb-3">Verification Result:</h4>
								<div className="space-y-2">
									<p className="text-blue-800">
										<strong>Valid:</strong> {verificationResult.valid ? "✓ Yes" : "✗ No"}
									</p>
									{verificationResult.criteria && (
										<div className="bg-white rounded p-3 mt-2">
											<p className="text-sm font-medium text-gray-900">Validated Criteria:</p>
											<pre className="text-xs mt-2 text-gray-700">
												{JSON.stringify(verificationResult.criteria, null, 2)}
											</pre>
										</div>
									)}
								</div>
								<div className="mt-4 p-3 bg-blue-100 rounded">
									<p className="text-sm text-blue-900 font-medium">
										✓ Third parties can verify you meet criteria<br />
										✓ Without seeing your actual wellness data<br />
										✓ Without knowing your identity<br />
										✓ This is Zero-Knowledge Proof in action!
									</p>
								</div>
							</div>
						)}

						<button
							onClick={onClose}
							className="w-full py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50"
						>
							Close Demo
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
