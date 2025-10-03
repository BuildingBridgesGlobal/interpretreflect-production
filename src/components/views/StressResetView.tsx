import { Brain, Heart } from "lucide-react";
import type React from "react";

interface StressResetViewProps {
	setBreathingMode: (mode: string) => void;
	setShowBreathingPractice: (show: boolean) => void;
	setCurrentTechniqueId: (id: string | null) => void;
	trackTechniqueStart: (technique: string) => string;
	isAnyModalOpen: () => boolean;
	setShowBreathingModal: (show: boolean) => void;
	setShowBodyModal: (show: boolean) => void;
	setShowFiveZoneModal: (show: boolean) => void;
	setShowAssignmentResetModal: (show: boolean) => void;
	setShowBoundariesModal: (show: boolean) => void;
	setShowEmotionMappingModal: (show: boolean) => void;
	setSelectedTechnique: (technique: string | null) => void;
	setShowTemperatureExploration: (show: boolean) => void;
	setShowAffirmationStudio: (show: boolean) => void;
	setCurrentView: (view: string) => void;
}

export const StressResetView: React.FC<StressResetViewProps> = ({
	setBreathingMode,
	setShowBreathingPractice,
	setCurrentTechniqueId,
	trackTechniqueStart,
	isAnyModalOpen,
	setShowBreathingModal,
	setShowBodyModal,
	setShowFiveZoneModal,
	setShowAssignmentResetModal,
	setShowBoundariesModal,
	setShowEmotionMappingModal,
	setSelectedTechnique,
	setShowTemperatureExploration,
	setShowAffirmationStudio,
	setCurrentView,
}) => {
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
					style={{ color: "#1A1A1A", letterSpacing: "-0.5px" }}
				>
					Your Personal Stress Reset Space
				</h1>
				<p
					className="text-lg mb-2"
					style={{ color: "#2A2A2A", fontWeight: "400" }}
				>
					Choose what your body-mind needs right now
				</p>
				<p className="text-sm" style={{ color: "#525252" }}>
					All practices are accessible for every body and mind
				</p>
			</header>

			<section
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
				aria-label="Available reset practices"
			>
				{/* Breathing Practice */}
				<section
					className="rounded-2xl p-6 transition-all group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
					tabIndex={0}
					role="button"
					aria-labelledby="breathing-practice-title"
					onClick={(e) => {
						e.currentTarget.blur();
						setBreathingMode("gentle");
						setShowBreathingPractice(true);
						const id = trackTechniqueStart("breathing-practice");
						setCurrentTechniqueId(id);
					}}
					style={{
						background: "#FFFFFF",
						border: "1px solid rgba(92, 127, 79, 0.15)",
						transform: "translateY(0)",
					}}
					onMouseEnter={(e) => {
						if (isAnyModalOpen()) return;
						e.currentTarget.style.borderColor = "rgba(45, 95, 63, 0.3)";
						e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.08)";
						e.currentTarget.style.transform = "translateY(-4px)";
					}}
					onMouseLeave={(e) => {
						if (isAnyModalOpen()) return;
						e.currentTarget.style.borderColor = "rgba(92, 127, 79, 0.15)";
						e.currentTarget.style.transform = "translateY(0)";
						e.currentTarget.style.boxShadow = "none";
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

					<header className="flex justify-end mb-3">
						<button
							onClick={(e) => {
								e.stopPropagation();
								setShowBreathingModal(true);
							}}
							className="text-sm px-4 py-3 min-h-[44px] min-w-[44px] rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
							style={{
								backgroundColor: "#F1F8F4",
								color: "var(--primary-800)",
								border: "2px solid #2D5F3F",
							}}
							aria-label="Learn why breathing works"
						>
							Why breathing works?
						</button>
					</header>

					<h3
						id="breathing-practice-title"
						className="text-lg font-semibold mb-3"
						style={{ color: "#0D3A14" }}
					>
						Breathing Practice
					</h3>

					<p
						className="text-sm mb-4"
						style={{ color: "#2A2A2A", lineHeight: "1.6" }}
					>
						<strong>Neuroscience:</strong> Guided breathing activates your
						body's relaxation response, calming the nervous system after
						high-pressure interpreting. Research shows slow, intentional breaths
						balance heart rate and reduce stress hormones.
					</p>

					<div className="mb-4">
						<p
							className="text-sm font-semibold mb-2"
							style={{ color: "#0D3A14" }}
						>
							Practice Steps:
						</p>
						<ol
							className="space-y-1.5 text-sm list-decimal list-inside"
							style={{ color: "#2A2A2A" }}
						>
							<li>Click to start guided breathing</li>
							<li>Follow the expanding circle</li>
							<li>Feel your nervous system calm</li>
						</ol>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-xs" style={{ color: "#1A3D26" }}>
							4 minutes
						</span>
						<div className="flex items-center space-x-1">
							<Brain className="h-4 w-4" style={{ color: "#1A3D26" }} />
							<span className="text-xs" style={{ color: "#1A3D26" }}>
								Vagus Nerve Reset
							</span>
						</div>
					</div>
				</section>

				{/* Body Awareness Journey */}
				<article
					className="rounded-xl p-6 transition-all group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-600 cursor-pointer"
					tabIndex={0}
					role="button"
					aria-labelledby="body-journey-title"
					onClick={(e) => {
						e.currentTarget.blur();
						setCurrentView("body-checkin");
					}}
					style={{
						background: "linear-gradient(145deg, #FFFFFF 0%, #F0F9FF 100%)",
						border: "2px solid transparent",
						boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						transform: "translateY(0)",
					}}
					onMouseEnter={(e) => {
						if (isAnyModalOpen()) return;
						e.currentTarget.style.borderColor = "#1E40AF";
						e.currentTarget.style.boxShadow =
							"0 10px 25px rgba(30, 64, 175, 0.3), 0 0 0 3px rgba(30, 64, 175, 0.2)";
						e.currentTarget.style.transform = "translateY(-4px) scale(1.01)";
					}}
					onMouseLeave={(e) => {
						if (isAnyModalOpen()) return;
						e.currentTarget.style.borderColor = "transparent";
						e.currentTarget.style.transform = "translateY(0) scale(1)";
						e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.05)";
					}}
				>
					<div
						className="absolute top-0 right-0 w-32 h-32 opacity-10"
						style={{
							background:
								"radial-gradient(circle, #1E40AF 0%, transparent 70%)",
							transform: "translate(50%, -50%)",
						}}
					/>

					<header className="flex justify-end mb-3">
						<button
							onClick={(e) => {
								e.stopPropagation();
								setShowBodyModal(true);
							}}
							className="text-sm px-4 py-3 min-h-[44px] min-w-[44px] rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800"
							style={{
								backgroundColor: "#F0F9FF",
								color: "#1E40AF",
								border: "2px solid #1E40AF",
							}}
							aria-label="Learn why body scans work"
						>
							Why body scans work?
						</button>
					</header>

					<h3
						id="body-journey-title"
						className="text-lg font-semibold mb-3"
						style={{ color: "#1E3A8A" }}
					>
						Body Awareness Journey
					</h3>

					<p
						className="text-sm mb-4"
						style={{ color: "#2A2A2A", lineHeight: "1.6" }}
					>
						<strong>Science:</strong> Progressive body scans release physical
						tension accumulated during interpreting. This practice reduces
						muscle tension by 30% and helps prevent repetitive strain injuries
						common in our field.
					</p>

					<div className="mb-4">
						<p
							className="text-sm font-semibold mb-2"
							style={{ color: "#1E3A8A" }}
						>
							Journey Steps:
						</p>
						<ol
							className="space-y-1.5 text-sm list-decimal list-inside"
							style={{ color: "#2A2A2A" }}
						>
							<li>Start from head or toes</li>
							<li>Notice without judgment</li>
							<li>Release what you find</li>
						</ol>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-xs" style={{ color: "#1E3A8A" }}>
							1 minute
						</span>
						<div className="flex items-center space-x-1">
							<Heart className="h-4 w-4" style={{ color: "#1E3A8A" }} />
							<span className="text-xs" style={{ color: "#1E3A8A" }}>
								Tension Release
							</span>
						</div>
					</div>
				</article>

				{/* BREATHE Protocol Card */}
				<article
					className="rounded-xl p-6 transition-all group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-purple-600 cursor-pointer"
					tabIndex={0}
					role="button"
					aria-labelledby="breathe-protocol-title"
					onClick={(e) => {
						e.currentTarget.blur();
						setSelectedTechnique("breathe-protocol");
						setShowBreathingModal(true);
					}}
					style={{
						background: "linear-gradient(145deg, #FFFFFF 0%, #FDF4FF 100%)",
						border: "2px solid transparent",
						boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
						transform: "translateY(0)",
					}}
					onMouseEnter={(e) => {
						if (isAnyModalOpen()) return;
						e.currentTarget.style.borderColor = "#7C3AED";
						e.currentTarget.style.boxShadow =
							"0 10px 25px rgba(124, 58, 237, 0.3), 0 0 0 3px rgba(124, 58, 237, 0.2)";
						e.currentTarget.style.transform = "translateY(-4px) scale(1.01)";
					}}
					onMouseLeave={(e) => {
						if (isAnyModalOpen()) return;
						e.currentTarget.style.borderColor = "transparent";
						e.currentTarget.style.transform = "translateY(0) scale(1)";
						e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.05)";
					}}
				>
					<div
						className="absolute top-0 right-0 w-32 h-32 opacity-10"
						style={{
							background:
								"radial-gradient(circle, #7C3AED 0%, transparent 70%)",
							transform: "translate(50%, -50%)",
						}}
					/>

					<header className="flex justify-end mb-3">
						<button
							onClick={(e) => {
								e.stopPropagation();
								setSelectedTechnique("breathe-protocol");
								setShowBreathingModal(true);
							}}
							className="text-sm px-4 py-3 min-h-[44px] min-w-[44px] rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-800"
							style={{
								backgroundColor: "#FDF4FF",
								color: "#7C3AED",
								border: "2px solid #7C3AED",
							}}
							aria-label="Learn why BREATHE Protocol works"
						>
							Why it works?
						</button>
					</header>

					<h3
						id="breathe-protocol-title"
						className="text-lg font-semibold mb-3"
						style={{ color: "#5B21B6" }}
					>
						BREATHE Protocol
					</h3>

					<p
						className="text-sm mb-4"
						style={{ color: "#2A2A2A", lineHeight: "1.6" }}
					>
						<strong>Reflective Questions:</strong> A 7-step framework using
						targeted questions to guide your stress response. Each letter represents
						a specific reflection that shifts your nervous system from reactive to
						responsive mode.
					</p>

					<div className="mb-4">
						<p
							className="text-sm font-semibold mb-2"
							style={{ color: "#5B21B6" }}
						>
							Protocol Steps:
						</p>
						<ol
							className="space-y-1.5 text-sm list-decimal list-inside"
							style={{ color: "#2A2A2A" }}
						>
							<li>Answer guided questions</li>
							<li>Build self-awareness</li>
							<li>Create actionable responses</li>
						</ol>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-xs" style={{ color: "#5B21B6" }}>
							7 minutes
						</span>
						<div className="flex items-center space-x-1">
							<Brain className="h-4 w-4" style={{ color: "#5B21B6" }} />
							<span className="text-xs" style={{ color: "#5B21B6" }}>
								Cognitive Reset
							</span>
						</div>
					</div>
				</article>

				{/* Add more stress reset cards here following the same pattern */}
			</section>
		</main>
	);
};
