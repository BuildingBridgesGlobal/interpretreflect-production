import { SECURITY_CONFIG } from "../config/security";

// Audit log types
export interface AuditLog {
	id: string;
	timestamp: Date;
	userId: string | null;
	userEmail: string | null;
	action: string;
	details?: any;
	ipAddress?: string;
	userAgent?: string;
	severity: "DEBUG" | "INFO" | "WARN" | "ERROR";
	category: "AUTH" | "DATA" | "SYSTEM" | "SECURITY";
}

// Session management
export class SessionManager {
	private static instance: SessionManager;
	private lastActivity: number = Date.now();
	private warningShown: boolean = false;
	private sessionTimer: NodeJS.Timeout | null = null;

	private constructor() {}

	static getInstance(): SessionManager {
		if (!SessionManager.instance) {
			SessionManager.instance = new SessionManager();
		}
		return SessionManager.instance;
	}

	startSession(): void {
		this.lastActivity = Date.now();
		this.warningShown = false;
		this.startSessionTimer();

		// Track user activity
		if (SECURITY_CONFIG.session.extendOnActivity) {
			this.setupActivityListeners();
		}

		// Log session start
		AuditLogger.log({
			action: "SESSION_START",
			category: "AUTH",
			severity: "INFO",
		});
	}

	private setupActivityListeners(): void {
		const events = ["mousedown", "keydown", "scroll", "touchstart"];
		events.forEach((event) => {
			window.addEventListener(event, () => this.updateActivity(), {
				passive: true,
			});
		});
	}

	private updateActivity(): void {
		this.lastActivity = Date.now();
		this.warningShown = false;
	}

	private startSessionTimer(): void {
		if (this.sessionTimer) {
			clearInterval(this.sessionTimer);
		}

		this.sessionTimer = setInterval(() => {
			this.checkSession();
		}, SECURITY_CONFIG.session.checkInterval);
	}

	private checkSession(): void {
		const now = Date.now();
		const timeSinceActivity = now - this.lastActivity;
		const timeUntilTimeout =
			SECURITY_CONFIG.session.timeout - timeSinceActivity;

		if (timeUntilTimeout <= 0) {
			this.endSession("TIMEOUT");
		} else if (
			timeUntilTimeout <= SECURITY_CONFIG.session.warningTime &&
			!this.warningShown
		) {
			this.showWarning();
			this.warningShown = true;
		}
	}

	private showWarning(): void {
		const event = new CustomEvent("sessionWarning", {
			detail: { timeRemaining: SECURITY_CONFIG.session.warningTime },
		});
		window.dispatchEvent(event);
	}

	endSession(reason: "LOGOUT" | "TIMEOUT" | "SECURITY"): void {
		if (this.sessionTimer) {
			clearInterval(this.sessionTimer);
			this.sessionTimer = null;
		}

		// Log session end
		AuditLogger.log({
			action: `SESSION_END_${reason}`,
			category: "AUTH",
			severity: "INFO",
		});

		// Clear local storage
		localStorage.removeItem("supabase.auth.token");
		sessionStorage.clear();

		// Dispatch event for components to handle
		const event = new CustomEvent("sessionEnd", { detail: { reason } });
		window.dispatchEvent(event);
	}

	extendSession(): void {
		this.lastActivity = Date.now();
		this.warningShown = false;

		AuditLogger.log({
			action: "SESSION_EXTENDED",
			category: "AUTH",
			severity: "DEBUG",
		});
	}
}

// Audit logging system
export class AuditLogger {
	private static logs: AuditLog[] = [];

	static log(params: {
		action: string;
		category: AuditLog["category"];
		severity: AuditLog["severity"];
		details?: any;
		userId?: string;
		userEmail?: string;
	}): void {
		const log: AuditLog = {
			id: crypto.randomUUID
				? crypto.randomUUID()
				: `${Date.now()}-${Math.random()}`,
			timestamp: new Date(),
			userId: params.userId || null,
			userEmail: params.userEmail || null,
			action: params.action,
			details: params.details,
			severity: params.severity,
			category: params.category,
			userAgent: navigator.userAgent,
		};

		// Store in memory (in production, send to backend)
		AuditLogger.logs.push(log);

		// Keep only recent logs in memory
		const maxLogs = 1000;
		if (AuditLogger.logs.length > maxLogs) {
			AuditLogger.logs = AuditLogger.logs.slice(-maxLogs);
		}

		// In production, send to backend
		if (SECURITY_CONFIG.audit.logLevel === "DEBUG") {
			console.log("[AUDIT]", log);
		}
	}

	static getLogs(filter?: {
		category?: AuditLog["category"];
		severity?: AuditLog["severity"];
		userId?: string;
		startDate?: Date;
		endDate?: Date;
	}): AuditLog[] {
		let filtered = [...AuditLogger.logs];

		if (filter) {
			if (filter.category) {
				filtered = filtered.filter((log) => log.category === filter.category);
			}
			if (filter.severity) {
				filtered = filtered.filter((log) => log.severity === filter.severity);
			}
			if (filter.userId) {
				filtered = filtered.filter((log) => log.userId === filter.userId);
			}
			if (filter.startDate) {
				filtered = filtered.filter((log) => filter.startDate && log.timestamp >= filter.startDate);
			}
			if (filter.endDate) {
				filtered = filtered.filter((log) => filter.endDate && log.timestamp <= filter.endDate);
			}
		}

		return filtered;
	}

	static clearOldLogs(
		daysToKeep: number = SECURITY_CONFIG.audit.retentionDays,
	): void {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

		AuditLogger.logs = AuditLogger.logs.filter(
			(log) => log.timestamp > cutoffDate,
		);
	}
}

// Role-based access control
export class RoleManager {
	private static userRoles: Map<string, string> = new Map();

	static setUserRole(userId: string, role: string): void {
		const validRole = Object.keys(SECURITY_CONFIG.rbac.roles).includes(role);
		if (!validRole) {
			throw new Error(`Invalid role: ${role}`);
		}

		RoleManager.userRoles.set(userId, role);

		AuditLogger.log({
			action: "ROLE_ASSIGNED",
			category: "SECURITY",
			severity: "INFO",
			details: { userId, role },
		});
	}

	static getUserRole(userId: string): string {
		return (
			RoleManager.userRoles.get(userId) || SECURITY_CONFIG.rbac.defaultRole
		);
	}

	static hasPermission(userId: string, permission: string): boolean {
		const userRole = RoleManager.getUserRole(userId);
		const roleConfig =
			SECURITY_CONFIG.rbac.roles[
				userRole as keyof typeof SECURITY_CONFIG.rbac.roles
			];

		if (!roleConfig) {
			return false;
		}

		return (
			roleConfig.permissions.includes("all") ||
			roleConfig.permissions.includes(permission)
		);
	}

	static canAccess(userId: string, resource: string, action: string): boolean {
		const permission = `${action}_${resource}`;
		return RoleManager.hasPermission(userId, permission);
	}
}

// HTTPS enforcement
export function enforceHttps(): void {
	if (
		SECURITY_CONFIG.https.enforceHttps &&
		window.location.protocol !== "https:" &&
		window.location.hostname !== "localhost" &&
		window.location.hostname !== "127.0.0.1"
	) {
		window.location.href =
			"https:" +
			window.location.href.substring(window.location.protocol.length);
	}
}

// Security headers helper (for backend implementation)
export function getSecurityHeaders(): Record<string, string> {
	const csp = Object.entries(SECURITY_CONFIG.headers.contentSecurityPolicy)
		.map(([key, values]) => `${key} ${values.join(" ")}`)
		.join("; ");

	return {
		"Content-Security-Policy": csp,
		"X-Frame-Options": SECURITY_CONFIG.headers.xFrameOptions,
		"X-Content-Type-Options": SECURITY_CONFIG.headers.xContentTypeOptions,
		"Referrer-Policy": SECURITY_CONFIG.headers.referrerPolicy,
		"Strict-Transport-Security": `max-age=${SECURITY_CONFIG.https.hstsMaxAge}; includeSubDomains; preload`,
	};
}

// Data encryption utilities (for sensitive data)
export async function encryptData(data: string): Promise<string> {
	// In production, use WebCrypto API or backend encryption
	// This is a placeholder for demonstration
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);

	// Generate a random key (in production, use key management)
	const key = await crypto.subtle.generateKey(
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt", "decrypt"],
	);

	const iv = crypto.getRandomValues(new Uint8Array(12));

	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		dataBuffer,
	);

	// Return base64 encoded (in production, also store key securely)
	return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

export async function decryptData(
	encryptedData: string,
	key: CryptoKey,
): Promise<string> {
	// Placeholder for demonstration
	const encryptedBuffer = Uint8Array.from(atob(encryptedData), (c) =>
		c.charCodeAt(0),
	);

	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: new Uint8Array(12) },
		key,
		encryptedBuffer,
	);

	const decoder = new TextDecoder();
	return decoder.decode(decrypted);
}
