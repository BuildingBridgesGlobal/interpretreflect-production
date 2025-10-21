import React from "react";
import { SuccessToast } from "./feedback/SuccessToast";

interface ReflectionSuccessToastProps {
	show: boolean;
	onClose: () => void;
	reflectionType?: string;
}

export const ReflectionSuccessToast: React.FC<ReflectionSuccessToastProps> = ({
	show,
	onClose,
	reflectionType,
}) => {
	return (
		<SuccessToast
			message="Reflection Saved!"
			subMessage="Your reflection has been saved and added to Recent Reflections."
			show={show}
			onClose={onClose}
			duration={4000}
		/>
	);
};
