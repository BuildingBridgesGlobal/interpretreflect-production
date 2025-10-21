import type React from "react";
import { useState } from "react";

interface ScaleSliderProps {
	label: string;
	value: number;
	onChange: (value: number) => void;
	minLabel?: string;
	maxLabel?: string;
	helpText?: string;
	showValue?: boolean;
	disabled?: boolean;
}

/**
 * Beautiful, accessible slider component for 1-5 scales
 * Replaces numeric inputs with an intuitive, interactive experience
 */
export const ScaleSlider: React.FC<ScaleSliderProps> = ({
	label,
	value,
	onChange,
	minLabel = "Low",
	maxLabel = "High",
	helpText,
	showValue = true,
	disabled = false,
}) => {
	const [isFocused, setIsFocused] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(Number(e.target.value));
	};

	const getValueLabel = (val: number): string => {
		const labels = [
			"Very Low",
			"Low",
			"Moderate",
			"High",
			"Very High"
		];
		return labels[val - 1] || "";
	};

	const getColorForValue = (val: number): string => {
		const colors = [
			"#EF4444", // red-500 - Very Low
			"#F97316", // orange-500 - Low
			"#EAB308", // yellow-500 - Moderate
			"#84CC16", // lime-500 - High
			"#22C55E", // green-500 - Very High
		];
		return colors[val - 1] || colors[2];
	};

	return (
		<div className="space-y-3">
			{/* Label and help text */}
			<div>
				<label
					htmlFor={`slider-${label}`}
					className="block text-sm font-medium mb-1"
					style={{ color: "var(--color-slate-700)" }}
				>
					{label}
				</label>
				{helpText && (
					<p
						className="text-xs mb-2"
						style={{ color: "var(--color-slate-500)" }}
					>
						{helpText}
					</p>
				)}
			</div>

			{/* Value display */}
			{showValue && (
				<div className="flex items-center justify-center mb-2">
					<span
						className="text-2xl font-bold px-4 py-2 rounded-lg transition-all"
						style={{
							color: getColorForValue(value),
							backgroundColor: `${getColorForValue(value)}15`,
						}}
					>
						{value} - {getValueLabel(value)}
					</span>
				</div>
			)}

			{/* Slider container */}
			<div className="relative px-1">
				{/* Track markers */}
				<div className="flex justify-between mb-2 px-1">
					{[1, 2, 3, 4, 5].map((num) => (
						<button
							key={num}
							type="button"
							onClick={() => !disabled && onChange(num)}
							disabled={disabled}
							className="flex flex-col items-center gap-1 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
							style={{
								color:
									value === num
										? getColorForValue(num)
										: "var(--color-slate-400)",
								opacity: disabled ? 0.5 : 1,
								cursor: disabled ? "not-allowed" : "pointer",
							}}
							aria-label={`Set value to ${num} - ${getValueLabel(num)}`}
						>
							<div
								className="w-3 h-3 rounded-full transition-all"
								style={{
									backgroundColor:
										value === num
											? getColorForValue(num)
											: "var(--color-slate-300)",
									transform: value === num ? "scale(1.3)" : "scale(1)",
									boxShadow:
										value === num
											? `0 0 0 3px ${getColorForValue(num)}20`
											: "none",
								}}
							/>
							<span className="text-xs font-medium">{num}</span>
						</button>
					))}
				</div>

				{/* Actual slider input */}
				<input
					id={`slider-${label}`}
					type="range"
					min="1"
					max="5"
					step="1"
					value={value}
					onChange={handleChange}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					disabled={disabled}
					className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-custom"
					style={{
						background: `linear-gradient(to right,
							${getColorForValue(1)} 0%,
							${getColorForValue(2)} 25%,
							${getColorForValue(3)} 50%,
							${getColorForValue(4)} 75%,
							${getColorForValue(5)} 100%)`,
						opacity: disabled ? 0.5 : 1,
						cursor: disabled ? "not-allowed" : "pointer",
					}}
					aria-label={label}
					aria-valuemin={1}
					aria-valuemax={5}
					aria-valuenow={value}
					aria-valuetext={`${value} - ${getValueLabel(value)}`}
				/>

				{/* Min/Max labels */}
				<div
					className="flex justify-between text-xs mt-2"
					style={{ color: "var(--color-slate-500)" }}
				>
					<span>{minLabel}</span>
					<span>{maxLabel}</span>
				</div>
			</div>

			<style>{`
				/* Custom slider styling for consistent appearance across browsers */
				.slider-custom::-webkit-slider-thumb {
					appearance: none;
					width: 24px;
					height: 24px;
					border-radius: 50%;
					background: white;
					cursor: pointer;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15),
					            0 0 0 2px ${getColorForValue(value)};
					transition: all 0.15s ease;
				}

				.slider-custom::-webkit-slider-thumb:hover {
					transform: scale(1.15);
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2),
					            0 0 0 3px ${getColorForValue(value)};
				}

				.slider-custom::-webkit-slider-thumb:active {
					transform: scale(1.05);
				}

				.slider-custom::-moz-range-thumb {
					width: 24px;
					height: 24px;
					border-radius: 50%;
					background: white;
					cursor: pointer;
					border: 2px solid ${getColorForValue(value)};
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
					transition: all 0.15s ease;
				}

				.slider-custom::-moz-range-thumb:hover {
					transform: scale(1.15);
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
				}

				.slider-custom:focus {
					outline: none;
					box-shadow: 0 0 0 3px ${getColorForValue(value)}40;
				}

				.slider-custom:disabled::-webkit-slider-thumb {
					cursor: not-allowed;
				}

				.slider-custom:disabled::-moz-range-thumb {
					cursor: not-allowed;
				}
			`}</style>
		</div>
	);
};
