import { ArrowLeft, Home, X } from "lucide-react";
import type React from "react";

interface ModalNavigationHeaderProps {
	title: string;
	subtitle?: string;
	onClose: () => void;
	onHome?: () => void;
	showAutoSave?: boolean;
}

export const ModalNavigationHeader: React.FC<ModalNavigationHeaderProps> = ({
	title,
	subtitle,
	onClose,
	onHome,
	showAutoSave = false,
}) => {
	return (
		<div
			className="border-b pb-4 mb-6"
			style={{ borderColor: "rgba(92, 127, 79, 0.2)" }}
		>
			{/* Top Navigation Bar */}
			<div className="flex justify-between items-start mb-3">
				<div className="flex gap-2">
					{/* Return to Dashboard Button */}
					<button
						type="button"
						onClick={onHome || onClose}
						className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:shadow-md"
						style={{
							backgroundColor: "#F0F5ED",
							color: "#1b5e20",
							border: "1px solid rgba(27, 94, 32, 0.2)",
						}}
						aria-label="Return to dashboard"
					>
						<Home className="h-4 w-4" />
						<span className="text-sm font-medium">Dashboard</span>
					</button>

					{/* Back Button (alternative style) */}
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:shadow-md"
						style={{
							backgroundColor: "transparent",
							color: "#5A5A5A",
							border: "1px solid rgba(92, 127, 79, 0.2)",
						}}
						aria-label="Go back"
					>
						<ArrowLeft className="h-4 w-4" />
						<span className="text-sm font-medium">Back</span>
					</button>
				</div>

				{/* Close Button */}
				<button
					type="button"
					onClick={onClose}
					className="p-2 rounded-lg transition-all hover:bg-gray-100"
					aria-label="Close"
				>
					<X className="h-5 w-5" style={{ color: "#5A5A5A" }} />
				</button>
			</div>

			{/* Title Section */}
			<div>
				<h2 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
					{title}
				</h2>
				{subtitle && (
					<p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>
						{subtitle}
					</p>
				)}
				{showAutoSave && (
					<p
						className="text-xs mt-2 flex items-center gap-1"
						style={{ color: "#1b5e20" }}
					>
						<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
						Auto-saving your progress
					</p>
				)}
			</div>
		</div>
	);
};
