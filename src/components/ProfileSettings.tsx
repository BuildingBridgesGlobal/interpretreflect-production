import {
	AlertCircle,
	Award,
	Bot,
	Camera,
	Check,
	ChevronDown,
	Download,
	Eye,
	Languages,
	Lock,
	Mail,
	Palette,
	RefreshCw,
	Shield,
	Trash2,
	Upload,
	User,
	X,
	Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { analyticsService } from "../services/analyticsService";
import { emailNotificationService } from "../services/emailNotificationService";

// ========== TYPES ==========
interface UserProfile {
	id: string;
	full_name: string;
	pronouns?: string;
	credentials?: string[];
	profile_photo_url?: string;
	preferred_language: string;
	accessibility_settings: {
		larger_text: boolean;
		high_contrast: boolean;
		reduce_motion: boolean;
		screen_reader: boolean;
	};
	email?: string;
	bio?: string;
	years_experience?: number;
	specializations?: string[];
	created_at?: string;
	updated_at?: string;
}

interface FormErrors {
	full_name?: string;
	pronouns?: string;
	credentials?: string;
	profile_photo?: string;
	bio?: string;
	general?: string;
}

// ========== CONSTANTS ==========
const SUPPORTED_LANGUAGES = [
	{ code: "en", label: "English", flag: "🇺🇸" },
	{ code: "es", label: "Spanish", flag: "🇪🇸" },
	{ code: "fr", label: "French", flag: "🇫🇷" },
	{ code: "asl", label: "ASL Resources", flag: "🤟" },
	{ code: "zh", label: "Chinese", flag: "🇨🇳" },
	{ code: "ar", label: "Arabic", flag: "🇸🇦" },
	{ code: "pt", label: "Portuguese", flag: "🇵🇹" },
	{ code: "ru", label: "Russian", flag: "🇷🇺" },
];

const COMMON_CREDENTIALS = [
	// ASL Certifications
	"RID CI/CT (Certificate of Interpretation/Certificate of Transliteration)",
	"RID CDI (Certified Deaf Interpreter)",
	"RID NIC (National Interpreter Certification)",
	"RID NIC-Advanced",
	"RID NIC-Master",
	"RID SC:L (Specialist Certificate: Legal)",
	"BEI Basic",
	"BEI Advanced",
	"BEI Master",
	"BEI Court Certified",
	"EIPA Level 3",
	"EIPA Level 4",
	"EIPA Level 5",

	// Spoken Language Certifications
	"CHI™ (Certified Healthcare Interpreter)",
	"CMI (Certified Medical Interpreter)",
	"CCHI (Certification Commission for Healthcare Interpreters)",
	"CoreCHI™",
	"NAATI Certified Provisional",
	"NAATI Certified",
	"NAATI Certified Advanced",
	"NAATI Certified Senior",
	"AIIC Member",
	"ATA Certified",

	// Specialized Certifications
	"Legal/Court Interpreter",
	"Medical Interpreter",
	"Conference Interpreter",
	"Educational Interpreter",
	"Mental Health Interpreter",
	"VRI/VRS Certified",
	"Trilingual Interpreter",

	// State-Specific (Dummy Examples)
	"California Court Interpreter",
	"New York State Certified",
	"Texas BEI Certified",
	"Florida Registry Approved",
];

const SPECIALIZATIONS = [
	"Medical",
	"Legal",
	"Mental Health",
	"Education",
	"Conference",
	"Community",
	"VRI/VRS",
	"Theatre",
	"Government",
	"Technology",
	"Business",
	"Religious",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
];

// ========== MAIN COMPONENT ==========
interface ProfileSettingsProps {
	devMode?: boolean;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
	devMode = false,
}) => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [cancelling, setCancelling] = useState(false);
	const [activeSection, setActiveSection] = useState<
		"profile" | "accessibility" | "privacy"
	>("profile");
	const [profile, setProfile] = useState<UserProfile>({
		id: "",
		full_name: "",
		pronouns: "",
		credentials: [],
		profile_photo_url: "",
		preferred_language: "en",
		accessibility_settings: {
			larger_text: false,
			high_contrast: false,
			reduce_motion: false,
			screen_reader: false,
		},
		bio: "",
		years_experience: 0,
		specializations: [],
	});
	const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(
		null,
	);
	const [errors, setErrors] = useState<FormErrors>({});
	const [successMessage, setSuccessMessage] = useState("");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [credentialInput, setCredentialInput] = useState("");
	const [showCredentialDropdown, setShowCredentialDropdown] = useState(false);
	const [filteredCredentials, setFilteredCredentials] = useState<string[]>([]);
	const [notificationPrefs, setNotificationPrefs] = useState({
		email_reminders: true,
		weekly_insights: true,
		team_updates: false,
		product_news: false,
	});

	// Privacy settings state
	const [privacySettings, setPrivacySettings] = useState({
		analytics: true,
		notifications: true,
		team_visibility: false,
	});

	// Refs for accessibility
	const fileInputRef = useRef<HTMLInputElement>(null);
	const announcementRef = useRef<HTMLDivElement>(null);

	// ========== DATA FETCHING ==========
	useEffect(() => {
		if (devMode) {
			// Use mock data in dev mode
			const mockProfile: UserProfile = {
				id: "dev-user",
				full_name: "Developer User",
				pronouns: "they/them",
				credentials: ["RID CI/CT"],
				profile_photo_url: "",
				preferred_language: "en",
				accessibility_settings: {
					larger_text: false,
					high_contrast: false,
					reduce_motion: false,
					screen_reader: false,
				},
				email: "dev@interpretreflect.com",
				bio: "Testing the platform in development mode",
				years_experience: 5,
				specializations: ["Medical", "Legal"],
			};
			setProfile(mockProfile);
			setOriginalProfile(mockProfile);
			setLoading(false);
		} else if (user) {
			fetchUserProfile();
		} else {
			setLoading(false);
		}
	}, [user, devMode]);

	// Initialize analytics and load email preferences based on user
	useEffect(() => {
		if (user?.id) {
			analyticsService.initialize(user.id);
			// Set initial consent based on current preference
			analyticsService.updateConsent(privacySettings.analytics);

			// Load email preferences from database
			emailNotificationService.getEmailPreferences(user.id).then(prefs => {
				if (prefs) {
					setPrivacySettings(prev => ({
						...prev,
						notifications: prefs.emailNotifications
					}));
				}
			});
		}
	}, [user?.id]);

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

		// Screen reader support
		if (profile.accessibility_settings.screen_reader) {
			// Add screen reader class
			root.classList.add("screen-reader-mode");
			// Set ARIA live regions
			root.setAttribute("aria-live", "polite");
			// Announce to user
			announceToScreenReader("Screen reader mode enabled. All content is optimized for accessibility.");
		} else {
			root.classList.remove("screen-reader-mode");
			root.removeAttribute("aria-live");
		}
	}, [profile.accessibility_settings]);

	const fetchUserProfile = async () => {
		try {
			setLoading(true);
			setErrors({});

			// Add timeout to prevent infinite loading
			const timeoutPromise = new Promise((_, reject) =>
				setTimeout(() => reject(new Error("Request timeout")), 5000),
			);

			const fetchPromise = supabase
				.from("user_profiles")
				.select("*")
				.eq("id", user?.id)
				.single();

			const { data, error } = await Promise.race([
				fetchPromise,
				timeoutPromise,
			]).catch(() => ({
				data: null,
				error: { code: "TIMEOUT", message: "Request timed out" },
			}));

			// If table doesn't exist or timeout, use default profile
			if (error && error.code !== "PGRST116") {
				console.warn("Profile table may not exist, using default profile");
			}

			const profileData: UserProfile = data || {
				id: user?.id || "",
				full_name: user?.user_metadata?.full_name || "",
				pronouns: "",
				credentials: [],
				profile_photo_url: user?.user_metadata?.avatar_url || "",
				preferred_language: "en",
				accessibility_settings: {
					larger_text: false,
					high_contrast: false,
					reduce_motion: false,
					screen_reader: false,
				},
				email: user?.email,
				bio: "",
				years_experience: 0,
				specializations: [],
			};

			setProfile(profileData);
			setOriginalProfile(profileData);
		} catch (err) {
			console.error("Error fetching profile:", err);
			setErrors({ general: "Failed to load profile. Please try again." });
		} finally {
			setLoading(false);
		}
	};

	// ========== FORM HANDLERS ==========
	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!profile.full_name.trim()) {
			newErrors.full_name = "Full name is required";
		} else if (profile.full_name.length > 100) {
			newErrors.full_name = "Full name must be less than 100 characters";
		}

		if (profile.pronouns && profile.pronouns.length > 50) {
			newErrors.pronouns = "Pronouns must be less than 50 characters";
		}

		if (profile.bio && profile.bio.length > 500) {
			newErrors.bio = "Bio must be less than 500 characters";
		}

		if (profile.credentials && profile.credentials.length > 10) {
			newErrors.credentials = "Maximum 10 credentials allowed";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			announceToScreenReader("Please correct the errors in the form");
			return;
		}

		try {
			setSaving(true);
			setErrors({});
			setSuccessMessage("");

			if (devMode) {
				// In dev mode, just simulate saving
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setOriginalProfile(profile);
				setSuccessMessage("Profile updated successfully!");
				announceToScreenReader("Profile saved successfully");
				setTimeout(() => setSuccessMessage(""), 5000);
			} else {
				const { error } = await supabase.from("user_profiles").upsert({
					id: user?.id,
					full_name: profile.full_name.trim(),
					pronouns: profile.pronouns?.trim() || null,
					credentials: profile.credentials,
					profile_photo_url: profile.profile_photo_url || null,
					preferred_language: profile.preferred_language,
					accessibility_settings: profile.accessibility_settings,
					bio: profile.bio?.trim() || null,
					years_experience: profile.years_experience,
					specializations: profile.specializations,
					updated_at: new Date().toISOString(),
				});

				if (error) throw error;

				if (profile.full_name !== originalProfile?.full_name) {
					await supabase.auth.updateUser({
						data: { full_name: profile.full_name },
					});
				}

				setOriginalProfile(profile);
				setSuccessMessage("Profile updated successfully!");
				announceToScreenReader("Profile settings saved successfully");

				setTimeout(() => setSuccessMessage(""), 5000);
			}
		} catch (err) {
			console.error("Error saving profile:", err);
			setErrors({ general: "Failed to save profile. Please try again." });
			announceToScreenReader("Error saving profile settings");
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		if (originalProfile) {
			setProfile(originalProfile);
			setErrors({});
			setSuccessMessage("");
			announceToScreenReader("Changes canceled");
		}
	};

	// ========== PHOTO UPLOAD ==========
	const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!ALLOWED_FILE_TYPES.includes(file.type)) {
			setErrors({
				profile_photo:
					"Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
			});
			return;
		}

		if (file.size > MAX_FILE_SIZE) {
			setErrors({ profile_photo: "File size must be less than 5MB" });
			return;
		}

		try {
			setErrors({ ...errors, profile_photo: undefined });

			const fileExt = file.name.split(".").pop();
			const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
			const filePath = `profile-photos/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from("avatars")
				.upload(filePath, file, {
					cacheControl: "3600",
					upsert: true,
				});

			if (uploadError) throw uploadError;

			const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

			setProfile({ ...profile, profile_photo_url: data.publicUrl });
			announceToScreenReader("Profile photo uploaded successfully");
		} catch (err) {
			console.error("Error uploading photo:", err);
			setErrors({ profile_photo: "Failed to upload photo. Please try again." });
		}
	};

	// ========== CREDENTIALS MANAGEMENT ==========
	const handleAddCredential = (credential: string) => {
		const trimmed = credential.trim();
		if (!trimmed) return;

		if (profile.credentials?.includes(trimmed)) {
			setErrors({ credentials: "This credential has already been added" });
			return;
		}

		if (profile.credentials && profile.credentials.length >= 10) {
			setErrors({ credentials: "Maximum 10 credentials allowed" });
			return;
		}

		setProfile({
			...profile,
			credentials: [...(profile.credentials || []), trimmed],
		});
		setCredentialInput("");
		setShowCredentialDropdown(false);
		setErrors({ ...errors, credentials: undefined });
	};

	const handleRemoveCredential = (index: number) => {
		setProfile({
			...profile,
			credentials: profile.credentials?.filter((_, i) => i !== index) || [],
		});
	};

	// ========== SPECIALIZATIONS ==========
	const toggleSpecialization = (spec: string) => {
		const current = profile.specializations || [];
		if (current.includes(spec)) {
			setProfile({
				...profile,
				specializations: current.filter((s) => s !== spec),
			});
		} else {
			setProfile({
				...profile,
				specializations: [...current, spec],
			});
		}
	};

	// ========== UTILITY FUNCTIONS ==========
	const announceToScreenReader = (message: string) => {
		if (announcementRef.current) {
			announcementRef.current.textContent = message;
		}
	};

	const hasUnsavedChanges = (): boolean => {
		return JSON.stringify(profile) !== JSON.stringify(originalProfile);
	};

	const handleManageSubscription = async () => {
		setCancelling(true);
		try {
			// Get auth session for the request
			const { data: { session } } = await supabase.auth.getSession();

			if (!session) {
				throw new Error('Not authenticated');
			}

			// Call Edge Function to create Stripe Customer Portal session
			const { data, error } = await supabase.functions.invoke('create-portal-session', {
				body: {
					returnUrl: window.location.origin + '/profile-settings'
				},
				headers: {
					Authorization: `Bearer ${session.access_token}`
				}
			});

			console.log('🔵 [ProfileSettings] Edge function response:', {
				data,
				error,
				hasUrl: !!data?.url
			});

			if (error) {
				console.error('❌ [ProfileSettings] Edge function error:', error);
				throw error;
			}

			if (data?.url) {
				console.log('✅ [ProfileSettings] Got portal URL, redirecting to:', data.url);
				// Redirect to Stripe Customer Portal
				window.location.href = data.url;
			} else {
				console.error('❌ [ProfileSettings] No URL in response:', data);
				throw new Error('No portal URL returned');
			}
		} catch (error) {
			console.error('❌ [ProfileSettings] Error opening billing portal:', error);
			alert('Unable to open billing portal. Please contact support at info@interpretreflect.com');
		} finally {
			setCancelling(false);
		}
	};

	// ========== RENDER ==========
	if (loading) {
		return (
			<div
				style={{
					backgroundColor: "var(--color-surface)",
					minHeight: "100vh",
					fontFamily:
						"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
				}}
				className="flex items-center justify-center"
			>
				<div className="text-center">
					<RefreshCw
						className="w-8 h-8 animate-spin mx-auto mb-4"
						style={{ color: "var(--color-green-600)" }}
					/>
					<p style={{ color: "var(--color-slate-600)" }}>Loading profile settings...</p>
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				backgroundColor: "var(--color-surface)",
				minHeight: "100vh",
				fontFamily:
					"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
			}}
		>
			{/* Screen reader announcements */}
			<div
				ref={announcementRef}
				className="sr-only"
				role="status"
				aria-live="polite"
			/>

			{/* Header */}
			<div
				className="border-b shadow-clean"
				style={{
					backgroundColor: "var(--color-card)",
					borderColor: "var(--color-slate-200)",
				}}
			>
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-4">
							<div
								className="w-12 h-12 rounded-2xl flex items-center justify-center"
								style={{ backgroundColor: "var(--color-green-50)", border: "1px solid var(--color-green-200)" }}
							>
								<User className="w-6 h-6" style={{ color: "var(--color-green-600)" }} />
							</div>
							<div>
								<h1 className="text-3xl font-bold" style={{ color: "var(--color-slate-700)" }}>
									Profile Settings
								</h1>
								<p className="text-sm mt-1" style={{ color: "var(--color-slate-600)" }}>
									Personalize your professional experience
								</p>
							</div>
						</div>
						<button
							onClick={() => navigate("/")}
							className="p-2 rounded-xl transition-all hover:-translate-y-0.5 shadow-clean"
							style={{
								backgroundColor: "var(--color-card)",
								border: "1px solid var(--color-slate-200)",
							}}
							aria-label="Close profile settings"
						>
							<X className="w-6 h-6" style={{ color: "var(--color-slate-600)" }} />
						</button>
					</div>
				</div>
			</div>

			{/* Tab Navigation */}
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
				<div
					className="flex gap-2 p-1 rounded-xl shadow-clean"
					style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-slate-200)" }}
				>
					{(["profile", "accessibility", "privacy"] as const).map((section) => (
						<button
							key={section}
							onClick={() => setActiveSection(section)}
							aria-label={`Switch to ${section === "privacy" ? "Privacy and Data" : section} settings`}
							className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all capitalize hover:-translate-y-0.5"
							style={{
								background:
									activeSection === section
										? "linear-gradient(135deg, var(--color-green-600), var(--color-green-500))"
										: "transparent",
								color: activeSection === section ? "white" : "var(--color-slate-600)",
								boxShadow: activeSection === section ? "0 4px 12px rgba(45, 95, 63, 0.2)" : "none"
							}}
						>
							{section === "privacy" ? "Privacy & Data" : section}
						</button>
					))}
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				{/* Success/Error Messages with ARIA Live Region */}
				<div aria-live="polite" aria-atomic="true">
					{successMessage && (
						<div
							role="status"
							className="mb-6 p-4 rounded-xl flex items-center gap-3 shadow-clean"
							style={{
								backgroundColor: "var(--color-success-light)",
								border: "2px solid var(--color-success)",
							}}
						>
							<Check className="w-5 h-5" style={{ color: "var(--color-success)" }} aria-hidden="true" />
							<p className="font-semibold" style={{ color: "var(--color-success)" }}>{successMessage}</p>
						</div>
					)}

					{errors.general && (
						<div
							role="alert"
							className="mb-6 p-4 rounded-xl flex items-center gap-3 shadow-clean"
							style={{
								backgroundColor: "var(--color-error-light)",
								border: "2px solid var(--color-error)",
							}}
						>
							<AlertCircle className="w-5 h-5" style={{ color: "var(--color-error)" }} aria-hidden="true" />
							<p className="font-semibold" style={{ color: "var(--color-error)" }}>{errors.general}</p>
						</div>
					)}
				</div>

				<form onSubmit={handleSubmit}>
					{/* Profile Section */}
					{activeSection === "profile" && (
						<div className="space-y-6">
							{/* Basic Information */}
							<div
								className="rounded-2xl p-6"
								style={{
									backgroundColor: "var(--color-card)",
									boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
								}}
							>
								<h2
									className="text-xl font-bold mb-6"
									style={{ color: "var(--color-slate-700)" }}
								>
									Basic Information
								</h2>

								<div className="grid md:grid-cols-2 gap-6">
									{/* Full Name */}
									<div>
										<label
											htmlFor="fullname-input"
											className="block text-sm font-medium mb-2"
											style={{ color: "var(--color-slate-700)" }}
										>
											Full Name <span style={{ color: "#EF4444" }}>*</span>
										</label>
										<input
											id="fullname-input"
											type="text"
											value={profile.full_name}
											onChange={(e) =>
												setProfile({ ...profile, full_name: e.target.value })
											}
											aria-required="true"
											aria-invalid={!!errors.full_name}
											aria-describedby={errors.full_name ? "fullname-error" : undefined}
											className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
											style={{
												borderColor: errors.full_name ? "#EF4444" : "#E5E5E5",
												backgroundColor: "#FAF9F6",
												focusRingColor: "#5B9378",
											}}
											placeholder="Enter your full name"
										/>
										{errors.full_name && (
											<p id="fullname-error" role="alert" className="text-sm mt-1" style={{ color: "#EF4444" }}>
												{errors.full_name}
											</p>
										)}
									</div>

									{/* Email */}
									<div>
										<label
											htmlFor="email-input"
											className="block text-sm font-medium mb-2"
											style={{ color: "var(--color-slate-700)" }}
										>
											Email
										</label>
										<div className="relative">
											<Mail
												className="absolute left-4 top-3.5 w-5 h-5"
												style={{ color: "var(--color-slate-500)" }}
												aria-hidden="true"
											/>
											<input
												id="email-input"
												type="email"
												value={profile.email || ""}
												disabled
												aria-describedby="email-help"
												className="w-full pl-12 pr-4 py-3 rounded-xl border"
												style={{
													borderColor: "#E5E5E5",
													backgroundColor: "#F5F5F5",
													color: "var(--color-slate-500)",
												}}
											/>
										</div>
										<p id="email-help" className="sr-only">Email cannot be changed. Contact support if needed.</p>
									</div>

									{/* Years of Experience */}
									<div>
										<label
											htmlFor="years-experience-input"
											className="block text-sm font-medium mb-2"
											style={{ color: "var(--color-slate-700)" }}
										>
											Years of Experience
										</label>
										<input
											id="years-experience-input"
											type="number"
											min="0"
											max="50"
											value={profile.years_experience || 0}
											onChange={(e) =>
												setProfile({
													...profile,
													years_experience: parseInt(e.target.value) || 0,
												})
											}
											aria-label="Years of Experience (0 to 50)"
											className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
											style={{
												borderColor: "#E5E5E5",
												backgroundColor: "#FAF9F6",
											}}
										/>
									</div>
								</div>
							</div>

							{/* Profile Photo */}
							<div
								className="rounded-2xl p-6"
								style={{
									backgroundColor: "var(--color-card)",
									boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
								}}
							>
								<h2
									className="text-xl font-bold mb-6"
									style={{ color: "var(--color-slate-700)" }}
								>
									Profile Photo
								</h2>

								<div className="flex items-center gap-6">
									<div className="relative">
										{profile.profile_photo_url ? (
											<img
												src={profile.profile_photo_url}
												alt={`Profile photo of ${profile.full_name || 'user'}`}
												className="w-32 h-32 rounded-2xl object-cover"
												style={{ border: "3px solid rgba(107, 139, 96, 0.2)" }}
											/>
										) : (
											<div
												className="w-32 h-32 rounded-2xl flex items-center justify-center"
												style={{
													backgroundColor: "rgba(107, 139, 96, 0.1)",
													border: "2px dashed rgba(107, 139, 96, 0.3)",
												}}
											>
												<Camera
													className="w-10 h-10"
													style={{ color: "var(--color-green-600)" }}
												/>
											</div>
										)}
									</div>

									<div className="flex-1">
										<p className="text-sm mb-3" style={{ color: "var(--color-slate-600)" }}>
											Upload a professional photo for your profile
										</p>
										<div className="flex gap-3">
											<input
												ref={fileInputRef}
												type="file"
												accept="image/*"
												onChange={handlePhotoUpload}
												className="hidden"
											/>
											<button
												type="button"
												onClick={() => fileInputRef.current?.click()}
												aria-label="Upload profile photo"
												className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-clean hover:shadow-clean-md hover:-translate-y-0.5"
												style={{
													background:
														"linear-gradient(135deg, var(--color-green-600), var(--color-green-500))",
													color: "white",
												}}
											>
												<Upload className="w-4 h-4" />
												Upload Photo
											</button>
											{profile.profile_photo_url && (
												<button
													type="button"
													onClick={() =>
														setProfile({ ...profile, profile_photo_url: "" })
													}
													aria-label="Remove profile photo"
													className="px-4 py-2 rounded-xl font-semibold border-2 transition-all shadow-clean hover:shadow-clean-md hover:-translate-y-0.5"
													style={{
														borderColor: "var(--color-slate-300)",
														color: "var(--color-slate-600)",
														backgroundColor: "var(--color-card)"
													}}
												>
													Remove
												</button>
											)}
										</div>
										{errors.profile_photo && (
											<p className="text-sm mt-2 font-semibold" style={{ color: "var(--color-error)" }}>
												{errors.profile_photo}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Professional Details */}
							<div
								className="rounded-2xl p-6"
								style={{
									backgroundColor: "var(--color-card)",
									boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
								}}
							>
								<h2
									className="text-xl font-bold mb-6"
									style={{ color: "var(--color-slate-700)" }}
								>
									Professional Details
								</h2>

								{/* Credentials */}
								<div className="mb-6">
									<label
										className="block text-sm font-medium mb-3"
										style={{ color: "var(--color-slate-700)" }}
									>
										Credentials & Certifications
									</label>

									{profile.credentials && profile.credentials.length > 0 && (
										<div className="flex flex-wrap gap-2 mb-3">
											{profile.credentials.map((cred, index) => {
												// Extract just the acronym for display if it has a description
												const displayName = cred.includes("(")
													? cred.split(" (")[0]
													: cred;
												return (
													<div
														key={index}
														className="flex items-center gap-2 px-3 py-2 rounded-lg"
														style={{
															backgroundColor: "rgba(107, 139, 96, 0.1)",
														}}
														title={cred} // Show full name on hover
													>
														<Award
															className="w-4 h-4"
															style={{ color: "var(--color-green-600)" }}
														/>
														<span style={{ color: "var(--color-slate-700)" }}>
															{displayName}
														</span>
														<button
															type="button"
															onClick={() => handleRemoveCredential(index)}
															style={{
																background: "none",
																border: "none",
																cursor: "pointer",
																padding: 0,
																display: "flex",
																alignItems: "center",
																justifyContent: "center",
															}}
															onMouseEnter={(e) => {
																e.currentTarget.style.opacity = "0.7";
															}}
															onMouseLeave={(e) => {
																e.currentTarget.style.opacity = "1";
															}}
															aria-label={`Remove ${displayName}`}
														>
															<X
																className="w-4 h-4"
																style={{
																	color: "var(--color-green-600) !important",
																	stroke: "var(--color-green-600) !important",
																}}
															/>
														</button>
													</div>
												);
											})}
										</div>
									)}

									<div className="relative">
										<div className="flex gap-2">
											<div className="relative flex-1">
												<select
													value=""
													onChange={(e) => {
														if (e.target.value) {
															handleAddCredential(e.target.value);
															e.target.value = "";
														}
													}}
													className="w-full px-4 py-2 pr-8 rounded-lg border appearance-none cursor-pointer"
													style={{
														borderColor: "#E5E5E5",
														backgroundColor: "#FAF9F6",
													}}
												>
													<option value="" disabled>
														Select a credential...
													</option>

													<optgroup label="ASL Certifications">
														{COMMON_CREDENTIALS.filter(
															(c) =>
																c.includes("RID") ||
																c.includes("BEI") ||
																c.includes("EIPA"),
														)
															.filter((c) => !profile.credentials?.includes(c))
															.map((cred) => {
																const displayName = cred.includes("(")
																	? cred.split(" (")[0]
																	: cred;
																return (
																	<option key={cred} value={cred}>
																		{displayName}
																	</option>
																);
															})}
													</optgroup>

													<optgroup label="Spoken Language Certifications">
														{COMMON_CREDENTIALS.filter(
															(c) =>
																(c.includes("CHI") ||
																	c.includes("CMI") ||
																	c.includes("CCHI") ||
																	c.includes("NAATI") ||
																	c.includes("AIIC") ||
																	c.includes("ATA")) &&
																!profile.credentials?.includes(c),
														).map((cred) => {
															const displayName = cred.includes("(")
																? cred.split(" (")[0]
																: cred;
															return (
																<option key={cred} value={cred}>
																	{displayName}
																</option>
															);
														})}
													</optgroup>

													<optgroup label="Specialized Certifications">
														{COMMON_CREDENTIALS.filter(
															(c) =>
																(c.includes("Legal") ||
																	c.includes("Medical") ||
																	c.includes("Conference") ||
																	c.includes("Educational") ||
																	c.includes("Mental Health") ||
																	c.includes("VRI") ||
																	c.includes("Trilingual")) &&
																!profile.credentials?.includes(c),
														).map((cred) => (
															<option key={cred} value={cred}>
																{cred}
															</option>
														))}
													</optgroup>

													<optgroup label="State-Specific Certifications">
														{COMMON_CREDENTIALS.filter(
															(c) =>
																(c.includes("California") ||
																	c.includes("New York") ||
																	c.includes("Texas") ||
																	c.includes("Florida")) &&
																!profile.credentials?.includes(c),
														).map((cred) => (
															<option key={cred} value={cred}>
																{cred}
															</option>
														))}
													</optgroup>
												</select>

												{/* Dropdown arrow icon */}
												<ChevronDown
													className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
													size={20}
													style={{ color: "var(--color-slate-600)" }}
												/>
											</div>

											{/* Optional: Allow custom input */}
											<div className="flex gap-2">
												<input
													type="text"
													value={credentialInput}
													onChange={(e) => setCredentialInput(e.target.value)}
													onKeyPress={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															if (credentialInput.trim()) {
																handleAddCredential(credentialInput);
															}
														}
													}}
													className="px-4 py-2 rounded-lg border"
													style={{
														borderColor: "#E5E5E5",
														backgroundColor: "#FAF9F6",
														minWidth: "200px",
													}}
													placeholder="Or enter custom..."
												/>
												<button
													type="button"
													onClick={() => {
														if (credentialInput.trim()) {
															handleAddCredential(credentialInput);
														}
													}}
													aria-label="Add credential"
													className="px-4 py-2 rounded-lg font-medium"
													style={{
														background:
															"linear-gradient(135deg, var(--color-green-600), var(--color-green-500))",
														color: "#FFFFFF",
													}}
												>
													Add
												</button>
											</div>
										</div>

										{errors.credentials && (
											<p className="text-sm mt-2" style={{ color: "#EF4444" }}>
												{errors.credentials}
											</p>
										)}
									</div>
								</div>

								{/* Specializations */}
								<div>
									<label
										className="block text-sm font-medium mb-3"
										style={{ color: "var(--color-slate-700)" }}
									>
										Areas of Specialization
									</label>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
										{SPECIALIZATIONS.map((spec) => (
											<label
												key={spec}
												className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all"
												onClick={() => toggleSpecialization(spec)}
												style={{
													backgroundColor: profile.specializations?.includes(
														spec,
													)
														? "rgba(107, 139, 96, 0.1)"
														: "#FAF9F6",
													border: `1px solid ${
														profile.specializations?.includes(spec)
															? "rgba(107, 139, 96, 0.3)"
															: "transparent"
													}`,
												}}
											>
												<div
													className="w-5 h-5 rounded flex items-center justify-center"
													style={{
														background: profile.specializations?.includes(spec)
															? "linear-gradient(135deg, var(--color-green-600), var(--color-green-500))"
															: "#FFFFFF",
														border: "2px solid var(--color-green-600)",
													}}
												>
													{profile.specializations?.includes(spec) && (
														<Check
															className="w-3 h-3"
															style={{ color: "#FFFFFF" }}
														/>
													)}
												</div>
												<span style={{ color: "var(--color-slate-700)" }}>{spec}</span>
											</label>
										))}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Accessibility Section */}
					{activeSection === "accessibility" && (
						<div className="space-y-6">
							<div
								className="rounded-2xl p-6"
								style={{
									backgroundColor: "var(--color-card)",
									boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
								}}
							>
								<h2
									className="text-lg font-bold mb-4"
									style={{ color: "var(--color-slate-700)" }}
								>
									Accessibility Settings
								</h2>

								<div className="space-y-3">
									{[
										{
											id: "larger_text",
											label: "Larger Text",
											description: "Increase text size for better readability",
											icon: Eye,
											enabled: profile.accessibility_settings.larger_text,
										},
										{
											id: "high_contrast",
											label: "High Contrast Mode",
											description: "Enhance color contrast for visual clarity",
											icon: Palette,
											enabled: profile.accessibility_settings.high_contrast,
										},
										{
											id: "reduce_motion",
											label: "Reduce Motion",
											description: "Minimize animations and transitions",
											icon: Zap,
											enabled: profile.accessibility_settings.reduce_motion,
										},
										{
											id: "screen_reader",
											label: "Screen Reader Support",
											description: "Optimize for screen reader compatibility",
											icon: Languages,
											enabled: profile.accessibility_settings.screen_reader,
										},
									].map((setting) => (
										<div
											key={setting.id}
											className="p-4 rounded-xl transition-all hover:shadow-clean"
											style={{
												backgroundColor: "var(--color-surface)",
												border: "1px solid var(--color-slate-200)"
											}}
										>
											<label
												htmlFor={`accessibility-${setting.id}`}
												className="flex items-start gap-3 cursor-pointer"
											>
												<input
													type="checkbox"
													id={`accessibility-${setting.id}`}
													checked={setting.enabled}
													onChange={() =>
														setProfile({
															...profile,
															accessibility_settings: {
																...profile.accessibility_settings,
																[setting.id]: !setting.enabled,
															},
														})
													}
													style={{
														position: 'absolute',
														width: '1px',
														height: '1px',
														padding: '0',
														margin: '-1px',
														overflow: 'hidden',
														clip: 'rect(0, 0, 0, 0)',
														whiteSpace: 'nowrap',
														border: '0'
													}}
													aria-describedby={`accessibility-${setting.id}-description`}
												/>
												<div className="relative mt-0.5" style={{ flexShrink: 0 }}>
													<div
														className="rounded-lg transition-all duration-200"
														style={{
															width: "20px",
															height: "20px",
															backgroundColor: setting.enabled
																? "var(--color-green-600)"
																: "var(--color-card)",
															border: setting.enabled
																? "2px solid var(--color-green-600)"
																: "2px solid var(--color-slate-300)",
														}}
														aria-hidden="true"
													>
														{setting.enabled && (
															<svg
																className="absolute inset-0 w-full h-full"
																viewBox="0 0 20 20"
																fill="none"
																style={{ padding: "2px" }}
															>
																<path
																	d="M5 10l3 3 7-7"
																	stroke="white"
																	strokeWidth="3"
																	strokeLinecap="round"
																	strokeLinejoin="round"
																/>
															</svg>
														)}
													</div>
												</div>
												<div>
													<h3
														className="text-sm font-medium"
														style={{ color: "var(--color-slate-700)" }}
													>
														{setting.label}
													</h3>
													<p
														id={`accessibility-${setting.id}-description`}
														className="text-xs mt-0.5"
														style={{ color: "var(--color-slate-600)" }}
													>
														{setting.description}
													</p>
												</div>
											</label>
										</div>
									))}
								</div>
							</div>

							{/* Privacy & Data Notice */}
							<div
								className="rounded-xl p-4"
								style={{
									backgroundColor: "rgba(59, 130, 246, 0.05)",
									border: "1px solid rgba(59, 130, 246, 0.2)",
								}}
							>
								<div>
									<p className="text-sm" style={{ color: "var(--color-slate-700)" }}>
										Your data is encrypted and never shared without consent.
										Visit{" "}
										<button
											type="button"
											onClick={() => setActiveSection("privacy")}
											aria-label="Go to Privacy and Data settings"
											className="underline"
											style={{
												color: "#3B82F6",
												background: "none",
												border: "none",
												padding: 0,
												font: "inherit",
												cursor: "pointer",
											}}
										>
											Privacy & Data
										</button>{" "}
										to manage your data preferences.
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Privacy & Data Section */}
					{activeSection === "privacy" && (
						<div className="space-y-6">
							<div
								className="rounded-2xl p-6"
								style={{
									backgroundColor: "var(--color-card)",
									boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
								}}
							>
								<h2
									className="text-xl font-bold mb-6"
									style={{ color: "var(--color-slate-700)" }}
								>
									Privacy & Data Settings
								</h2>

								<div className="space-y-6">
									{/* Data Management */}
									<div>
										<h3
											className="font-semibold mb-4"
											style={{ color: "var(--color-slate-700)" }}
										>
											Data Management
										</h3>
										<div className="space-y-4">
											<div
												className="p-4 rounded-xl border flex items-start justify-between"
												style={{
													backgroundColor: "#FAF9F6",
													borderColor: "rgba(107, 139, 96, 0.2)",
												}}
											>
												<div className="flex items-start gap-3">
													<Download
														className="w-5 h-5 mt-0.5"
														style={{ color: "var(--color-green-600)" }}
													/>
													<div>
														<h4
															className="font-medium"
															style={{ color: "var(--color-slate-700)" }}
														>
															Export Your Data
														</h4>
														<p
															className="text-sm mt-1"
															style={{ color: "var(--color-slate-600)" }}
														>
															Download all your reflections and settings
														</p>
													</div>
												</div>
												<button
													type="button"
													onClick={() => {
														// Create email with user details for data export request
														const userEmail = user?.email || 'Not provided';
														const userId = user?.id || 'Not provided';
														const userName = profile.full_name || 'Not provided';
														const subject = encodeURIComponent('Data Export Request - InterpretReflect');
														const body = encodeURIComponent(
															`Hello Huvia Technologies Team,\n\n` +
															`I would like to request an export of my data from InterpretReflect.\n\n` +
															`My account details:\n` +
															`- Name: ${userName}\n` +
															`- Email: ${userEmail}\n` +
															`- User ID: ${userId}\n` +
															`- Request Date: ${new Date().toLocaleDateString()}\n\n` +
															`Please send my data export to this email address.\n\n` +
															`Thank you`
														);

														// Open email client
														window.location.href = `mailto:info@interpretreflect.com?subject=${subject}&body=${body}`;

														// Show confirmation after a short delay
														setTimeout(() => {
															alert(
																"Your data export request email has been prepared. Please send it to begin the export process. You will receive your data within 48 hours."
															);
														}, 500);
													}}
													aria-label="Export your data"
													className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
													style={{
														background:
															"linear-gradient(135deg, var(--color-green-600), var(--color-green-500))",
														color: "#FFFFFF",
													}}
												>
													Export
												</button>
											</div>

											<div
												className="p-4 rounded-xl border flex items-start justify-between"
												style={{
													backgroundColor: "rgba(107, 139, 96, 0.05)",
													borderColor: "rgba(107, 139, 96, 0.2)",
												}}
											>
												<div className="flex items-start gap-3">
													<Shield
														className="w-5 h-5 mt-0.5"
														style={{ color: "var(--color-green-600)" }}
													/>
													<div>
														<h4
															className="font-medium"
															style={{ color: "var(--color-slate-700)" }}
														>
															Manage Subscription
														</h4>
														<p
															className="text-sm mt-1"
															style={{ color: "var(--color-slate-600)" }}
														>
															Cancel, update payment, or view billing history
														</p>
													</div>
												</div>
												<button
													type="button"
													onClick={handleManageSubscription}
													aria-label="Manage your subscription"
													className="px-4 py-2 rounded-xl font-semibold transition-all shadow-clean hover:shadow-clean-md hover:-translate-y-0.5"
													style={{
														background: "linear-gradient(135deg, var(--color-green-600), var(--color-green-500))",
														color: "white",
														border: "none",
													}}
												>
													Manage
												</button>
											</div>
										</div>
									</div>

									{/* Privacy Settings */}
									<div>
										<h3
											className="font-semibold mb-4"
											style={{ color: "var(--color-slate-700)" }}
										>
											Privacy Preferences
										</h3>
										<div className="space-y-3">
											{[
												{
													id: "analytics" as keyof typeof privacySettings,
													label: "Usage Analytics",
													description: "Help improve InterpretReflect",
												},
												{
													id: "notifications" as keyof typeof privacySettings,
													label: "Email Notifications",
													description: "Receive wellness reminders",
												},
												{
													id: "team_visibility" as keyof typeof privacySettings,
													label: "Team Visibility",
													description: "Share wellness status with team (Coming Soon)",
													disabled: true,
												},
											].map((setting) => {
												const isEnabled = privacySettings[setting.id];
												return (
													<div
														key={setting.id}
														className="p-4 rounded-xl"
														style={{ backgroundColor: "#FAF9F6" }}
													>
														<label
															className={`${setting.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} focus:outline-none flex items-center gap-3`}
															style={{ outline: "none" }}
															onClick={async () => {
																if (!setting.disabled) {
																	const newValue = !privacySettings[setting.id];
																	setPrivacySettings((prev) => ({
																		...prev,
																		[setting.id]: newValue,
																	}));

																	// Handle analytics opt-out
																	if (setting.id === 'analytics') {
																		await analyticsService.updateConsent(newValue);
																		announceToScreenReader(
																			newValue
																				? 'Analytics enabled. Thank you for helping us improve!'
																				: 'Analytics disabled. Your data will not be collected.'
																		);
																	}

																	// Handle email notifications with Encharge integration
																	if (setting.id === 'notifications' && user?.id) {
																		const success = await emailNotificationService.updateEmailPreferences(user.id, {
																			emailNotifications: newValue,
																			wellnessReminders: newValue // Enable/disable wellness reminders with main toggle
																		});

																		if (success) {
																			announceToScreenReader(
																				newValue
																					? 'Email notifications enabled. You will receive wellness reminders.'
																					: 'Email notifications disabled. You will not receive any emails.'
																			);
																		} else {
																			// Revert the change if it failed
																			setPrivacySettings((prev) => ({
																				...prev,
																				[setting.id]: !newValue,
																			}));
																			announceToScreenReader('Failed to update email preferences. Please try again.');
																		}
																	}
																}
															}}
														>
															<div
																className="rounded transition-all duration-200 focus:outline-none"
																style={{
																	width: "20px",
																	height: "20px",
																	backgroundColor: isEnabled
																		? "#059669"
																		: "#ffffff",
																	border: isEnabled
																		? "2px solid #059669"
																		: "2px solid #d1d5db",
																	outline: "none",
																}}
															>
																{isEnabled && (
																	<svg
																		className="w-full h-full"
																		viewBox="0 0 20 20"
																		fill="none"
																		style={{ padding: "2px" }}
																	>
																		<path
																			d="M5 10l3 3 7-7"
																			stroke="white"
																			strokeWidth="3"
																			strokeLinecap="round"
																			strokeLinejoin="round"
																		/>
																	</svg>
																)}
															</div>
															<div className="flex-1">
																<h4
																	className="font-medium"
																	style={{ color: "var(--color-slate-700)" }}
																>
																	{setting.label}
																</h4>
																<p
																	className="text-sm"
																	style={{ color: "var(--color-slate-600)" }}
																>
																	{setting.description}
																</p>
															</div>
														</label>
													</div>
												);
											})}
										</div>
									</div>

									{/* AI & Privacy Section */}
									<div className="mt-8">
										<h3
											className="font-semibold mb-4 flex items-center gap-2"
											style={{ color: "var(--color-slate-700)" }}
										>
											<Bot className="w-5 h-5" style={{ color: "var(--color-green-600)" }} />
											AI & Privacy - How We Use AI
										</h3>

										<div
											className="rounded-xl p-6"
											style={{
												backgroundColor: "#FAF9F6",
												border: "1px solid rgba(107, 139, 96, 0.2)"
											}}
										>
											{/* What AI Does */}
											<div className="mb-6">
												<h4
													className="font-medium mb-3 flex items-center gap-2"
													style={{ color: "var(--color-slate-700)" }}
												>
													<Check className="w-4 h-4" style={{ color: "#059669" }} />
													What AI Does
												</h4>
												<ul className="space-y-2 ml-6">
													<li className="flex items-start gap-2">
														<span className="text-sm" style={{ color: "var(--color-slate-600)" }}>
															• Provides personalized reflection prompts based on your recent entries
														</span>
													</li>
													<li className="flex items-start gap-2">
														<span className="text-sm" style={{ color: "var(--color-slate-600)" }}>
															• Summarizes entries for your eyes only
														</span>
													</li>
													<li className="flex items-start gap-2">
														<span className="text-sm" style={{ color: "var(--color-slate-600)" }}>
															• Surfaces trends across your own reflections
														</span>
													</li>
												</ul>
											</div>

											{/* What AI Does Not Do */}
											<div className="mb-6">
												<h4
													className="font-medium mb-3 flex items-center gap-2"
													style={{ color: "var(--color-slate-700)" }}
												>
													<X className="w-4 h-4" style={{ color: "#EF4444" }} />
													What AI Does Not Do
												</h4>
												<ul className="space-y-2 ml-6">
													<li className="text-sm" style={{ color: "var(--color-slate-600)" }}>
														• Does not diagnose or provide medical or mental health treatment
													</li>
													<li className="text-sm" style={{ color: "var(--color-slate-600)" }}>
														• Does not share your private content with employers or marketers
													</li>
													<li className="text-sm" style={{ color: "var(--color-slate-600)" }}>
														• Does not use your personal reflections to train foundation models
													</li>
												</ul>
											</div>

											{/* Your Controls */}
											<div className="mb-6">
												<h4
													className="font-medium mb-3 flex items-center gap-2"
													style={{ color: "var(--color-slate-700)" }}
												>
													<Shield className="w-4 h-4" style={{ color: "var(--color-green-600)" }} />
													Your Controls
												</h4>
												<ul className="space-y-2 ml-6">
													<li className="text-sm" style={{ color: "var(--color-slate-600)" }}>
														• AI features are currently used in Elya, our wellness companion
													</li>
													<li className="text-sm" style={{ color: "var(--color-slate-600)" }}>
														• AI insights help personalize your wellness journey
													</li>
													<li className="text-sm" style={{ color: "var(--color-slate-600)" }}>
														• All your reflections and data remain private to you
													</li>
												</ul>
											</div>

											{/* Data Handling */}
											<div className="mb-6">
												<h4
													className="font-medium mb-3 flex items-center gap-2"
													style={{ color: "var(--color-slate-700)" }}
												>
													<Lock className="w-4 h-4" style={{ color: "var(--color-green-600)" }} />
													Data Handling at a Glance
												</h4>
												<div className="grid md:grid-cols-2 gap-3">
													<div
														className="p-3 rounded-lg"
														style={{ backgroundColor: "var(--color-card)" }}
													>
														<p className="text-sm">
															<span className="font-medium" style={{ color: "var(--color-slate-700)" }}>Encryption:</span>
															<span style={{ color: "var(--color-slate-600)" }}> Industry-standard TLS in transit; encrypted at rest</span>
														</p>
													</div>
													<div
														className="p-3 rounded-lg"
														style={{ backgroundColor: "var(--color-card)" }}
													>
														<p className="text-sm">
															<span className="font-medium" style={{ color: "var(--color-slate-700)" }}>Access:</span>
															<span style={{ color: "var(--color-slate-600)" }}> Secure authentication with role-based permissions</span>
														</p>
													</div>
													<div
														className="p-3 rounded-lg"
														style={{ backgroundColor: "var(--color-card)" }}
													>
														<p className="text-sm">
															<span className="font-medium" style={{ color: "var(--color-slate-700)" }}>Analytics:</span>
															<span style={{ color: "var(--color-slate-600)" }}> Zero-knowledge analytics - only numerical metrics, no personal content</span>
														</p>
													</div>
													<div
														className="p-3 rounded-lg"
														style={{ backgroundColor: "var(--color-card)" }}
													>
														<p className="text-sm">
															<span className="font-medium" style={{ color: "var(--color-slate-700)" }}>Data Rights:</span>
															<span style={{ color: "var(--color-slate-600)" }}> Contact info@interpretreflect.com for export/deletion</span>
														</p>
													</div>
												</div>
											</div>

										</div>
									</div>
								</div>
							</div>

							{/* Security Notice */}
							<div
								className="rounded-xl p-4 flex items-start gap-3"
								style={{
									backgroundColor: "rgba(59, 130, 246, 0.05)",
									border: "1px solid rgba(59, 130, 246, 0.2)",
								}}
							>
								<Lock
									className="w-5 h-5 mt-0.5 flex-shrink-0"
									style={{ color: "#3B82F6" }}
								/>
								<div>
									<p className="text-sm" style={{ color: "var(--color-slate-700)" }}>
										Your data is protected with encryption and stored securely.
										We never sell or share your personal information without explicit consent.
										All wellness data remains private and under your control.
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Form Actions - Outside all tab conditionals */}
					<div className="flex gap-3 mt-8 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
					<button
						type="submit"
						disabled={saving || !hasUnsavedChanges()}
						aria-label="Save profile changes"
						className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-clean-md hover:shadow-clean-lg hover:-translate-y-0.5"
						style={{
							background:
								saving || !hasUnsavedChanges()
									? "var(--color-slate-200)"
									: "linear-gradient(135deg, var(--color-green-600), var(--color-green-500))",
							color: saving || !hasUnsavedChanges() ? "var(--color-slate-500)" : "white",
							cursor:
								saving || !hasUnsavedChanges() ? "not-allowed" : "pointer",
							minHeight: "48px",
						}}
					>
						{saving ? (
							<>
								<RefreshCw className="w-5 h-5 animate-spin" />
								Saving...
							</>
						) : (
							"Save Changes"
						)}
					</button>

					<button
						type="button"
						onClick={handleCancel}
						disabled={!hasUnsavedChanges()}
						aria-label="Cancel changes"
						className="px-6 py-3 rounded-xl font-semibold border-2 transition-all shadow-clean hover:shadow-clean-md hover:-translate-y-0.5"
						style={{
							borderColor: !hasUnsavedChanges() ? "var(--color-slate-300)" : "var(--color-green-600)",
							color: !hasUnsavedChanges() ? "var(--color-slate-500)" : "var(--color-green-600)",
							backgroundColor: !hasUnsavedChanges() ? "var(--color-slate-100)" : "var(--color-card)",
							cursor: !hasUnsavedChanges() ? "not-allowed" : "pointer",
							minHeight: "48px",
						}}
					>
						Cancel
					</button>
				</div>
				</form>
			</div>

			{/* CSS for accessibility settings */}
			<style jsx global>{`
        .larger-text {
          font-size: 1.125rem;
        }

        .larger-text h1 {
          font-size: 2.5rem;
        }

        .larger-text h2 {
          font-size: 2rem;
        }

        .high-contrast {
          filter: contrast(1.2);
        }

        .high-contrast input,
        .high-contrast button {
          border-width: 2px;
        }

        .reduce-motion * {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }

        /* Enhanced focus styles for accessibility */
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        select:focus-visible,
        a:focus-visible {
          outline: 3px solid #5B9378;
          outline-offset: 2px;
        }

        /* Skip to main content link */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 0;
          background: #5B9378;
          color: white;
          padding: 8px;
          text-decoration: none;
          z-index: 100;
        }

        .skip-link:focus {
          top: 0;
        }
      `}</style>
		</div>
	);
};

export default ProfileSettings;
