import { ChevronDown, ChevronRight } from "lucide-react";
import type React from "react";
import { useNavigate } from "react-router-dom";

interface UserDropdownProps {
	user: any;
	devMode: boolean;
	showUserDropdown: boolean;
	setShowUserDropdown: (show: boolean) => void;
	setDevMode: (mode: boolean) => void;
	signOut: () => Promise<void>;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
	user,
	devMode,
	showUserDropdown,
	setShowUserDropdown,
	setDevMode,
	signOut,
}) => {
	const navigate = useNavigate();

	return (
		<div className="relative">
			<button
				onClick={() => setShowUserDropdown(!showUserDropdown)}
				className="flex items-center space-x-3 px-4 py-2 rounded-xl transition-all"
				style={{
					backgroundColor: "rgba(13, 148, 136, 0.08)",
					border: "1px solid rgba(45, 95, 63, 0.2)",
				}}
				aria-label="User menu"
				aria-expanded={showUserDropdown}
			>
				<div
					className="w-8 h-8 rounded-full flex items-center justify-center"
					style={{
						background:
							"linear-gradient(135deg, #6B8268, #5B9378)",
					}}
				>
					<span className="text-sm font-medium" style={{ color: "#FFFFFF" }}>
						{user?.user_metadata?.full_name?.charAt(0).toUpperCase() ||
							user?.email?.charAt(0).toUpperCase() ||
							"U"}
					</span>
				</div>
				<span className="text-sm font-medium" style={{ color: "#1A3D26" }}>
					{devMode
						? "Dev Mode"
						: user?.user_metadata?.full_name ||
							user?.email?.split("@")[0] ||
							"User"}
				</span>
				<ChevronDown
					className={`h-4 w-4 transition-transform ${showUserDropdown ? "rotate-180" : ""}`}
					style={{ color: "#5C6A60" }}
				/>
			</button>

			{/* User Dropdown Menu */}
			{showUserDropdown && (
				<>
					{/* Backdrop to close dropdown */}
					<div
						className="fixed inset-0 z-10"
						onClick={() => setShowUserDropdown(false)}
					/>

					<div
						className="absolute right-0 top-full mt-2 w-72 rounded-lg shadow-lg z-20"
						style={{
							backgroundColor: "white",
							border: "2px solid #6B8268",
							boxShadow:
								"0 8px 16px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)",
						}}
					>
						{/* User Info */}
						<div
							className="p-4"
							style={{
								borderBottom: "2px solid rgba(45, 95, 63, 0.3)",
								backgroundColor: "rgba(13, 148, 136, 0.03)",
							}}
						>
							<div>
								<div
									className="font-medium text-base text-left"
									style={{ color: "#000000" }}
								>
									{devMode
										? "Dev Mode"
										: user?.user_metadata?.full_name ||
											user?.email?.split("@")[0] ||
											"User"}
								</div>
								<div className="text-sm text-left" style={{ color: "#333333" }}>
									{devMode
										? "Development Environment"
										: user?.email || "user@interpretreflect.com"}
								</div>
							</div>
						</div>

						{/* Menu Items */}
						<div
							className="p-3"
							style={{
								borderBottom: "2px solid rgba(45, 95, 63, 0.3)",
							}}
						>
							<button
								onClick={() => {
									setShowUserDropdown(false);
									navigate("/profile-settings");
								}}
								className="w-full flex items-center justify-between p-4 rounded-xl transition-all text-left group"
								style={{
									backgroundColor: "transparent",
									border: "2px solid transparent",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor =
										"rgba(13, 148, 136, 0.1)";
									e.currentTarget.style.borderColor = "rgba(45, 95, 63, 0.3)";
									e.currentTarget.style.transform = "translateX(4px)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = "transparent";
									e.currentTarget.style.borderColor = "transparent";
									e.currentTarget.style.transform = "translateX(0)";
								}}
							>
								<div className="text-left">
									<div className="font-medium text-left" style={{ color: "#000000" }}>
										Profile Settings
									</div>
									<div className="text-xs text-left" style={{ color: "#333333" }}>
										Manage your account
									</div>
								</div>
								<ChevronRight
									className="h-4 w-4 opacity-60 flex-shrink-0 transition-opacity group-hover:opacity-100"
									style={{ color: "#6A6A6A" }}
								/>
							</button>
						</div>

						{/* Sign Out */}
						<div className="p-3">
							<button
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();

									// Close dropdown immediately
									setShowUserDropdown(false);

									// Simple, direct sign out - no async, no waiting
									// Just clear everything and redirect
									setTimeout(() => {
										try {
											// Clear all storage
											localStorage.clear();
											sessionStorage.clear();

											// Clear cookies (in case any are set)
											document.cookie.split(";").forEach((c) => {
												document.cookie = c
													.replace(/^ +/, "")
													.replace(
														/=.*/,
														"=;expires=" + new Date().toUTCString() + ";path=/",
													);
											});

											// Force reload to landing page
											window.location.replace("/");
										} catch (err) {
											// If anything fails, just force redirect
											window.location.replace("/");
										}
									}, 100); // Small delay to ensure dropdown closes first
								}}
								className="w-full flex items-center p-4 rounded-xl transition-all text-left"
								style={{
									backgroundColor: "transparent",
									border: "2px solid transparent",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor =
										"rgba(220, 38, 38, 0.1)";
									e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.3)";
									e.currentTarget.style.transform = "translateX(4px)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = "transparent";
									e.currentTarget.style.borderColor = "transparent";
									e.currentTarget.style.transform = "translateX(0)";
								}}
							>
								<div className="font-medium text-left" style={{ color: "#000000" }}>
									Sign Out
								</div>
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
