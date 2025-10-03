import { useCallback, useEffect, useState } from "react";

interface ConversionFlowState {
	isVisible: boolean;
	trigger: "exit-intent" | "time-delay" | "scroll" | "manual";
	hasBeenShown: boolean;
}

export function useConversionFlow() {
	const [state, setState] = useState<ConversionFlowState>({
		isVisible: false,
		trigger: "manual",
		hasBeenShown: false,
	});

	// Exit intent detection
	useEffect(() => {
		const handleMouseLeave = (e: MouseEvent) => {
			if (
				e.clientY <= 0 &&
				!state.hasBeenShown &&
				!state.isVisible &&
				e.relatedTarget === null
			) {
				setState((prev) => ({
					...prev,
					isVisible: true,
					trigger: "exit-intent",
					hasBeenShown: true,
				}));
			}
		};

		document.addEventListener("mouseleave", handleMouseLeave);
		return () => document.removeEventListener("mouseleave", handleMouseLeave);
	}, [state.hasBeenShown, state.isVisible]);

	// Time-based trigger (30 seconds)
	useEffect(() => {
		const timer = setTimeout(() => {
			if (!state.hasBeenShown && !state.isVisible) {
				setState((prev) => ({
					...prev,
					isVisible: true,
					trigger: "time-delay",
					hasBeenShown: true,
				}));
			}
		}, 30000); // 30 seconds

		return () => clearTimeout(timer);
	}, [state.hasBeenShown, state.isVisible]);

	// Scroll-based trigger (80% of page)
	useEffect(() => {
		const handleScroll = () => {
			const scrollPercentage =
				(window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
				100;

			if (scrollPercentage >= 80 && !state.hasBeenShown && !state.isVisible) {
				setState((prev) => ({
					...prev,
					isVisible: true,
					trigger: "scroll",
					hasBeenShown: true,
				}));
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [state.hasBeenShown, state.isVisible]);

	const showConversionFlow = useCallback(
		(trigger: ConversionFlowState["trigger"] = "manual") => {
			setState((prev) => ({
				...prev,
				isVisible: true,
				trigger,
				hasBeenShown: true,
			}));
		},
		[],
	);

	const hideConversionFlow = useCallback(() => {
		setState((prev) => ({
			...prev,
			isVisible: false,
		}));
	}, []);

	const resetConversionFlow = useCallback(() => {
		setState({
			isVisible: false,
			trigger: "manual",
			hasBeenShown: false,
		});
	}, []);

	return {
		isVisible: state.isVisible,
		trigger: state.trigger,
		hasBeenShown: state.hasBeenShown,
		showConversionFlow,
		hideConversionFlow,
		resetConversionFlow,
	};
}
