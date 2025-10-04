import type React from "react";
import { useState } from "react";

interface BodyCheckInResultsWarmProps {
	onClose: () => void;
	onCheckInAgain?: () => void;
}

export const BodyCheckInResultsWarm: React.FC<BodyCheckInResultsWarmProps> = ({
	onClose,
	onCheckInAgain,
}) => {
	const [overall, setOverall] = useState(50);
	const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

	const handleAreaToggle = (area: string) => {
		setSelectedAreas((prev) =>
			prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
		);
	};

	return (
		<div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
			<div className="rounded-3xl max-w-lg w-full bg-white shadow-sm">
				<div className="p-8">
					{/* Header */}
					<div className="mb-8">
						<h2 className="text-xl font-normal text-gray-700 mb-2">
							Let me check in with you
						</h2>
						<p className="text-gray-500 text-sm">
							How are things in your body?
						</p>
					</div>

					{/* Overall Slider */}
					<div className="mb-8">
						<div className="flex justify-between items-center mb-3">
							<span className="text-sm font-medium text-gray-700">
								Overall, you're feeling:
							</span>
						</div>
						<div className="relative">
							<div className="flex justify-between text-xs text-gray-500 mb-2">
								<span>Tense</span>
								<span>Relaxed</span>
							</div>
							<input
								type="range"
								min="0"
								max="100"
								value={overall}
								onChange={(e) => setOverall(Number(e.target.value))}
								className="comfort-slider w-full"
								style={{
									background: `linear-gradient(to right, #E2E8F0 0%, #E2E8F0 ${overall}%, #F7FAFC ${overall}%, #F7FAFC 100%)`,
								}}
							/>
						</div>
						<p className="text-xs text-gray-400 mt-2 italic">
							Wherever you are is okay
						</p>
					</div>

					{/* Areas needing attention */}
					<div className="mb-8">
						<p className="text-sm font-medium text-gray-700 mb-4">
							Any spots asking for attention?
						</p>
						<div className="space-y-2">
							{[
								"Upper area (head, neck, shoulders)",
								"Middle (back, core)",
								"Hands and arms",
								"Everything's pretty good",
								"Not sure, just tired",
							].map((area) => (
								<button
									key={area}
									onClick={() => handleAreaToggle(area)}
									className={`w-full p-3 rounded-lg text-left transition-all text-sm ${
										selectedAreas.includes(area)
											? "bg-blue-50 border-2 border-blue-300"
											: "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
									}`}
								>
									<div className="flex items-center">
										<div
											className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
												selectedAreas.includes(area)
													? "border-blue-400 bg-blue-400"
													: "border-gray-300"
											}`}
										>
											{selectedAreas.includes(area) && (
												<div className="w-2 h-2 bg-white rounded-full" />
											)}
										</div>
										<span className="text-gray-700">{area}</span>
									</div>
								</button>
							))}
						</div>
					</div>

					{/* Gentle thought */}
					<div className="mb-8 p-4 bg-blue-50 rounded-xl">
						<p className="text-sm font-medium text-gray-700 mb-2">
							A gentle thought:
						</p>
						<p className="text-sm text-gray-600 mb-2">
							Your body worked hard today. Whatever you noticed, you're taking
							care of yourself.
						</p>
						<p className="text-sm text-gray-500 italic">That's what matters.</p>
					</div>

					{/* Actions */}
					<div className="flex gap-3">
						<button
							onClick={onClose}
							className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all text-sm font-medium"
						>
							Done
						</button>
						{onCheckInAgain && (
							<button
								onClick={onCheckInAgain}
								className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all text-sm font-medium"
							>
								Check In Again Later
							</button>
						)}
					</div>
				</div>
			</div>

			<style jsx>{`
        .comfort-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 2px;
          background: #e2e8f0;
          border-radius: 1px;
          outline: none;
        }

        .comfort-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #4a90e2;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .comfort-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .comfort-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #4a90e2;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          border: none;
        }

        .comfort-slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
		</div>
	);
};
