import { Loader2 } from "lucide-react";
import type React from "react";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	message?: string;
	className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	size = "md",
	message,
	className = ""
}) => {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-8 h-8", 
		lg: "w-12 h-12"
	};

	return (
		<div className={`flex flex-col items-center justify-center ${className}`}>
			<Loader2
				className={`${sizeClasses[size]} animate-spin`}
				style={{ color: "#5C7F4F" }}
			/>
			{message && (
				<p className="mt-2 text-sm text-gray-600 text-center">
					{message}
				</p>
			)}
		</div>
	);
};

export default LoadingSpinner;
