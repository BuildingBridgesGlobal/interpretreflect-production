import { Activity } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";

interface StressResetSectionProps {
	onTechniqueStart: (technique: string) => string;
	onTechniqueComplete: (techniqueId: string, duration: number | string) => void;
}

const StressResetSection: React.FC<StressResetSectionProps> = ({
	onTechniqueStart,
	onTechniqueComplete,
}) => {
	const [selectedTechnique, setSelectedTechnique] = useState<string | null>(
		null,
	);
	const [techniqueProgress, setTechniqueProgress] = useState(0);
	const [isTimerActive, setIsTimerActive] = useState(false);
	const [breathPhase, setBreathPhase] = useState<
		"inhale" | "hold-in" | "exhale" | "hold-out"
	>("inhale");
	const [breathCycle, setBreathCycle] = useState(0);
	const [bodyPart, setBodyPart] = useState(0);
	const [senseCount, setSenseCount] = useState(0);
	const [expansionLevel, setExpansionLevel] = useState(0);
	const [currentTechniqueId, setCurrentTechniqueId] = useState<string | null>(
		null,
	);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const handleTechniqueClick = (technique: string) => {
		const id = onTechniqueStart(technique);
		setCurrentTechniqueId(id);
		setSelectedTechnique(technique);
		setIsTimerActive(true);
		setTechniqueProgress(0);

		// Reset technique-specific state
		setBreathPhase("inhale");
		setBreathCycle(0);
		setBodyPart(0);
		setSenseCount(0);
		setExpansionLevel(0);
	};

	const handleComplete = () => {
		if (currentTechniqueId) {
			onTechniqueComplete(currentTechniqueId, techniqueProgress);
		}
		setSelectedTechnique(null);
		setIsTimerActive(false);
		setTechniqueProgress(0);
		setCurrentTechniqueId(null);
	};

	const handleClose = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setSelectedTechnique(null);
		setIsTimerActive(false);
		setTechniqueProgress(0);
		setCurrentTechniqueId(null);
	};

	return (
		<main
			className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
			role="main"
			aria-labelledby="stress-reset-heading"
		>
			<header className="text-center mb-12">
				<h1
					id="stress-reset-heading"
					className="text-4xl font-bold mb-4"
					style={{ color: "var(--color-slate-700)", letterSpacing: "-0.5px" }}
				>
					Your Personal Reset Space
				</h1>
				<p
					className="text-lg mb-2"
					style={{ color: "var(--color-slate-600)", fontWeight: "400" }}
				>
					Choose what your body-mind needs right now
				</p>
				<p className="text-sm" style={{ color: "var(--color-slate-500)" }}>
					All practices are accessible for every body and mind
				</p>
			</header>

			<section
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
				aria-label="Available reset practices"
			>
				{/* Breathing Practice Card */}
				<article
					className="rounded-2xl p-6 transition-all group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-teal-500 cursor-pointer shadow-clean hover:shadow-clean-md hover:-translate-y-0.5"
					tabIndex={0}
					role="button"
					aria-labelledby="breathing-practice-title"
					onClick={() => handleTechniqueClick("breathing-practice")}
					style={{
						backgroundColor: "var(--color-card)",
						border: "1px solid var(--color-slate-200)",
					}}
				>
					<div
						className="absolute top-0 right-0 w-32 h-32 opacity-5"
						style={{
							background:
								"radial-gradient(circle, var(--color-green-600) 0%, transparent 70%)",
							transform: "translate(50%, -50%)",
						}}
					/>

					<h3
						id="breathing-practice-title"
						className="text-lg font-bold mb-3"
						style={{ color: "var(--color-slate-700)" }}
					>
						Breathing Practice
					</h3>

					<p
						className="text-sm mb-4"
						style={{ color: "var(--color-slate-600)", lineHeight: "1.6" }}
					>
						<strong>Neuroscience:</strong> Guided breathing activates your
						body's relaxation response, calming the nervous system after
						high-pressure interpreting. Research shows slow, intentional breaths
						balance heart rate and reduce stress hormones.
					</p>

					<div className="mb-4">
						<p
							className="text-sm font-semibold mb-2"
							style={{ color: "var(--color-slate-700)" }}
						>
							Practice Steps:
						</p>
						<ol
							className="space-y-1.5 text-sm list-decimal list-inside"
							style={{ color: "var(--color-slate-600)" }}
						>
							<li>Settle into a comfortable posture</li>
							<li>Inhale slowly through the nose (4 counts)</li>
							<li>Exhale slowly through the mouth (6 counts)</li>
							<li>Repeat for set cycles or minutes</li>
						</ol>
					</div>

					<div
						className="pt-3 border-t"
						style={{ borderColor: "rgba(15, 40, 24, 0.2)" }}
					>
						<p className="text-sm italic" style={{ color: "var(--color-slate-500)" }}>
							Balances autonomic nervous system
						</p>
					</div>
				</article>

				{/* Body Check-In Card */}
				<article
					className="rounded-xl p-6 transition-all group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-600 cursor-pointer"
					tabIndex={0}
					role="button"
					aria-labelledby="body-checkin-title"
					onClick={() => handleTechniqueClick("body-checkin")}
					style={{
						background: "linear-gradient(145deg, #FFFFFF 0%, #FAFAF8 100%)",
						border: "2px solid transparent",
						boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						transform: "translateY(0)",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.borderColor = "var(--primary-800)";
						e.currentTarget.style.boxShadow =
							"0 10px 25px rgba(27, 94, 32, 0.3), 0 0 0 3px rgba(27, 94, 32, 0.2)";
						e.currentTarget.style.transform = "translateY(-4px) scale(1.01)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.borderColor = "transparent";
						e.currentTarget.style.transform = "translateY(0) scale(1)";
						e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.05)";
					}}
				>
					<div
						className="absolute top-0 right-0 w-32 h-32 opacity-10"
						style={{
							background:
								"radial-gradient(circle, #1A3D26 0%, transparent 70%)",
							transform: "translate(50%, -50%)",
						}}
					/>

					<h3
						id="body-checkin-title"
						className="text-lg font-semibold mb-3"
						style={{ color: "var(--color-slate-700)" }}
					>
						Body Check-In
					</h3>

					<p
						className="text-sm mb-4"
						style={{ color: "var(--color-slate-600)", lineHeight: "1.6" }}
					>
						<strong>Neuroscience:</strong> Somatic awareness activates the
						insula cortex, helping release physical holding and reset your
						nervous system.
					</p>

					<div className="mb-4">
						<p
							className="text-sm font-semibold mb-2"
							style={{ color: "var(--color-slate-700)" }}
						>
							Four-Step Process:
						</p>
						<ol className="space-y-1.5 text-sm list-decimal list-inside" style={{ color: "#2A2A2A" }}>
							<li>Pause and ground yourself</li>
							<li>Scan from head to toe</li>
							<li>Release tension points</li>
							<li>Breathe into open spaces</li>
						</ol>
					</div>

					<div
						className="pt-3 border-t"
						style={{ borderColor: "rgba(15, 40, 24, 0.2)" }}
					>
						<p className="text-sm italic" style={{ color: "var(--color-slate-500)" }}>
							Releases interpreter tension patterns
						</p>
					</div>
				</article>

				{/* Add more technique cards here as needed */}
				<div className="text-center py-12">
					<Activity
						className="h-12 w-12 mx-auto mb-3"
						style={{ color: "var(--color-green-600)" }}
					/>
					<p className="text-sm font-medium mb-2" style={{ color: "var(--color-slate-700)" }}>
						More techniques coming soon
					</p>
					<p className="text-xs" style={{ color: "var(--color-slate-500)" }}>
						Additional reset practices will be available
					</p>
				</div>
			</section>

			{/* Technique Modal would go here - extracted to separate component */}
			{selectedTechnique && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
					<div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
						<div className="flex justify-between items-start mb-6">
							<h2 className="text-2xl font-bold" style={{ color: "#0D3A14" }}>
								{selectedTechnique === "breathing-practice" &&
									"Breathing Practice"}
								{selectedTechnique === "body-checkin" && "Body Check-In"}
							</h2>
							<button
								onClick={handleClose}
								className="p-2 rounded-lg hover:bg-gray-100"
								aria-label="Close modal"
							>
								✕
							</button>
						</div>

						<div className="mb-6">
							<div className="text-center">
								<p className="text-lg font-bold" style={{ color: "#0D3A14" }}>
									{selectedTechnique === "breathing-practice" &&
										(!isTimerActive
											? "Ready to Begin"
											: breathPhase === "inhale"
												? "Expanding Phase"
												: breathPhase === "hold-in"
													? "Holding Gently"
													: breathPhase === "exhale"
														? "Releasing Phase"
														: "Resting Pause")}
									{selectedTechnique === "body-checkin" &&
										(!isTimerActive
											? "Check in with your body"
											: "Moving through your body")}
								</p>
								<p className="text-sm mt-1" style={{ color: "var(--color-slate-500)" }}>
									{selectedTechnique === "breathing-practice" &&
										(!isTimerActive
											? "Press start when ready"
											: breathPhase === "inhale"
												? "Let your breath fill you"
												: breathPhase === "hold-in"
													? "Rest in fullness"
													: breathPhase === "exhale"
														? "Let everything soften"
														: "Rest in emptiness")}
									{selectedTechnique === "body-checkin" &&
										(!isTimerActive
											? "Choose your time and begin when ready"
											: "Notice without needing to change anything")}
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<button
								onClick={handleComplete}
								className="flex-1 px-6 py-3 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700"
							>
								Complete Practice
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
};

export default StressResetSection;
