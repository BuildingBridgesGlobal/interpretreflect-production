import {
	AlertTriangle,
	Clock,
	Eye,
	Info,
	Lock,
	LogOut,
	Shield,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { SECURITY_MESSAGES } from "../config/security";

interface SecurityBannerProps {
	type?: "info" | "warning" | "success" | "error";
	dismissible?: boolean;
	autoHide?: number; // milliseconds
}

const SecurityBanner: React.FC<SecurityBannerProps> = ({
	type = "info",
	dismissible = true,
	autoHide,
}) => {
	const [visible, setVisible] = useState(true);
	const [currentMessage, setCurrentMessage] = useState<string>("");
	const [messageType, setMessageType] = useState(type);

	// Rotating security tips
	const securityTips = [
		{
			message:
				"Your data is encrypted at rest and in transit using 256-bit AES encryption.",
			icon: Lock,
			type: "info" as const,
		},
		{
			message: "Remember to log out when using shared or public devices.",
			icon: LogOut,
			type: "warning" as const,
		},
		{
			message:
				"We follow HIPAA guidelines to protect your wellness information.",
			icon: Shield,
			type: "success" as const,
		},
		{
			message:
				"Your session will automatically timeout after 30 minutes of inactivity.",
			icon: Clock,
			type: "info" as const,
		},
		{
			message: "You can review and download your data anytime from Settings.",
			icon: Eye,
			type: "info" as const,
		},
	];

	useEffect(() => {
		// Rotate through security tips
		let tipIndex = 0;
		const showNextTip = () => {
			const tip = securityTips[tipIndex % securityTips.length];
			setCurrentMessage(tip.message);
			setMessageType(tip.type);
			setVisible(true);
			tipIndex++;
		};

		showNextTip();
		const interval = setInterval(showNextTip, 60000); // Change tip every minute

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (autoHide && visible) {
			const timer = setTimeout(() => {
				setVisible(false);
			}, autoHide);
			return () => clearTimeout(timer);
		}
	}, [autoHide, visible, currentMessage]);

	// Listen for session warnings
	useEffect(() => {
		const handleSessionWarning = (event: CustomEvent) => {
			setCurrentMessage(SECURITY_MESSAGES.sessionWarning);
			setMessageType("warning");
			setVisible(true);
		};

		const handleSessionEnd = (event: CustomEvent) => {
			if (event.detail.reason === "TIMEOUT") {
				setCurrentMessage(SECURITY_MESSAGES.sessionExpired);
				setMessageType("error");
				setVisible(true);
			}
		};

		window.addEventListener(
			"sessionWarning",
			handleSessionWarning as EventListener,
		);
		window.addEventListener("sessionEnd", handleSessionEnd as EventListener);

		return () => {
			window.removeEventListener(
				"sessionWarning",
				handleSessionWarning as EventListener,
			);
			window.removeEventListener(
				"sessionEnd",
				handleSessionEnd as EventListener,
			);
		};
	}, []);

	if (!visible || !currentMessage) return null;

	const getStyles = () => {
		switch (messageType) {
			case "warning":
				return {
					bg: "bg-yellow-50 border-yellow-200",
					text: "text-yellow-900",
					icon: "text-yellow-600",
				};
			case "success":
				return {
					bg: "bg-[rgba(107,130,104,0.05)] border-green-200",
					text: "text-green-900",
					icon: "text-green-600",
				};
			case "error":
				return {
					bg: "bg-red-50 border-red-200",
					text: "text-red-900",
					icon: "text-red-600",
				};
			default:
				return {
					bg: "bg-blue-50 border-blue-200",
					text: "text-blue-900",
					icon: "text-blue-600",
				};
		}
	};

	const getIcon = () => {
		switch (messageType) {
			case "warning":
				return AlertTriangle;
			case "success":
				return Shield;
			case "error":
				return AlertTriangle;
			default:
				return Info;
		}
	};

	const styles = getStyles();
	const Icon = getIcon();

	return (
		<div
			className={`fixed top-20 right-4 z-40 max-w-md animate-slide-in ${styles.bg} border rounded-lg shadow-lg p-4`}
			role="alert"
			aria-live="polite"
		>
			<div className="flex items-start">
				<Icon className={`h-5 w-5 ${styles.icon} mt-0.5 mr-3 flex-shrink-0`} />
				<div className="flex-1">
					<p className={`text-sm ${styles.text}`}>{currentMessage}</p>
				</div>
				{dismissible && (
					<button
						onClick={() => setVisible(false)}
						className={`ml-3 ${styles.icon} hover:opacity-70 transition-opacity`}
						aria-label="Dismiss"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>
		</div>
	);
};

// Session Timeout Warning Modal
interface SessionTimeoutModalProps {
	isOpen: boolean;
	timeRemaining: number;
	onExtend: () => void;
	onLogout: () => void;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
	isOpen,
	timeRemaining,
	onExtend,
	onLogout,
}) => {
	const [secondsRemaining, setSecondsRemaining] = useState(
		Math.floor(timeRemaining / 1000),
	);

	useEffect(() => {
		if (isOpen && timeRemaining > 0) {
			const timer = setInterval(() => {
				setSecondsRemaining((prev) => {
					if (prev <= 1) {
						clearInterval(timer);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			return () => clearInterval(timer);
		}
	}, [isOpen, timeRemaining]);

	if (!isOpen) return null;

	const minutes = Math.floor(secondsRemaining / 60);
	const seconds = secondsRemaining % 60;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
				<div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-orange-100 rounded-lg">
							<Clock className="h-6 w-6 text-orange-600" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-gray-900">
								Session Timeout Warning
							</h2>
							<p className="text-sm text-gray-600">
								Your session is about to expire
							</p>
						</div>
					</div>
				</div>

				<div className="p-6">
					<div className="text-center mb-6">
						<div className="text-4xl font-bold text-orange-600 mb-2">
							{minutes}:{seconds.toString().padStart(2, "0")}
						</div>
						<p className="text-gray-600">
							You've been inactive for a while. Your session will expire soon
							for security reasons.
						</p>
					</div>

					<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
						<p className="text-sm text-yellow-900">
							<strong>Why does this happen?</strong> Auto-logout protects your
							data if you forget to sign out on a shared device.
						</p>
					</div>

					<div className="flex gap-3">
						<button
							onClick={onExtend}
							className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
						>
							Stay Logged In
						</button>
						<button
							onClick={onLogout}
							className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
						>
							Log Out Now
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SecurityBanner;
