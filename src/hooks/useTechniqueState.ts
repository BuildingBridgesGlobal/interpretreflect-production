import { useRef, useState } from "react";

export interface TechniqueState {
	selectedTechnique: string | null;
	techniqueProgress: number;
	isTimerActive: boolean;
	breathPhase: "inhale" | "hold-in" | "exhale" | "hold-out";
	breathCycle: number;
	bodyPart: number;
	senseCount: number;
	expansionLevel: number;
	currentTechniqueId: string | null;
}

export interface TechniqueActions {
	setSelectedTechnique: (technique: string | null) => void;
	setTechniqueProgress: (progress: number) => void;
	setIsTimerActive: (active: boolean) => void;
	setBreathPhase: (phase: "inhale" | "hold-in" | "exhale" | "hold-out") => void;
	setBreathCycle: (cycle: number) => void;
	setBodyPart: (part: number) => void;
	setSenseCount: (count: number) => void;
	setExpansionLevel: (level: number) => void;
	setCurrentTechniqueId: (id: string | null) => void;

	// Utility functions
	startTechnique: (technique: string, id: string) => void;
	completeTechnique: () => void;
	resetTechnique: () => void;
	clearTimer: () => void;
}

const initialTechniqueState: TechniqueState = {
	selectedTechnique: null,
	techniqueProgress: 0,
	isTimerActive: false,
	breathPhase: "inhale",
	breathCycle: 0,
	bodyPart: 0,
	senseCount: 0,
	expansionLevel: 0,
	currentTechniqueId: null,
};

export const useTechniqueState = (): TechniqueState & TechniqueActions => {
	const [techniqueState, setTechniqueState] = useState<TechniqueState>(
		initialTechniqueState,
	);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const actions: TechniqueActions = {
		setSelectedTechnique: (technique: string | null) =>
			setTechniqueState((prev) => ({ ...prev, selectedTechnique: technique })),

		setTechniqueProgress: (progress: number) =>
			setTechniqueState((prev) => ({ ...prev, techniqueProgress: progress })),

		setIsTimerActive: (active: boolean) =>
			setTechniqueState((prev) => ({ ...prev, isTimerActive: active })),

		setBreathPhase: (phase: "inhale" | "hold-in" | "exhale" | "hold-out") =>
			setTechniqueState((prev) => ({ ...prev, breathPhase: phase })),

		setBreathCycle: (cycle: number) =>
			setTechniqueState((prev) => ({ ...prev, breathCycle: cycle })),

		setBodyPart: (part: number) =>
			setTechniqueState((prev) => ({ ...prev, bodyPart: part })),

		setSenseCount: (count: number) =>
			setTechniqueState((prev) => ({ ...prev, senseCount: count })),

		setExpansionLevel: (level: number) =>
			setTechniqueState((prev) => ({ ...prev, expansionLevel: level })),

		setCurrentTechniqueId: (id: string | null) =>
			setTechniqueState((prev) => ({ ...prev, currentTechniqueId: id })),

		startTechnique: (technique: string, id: string) => {
			setTechniqueState({
				...initialTechniqueState,
				selectedTechnique: technique,
				currentTechniqueId: id,
				isTimerActive: true,
			});
		},

		completeTechnique: () => {
			setTechniqueState((prev) => ({
				...prev,
				isTimerActive: false,
				techniqueProgress: 100,
			}));
		},

		resetTechnique: () => {
			setTechniqueState(initialTechniqueState);
		},

		clearTimer: () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		},
	};

	return {
		...techniqueState,
		...actions,
	};
};

export default useTechniqueState;
