import type React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
	variant?: "default" | "dark" | "light";
	size?: "sm" | "md" | "lg" | "xl";
	showTagline?: boolean;
	className?: string;
	linkToHome?: boolean;
}

const Logo: React.FC<LogoProps> = ({
	variant = "default",
	size = "md",
	showTagline = false,
	className = "",
	linkToHome = true,
}) => {
	const sizeClasses = {
		sm: "text-xl",
		md: "text-2xl",
		lg: "text-3xl",
		xl: "text-4xl",
	};

	const variantClasses = {
		default: "text-sage-700",
		dark: "text-gray-900",
		light: "text-white",
	};

	const logoContent = (
		<div className={`flex items-center ${className}`}>
			<div>
				{/* Main Logo Text */}
				<h1
					className={`${sizeClasses[size]} ${variantClasses[variant]} font-semibold tracking-tight leading-none`}
				>
					Interpret<span style={{ color: '#6B8268' }}>Reflect</span>
				</h1>

				{/* Tagline */}
				{showTagline && (
					<p
						className={`${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"} ${
							variant === "light" ? "text-gray-200" : "text-gray-600"
						} mt-1 font-medium tracking-wide`}
					>
						Wellness for Language Professionals
					</p>
				)}
			</div>
		</div>
	);

	if (linkToHome) {
		return (
			<Link
				to="/"
				className="inline-block hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 rounded-lg"
				aria-label="InterpretReflect - Home"
			>
				{logoContent}
			</Link>
		);
	}

	return logoContent;
};

export default Logo;
