/**
 * Base Component for All Reflection Tools
 *
 * Provides:
 * - Linear question navigation
 * - Review/edit mode
 * - Progress tracking
 * - Auto-save functionality
 * - Accessibility features
 * - Consistent theming
 *
 * @module ReflectionBase
 */

import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Clock,
	Edit3,
	Eye,
	Keyboard,
} from "lucide-react";
import type React from "react";
import { type KeyboardEvent, useCallback, useEffect, useState } from "react";

import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { REFLECTION_THEME } from "../../styles/reflectionTheme";

/**
 * Question interface
 */
export interface ReflectionQuestion {
	id: string;
	category: string;
	text: string;
	subText?: string;
	type:
		| "text"
		| "textarea"
		| "scale"
		| "multiselect"
		| "radio"
		| "date"
		| "time";
	options?: string[] | { value: string; label: string }[];
	required: boolean;
	placeholder?: string;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
	helpText?: string;
	icon?: React.ComponentType<any>;
	validation?: (value: any) => string | null;
	dependsOn?: { questionId: string; value: any };
}

/**
 * Props for ReflectionBase component
 */
export interface ReflectionBaseProps {
	title: string;
	subtitle?: string;
	questions: ReflectionQuestion[];
	reflectionType: string;
	onComplete?: (data: any) => void;
	initialData?: Record<string, any>;
	allowReview?: boolean;
	autoSaveInterval?: number;
	customTheme?: typeof REFLECTION_THEME;
	headerComponent?: React.ReactNode;
	footerComponent?: React.ReactNode;
}

/**
 * Navigation mode enum
 */
enum NavigationMode {
	LINEAR = "linear",
	REVIEW = "review",
}

/**
 * Main ReflectionBase Component
 */
export function ReflectionBase({
	title,
	subtitle,
	questions,
	reflectionType,
	onComplete,
	initialData = {},
	allowReview = true,
	autoSaveInterval = 3,
	customTheme = REFLECTION_THEME,
	headerComponent,
	footerComponent,
}: ReflectionBaseProps) {
	const { user } = useAuth();
	const [mode, setMode] = useState<NavigationMode>(NavigationMode.LINEAR);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<string, any>>(initialData);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [isComplete, setIsComplete] = useState(false);
	const [startTime] = useState(Date.now());
	const [questionTimes, setQuestionTimes] = useState<Record<string, number>>(
		{},
	);
	const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState(
		Date.now(),
	);

	// Filter questions based on dependencies
	const activeQuestions = questions.filter((q) => {
		if (!q.dependsOn) return true;
		const dependencyValue = answers[q.dependsOn.questionId];
		return dependencyValue === q.dependsOn.value;
	});

	const currentQuestion =
		mode === NavigationMode.LINEAR
			? activeQuestions[currentQuestionIndex]
			: null;
	const progress = ((currentQuestionIndex + 1) / activeQuestions.length) * 100;
	const completedQuestions = activeQuestions.filter(
		(q) => answers[q.id] !== undefined,
	).length;
	const isAllComplete = completedQuestions === activeQuestions.length;

	/**
	 * Track time spent on each question
	 */
	useEffect(() => {
		if (currentQuestion) {
			setCurrentQuestionStartTime(Date.now());
		}
	}, [currentQuestionIndex]);

	/**
	 * Auto-save functionality
	 */
	useEffect(() => {
		const answerCount = Object.keys(answers).length;
		if (answerCount > 0 && answerCount % autoSaveInterval === 0 && user) {
			saveToSupabase();
		}
	}, [answers]);

	/**
	 * Keyboard navigation
	 */
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (mode === NavigationMode.LINEAR) {
				switch (e.key) {
					case "ArrowLeft":
						if (e.ctrlKey || e.metaKey) {
							handlePrevious();
						}
						break;
					case "ArrowRight":
						if (e.ctrlKey || e.metaKey) {
							handleNext();
						}
						break;
					case "Enter":
						if (e.ctrlKey || e.metaKey) {
							if (currentQuestionIndex === activeQuestions.length - 1) {
								handleComplete();
							} else {
								handleNext();
							}
						}
						break;
					case "r":
						if (e.ctrlKey || e.metaKey) {
							e.preventDefault();
							if (allowReview && isAllComplete) {
								setMode(NavigationMode.REVIEW);
							}
						}
						break;
				}
			}
		},
		[mode, currentQuestionIndex, activeQuestions.length],
	);

	/**
	 * Save to Supabase
	 */
	const saveToSupabase = async () => {
		if (!user) return;

		setIsSaving(true);
		try {
			const data = {
				user_id: user.id,
				reflection_type: reflectionType,
				data: {
					...answers,
					question_times: questionTimes,
					total_duration: Math.floor((Date.now() - startTime) / 1000),
				},
				status: isComplete ? "completed" : "draft",
				updated_at: new Date().toISOString(),
			};

			const { error } = await supabase.from("reflections").upsert(data);

			if (!error) {
				setLastSaved(new Date());
			}
		} catch (error) {
			console.error("Save error:", error);
		} finally {
			setIsSaving(false);
		}
	};

	/**
	 * Validate answer
	 */
	const validateAnswer = (
		question: ReflectionQuestion,
		value: any,
	): string | null => {
		if (question.required && !value) {
			return "This field is required";
		}

		if ((question.type === "text" || question.type === "textarea") && value) {
			const textValue = value as string;
			if (question.minLength && textValue.length < question.minLength) {
				return `Minimum ${question.minLength} characters required`;
			}
			if (question.maxLength && textValue.length > question.maxLength) {
				return `Maximum ${question.maxLength} characters allowed`;
			}
		}

		if (question.type === "scale" && value) {
			const numValue = value as number;
			if (question.min && numValue < question.min) {
				return `Minimum value is ${question.min}`;
			}
			if (question.max && numValue > question.max) {
				return `Maximum value is ${question.max}`;
			}
		}

		if (question.validation) {
			return question.validation(value);
		}

		return null;
	};

	/**
	 * Handle navigation
	 */
	const handleNext = () => {
		if (!currentQuestion) return;

		// Track time spent
		const timeSpent = Date.now() - currentQuestionStartTime;
		setQuestionTimes((prev) => ({
			...prev,
			[currentQuestion.id]: (prev[currentQuestion.id] || 0) + timeSpent,
		}));

		// Validate current answer
		const error = validateAnswer(currentQuestion, answers[currentQuestion.id]);
		if (error && currentQuestion.required) {
			setErrors({ [currentQuestion.id]: error });
			setTouched({ ...touched, [currentQuestion.id]: true });
			return;
		}

		setErrors({});
		if (currentQuestionIndex < activeQuestions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		} else if (isAllComplete) {
			setMode(NavigationMode.REVIEW);
		}
	};

	const handlePrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
			setErrors({});
		}
	};

	const handleComplete = async () => {
		// Validate all required questions
		const validationErrors: Record<string, string> = {};
		activeQuestions.forEach((q) => {
			if (q.required) {
				const error = validateAnswer(q, answers[q.id]);
				if (error) {
					validationErrors[q.id] = error;
				}
			}
		});

		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			setMode(NavigationMode.REVIEW);
			return;
		}

		setIsComplete(true);
		await saveToSupabase();
		if (onComplete) {
			onComplete(answers);
		}
	};

	/**
	 * Handle answer change
	 */
	const handleAnswerChange = (questionId: string, value: any) => {
		setAnswers((prev) => ({ ...prev, [questionId]: value }));
		setTouched((prev) => ({ ...prev, [questionId]: true }));

		// Clear error when user starts typing
		if (errors[questionId]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[questionId];
				return newErrors;
			});
		}
	};

	/**
	 * Render question input
	 */
	const renderQuestionInput = (question: ReflectionQuestion) => {
		const value = answers[question.id];
		const error = touched[question.id] ? errors[question.id] : null;
		const theme = customTheme;

		switch (question.type) {
			case "text":
				return (
					<div className="w-full">
						<input
							type="text"
							value={value || ""}
							onChange={(e) => handleAnswerChange(question.id, e.target.value)}
							placeholder={question.placeholder}
							aria-label={question.text}
							aria-describedby={`${question.id}-help`}
							aria-invalid={!!error}
							className="w-full px-4 py-3 text-lg border-2 rounded-lg transition-all duration-200"
							style={{
								borderColor: error
									? theme.colors.semantic.error
									: theme.colors.neutral.gray300,
								backgroundColor: error
									? theme.colors.semantic.errorLight
									: theme.colors.neutral.white,
							}}
						/>
						{question.helpText && (
							<p
								id={`${question.id}-help`}
								className="mt-2 text-sm text-gray-600"
							>
								<AlertCircle className="inline w-4 h-4 mr-1" />
								{question.helpText}
							</p>
						)}
						{error && (
							<p className="mt-2 text-sm text-red-600" role="alert">
								{error}
							</p>
						)}
					</div>
				);

			case "textarea": {
				const textLength = (value as string)?.length || 0;
				return (
					<div className="w-full">
						<textarea
							value={value || ""}
							onChange={(e) => handleAnswerChange(question.id, e.target.value)}
							placeholder={question.placeholder}
							rows={4}
							aria-label={question.text}
							aria-describedby={`${question.id}-help`}
							aria-invalid={!!error}
							className="w-full px-4 py-3 text-lg border-2 rounded-lg transition-all duration-200 resize-none"
							style={{
								borderColor: error
									? theme.colors.semantic.error
									: theme.colors.neutral.gray300,
								backgroundColor: error
									? theme.colors.semantic.errorLight
									: theme.colors.neutral.white,
							}}
						/>
						<div className="flex justify-between mt-2">
							<div className="text-sm text-gray-600">
								{question.helpText && (
									<span>
										<AlertCircle className="inline w-4 h-4 mr-1" />
										{question.helpText}
									</span>
								)}
							</div>
							{(question.minLength || question.maxLength) && (
								<div className="text-sm text-gray-600">
									{textLength} / {question.maxLength || "∞"}
								</div>
							)}
						</div>
						{error && (
							<p className="mt-2 text-sm text-red-600" role="alert">
								{error}
							</p>
						)}
					</div>
				);
			}

			case "scale": {
				const scaleValue = value || question.min || 1;
				const min = question.min || 1;
				const max = question.max || 10;
				return (
					<div className="w-full space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-lg font-medium">{min}</span>
							<input
								type="range"
								min={min}
								max={max}
								value={scaleValue}
								onChange={(e) =>
									handleAnswerChange(question.id, parseInt(e.target.value))
								}
								className="flex-1 mx-4"
								aria-label={question.text}
								aria-valuenow={scaleValue}
								aria-valuemin={min}
								aria-valuemax={max}
							/>
							<span className="text-lg font-medium">{max}</span>
						</div>
						<div className="text-center">
							<span
								className="text-3xl font-bold"
								style={{ color: theme.colors.accents.teal }}
							>
								{scaleValue}
							</span>
						</div>
						{question.helpText && (
							<p className="text-sm text-center text-gray-600">
								{question.helpText}
							</p>
						)}
					</div>
				);
			}

			case "multiselect": {
				const selected = (value as string[]) || [];
				return (
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						{question.options?.map((option) => {
							const optionValue =
								typeof option === "string" ? option : option.value;
							const optionLabel =
								typeof option === "string" ? option : option.label;
							const isSelected = selected.includes(optionValue);

							return (
								<label
									key={optionValue}
									className="flex items-center p-4 transition-all duration-200 border-2 rounded-lg cursor-pointer"
									style={{
										borderColor: isSelected
											? theme.colors.accents.teal
											: theme.colors.neutral.gray300,
										backgroundColor: isSelected
											? theme.colors.backgrounds.selected || "#fff7dc"
											: theme.colors.neutral.white,
									}}
								>
									<input
										type="checkbox"
										checked={isSelected}
										onChange={(e) => {
											if (e.target.checked) {
												handleAnswerChange(question.id, [
													...selected,
													optionValue,
												]);
											} else {
												handleAnswerChange(
													question.id,
													selected.filter((s) => s !== optionValue),
												);
											}
										}}
										className="sr-only"
										aria-label={optionLabel}
									/>
									<div
										className="flex items-center justify-center w-5 h-5 mr-3 border-2 rounded"
										style={{
											borderColor: isSelected
												? theme.colors.accents.teal
												: theme.colors.neutral.gray400,
											backgroundColor: isSelected
												? theme.colors.accents.teal
												: "transparent",
										}}
									>
										{isSelected && (
											<CheckCircle className="w-3 h-3 text-white" />
										)}
									</div>
									<span className="text-base">{optionLabel}</span>
								</label>
							);
						})}
						{error && (
							<p className="col-span-full text-sm text-red-600" role="alert">
								{error}
							</p>
						)}
					</div>
				);
			}

			case "radio":
				return (
					<div className="space-y-3">
						{question.options?.map((option) => {
							const optionValue =
								typeof option === "string" ? option : option.value;
							const optionLabel =
								typeof option === "string" ? option : option.label;
							const isSelected = value === optionValue;

							return (
								<label
									key={optionValue}
									className="flex items-center p-4 transition-all duration-200 border-2 rounded-lg cursor-pointer"
									style={{
										borderColor: isSelected
											? theme.colors.accents.teal
											: theme.colors.neutral.gray300,
										backgroundColor: isSelected
											? theme.colors.backgrounds.selected || "#fff7dc"
											: theme.colors.neutral.white,
									}}
								>
									<input
										type="radio"
										name={question.id}
										value={optionValue}
										checked={isSelected}
										onChange={(e) =>
											handleAnswerChange(question.id, e.target.value)
										}
										className="sr-only"
										aria-label={optionLabel}
									/>
									<div
										className="flex items-center justify-center w-5 h-5 mr-3 border-2 rounded-full"
										style={{
											borderColor: isSelected
												? theme.colors.accents.teal
												: theme.colors.neutral.gray400,
										}}
									>
										{isSelected && (
											<div
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: theme.colors.accents.teal }}
											/>
										)}
									</div>
									<span className="text-base">{optionLabel}</span>
								</label>
							);
						})}
						{error && (
							<p className="mt-2 text-sm text-red-600" role="alert">
								{error}
							</p>
						)}
					</div>
				);

			default:
				return null;
		}
	};

	/**
	 * Render review mode
	 */
	const renderReviewMode = () => {
		const theme = customTheme;

		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold">Review Your Responses</h2>
					<button
						onClick={() => setMode(NavigationMode.LINEAR)}
						className="flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200 border rounded-lg"
						style={{
							borderColor: theme.colors.neutral.gray300,
							color: theme.colors.neutral.gray700,
						}}
					>
						<Edit3 className="w-4 h-4 mr-2" />
						Edit Responses
					</button>
				</div>

				<div className="space-y-4">
					{activeQuestions.map((question, index) => {
						const answer = answers[question.id];
						const error = errors[question.id];
						const hasAnswer =
							answer !== undefined && answer !== null && answer !== "";

						return (
							<div
								key={question.id}
								className="p-4 border rounded-lg"
								style={{
									borderColor: error
										? theme.colors.semantic.error
										: hasAnswer
											? theme.colors.accents.teal
											: theme.colors.neutral.gray300,
									backgroundColor: error
										? theme.colors.semantic.errorLight
										: hasAnswer
											? `${theme.colors.accents.teal}05`
											: theme.colors.neutral.white,
								}}
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center mb-2">
											<span className="mr-2 text-sm font-medium text-gray-500">
												Q{index + 1}
											</span>
											{hasAnswer ? (
												<CheckCircle className="w-4 h-4 text-green-600" />
											) : question.required ? (
												<AlertCircle className="w-4 h-4 text-amber-600" />
											) : null}
										</div>
										<h3 className="mb-2 font-semibold">{question.text}</h3>
										{question.subText && (
											<p className="mb-2 text-sm text-gray-600">
												{question.subText}
											</p>
										)}
										<div className="mt-2">
											{hasAnswer ? (
												<div
													className="p-3 rounded"
													style={{
														backgroundColor: theme.colors.backgrounds.primary,
													}}
												>
													{Array.isArray(answer) ? (
														<ul className="space-y-1">
															{answer.map((item, i) => (
																<li key={i} className="flex items-center">
																	<CheckCircle className="w-3 h-3 mr-2 text-green-600" />
																	{item}
																</li>
															))}
														</ul>
													) : (
														<p className="whitespace-pre-wrap">{answer}</p>
													)}
												</div>
											) : (
												<p className="italic text-gray-500">
													No response provided
												</p>
											)}
										</div>
										{error && (
											<p className="mt-2 text-sm text-red-600" role="alert">
												<AlertCircle className="inline w-4 h-4 mr-1" />
												{error}
											</p>
										)}
									</div>
									<button
										onClick={() => {
											setCurrentQuestionIndex(index);
											setMode(NavigationMode.LINEAR);
										}}
										className="p-2 ml-4 transition-colors duration-200 rounded-lg hover:bg-gray-100"
										aria-label={`Edit question ${index + 1}`}
									>
										<Edit3 className="w-4 h-4" />
									</button>
								</div>
							</div>
						);
					})}
				</div>

				<div className="flex justify-between pt-6 mt-6 border-t">
					<button
						onClick={() => setMode(NavigationMode.LINEAR)}
						className="flex items-center px-6 py-3 font-medium transition-colors duration-200 border rounded-lg"
						style={{
							borderColor: theme.colors.neutral.gray300,
							color: theme.colors.neutral.gray700,
						}}
					>
						<ChevronLeft className="w-5 h-5 mr-2" />
						Back to Questions
					</button>
					<button
						onClick={handleComplete}
						disabled={Object.keys(errors).length > 0}
						className="flex items-center px-6 py-3 font-medium text-white transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
						style={{
							background:
								Object.keys(errors).length > 0
									? theme.colors.neutral.gray400
									: `linear-gradient(135deg, ${theme.colors.accents.teal}, ${theme.colors.accents.blue})`,
						}}
					>
						Complete Assessment
						<CheckCircle className="w-5 h-5 ml-2" />
					</button>
				</div>
			</div>
		);
	};

	/**
	 * Render completion screen
	 */
	if (isComplete) {
		const theme = customTheme;

		return (
			<div
				className="flex items-center justify-center min-h-screen p-4"
				style={{ backgroundColor: theme.colors.backgrounds.primary }}
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="w-full max-w-2xl p-8 text-center bg-white shadow-2xl rounded-2xl"
				>
					<CheckCircle
						className="w-20 h-20 mx-auto mb-6"
						style={{ color: theme.colors.accents.green }}
					/>
					<h2 className="mb-4 text-3xl font-bold">Assessment Complete!</h2>
					<p className="mb-6 text-lg text-gray-600">
						Your responses have been saved and will contribute to your growth
						insights.
					</p>
					<div
						className="p-4 rounded-lg"
						style={{ backgroundColor: theme.colors.backgrounds.secondary }}
					>
						<p className="text-sm text-gray-600">Time taken</p>
						<p className="text-xl font-semibold">
							{Math.floor((Date.now() - startTime) / 60000)} minutes
						</p>
					</div>
				</motion.div>
			</div>
		);
	}

	/**
	 * Main render
	 */
	const theme = customTheme;

	return (
		<div
			className="min-h-screen"
			style={{
				background: `linear-gradient(180deg, ${theme.colors.backgrounds.primary}, ${theme.colors.backgrounds.secondary})`,
			}}
			onKeyDown={handleKeyDown as any}
			tabIndex={0}
		>
			{/* Progress Bar */}
			{mode === NavigationMode.LINEAR && (
				<div className="fixed top-0 left-0 z-50 w-full h-2 bg-gray-200">
					<motion.div
						className="h-full"
						style={{
							background: `linear-gradient(90deg, ${theme.colors.accents.teal}, ${theme.colors.accents.purple})`,
						}}
						initial={{ width: 0 }}
						animate={{ width: `${progress}%` }}
						transition={{ duration: 0.3 }}
					/>
				</div>
			)}

			{/* Header */}
			<header className="pt-4 pb-6 bg-white border-b shadow-sm">
				<div className="max-w-4xl px-4 mx-auto">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold">{title}</h1>
							{subtitle && <p className="text-gray-600">{subtitle}</p>}
							{mode === NavigationMode.LINEAR && (
								<p className="mt-2 text-sm text-gray-500">
									Question {currentQuestionIndex + 1} of{" "}
									{activeQuestions.length}
								</p>
							)}
						</div>
						<div className="flex items-center space-x-4">
							{lastSaved && (
								<div className="flex items-center text-sm text-gray-500">
									<Clock className="w-4 h-4 mr-1" />
									Saved {lastSaved.toLocaleTimeString()}
								</div>
							)}
							{allowReview &&
								completedQuestions > 0 &&
								mode === NavigationMode.LINEAR && (
									<button
										onClick={() => setMode(NavigationMode.REVIEW)}
										className="flex items-center px-3 py-1 text-sm transition-colors duration-200 border rounded-lg"
										style={{
											borderColor: theme.colors.neutral.gray300,
											color: theme.colors.neutral.gray700,
										}}
									>
										<Eye className="w-4 h-4 mr-1" />
										Review ({completedQuestions}/{activeQuestions.length})
									</button>
								)}
						</div>
					</div>
				</div>
			</header>

			{/* Custom Header Component */}
			{headerComponent}

			{/* Main Content */}
			<main className="max-w-4xl px-4 py-8 mx-auto">
				{mode === NavigationMode.LINEAR ? (
					<AnimatePresence mode="wait">
						<motion.div
							key={currentQuestionIndex}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.3 }}
							className="overflow-hidden bg-white shadow-xl rounded-2xl"
						>
							{/* Question */}
							{currentQuestion && (
								<>
									<div className="p-6">
										<div className="flex items-start mb-4">
											{currentQuestion.icon && (
												<currentQuestion.icon className="w-6 h-6 mr-3 text-gray-600" />
											)}
											<div className="flex-1">
												<h2 className="mb-2 text-xl font-semibold">
													{currentQuestion.text}
													{currentQuestion.required && (
														<span
															className="ml-2 text-red-500"
															aria-label="Required"
														>
															*
														</span>
													)}
												</h2>
												{currentQuestion.subText && (
													<p className="text-gray-600">
														{currentQuestion.subText}
													</p>
												)}
											</div>
										</div>

										{renderQuestionInput(currentQuestion)}
									</div>

									{/* Navigation */}
									<div className="flex items-center justify-between p-4 bg-gray-50">
										<button
											onClick={handlePrevious}
											disabled={currentQuestionIndex === 0}
											className="flex items-center px-4 py-2 font-medium transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
											style={{
												backgroundColor:
													currentQuestionIndex === 0
														? theme.colors.neutral.gray200
														: theme.colors.neutral.white,
												color:
													currentQuestionIndex === 0
														? theme.colors.neutral.gray400
														: theme.colors.neutral.gray700,
												border: `2px solid ${theme.colors.neutral.gray300}`,
											}}
										>
											<ChevronLeft className="w-5 h-5 mr-1" />
											Previous
										</button>

										<div className="flex items-center space-x-2 text-sm text-gray-500">
											<Keyboard className="w-4 h-4" />
											<span>Ctrl + ← → to navigate</span>
										</div>

										<button
											onClick={handleNext}
											className="flex items-center px-6 py-2 font-medium text-white transition-all duration-200 rounded-lg"
											style={{
												background: `linear-gradient(135deg, ${theme.colors.accents.teal}, ${theme.colors.accents.purple})`,
											}}
										>
											{currentQuestionIndex === activeQuestions.length - 1 ? (
												<>
													{isAllComplete ? "Review" : "Next"}
													{isAllComplete ? (
														<Eye className="w-5 h-5 ml-1" />
													) : (
														<ChevronRight className="w-5 h-5 ml-1" />
													)}
												</>
											) : (
												<>
													Next
													<ChevronRight className="w-5 h-5 ml-1" />
												</>
											)}
										</button>
									</div>
								</>
							)}
						</motion.div>
					</AnimatePresence>
				) : (
					renderReviewMode()
				)}

				{/* Category Progress (Linear Mode Only) */}
				{mode === NavigationMode.LINEAR && (
					<div className="grid grid-cols-3 gap-4 mt-8 md:grid-cols-5">
						{Array.from(new Set(activeQuestions.map((q) => q.category))).map(
							(category) => {
								const categoryQuestions = activeQuestions.filter(
									(q) => q.category === category,
								);
								const categoryAnswered = categoryQuestions.filter(
									(q) => answers[q.id],
								).length;
								const categoryProgress =
									(categoryAnswered / categoryQuestions.length) * 100;

								return (
									<div
										key={category}
										className="p-3 text-center bg-white rounded-lg shadow-sm"
										aria-label={`${category}: ${Math.round(categoryProgress)}% complete`}
									>
										<p className="mb-2 text-xs font-medium text-gray-600">
											{category}
										</p>
										<div className="h-2 overflow-hidden bg-gray-200 rounded-full">
											<div
												className="h-full transition-all duration-300"
												style={{
													width: `${categoryProgress}%`,
													background: `linear-gradient(90deg, ${theme.colors.accents.teal}, ${theme.colors.accents.purple})`,
												}}
											/>
										</div>
										<p className="mt-1 text-xs text-gray-500">
											{categoryAnswered}/{categoryQuestions.length}
										</p>
									</div>
								);
							},
						)}
					</div>
				)}
			</main>

			{/* Custom Footer Component */}
			{footerComponent}

			{/* Saving Indicator */}
			{isSaving && (
				<div className="fixed z-50 flex items-center px-4 py-2 bg-white rounded-lg shadow-lg bottom-4 right-4">
					<div className="w-4 h-4 mr-2 border-2 border-gray-300 rounded-full animate-spin border-t-teal-600" />
					Saving...
				</div>
			)}

			{/* Accessibility Styles */}
			<style jsx>{`
        /* Focus styles */
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible {
          outline: ${theme.accessibility.focusRingWidth}px solid
            ${theme.accessibility.focusRingColor};
          outline-offset: ${theme.accessibility.focusRingOffset}px;
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          * {
            border-color: currentColor !important;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Custom range slider */
        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          background: ${theme.colors.neutral.gray200};
          border-radius: 999px;
          outline: none;
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(
            135deg,
            ${theme.colors.accents.teal},
            ${theme.colors.accents.purple}
          );
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        input[type='range']::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(
            135deg,
            ${theme.colors.accents.teal},
            ${theme.colors.accents.purple}
          );
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          border: none;
        }
      `}</style>
		</div>
	);
}

export default ReflectionBase;
