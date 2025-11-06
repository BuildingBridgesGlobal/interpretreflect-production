'use client';

import type { AuthError, User } from "@supabase/supabase-js";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { SECURITY_CONFIG } from "../config/security";
import { createClient } from "../lib/supabase/client";
import { setSentryUser, clearSentryUser } from "../lib/sentry";
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
	const router = useRouter();
	const pathname = usePathname();
	const supabase = createClient();

	// Enforce HTTPS on mount
	useEffect(() => {
		enforceHttps();
	}, []);

	useEffect(() => {
		// Skip auth initialization entirely for password reset page
		if (pathname === '/reset-password') {
			console.log("AuthContext: Skipping auth for password reset page");
			setLoading(false);
			return;
		}

		// Check active sessions and sets the user
		const initializeAuth = async () => {
			console.log("AuthContext: Initializing auth...");
			try {
				// Skip Supabase check if credentials are missing
				const isDevMode =
					!process.env.NEXT_PUBLIC_SUPABASE_URL ||
					!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

				if (isDevMode) {
					console.log("AuthContext: Running in dev mode, skipping auth");
					console.log("AuthContext: Setting loading to false");
					setLoading(false);
					return;
				}

				// CRITICAL FIX: Add timeout but don't reject - just log and continue
				let session = null;
				let sessionError = null;

				const timeoutPromise = new Promise<void>((resolve) => {
					setTimeout(() => {
						console.warn("⚠️ getSession() taking >10s - continuing anyway");
						resolve();
					}, 10000); // 10 seconds
				});

				const sessionPromise = supabase.auth.getSession().then(result => {
					session = result.data.session;
					sessionError = result.error;
				});

				await Promise.race([sessionPromise, timeoutPromise]);

				if (sessionError) {
					if (sessionError.name !== "AuthSessionMissingError") {
						console.error("Error getting session:", sessionError);
					}
					console.log("AuthContext: Setting loading to false");
					setLoading(false);
					return;
				}

				if (session?.user) {
					setUser(session.user);
					setSentryUser({ id: session.user.id, email: session.user.email });
					sessionManager.startSession();

					const role = session.user.email?.includes("admin") ? "admin" : "user";
					RoleManager.setUserRole(session.user.id, role);
					setUserRole(role);

					// PERFORMANCE FIX: Defer heavy operations to background
					Promise.all([
						termsService.checkTermsStatus(session.user.id).then(termsStatus => {
							setNeedsTermsAcceptance(termsStatus.needsAcceptance);
						}),
						UserDataLoader.loadUserData(session.user.id),
						dataSyncService.triggerManualSync()
					]).catch(err => {
						console.error("Background data loading error:", err);
					});
				} else {
					setUser(null);
					setUserRole(SECURITY_CONFIG.rbac.defaultRole);
					setNeedsTermsAcceptance(false);
				}
			} catch (error) {
				console.error("Unexpected error during auth initialization:", error);
			} finally {
				console.log("AuthContext: Setting loading to false");
				setLoading(false);
			}
		};

		initializeAuth();

		const isDevMode =
			!process.env.NEXT_PUBLIC_SUPABASE_URL ||
			!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
		const isPasswordResetPage = pathname === '/reset-password';

		if (!isDevMode && !isPasswordResetPage) {
			// Proactive session refresh every 50 minutes
			const refreshInterval = setInterval(async () => {
				try {
					const { data: { session } } = await supabase.auth.getSession();
					if (session?.user) {
						console.log('🔄 Proactively refreshing session...');
						const { data, error } = await supabase.auth.refreshSession();
						if (error) {
							console.error('❌ Failed to refresh session:', error);
						} else if (data.session) {
							console.log('✅ Session refreshed successfully');
							setUser(data.session.user);
						}
					}
				} catch (error) {
					console.error('❌ Error in proactive session refresh:', error);
				}
			}, 50 * 60 * 1000);

			// Visibility-based session check
			let lastVisibilityCheck = Date.now();
			const handleVisibilityChange = async () => {
				if (!document.hidden) {
					const timeSinceLastCheck = Date.now() - lastVisibilityCheck;
					if (timeSinceLastCheck > 5 * 60 * 1000) {
						console.log('👁️ Tab visible - checking session validity...');
						try {
							const { data: { session }, error } = await supabase.auth.getSession();
							if (error || !session) {
								console.log('⚠️ Session invalid or expired, signing out...');
								await signOut();
							} else {
								console.log('✅ Session valid');
								lastVisibilityCheck = Date.now();
							}
						} catch (error) {
							console.error('❌ Error checking session on visibility change:', error);
						}
					}
				}
			};
			document.addEventListener('visibilitychange', handleVisibilityChange);

			// Listen for auth state changes
			const { data: authListener } = supabase.auth.onAuthStateChange(
				async (event, session) => {
					if (pathname === '/reset-password') {
						return;
					}

					console.log("Auth state changed:", event, session?.user?.email);

					if (event === "SIGNED_OUT" && !session) {
						const wasManualLogout = sessionManager.getSessionData()?.reason === "LOGOUT";
						if (!wasManualLogout) {
							window.dispatchEvent(new CustomEvent("sessionExpired"));
						}
					}

					if (event === "TOKEN_REFRESHED" && session) {
						console.log("Token refreshed successfully - reloading user data");
						setUser(session.user);
						await UserDataLoader.loadUserData(session.user.id);
						dataSyncService.triggerManualSync().catch(err => {
							console.error("Failed to sync data after token refresh:", err);
						});
						return;
					}

					setUser(session?.user ?? null);
					console.log("AuthContext: Setting loading to false");
					setLoading(false);

					if (event === "SIGNED_IN" && session?.user) {
						sessionManager.startSession();
						const role = session.user.email?.includes("admin") ? "admin" : "user";
						RoleManager.setUserRole(session.user.id, role);
						setUserRole(role);

						const termsStatus = await termsService.checkTermsStatus(session.user.id);
						setNeedsTermsAcceptance(termsStatus.needsAcceptance);

						await UserDataLoader.loadUserData(session.user.id);
						dataSyncService.triggerManualSync().then(() => {
							console.log("Initial data sync completed after sign in");
						});
					} else if (event === "SIGNED_OUT") {
						sessionManager.endSession("LOGOUT");
						setUserRole(SECURITY_CONFIG.rbac.defaultRole);
						setNeedsTermsAcceptance(false);
					} else if (event === "USER_UPDATED" && session?.user) {
						setUser(session.user);
					}
				},
			);

			return () => {
				clearInterval(refreshInterval);
				document.removeEventListener('visibilitychange', handleVisibilityChange);
				authListener.subscription.unsubscribe();
			};
		}
	}, [pathname, router, supabase]);

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
				AuditLogger.log({
					action: "SIGN_IN_FAILED",
					category: "AUTH",
					severity: "WARN",
					details: { email, error: error.message },
				});
				throw error;
			}

			if (data.user) {
				AuditLogger.log({
					action: "SIGN_IN_SUCCESS",
					category: "AUTH",
					severity: "INFO",
					userId: data.user.id,
					userEmail: data.user.email || undefined,
				});

				sessionManager.startSession();
				const role = data.user.email?.includes("admin") ? "admin" : "user";
				RoleManager.setUserRole(data.user.id, role);
				setUserRole(role);

				const termsStatus = await termsService.checkTermsStatus(data.user.id);
				setNeedsTermsAcceptance(termsStatus.needsAcceptance);

				await UserDataLoader.loadUserData(data.user.id);
				dataSyncService.triggerManualSync().then(() => {
					console.log("Initial data sync completed after sign in");
				});

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
				AuditLogger.log({
					action: "SIGN_UP_FAILED",
					category: "AUTH",
					severity: "WARN",
					details: { email, error: error.message },
				});
				throw error;
			}

			if (data.user) {
				AuditLogger.log({
					action: "SIGN_UP_SUCCESS",
					category: "AUTH",
					severity: "INFO",
					userId: data.user.id,
					userEmail: data.user.email || undefined,
				});

				RoleManager.setUserRole(data.user.id, "user");
				setUserRole("user");

				const termsStatus = await termsService.checkTermsStatus(data.user.id);
				setNeedsTermsAcceptance(termsStatus.needsAcceptance);

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

			sessionManager.endSession("LOGOUT");
			clearSentryUser();
			setUser(null);
			setUserRole(SECURITY_CONFIG.rbac.defaultRole);
			setNeedsTermsAcceptance(false);

			localStorage.clear();
			sessionStorage.clear();

			router.push("/");
			router.refresh();
		} catch (error) {
			console.error("Sign out error:", error);
			localStorage.clear();
			sessionStorage.clear();
			router.push("/");
			router.refresh();
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

			return { user: null, error: null };
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
		setNeedsTermsAcceptance(false);
		if (user) {
			const termsStatus = await termsService.checkTermsStatus(user.id);
			setNeedsTermsAcceptance(termsStatus.needsAcceptance);
		}
	};

	// Listen for session timeout events
	useEffect(() => {
		const handleSessionEnd = async (event: CustomEvent) => {
			if (event.detail.reason === "TIMEOUT") {
				await signOut();
			}
		};

		window.addEventListener("sessionEnd", handleSessionEnd as EventListener);
		return () => {
			window.removeEventListener("sessionEnd", handleSessionEnd as EventListener);
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
