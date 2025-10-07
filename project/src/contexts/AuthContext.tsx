import type { AuthError, User } from "@supabase/supabase-js";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { SECURITY_CONFIG } from "../config/security";
import { supabase } from "../lib/supabase";
import { dataSyncService } from "../services/dataSync";
import { enchargeService } from "../services/enchargeService";
import { UserDataLoader } from "../services/userDataLoader";
import { termsService } from "../services/termsService";
import {
	AuditLogger,
	enforceHttps,
	RoleManager,
	SessionManager,
} from "../utils/security";

interface AuthResult {
	user?: User | null;
	error?: AuthError | null;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	userRole: string;
	needsTermsAcceptance: boolean;
	signIn: (email: string, password: string) => Promise<AuthResult>;
	signUp: (email: string, password: string) => Promise<AuthResult>;
	signOut: () => Promise<void>;
	signInWithGoogle: () => Promise<AuthResult>;
	signInWithApple: () => Promise<AuthResult>;
	signInWithMagicLink: (email: string) => Promise<AuthResult>;
	hasPermission: (permission: string) => boolean;
	extendSession: () => void;
	checkTermsAcceptance: () => Promise<void>;
	handleTermsAccepted: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [userRole, setUserRole] = useState<string>(
		SECURITY_CONFIG.rbac.defaultRole,
	);
	const [needsTermsAcceptance, setNeedsTermsAcceptance] = useState(false);
	const sessionManager = SessionManager.getInstance();

	// Enforce HTTPS on mount
	useEffect(() => {
		enforceHttps();
	}, []);

	useEffect(() => {
		// Skip auth initialization entirely for password reset page
		if (window.location.pathname === '/reset-password') {
			console.log("AuthContext: Skipping auth for password reset page");
			setLoading(false);
			return;
		}

		// Check active sessions and sets the user
		const initializeAuth = async () => {
			console.log("AuthContext: Initializing auth...");
			try {
				// Skip Supabase check if credentials are missing or in dev mode
				const isDevMode =
					!import.meta.env.VITE_SUPABASE_URL ||
					!import.meta.env.VITE_SUPABASE_ANON_KEY;
				console.log("AuthContext: Dev mode check:", isDevMode);
				console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
				console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "Set" : "Not set");

				if (isDevMode) {
					// Silently skip auth in dev mode
					console.log("AuthContext: Running in dev mode, skipping auth");
					console.log("AuthContext: Setting loading to false");
				setLoading(false);
					return;
				}

				// Just get current session - don't manually refresh
				// Supabase client will auto-refresh when needed
				const {
					data: { session },
					error: sessionError,
				} = await supabase.auth.getSession();

				if (sessionError) {
					// Only log if it's not an expected error
					if (sessionError.name !== "AuthSessionMissingError") {
						console.error("Error getting session:", sessionError);
					}
					console.log("AuthContext: Setting loading to false");
				setLoading(false);
					return;
				}

				// Only try to get user if we have a session
				if (session?.user) {
					// SECURITY FIX: Check subscription status before allowing access
					const { data: subscriptions } = await supabase
						.from('subscriptions')
						.select('status')
						.eq('user_id', session.user.id)
						.eq('status', 'active')
						.limit(1);

					// If user has NO active subscription, sign them out immediately
					if (!subscriptions || subscriptions.length === 0) {
						console.warn('User has no active subscription - signing out');
						await supabase.auth.signOut();
						setUser(null);
						setUserRole(SECURITY_CONFIG.rbac.defaultRole);
						setNeedsTermsAcceptance(false);
						setLoading(false);
						return;
					}

					setUser(session.user);
					// Start session manager
					sessionManager.startSession();
					// Set user role (in production, fetch from database)
					const role = session.user.email?.includes("admin") ? "admin" : "user";
					RoleManager.setUserRole(session.user.id, role);
					setUserRole(role);

					// Check if user needs to accept terms
					const termsStatus = await termsService.checkTermsStatus(session.user.id);
					setNeedsTermsAcceptance(termsStatus.needsAcceptance);

					// Load user data from Supabase on initial load
					await UserDataLoader.loadUserData(session.user.id);

					// Trigger initial sync
					dataSyncService.triggerManualSync();
				} else {
					// No session, no user - this is normal for logged out state
					setUser(null);
					setUserRole(SECURITY_CONFIG.rbac.defaultRole);
					setNeedsTermsAcceptance(false);
				}
			} catch (error) {
				// Unexpected error
				console.error("Unexpected error during auth initialization:", error);
			} finally {
				console.log("AuthContext: Setting loading to false");
				setLoading(false);
			}
		};

		initializeAuth();

		// Only set up auth listener if Supabase is configured AND not on password reset page
		const isDevMode =
			!import.meta.env.VITE_SUPABASE_URL ||
			!import.meta.env.VITE_SUPABASE_ANON_KEY;
		const isPasswordResetPage = window.location.pathname === '/reset-password';

		if (!isDevMode && !isPasswordResetPage) {
			// Listen for changes on auth state (sign in, sign out, etc.)
			const { data: authListener } = supabase.auth.onAuthStateChange(
				async (event, session) => {
					// Skip auth state changes on password reset page
					if (window.location.pathname === '/reset-password') {
						console.log("Skipping auth state change on password reset page");
						return;
					}

					console.log("Auth state changed:", event, session?.user?.email);

					// Handle token refresh events
					if (event === "TOKEN_REFRESHED" && session) {
						console.log("Token refreshed successfully");
						setUser(session.user);
						return;
					}

					setUser(session?.user ?? null);
					console.log("AuthContext: Setting loading to false");
				setLoading(false);

					if (event === "SIGNED_IN" && session?.user) {
						// SECURITY FIX: Check subscription status before allowing access
						const { data: subscriptions } = await supabase
							.from('subscriptions')
							.select('status')
							.eq('user_id', session.user.id)
							.eq('status', 'active')
							.limit(1);

						// If user has NO active subscription, sign them out immediately
						if (!subscriptions || subscriptions.length === 0) {
							console.warn('User has no active subscription - signing out');
							await supabase.auth.signOut();
							setUser(null);
							setUserRole(SECURITY_CONFIG.rbac.defaultRole);
							setNeedsTermsAcceptance(false);
							return;
						}

						sessionManager.startSession();
						const role = session.user.email?.includes("admin")
							? "admin"
							: "user";
						RoleManager.setUserRole(session.user.id, role);
						setUserRole(role);

						// Check if user needs to accept terms
						const termsStatus = await termsService.checkTermsStatus(session.user.id);
						setNeedsTermsAcceptance(termsStatus.needsAcceptance);

						// Load user data from Supabase first
						await UserDataLoader.loadUserData(session.user.id);

						// Then trigger data sync to ensure everything is up to date
						dataSyncService.triggerManualSync().then(() => {
							console.log("Initial data sync completed after sign in");
						});
					} else if (event === "SIGNED_OUT") {
						sessionManager.endSession("LOGOUT");
						setUserRole(SECURITY_CONFIG.rbac.defaultRole);
						setNeedsTermsAcceptance(false);
					} else if (event === "USER_UPDATED" && session?.user) {
						// Handle user updates
						setUser(session.user);
					}
				},
			);

			return () => {
				authListener.subscription.unsubscribe();
			};
		}

		// SECURITY FIX: Set up real-time subscription monitoring
		// Monitor for subscription status changes and sign out users if their subscription is canceled
		let subscriptionChannel: any;
		if (!isDevMode && !isPasswordResetPage) {
			subscriptionChannel = supabase
				.channel('subscription-status-monitor')
				.on(
					'postgres_changes',
					{
						event: 'UPDATE',
						schema: 'public',
						table: 'subscriptions',
					},
					async (payload: any) => {
						// Check if this update affects the current user
						const { data: { user: currentUser } } = await supabase.auth.getUser();

						if (currentUser && payload.new.user_id === currentUser.id) {
							console.log('Subscription status changed for current user:', payload.new.status);

							// If subscription is no longer active, sign user out immediately
							if (payload.new.status !== 'active') {
								console.warn('Subscription became inactive - signing out user immediately');
								await supabase.auth.signOut();
								window.location.href = '/signup?reason=subscription_expired';
							}
						}
					}
				)
				.subscribe();
		}

		return () => {
			if (subscriptionChannel) {
				subscriptionChannel.unsubscribe();
			}
		};
	}, []);

	const signIn = async (
		email: string,
		password: string,
	): Promise<AuthResult> => {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				// Log failed sign in attempt
				AuditLogger.log({
					action: "SIGN_IN_FAILED",
					category: "AUTH",
					severity: "WARN",
					details: { email, error: error.message },
				});
				throw error;
			}

			// Log successful sign in
			if (data.user) {
				AuditLogger.log({
					action: "SIGN_IN_SUCCESS",
					category: "AUTH",
					severity: "INFO",
					userId: data.user.id,
					userEmail: data.user.email || undefined,
				});

				// Start session management
				sessionManager.startSession();

				// Set user role
				const role = data.user.email?.includes("admin") ? "admin" : "user";
				RoleManager.setUserRole(data.user.id, role);
				setUserRole(role);

				// Check if user needs to accept terms
				const termsStatus = await termsService.checkTermsStatus(data.user.id);
				setNeedsTermsAcceptance(termsStatus.needsAcceptance);

				// Load user data from Supabase first
				await UserDataLoader.loadUserData(data.user.id);

				// Then trigger data sync to ensure everything is up to date
				dataSyncService.triggerManualSync().then(() => {
					console.log("Initial data sync completed after sign in");
				});

				// Track login in Encharge
				if (data.user.email) {
					enchargeService.trackUserLogin(data.user.email).catch(error => {
						console.error("Failed to track login in Encharge:", error);
					});
				}
			}

			return { user: data.user, error: null };
		} catch (error) {
			return { user: null, error: error as AuthError };
		}
	};

	const signUp = async (
		email: string,
		password: string,
	): Promise<AuthResult> => {
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) {
				// Log failed sign up attempt
				AuditLogger.log({
					action: "SIGN_UP_FAILED",
					category: "AUTH",
					severity: "WARN",
					details: { email, error: error.message },
				});
				throw error;
			}

			// Log successful sign up
			if (data.user) {
				AuditLogger.log({
					action: "SIGN_UP_SUCCESS",
					category: "AUTH",
					severity: "INFO",
					userId: data.user.id,
					userEmail: data.user.email || undefined,
				});

				// Set default user role
				RoleManager.setUserRole(data.user.id, "user");
				setUserRole("user");

				// Check if user needs to accept terms
				const termsStatus = await termsService.checkTermsStatus(data.user.id);
				setNeedsTermsAcceptance(termsStatus.needsAcceptance);

				// Track signup in Encharge
				if (data.user.email) {
					enchargeService.handleUserSignup(
						data.user.email,
						data.user.id,
						undefined,
						"free"
					).catch(error => {
						console.error("Failed to track signup in Encharge:", error);
					});
				}
			}

			return { user: data.user, error: null };
		} catch (error) {
			return { user: null, error: error as AuthError };
		}
	};

	const signOut = async () => {
		try {
			// Log sign out
			if (user) {
				AuditLogger.log({
					action: "SIGN_OUT",
					category: "AUTH",
					severity: "INFO",
					userId: user.id,
					userEmail: user.email || undefined,
				});
			}

			const { error } = await supabase.auth.signOut();
			if (error) throw error;

			// End session
			sessionManager.endSession("LOGOUT");
			setUser(null);
			setUserRole(SECURITY_CONFIG.rbac.defaultRole);
			setNeedsTermsAcceptance(false);

			// Clear all local storage and session storage
			localStorage.clear();
			sessionStorage.clear();

			// Force reload to completely reset the app state
			window.location.href = "/";
		} catch (error) {
			console.error("Sign out error:", error);
			// Even if there's an error, try to clear state and redirect
			localStorage.clear();
			sessionStorage.clear();
			window.location.href = "/";
		}
	};

	const signInWithGoogle = async (): Promise<AuthResult> => {
		try {
			console.log("Starting Google SSO authentication...");
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${window.location.origin}/signup?step=payment&sso=google`,
					queryParams: {
						access_type: "offline",
						prompt: "consent",
					},
				},
			});

			if (error) {
				console.error("Google SSO Error:", error);
				AuditLogger.log({
					action: "GOOGLE_SSO_FAILED",
					category: "AUTH",
					severity: "WARN",
					details: { error: error.message },
				});
				throw error;
			}

			console.log("Google SSO initiated successfully");
			// The actual sign-in happens via redirect, so we return success here
			return { user: null, error: null };
		} catch (error) {
			console.error("Google SSO Exception:", error);
			return { user: null, error: error as AuthError };
		}
	};

	const signInWithApple = async (): Promise<AuthResult> => {
		try {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: "apple",
				options: {
					redirectTo: `${window.location.origin}/dashboard`,
				},
			});

			if (error) {
				AuditLogger.log({
					action: "APPLE_SSO_FAILED",
					category: "AUTH",
					severity: "WARN",
					details: { error: error.message },
				});
				throw error;
			}

			return { user: data.session?.user || null, error: null };
		} catch (error) {
			return { user: null, error: error as AuthError };
		}
	};

	const signInWithMagicLink = async (email: string): Promise<AuthResult> => {
		try {
			const { data, error } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: `${window.location.origin}/dashboard`,
					shouldCreateUser: true,
				},
			});

			if (error) {
				AuditLogger.log({
					action: "MAGIC_LINK_FAILED",
					category: "AUTH",
					severity: "WARN",
					details: { email, error: error.message },
				});
				throw error;
			}

			AuditLogger.log({
				action: "MAGIC_LINK_SENT",
				category: "AUTH",
				severity: "INFO",
				details: { email },
			});

			return { user: null, error: null }; // User will be set after clicking link
		} catch (error) {
			return { user: null, error: error as AuthError };
		}
	};

	const hasPermission = (permission: string): boolean => {
		if (!user) return false;
		return RoleManager.hasPermission(user.id, permission);
	};

	const extendSession = () => {
		sessionManager.extendSession();
	};

	const checkTermsAcceptance = async () => {
		if (!user) return;

		const termsStatus = await termsService.checkTermsStatus(user.id);
		setNeedsTermsAcceptance(termsStatus.needsAcceptance);
	};

	const handleTermsAccepted = async () => {
		// Set needs terms acceptance to false immediately
		setNeedsTermsAcceptance(false);
		// Optionally re-check to confirm
		if (user) {
			const termsStatus = await termsService.checkTermsStatus(user.id);
			setNeedsTermsAcceptance(termsStatus.needsAcceptance);
		}
	};

	// Listen for session timeout events
	useEffect(() => {
		const handleSessionEnd = async (event: CustomEvent) => {
			if (event.detail.reason === "TIMEOUT") {
				// Auto logout on timeout
				await signOut();
			}
		};

		window.addEventListener("sessionEnd", handleSessionEnd as EventListener);
		return () => {
			window.removeEventListener(
				"sessionEnd",
				handleSessionEnd as EventListener,
			);
		};
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				userRole,
				needsTermsAcceptance,
				signIn,
				signUp,
				signOut,
				signInWithGoogle,
				signInWithApple,
				signInWithMagicLink,
				hasPermission,
				extendSession,
				checkTermsAcceptance,
				handleTermsAccepted,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
