import { useState } from "react";

export interface SavedReflection {
	id: string;
	type: string;
	data: Record<string, unknown>;
	timestamp: string;
}

export interface BodyCheckInData {
	id: number;
	date: string;
	tensionLevel?: string;
	energyLevel?: string;
	overallFeeling?: string;
	completedDuration?: number;
	[key: string]: unknown;
}

export interface TechniqueUsage {
	id: string;
	technique: string;
	startTime: string;
	completed: boolean;
	stressLevelBefore?: number | null;
	stressLevelAfter?: number | null;
	duration?: number | string;
	endTime?: string;
}

export interface DataState {
	savedReflections: SavedReflection[];
	bodyCheckInData: BodyCheckInData[];
	techniqueUsage: TechniqueUsage[];
	recoveryHabits: Record<string, unknown>[];
	currentTechniqueId: string | null;
}

export interface DataActions {
	setSavedReflections: (reflections: SavedReflection[]) => void;
	setBodyCheckInData: (data: BodyCheckInData[]) => void;
	setTechniqueUsage: (usage: TechniqueUsage[]) => void;
	setRecoveryHabits: (habits: Record<string, unknown>[]) => void;
	setCurrentTechniqueId: (id: string | null) => void;

	// Utility functions
	addReflection: (reflection: SavedReflection) => void;
	addBodyCheckIn: (data: BodyCheckInData) => void;
	addTechniqueUsage: (usage: TechniqueUsage) => void;
	addRecoveryHabit: (habit: Record<string, unknown>) => void;
	clearData: () => void;
}

const initialDataState: DataState = {
	savedReflections: [],
	bodyCheckInData: [],
	techniqueUsage: [],
	recoveryHabits: [],
	currentTechniqueId: null,
};

export const useDataState = (): DataState & DataActions => {
	const [dataState, setDataState] = useState<DataState>(initialDataState);

	const actions: DataActions = {
		setSavedReflections: (reflections: SavedReflection[]) =>
			setDataState((prev) => ({ ...prev, savedReflections: reflections })),

		setBodyCheckInData: (data: BodyCheckInData[]) =>
			setDataState((prev) => ({ ...prev, bodyCheckInData: data })),

		setTechniqueUsage: (usage: TechniqueUsage[]) =>
			setDataState((prev) => ({ ...prev, techniqueUsage: usage })),

		setRecoveryHabits: (habits: Record<string, unknown>[]) =>
			setDataState((prev) => ({ ...prev, recoveryHabits: habits })),

		setCurrentTechniqueId: (id: string | null) =>
			setDataState((prev) => ({ ...prev, currentTechniqueId: id })),

		addReflection: (reflection: SavedReflection) =>
			setDataState((prev) => ({
				...prev,
				savedReflections: [reflection, ...prev.savedReflections].slice(0, 10),
			})),

		addBodyCheckIn: (data: BodyCheckInData) =>
			setDataState((prev) => ({
				...prev,
				bodyCheckInData: [data, ...prev.bodyCheckInData],
			})),

		addTechniqueUsage: (usage: TechniqueUsage) =>
			setDataState((prev) => ({
				...prev,
				techniqueUsage: [usage, ...prev.techniqueUsage],
			})),

		addRecoveryHabit: (habit: Record<string, unknown>) =>
			setDataState((prev) => ({
				...prev,
				recoveryHabits: [habit, ...prev.recoveryHabits].slice(0, 100),
			})),

		clearData: () => setDataState(initialDataState),
	};

	return {
		...dataState,
		...actions,
	};
};

export default useDataState;
