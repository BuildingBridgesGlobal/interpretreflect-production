import { BookOpen, Sparkles } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { DirectCommunicationReflection } from "../DirectCommunicationReflection";
import { EthicsMeaningCheckAccessible } from "../EthicsMeaningCheckAccessible";
import { InSessionSelfCheck } from "../InSessionSelfCheck";
import { InSessionTeamSync } from "../InSessionTeamSync";
import { InterpreterGlossary } from "../InterpreterGlossary";
import { ReflectionTools } from "../layout/ReflectionTools";
import { MentoringPrepAccessible } from "../MentoringPrepAccessible";
import { MentoringReflectionAccessible } from "../MentoringReflectionAccessible";
import PostAssignmentDebriefEnhanced from "../PostAssignmentDebriefEnhanced";
import PreAssignmentPrepAccessible from "../PreAssignmentPrepAccessible";
import { RoleSpaceReflection } from "../RoleSpaceReflection";
import { TeamingPrepEnhanced } from "../TeamingPrepEnhanced";
import { TeamingReflectionEnhanced } from "../TeamingReflectionEnhanced";
import { WellnessCheckInAccessible } from "../WellnessCheckInAccessible";
import BIPOCWellnessReflection from "../BIPOCWellnessReflection";
import DeafInterpreterReflection from "../DeafInterpreterReflection";
import { NeurodivergentInterpreterReflection } from "../NeurodivergentInterpreterReflection";

interface ReflectionStudioViewProps {
	currentView: string;
	setCurrentView: (view: string) => void;
	activeCategory: string;
	setActiveCategory: (category: string) => void;
	showPreAssignment: boolean;
	setShowPreAssignment: (show: boolean) => void;
	showPostAssignment: boolean;
	setShowPostAssignment: (show: boolean) => void;
	showTeamingPrep: boolean;
	setShowTeamingPrep: (show: boolean) => void;
	showTeamingReflection: boolean;
	setShowTeamingReflection: (show: boolean) => void;
	showMentoringPrep: boolean;
	setShowMentoringPrep: (show: boolean) => void;
	showMentoringReflection: boolean;
	setShowMentoringReflection: (show: boolean) => void;
	showWellnessCheck: boolean;
	setShowWellnessCheck: (show: boolean) => void;
	showEthicsMeaningCheck: boolean;
	setShowEthicsMeaningCheck: (show: boolean) => void;
	showInSessionSelfCheck: boolean;
	setShowInSessionSelfCheck: (show: boolean) => void;
	showInSessionTeamSync: boolean;
	setShowInSessionTeamSync: (show: boolean) => void;
	showRoleSpaceReflection: boolean;
	setShowRoleSpaceReflection: (show: boolean) => void;
	showDirectCommunication: boolean;
	setShowDirectCommunication: (show: boolean) => void;
	showBIPOCWellness: boolean;
	setShowBIPOCWellness: (show: boolean) => void;
	showDeafInterpreter: boolean;
	setShowDeafInterpreter: (show: boolean) => void;
	showNeurodivergentInterpreter: boolean;
	setShowNeurodivergentInterpreter: (show: boolean) => void;
	saveReflection?: (type: string, data: any) => void;
}

export const ReflectionStudioView: React.FC<ReflectionStudioViewProps> = ({
	currentView,
	setCurrentView,
	activeCategory,
	setActiveCategory,
	showPreAssignment,
	setShowPreAssignment,
	showPostAssignment,
	setShowPostAssignment,
	showTeamingPrep,
	setShowTeamingPrep,
	showTeamingReflection,
	setShowTeamingReflection,
	showMentoringPrep,
	setShowMentoringPrep,
	showMentoringReflection,
	setShowMentoringReflection,
	showWellnessCheck,
	setShowWellnessCheck,
	showEthicsMeaningCheck,
	setShowEthicsMeaningCheck,
	showInSessionSelfCheck,
	setShowInSessionSelfCheck,
	showInSessionTeamSync,
	setShowInSessionTeamSync,
	showRoleSpaceReflection,
	setShowRoleSpaceReflection,
	showDirectCommunication,
	setShowDirectCommunication,
	showBIPOCWellness,
	setShowBIPOCWellness,
	showDeafInterpreter,
	setShowDeafInterpreter,
	showNeurodivergentInterpreter,
	setShowNeurodivergentInterpreter,
	saveReflection,
}) => {
	const [showGlossary, setShowGlossary] = useState(false);
	const handleToolSelect = (tool: string) => {
		switch (tool) {
			case "pre-assignment":
				setShowPreAssignment(true);
				break;
			case "post-assignment":
				setShowPostAssignment(true);
				break;
			case "teaming-prep":
				setShowTeamingPrep(true);
				break;
			case "teaming-reflection":
				setShowTeamingReflection(true);
				break;
			case "mentoring-prep":
				setShowMentoringPrep(true);
				break;
			case "mentoring-reflection":
				setShowMentoringReflection(true);
				break;
			case "wellness":
				setShowWellnessCheck(true);
				break;
			case "ethics-meaning":
				setShowEthicsMeaningCheck(true);
				break;
			case "in-session-self":
				setShowInSessionSelfCheck(true);
				break;
			case "in-session-team":
				setShowInSessionTeamSync(true);
				break;
			case "role-space":
				setShowRoleSpaceReflection(true);
				break;
			case "direct-communication":
				setShowDirectCommunication(true);
				break;
			case "bipoc-wellness":
				setShowBIPOCWellness(true);
				break;
			case "deaf-interpreter":
				setShowDeafInterpreter(true);
				break;
			case "neurodivergent-interpreter":
				setShowNeurodivergentInterpreter(true);
				break;
		}
	};

	return (
		<main
			className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
			role="main"
			aria-labelledby="reflection-studio-heading"
		>
			{/* Main Content */}
			<div className="space-y-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-3">
								<Sparkles className="text-green-600" size={32} />
								<h2
									id="reflection-studio-heading"
									className="text-4xl font-bold"
									style={{ color: "var(--color-slate-700)", letterSpacing: "-0.5px" }}
								>
									Reflection Studio
								</h2>
							</div>
							<p
								className="text-lg mb-3"
								style={{ color: "var(--color-slate-600)", fontWeight: "400", lineHeight: "1.6" }}
							>
								Your personal space for professional growth. Choose a guided reflection below to process your work, build skills, and take care of yourself.
							</p>
							<p
								className="text-base"
								style={{ color: "var(--color-slate-500)", fontWeight: "400", lineHeight: "1.6" }}
							>
								New to some of these terms? That's okay! We use professional interpreter language here, but we're here to learn together.
							</p>
						</div>
						<button
							onClick={() => setShowGlossary(true)}
							className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-green-500 bg-white hover:bg-green-50 transition-all shadow-sm hover:shadow-md"
							style={{ color: "var(--color-green-700)" }}
						>
							<BookOpen size={20} />
							<span className="font-medium">View Glossary</span>
						</button>
					</div>
				</div>

				{/* Glossary Modal */}
				{showGlossary && (
					<InterpreterGlossary onClose={() => setShowGlossary(false)} />
				)}

				{/* Category Tabs */}
				<nav
					className="flex space-x-3 mb-8 p-2 rounded-2xl"
					role="tablist"
					aria-label="Reflection categories"
					style={{
						backgroundColor: "#FFFFFF",
						boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
					}}
				>
					<button
						onClick={() => setActiveCategory("structured")}
						className={`px-6 py-3 rounded-xl font-medium transition-all ${
							activeCategory === "structured" ? "shadow-md" : ""
						}`}
						role="tab"
						aria-selected={activeCategory === "structured"}
						style={{
							backgroundColor:
								activeCategory === "structured" ? "#1A3D26" : "transparent",
							color: activeCategory === "structured" ? "#FFFFFF" : "#6B7280",
						}}
					>
						Structured Reflections
					</button>
					<button
						onClick={() => setActiveCategory("quick")}
						className={`px-6 py-3 rounded-xl font-medium transition-all ${
							activeCategory === "quick" ? "shadow-md" : ""
						}`}
						role="tab"
						aria-selected={activeCategory === "quick"}
						style={{
							backgroundColor:
								activeCategory === "quick" ? "#1A3D26" : "transparent",
							color: activeCategory === "quick" ? "#FFFFFF" : "#6B7280",
						}}
					>
						Quick Check-ins
					</button>
					<button
						onClick={() => setActiveCategory("team")}
						className={`px-6 py-3 rounded-xl font-medium transition-all ${
							activeCategory === "team" ? "shadow-md" : ""
						}`}
						role="tab"
						aria-selected={activeCategory === "team"}
						style={{
							backgroundColor:
								activeCategory === "team" ? "#1A3D26" : "transparent",
							color: activeCategory === "team" ? "#FFFFFF" : "#6B7280",
						}}
					>
						Team & Mentoring
					</button>
				</nav>

				{/* Reflection Tools Grid */}
				<ReflectionTools onToolSelect={handleToolSelect} />
			</div>

			{/* Modals for each reflection tool */}
			{showPreAssignment && (
				<PreAssignmentPrepAccessible
					onClose={() => setShowPreAssignment(false)}
				/>
			)}

			{showPostAssignment && (
				<PostAssignmentDebriefEnhanced
					onClose={() => setShowPostAssignment(false)}
				/>
			)}

			{showTeamingPrep && (
				<TeamingPrepEnhanced onClose={() => setShowTeamingPrep(false)} />
			)}

			{showTeamingReflection && (
				<TeamingReflectionEnhanced
					onClose={() => setShowTeamingReflection(false)}
				/>
			)}

			{showMentoringPrep && (
				<MentoringPrepAccessible onClose={() => setShowMentoringPrep(false)} />
			)}

			{showMentoringReflection && (
				<MentoringReflectionAccessible
					onClose={() => setShowMentoringReflection(false)}
				/>
			)}

			{showWellnessCheck && (
				<WellnessCheckInAccessible
					onClose={() => setShowWellnessCheck(false)}
					onComplete={(data) => {
						// WellnessCheckInAccessible already saves internally using reflectionService
						// No need to call saveReflection here to avoid double-saving
						setShowWellnessCheck(false);
					}}
				/>
			)}

			{showEthicsMeaningCheck && (
				<EthicsMeaningCheckAccessible
					onClose={() => setShowEthicsMeaningCheck(false)}
				/>
			)}

			{showInSessionSelfCheck && (
				<InSessionSelfCheck onClose={() => setShowInSessionSelfCheck(false)} />
			)}

			{showInSessionTeamSync && (
				<InSessionTeamSync onClose={() => setShowInSessionTeamSync(false)} />
			)}

			{showRoleSpaceReflection && (
				<RoleSpaceReflection
					onClose={() => setShowRoleSpaceReflection(false)}
				/>
			)}

			{showDirectCommunication && (
				<DirectCommunicationReflection
					onClose={() => setShowDirectCommunication(false)}
				/>
			)}

			{showBIPOCWellness && (
				<BIPOCWellnessReflection onClose={() => setShowBIPOCWellness(false)} />
			)}

			{showDeafInterpreter && (
				<DeafInterpreterReflection
					onClose={() => setShowDeafInterpreter(false)}
				/>
			)}

			{showNeurodivergentInterpreter && (
				<NeurodivergentInterpreterReflection
					onComplete={(data) => {
						if (saveReflection) {
							saveReflection("neurodivergent_interpreter_reflection", data);
						}
						setShowNeurodivergentInterpreter(false);
					}}
					onClose={() => setShowNeurodivergentInterpreter(false)}
				/>
			)}
		</main>
	);
};
