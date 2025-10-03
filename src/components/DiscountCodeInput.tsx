import React, { useState } from "react";
import { Check, X, Tag } from "lucide-react";

interface DiscountCodeInputProps {
	onCodeApplied: (code: string) => void;
	onCodeRemoved: () => void;
	disabled?: boolean;
}

export const DiscountCodeInput: React.FC<DiscountCodeInputProps> = ({
	onCodeApplied,
	onCodeRemoved,
	disabled = false,
}) => {
	const [code, setCode] = useState("");
	const [appliedCode, setAppliedCode] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleApplyCode = async () => {
		if (!code.trim()) {
			setError("Please enter a discount code");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Validate the code format (basic check)
			const trimmedCode = code.trim().toUpperCase();

			// For now, we'll accept BETA30DAYS
			// In production, you'd validate against Stripe API
			if (trimmedCode === "BETA30DAYS") {
				setAppliedCode(trimmedCode);
				onCodeApplied(trimmedCode);
				setError(null);
			} else {
				setError("Invalid discount code");
			}
		} catch (err) {
			setError("Error applying code. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveCode = () => {
		setCode("");
		setAppliedCode(null);
		setError(null);
		onCodeRemoved();
	};

	return (
		<div className="w-full max-w-md mx-auto mb-8">
			<div className="flex items-center gap-2 mb-3">
				<Tag className="w-5 h-5" style={{ color: "rgb(92, 127, 79)" }} />
				<label
					htmlFor="discount-code"
					className="text-sm font-semibold"
					style={{ color: "rgb(45, 58, 49)" }}
				>
					Have a discount code?
				</label>
			</div>

			{!appliedCode ? (
				<div className="flex gap-2">
					<input
						id="discount-code"
						type="text"
						value={code}
						onChange={(e) => {
							setCode(e.target.value.toUpperCase());
							setError(null);
						}}
						placeholder="Enter code (e.g., BETA30DAYS)"
						disabled={disabled || isLoading}
						className="flex-1 px-4 py-3 border-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
						style={{
							borderColor: error ? "#b91c1c" : "#d1d5db",
							backgroundColor: error ? "#fef2f2" : "#ffffff",
						}}
						onKeyPress={(e) => {
							if (e.key === "Enter") {
								handleApplyCode();
							}
						}}
						aria-label="Discount code"
						aria-invalid={!!error}
						aria-describedby={error ? "discount-error" : undefined}
					/>
					<button
						onClick={handleApplyCode}
						disabled={disabled || isLoading || !code.trim()}
						className="px-6 py-3 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
						style={{
							background:
								"linear-gradient(135deg, rgb(45, 95, 63), rgb(91, 147, 120))",
							boxShadow: "rgba(107, 139, 96, 0.3) 0px 2px 8px",
						}}
						aria-label="Apply discount code"
					>
						{isLoading ? "Checking..." : "Apply"}
					</button>
				</div>
			) : (
				<div
					className="flex items-center justify-between px-4 py-3 border-2 rounded-lg"
					style={{
						backgroundColor: "#f0fdf4",
						borderColor: "#86efac",
					}}
				>
					<div className="flex items-center gap-2">
						<Check className="w-5 h-5" style={{ color: "#16a34a" }} />
						<span className="font-semibold" style={{ color: "#15803d" }}>
							{appliedCode} applied
							{appliedCode === "BETA30DAYS" && (
								<span className="ml-2 text-sm font-normal">
									• 30-day free trial
								</span>
							)}
						</span>
					</div>
					<button
						onClick={handleRemoveCode}
						disabled={disabled}
						className="p-1.5 rounded transition-colors disabled:opacity-50 hover:bg-green-200"
						style={{ color: "#16a34a" }}
						aria-label="Remove discount code"
					>
						<X className="w-5 h-5" />
					</button>
				</div>
			)}

			{error && (
				<p
					id="discount-error"
					className="mt-2 text-sm flex items-center gap-1"
					style={{ color: "#b91c1c" }}
					role="alert"
				>
					<X className="w-4 h-4" />
					{error}
				</p>
			)}
		</div>
	);
};
