import type React from "react";
import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";
import Logo from "../Logo";

import { UserDropdown } from "./UserDropdown";

interface HeaderProps {
	user: any;
	devMode: boolean;
	showUserDropdown: boolean;
	setShowUserDropdown: (show: boolean) => void;
	setDevMode: (mode: boolean) => void;
	signOut: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
	user,
	devMode,
	showUserDropdown,
	setShowUserDropdown,
	setDevMode,
	signOut,
}) => {
	const [userFullName, setUserFullName] = useState<string>("User");

	// Fetch user's full name from profile
	useEffect(() => {
		const fetchUserName = async () => {
			if (devMode) {
				setUserFullName("Dev Mode");
				return;
			}

			if (!user) {
				setUserFullName("User");
				return;
			}

			// First check user_metadata for full_name (same as UserDropdown)
			if (user?.user_metadata?.full_name && user.user_metadata.full_name.trim()) {
				// Use the full name from metadata (matching UserDropdown display)
				setUserFullName(user.user_metadata.full_name);
				return;
			}

			// If no metadata, try to fetch from user_profiles table
			if (user?.id) {
				try {
					const { data, error } = await supabase
						.from('user_profiles')
						.select('full_name')
						.eq('id', user.id)
						.single();

					if (data?.full_name && data.full_name.trim()) {
						setUserFullName(data.full_name);
						return;
					}
				} catch (error) {
					console.log('Could not fetch user profile');
				}
			}

			// Last fallback: use first part of email
			const emailName = user?.email?.split("@")[0] || "User";
			setUserFullName(emailName);
		};

		fetchUserName();
	}, [user, devMode]);

	return (
		<>
			{/* DEV MODE INDICATOR */}
			{devMode && (
				<div
					className="fixed top-0 left-0 right-0 text-center py-1 text-xs font-medium z-50"
					style={{
						backgroundColor: "#FEF3C7",
						color: "#92400E",
						borderBottom: "1px solid #FDE68A",
					}}
				>
					Development Mode - Authentication Bypassed
				</div>
			)}

			{/* Header with proper semantic structure */}
			<header
				className="border-b"
				style={{
					backgroundColor: "#FFFFFF",
					borderBottomColor: "rgba(92, 127, 79, 0.15)",
					boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
				}}
				role="banner"
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo and Greeting */}
						<div className="flex items-center space-x-8">
							<Logo size="md" variant="default" linkToHome={false} />
							<div className="hidden md:block">
								<p className="text-lg font-medium" style={{ color: "#2D3A31" }}>
									Welcome back,{" "}
									{userFullName}
								</p>
								<p className="text-sm" style={{ color: "#5C6A60" }}>
									{new Date().toLocaleDateString("en-US", {
										weekday: "long",
										month: "long",
										day: "numeric",
									})}
								</p>
							</div>
						</div>

						{/* Right side controls */}
						<div className="flex items-center space-x-4">
							<UserDropdown
								user={user}
								devMode={devMode}
								showUserDropdown={showUserDropdown}
								setShowUserDropdown={setShowUserDropdown}
								setDevMode={setDevMode}
								signOut={signOut}
							/>
						</div>
					</div>
				</div>
			</header>
		</>
	);
};
