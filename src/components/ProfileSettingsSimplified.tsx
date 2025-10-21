import {
	Check,
	ChevronLeft,
	Download,
	RefreshCw,
	Trash2,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { emailNotificationService } from "../services/emailNotificationService";

interface UserProfile {
	id: string;
	full_name: string;
	email?: string;
	profile_photo_url?: string;
	accessibility_settings: {
		larger_text: boolean;
		high_contrast: boolean;
		reduce_motion: boolean;
	};
}

export const ProfileSettingsSimplified: React.FC = () => {
	const { user, signOut } = useAuth();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [activeSection, setActiveSection] = useState<"profile" | "accessibility" | "privacy">("profile");
	
	const [profile, setProfile] = useState<UserProfile>({
		id: user?.id || "",
		full_name: user?.user_metadata?.full_name || "",
		email: user?.email || "",
		profile_photo_url: "",
		accessibility_settings: {
			larger_text: false,
			high_contrast: false,
			reduce_motion: false,
		},
	});

	const [emailNotifications, setEmailNotifications] = useState(true);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	// Load user profile
	useEffect(() => {
		if (user) {
			fetchUserProfile();
			loadEmailPreferences();
		} else {
			setLoading(false);
		}
		
		// Fallback timeout in case loading gets stuck
		const timeout = setTimeout(() => {
			if (loading) {
				console.warn("Profile loading timeout - setting defaults");
				setLoading(false);
			}
		}, 5000);
		
		return () => clearTimeout(timeout);
	}, [user]);

	const loadEmailPreferences = async () => {
		if (!user) return;
		
		try {
			const prefs = await emailNotificationService.getEmailPreferences(user.id);
			if (prefs) {
				setEmailNotifications(prefs.emailNotifications);
			}
		} catch (error) {
			console.error("Error loading email preferences:", error);
		}
	};

	// Apply accessibility settings
	useEffect(() => {
		const root = document.documentElement;
		
		if (profile.accessibility_settings.larger_text) {
			root.classList.add("larger-text");
		} else {
			root.classList.remove("larger-text");
		}
		
		if (profile.accessibility_settings.high_contrast) {
			root.classList.add("high-contrast");
		} else {
			root.classList.remove("high-contrast");
		}
		
		if (profile.accessibility_settings.reduce_motion) {
			root.classList.add("reduce-motion");
		} else {
			root.classList.remove("reduce-motion");
		}
	}, [profile.accessibility_settings]);

	const fetchUserProfile = async () => {
		if (!user) {
			setLoading(false);
			return;
		}
		
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("user_profiles")
				.select("*")
				.eq("id", user.id)
				.single();

			if (error && error.code !== 'PGRST116') {
				// PGRST116 is "not found" - that's okay, we'll create a profile
				console.error("Error fetching profile:", error);
			}

			if (data) {
				setProfile({
					id: data.id,
					full_name: data.full_name || "",
					email: user.email || "",
					profile_photo_url: data.profile_photo_url || "",
					accessibility_settings: data.accessibility_settings || {
						larger_text: false,
						high_contrast: false,
						reduce_motion: false,
					},
				});
			} else {
				// No profile exists yet, use defaults
				setProfile({
					id: user.id,
					full_name: user.user_metadata?.full_name || "",
					email: user.email || "",
					profile_photo_url: "",
					accessibility_settings: {
						larger_text: false,
						high_contrast: false,
						reduce_motion: false,
					},
				});
			}
		} catch (error) {
			console.error("Error fetching profile:", error);
			// Set defaults even on error
			setProfile({
				id: user.id,
				full_name: user.user_metadata?.full_name || "",
				email: user.email || "",
				profile_photo_url: "",
				accessibility_settings: {
					larger_text: false,
					high_contrast: false,
					reduce_motion: false,
				},
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		if (!user) return;
		
		setSaving(true);
		try {
			const { error } = await supabase
				.from("user_profiles")
				.upsert({
					id: user.id,
					full_name: profile.full_name,
					profile_photo_url: profile.profile_photo_url,
					accessibility_settings: profile.accessibility_settings,
					updated_at: new Date().toISOString(),
				});

			if (error) throw error;
			
			alert("Profile saved successfully!");
		} catch (error) {
			console.error("Error saving profile:", error);
			alert("Failed to save profile. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (!user) return;
		
		try {
			// Delete user data
			await supabase.from("user_profiles").delete().eq("id", user.id);
			await supabase.from("reflections").delete().eq("user_id", user.id);
			
			// Sign out and redirect
			await signOut();
			navigate("/");
		} catch (error) {
			console.error("Error deleting account:", error);
			alert("Failed to delete account. Please contact support.");
		}
	};

	const handleExportData = () => {
		const userEmail = user?.email || 'Not provided';
		const userId = user?.id || 'Not provided';
		const userName = profile.full_name || 'Not provided';
		
		const emailBody = 
			`Hello InterpretReflect Team,\n\n` +
			`I would like to request an export of my data.\n\n` +
			`Account details:\n` +
			`- Name: ${userName}\n` +
			`- Email: ${userEmail}\n` +
			`- User ID: ${userId}\n` +
			`- Request Date: ${new Date().toLocaleDateString()}\n\n` +
			`Thank you`;
		
		const subject = 'Data Export Request - InterpretReflect';
		const mailtoLink = `mailto:info@interpretreflect.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
		
		// Try to open email client
		window.location.href = mailtoLink;
		
		// Show instructions as fallback
		setTimeout(() => {
			if (confirm('Did your email client open?\n\nClick OK to copy the email details to clipboard instead.')) {
				const fullEmail = `To: info@interpretreflect.com\nSubject: ${subject}\n\n${emailBody}`;
				navigator.clipboard.writeText(fullEmail).then(() => {
					alert('Email details copied to clipboard! You can paste this into your email client.');
				}).catch(() => {
					alert('Could not copy to clipboard. Please email info@interpretreflect.com with your data export request.');
				});
			}
		}, 1000);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#FAF8F5" }}>
				<RefreshCw className="w-8 h-8 animate-spin" style={{ color: "#6B8268" }} />
			</div>
		);
	}

	return (
		<div className="min-h-screen" style={{ backgroundColor: "#FAF8F5" }}>
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Back Button */}
				<button
					onClick={() => navigate("/")}
					className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg transition-all hover:bg-opacity-80"
					style={{ color: "#6B8268", backgroundColor: "rgba(107, 130, 104, 0.1)" }}
				>
					<ChevronLeft className="w-4 h-4" />
					<span className="text-sm font-medium">Back to Home</span>
				</button>

				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-slate-700)" }}>
						Settings
					</h1>
					<p className="text-sm" style={{ color: "var(--color-slate-600)" }}>
						Manage your profile and preferences
					</p>
				</div>

				{/* Section Tabs */}
				<div className="mb-6 flex gap-2 p-1 rounded-xl" style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-slate-200)" }}>
					{(["profile", "accessibility", "privacy"] as const).map((section) => (
						<button
							key={section}
							onClick={() => setActiveSection(section)}
							className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all capitalize"
							style={{
								backgroundColor: activeSection === section ? "#6B8268" : "transparent",
								color: activeSection === section ? "white" : "var(--color-slate-600)",
							}}
						>
							{section}
						</button>
					))}
				</div>

				{/* Profile Section */}
				{activeSection === "profile" && (
					<div className="space-y-6">
						{/* Account Info */}
						<div className="rounded-xl p-6" style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-slate-200)" }}>
							<h2 className="text-lg font-semibold mb-6" style={{ color: "var(--color-slate-700)" }}>
								Profile Information
							</h2>

							<div className="space-y-4">
								{/* Email (read-only) */}
								<div>
									<label className="block text-sm font-medium mb-2" style={{ color: "var(--color-slate-700)" }}>
										Email
									</label>
									<div className="px-4 py-3 rounded-lg" style={{ backgroundColor: "#F3F4F6", color: "var(--color-slate-600)" }}>
										{profile.email || user?.email || "No email found"}
									</div>
								</div>

								{/* Full Name */}
								<div>
									<label className="block text-sm font-medium mb-2" style={{ color: "var(--color-slate-700)" }}>
										Full Name
									</label>
									<input
										type="text"
										value={profile.full_name}
										onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
										className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#6B8268]"
										style={{ borderColor: "var(--color-slate-300)" }}
										placeholder="Enter your full name"
									/>
								</div>
							</div>
						</div>

						{/* Save Button */}
						<button
							onClick={handleSave}
							disabled={saving}
							className="w-full px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
							style={{
								backgroundColor: saving ? "#CCCCCC" : "#6B8268",
								color: "white",
								cursor: saving ? "not-allowed" : "pointer",
							}}
						>
							{saving ? (
								<>
									<RefreshCw className="w-5 h-5 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Check className="w-5 h-5" />
									Save Changes
								</>
							)}
						</button>
					</div>
				)}

				{/* Accessibility Section */}
				{activeSection === "accessibility" && (
					<div className="space-y-6">
						<div className="rounded-xl p-6" style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-slate-200)" }}>
							<h2 className="text-lg font-semibold mb-6" style={{ color: "var(--color-slate-700)" }}>
								Accessibility Settings
							</h2>

							<div className="space-y-4">
								{[
									{
										id: "larger_text",
										label: "Larger Text",
										description: "Increase text size for better readability",
									},
									{
										id: "high_contrast",
										label: "High Contrast",
										description: "Enhance color contrast for visual clarity",
									},
									{
										id: "reduce_motion",
										label: "Reduce Motion",
										description: "Minimize animations and transitions",
									},
								].map((setting) => (
									<label
										key={setting.id}
										className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-opacity-80 transition-colors"
										style={{ backgroundColor: "#FAF8F5", border: "1px solid var(--color-slate-200)" }}
									>
										<div>
											<h3 className="font-medium text-sm" style={{ color: "var(--color-slate-700)" }}>
												{setting.label}
											</h3>
											<p className="text-xs mt-0.5" style={{ color: "var(--color-slate-600)" }}>
												{setting.description}
											</p>
										</div>
										<input
											type="checkbox"
											checked={profile.accessibility_settings[setting.id as keyof typeof profile.accessibility_settings]}
											onChange={() =>
												setProfile({
													...profile,
													accessibility_settings: {
														...profile.accessibility_settings,
														[setting.id]: !profile.accessibility_settings[setting.id as keyof typeof profile.accessibility_settings],
													},
												})
											}
											className="w-3.5 h-3.5 rounded cursor-pointer transition-colors"
											style={{
												accentColor: "#6B8268",
											}}
											aria-label={`${setting.label}: ${setting.description}`}
											aria-describedby={`${setting.id}-description`}
										/>
									</label>
								))}
							</div>
						</div>

						{/* Save Button */}
						<button
							onClick={handleSave}
							disabled={saving}
							className="w-full px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
							style={{
								backgroundColor: saving ? "#CCCCCC" : "#6B8268",
								color: "white",
								cursor: saving ? "not-allowed" : "pointer",
							}}
						>
							{saving ? (
								<>
									<RefreshCw className="w-5 h-5 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Check className="w-5 h-5" />
									Save Changes
								</>
							)}
						</button>
					</div>
				)}

				{/* Privacy Section */}
				{activeSection === "privacy" && (
					<div className="space-y-6">
						{/* Email Notifications */}
						<div className="rounded-xl p-6" style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-slate-200)" }}>
							<h2 className="text-lg font-semibold mb-6" style={{ color: "var(--color-slate-700)" }}>
								Notifications
							</h2>

							<label
								className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-opacity-80 transition-colors"
								style={{ backgroundColor: "#FAF8F5", border: "1px solid var(--color-slate-200)" }}
							>
								<div>
									<h3 className="font-medium text-sm" style={{ color: "var(--color-slate-700)" }}>
										Email Notifications
									</h3>
									<p className="text-xs mt-0.5" style={{ color: "var(--color-slate-600)" }}>
										Receive wellness reminders and updates
									</p>
								</div>
								<input
									type="checkbox"
									checked={emailNotifications}
									onChange={async (e) => {
										const newValue = e.target.checked;
										setEmailNotifications(newValue);
										
										if (user) {
											try {
												await emailNotificationService.updateEmailPreferences(user.id, {
													emailNotifications: newValue,
												});
											} catch (error) {
												console.error("Error updating email preferences:", error);
												// Revert on error
												setEmailNotifications(!newValue);
												alert("Failed to update email preferences. Please try again.");
											}
										}
									}}
									className="w-3.5 h-3.5 rounded cursor-pointer transition-colors"
									style={{
										accentColor: "#6B8268",
									}}
								/>
							</label>
						</div>

						{/* Data Management */}
						<div className="rounded-xl p-6" style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-slate-200)" }}>
							<h2 className="text-lg font-semibold mb-2" style={{ color: "var(--color-slate-700)" }}>
								Data Management
							</h2>
							<p className="text-sm mb-6" style={{ color: "var(--color-slate-600)" }}>
								Request a copy of your data or permanently delete your account
							</p>

							<div className="space-y-3">
								{/* Export Data */}
								<button
									onClick={handleExportData}
									className="w-full flex items-center justify-between p-4 rounded-lg transition-all hover:opacity-90"
									style={{ backgroundColor: "#FAF8F5", border: "1px solid var(--color-slate-200)" }}
								>
									<div className="flex items-center gap-3">
										<Download className="w-5 h-5" style={{ color: "#6B8268" }} />
										<div className="text-left">
											<h3 className="font-medium text-sm" style={{ color: "var(--color-slate-700)" }}>
												Request Data Export
											</h3>
											<p className="text-xs mt-0.5" style={{ color: "var(--color-slate-600)" }}>
												Get a copy of all your reflections and data
											</p>
										</div>
									</div>
									<span className="text-xs font-medium" style={{ color: "#6B8268" }}>
										Email Us →
									</span>
								</button>

								{/* Delete Account */}
								<button
									onClick={() => setShowDeleteConfirm(true)}
									className="w-full flex items-center justify-between p-4 rounded-lg transition-all hover:opacity-90"
									style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5" }}
								>
									<div className="flex items-center gap-3">
										<Trash2 className="w-5 h-5" style={{ color: "#DC2626" }} />
										<div className="text-left">
											<h3 className="font-medium text-sm" style={{ color: "#DC2626" }}>
												Delete Account
											</h3>
											<p className="text-xs mt-0.5" style={{ color: "#991B1B" }}>
												Permanently delete your account and data
											</p>
										</div>
									</div>
								</button>
							</div>
						</div>

						{/* Privacy Notice */}
						<div
							className="rounded-lg p-4"
							style={{ backgroundColor: "rgba(107, 130, 104, 0.05)", border: "1px solid rgba(107, 130, 104, 0.2)" }}
						>
							<p className="text-xs leading-relaxed" style={{ color: "var(--color-slate-600)" }}>
								🔒 Your data is encrypted and never shared without consent. We use zero-knowledge analytics that only track usage patterns, not personal content.
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl p-6 max-w-md w-full">
						<h3 className="text-xl font-bold mb-2" style={{ color: "#DC2626" }}>
							Delete Account?
						</h3>
						<p className="text-sm mb-4" style={{ color: "var(--color-slate-600)" }}>
							This action cannot be undone. All your reflections and data will be permanently deleted.
						</p>
						
						{/* Warning box */}
						<div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5" }}>
							<p className="text-sm font-medium mb-2" style={{ color: "#DC2626" }}>
								⚠️ Important: Export Your Data First
							</p>
							<p className="text-xs" style={{ color: "#991B1B" }}>
								Make sure to request a data export before deleting your account. Once deleted, we cannot recover your information.
							</p>
						</div>

						<div className="flex gap-3">
							<button
								onClick={() => setShowDeleteConfirm(false)}
								className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all"
								style={{ backgroundColor: "var(--color-slate-100)", color: "var(--color-slate-700)" }}
							>
								Cancel
							</button>
							<button
								onClick={handleDeleteAccount}
								className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all hover:opacity-90"
								style={{ backgroundColor: "#DC2626", color: "white" }}
							>
								Delete Account
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProfileSettingsSimplified;
