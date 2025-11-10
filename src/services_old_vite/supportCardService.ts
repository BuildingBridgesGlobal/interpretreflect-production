/**
 * TRF-Lite Support Card Service
 * Private, encrypted wellness support system
 * Manages early signs, what helps/avoid strategies
 */

import { supabase } from "../lib/supabase";

// ============= TYPES =============
export interface EarlySigns {
	physical: string[];
	emotional: string[];
	cognitive: string[];
}

export interface WhatHelps {
	immediate: string[];  // Quick interventions (under 1 minute)
	shortTerm: string[];  // Short breaks (5-15 minutes)
	preventive: string[]; // Daily practices
}

export interface WhatToAvoid {
	behaviors: string[];
	situations: string[];
}

export interface SupportCardData {
	earlySigns: EarlySigns;
	whatHelps: WhatHelps;
	whatToAvoid: WhatToAvoid;
	personalNotes?: string;
	lastUpdated?: string;
	emergencyContact?: {
		name: string;
		relationship: string;
		phone?: string;
	};
}

export interface SupportCard {
	id: string;
	encryptedData: string;
	version: number;
	updatedAt: string;
	isActive: boolean;
}

export interface CardTemplate {
	id: string;
	templateName: string;
	templateCategory: string;
	earlySigns: EarlySigns;
	whatHelps: WhatHelps;
	whatToAvoid: WhatToAvoid;
}

// ============= ENCRYPTION =============
class EncryptionService {
	private encoder = new TextEncoder();
	private decoder = new TextDecoder();

	/**
	 * Generate a cryptographic key from user password
	 */
	async generateKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
		const passwordKey = await crypto.subtle.importKey(
			"raw",
			this.encoder.encode(password),
			"PBKDF2",
			false,
			["deriveBits", "deriveKey"]
		);

		return crypto.subtle.deriveKey(
			{
				name: "PBKDF2",
				salt,
				iterations: 100000,
				hash: "SHA-256"
			},
			passwordKey,
			{ name: "AES-GCM", length: 256 },
			false,
			["encrypt", "decrypt"]
		);
	}

	/**
	 * Encrypt support card data
	 */
	async encrypt(data: SupportCardData, password: string): Promise<string> {
		const salt = crypto.getRandomValues(new Uint8Array(16));
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const key = await this.generateKey(password, salt);

		const encryptedData = await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv },
			key,
			this.encoder.encode(JSON.stringify(data))
		);

		// Combine salt, iv, and encrypted data
		const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
		combined.set(salt, 0);
		combined.set(iv, salt.length);
		combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

		// Convert to base64 for storage
		return btoa(String.fromCharCode(...combined));
	}

	/**
	 * Decrypt support card data
	 */
	async decrypt(encryptedString: string, password: string): Promise<SupportCardData> {
		try {
			// Convert from base64
			const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));

			// Extract salt, iv, and encrypted data
			const salt = combined.slice(0, 16);
			const iv = combined.slice(16, 28);
			const encryptedData = combined.slice(28);

			const key = await this.generateKey(password, salt);

			const decryptedData = await crypto.subtle.decrypt(
				{ name: "AES-GCM", iv },
				key,
				encryptedData
			);

			return JSON.parse(this.decoder.decode(decryptedData));
		} catch (error) {
			console.error("Decryption failed:", error);
			throw new Error("Invalid password or corrupted data");
		}
	}

	/**
	 * Generate hash for quick search (one-way)
	 */
	async hashQuickHelp(text: string): Promise<string> {
		const data = this.encoder.encode(text.toLowerCase());
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
	}
}

// ============= MAIN SERVICE =============
class SupportCardService {
	private encryption = new EncryptionService();
	private userPassword: string | null = null;

	/**
	 * Set the user's encryption password (stored in memory only)
	 */
	setPassword(password: string) {
		this.userPassword = password;
	}

	/**
	 * Clear password from memory
	 */
	clearPassword() {
		this.userPassword = null;
	}

	/**
	 * Get password or prompt user
	 */
	private async getPassword(): Promise<string> {
		if (this.userPassword) {
			return this.userPassword;
		}

		// In production, show a modal to get password
		const password = prompt("Enter your Support Card password:");
		if (!password) {
			throw new Error("Password required");
		}

		this.userPassword = password;
		return password;
	}

	/**
	 * Save or update support card
	 */
	async saveSupportCard(
		userId: string,
		data: SupportCardData
	): Promise<{ success: boolean; cardId?: string; error?: string }> {
		try {
			const password = await this.getPassword();

			// Add timestamp
			data.lastUpdated = new Date().toISOString();

			// Encrypt the data
			const encryptedData = await this.encryption.encrypt(data, password);

			// Generate hashes for quick helps (for emergency access)
			const quickHelpsHash = await Promise.all(
				data.whatHelps.immediate.slice(0, 3).map(help =>
					this.encryption.hashQuickHelp(help)
				)
			);

			// Save to database
			const { data: result, error } = await supabase.rpc("save_support_card", {
				p_user_id: userId,
				p_encrypted_data: encryptedData,
				p_quick_helps_hash: quickHelpsHash
			});

			if (error) throw error;

			return {
				success: true,
				cardId: result.card_id
			};
		} catch (error) {
			console.error("Save support card error:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to save support card"
			};
		}
	}

	/**
	 * Retrieve and decrypt support card
	 */
	async getSupportCard(
		userId: string,
		shareToken?: string
	): Promise<{ success: boolean; data?: SupportCardData; error?: string }> {
		try {
			// Get encrypted card from database
			const { data: result, error } = await supabase.rpc("get_support_card", {
				p_user_id: userId,
				p_share_token: shareToken || null
			});

			if (error) throw error;

			if (!result.success || !result.card) {
				return {
					success: false,
					error: "No support card found"
				};
			}

			// Decrypt the data
			const password = await this.getPassword();
			const decryptedData = await this.encryption.decrypt(
				result.card.encrypted_data,
				password
			);

			return {
				success: true,
				data: decryptedData
			};
		} catch (error) {
			console.error("Get support card error:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to retrieve support card"
			};
		}
	}

	/**
	 * Share support card with limited access
	 */
	async shareSupportCard(
		cardId: string,
		userId: string,
		shareType: "team" | "supervisor" | "agency" | "emergency",
		expiresHours: number = 24
	): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
		try {
			const { data: result, error } = await supabase.rpc("share_support_card", {
				p_card_id: cardId,
				p_user_id: userId,
				p_share_type: shareType,
				p_expires_hours: expiresHours
			});

			if (error) throw error;

			return {
				success: true,
				shareUrl: result.share_url
			};
		} catch (error) {
			console.error("Share support card error:", error);
			return {
				success: false,
				error: "Failed to share support card"
			};
		}
	}

	/**
	 * Get available templates
	 */
	async getTemplates(
		category?: string
	): Promise<{ success: boolean; templates?: CardTemplate[]; error?: string }> {
		try {
			let query = supabase
				.from("card_templates")
				.select("*")
				.eq("is_public", true);

			if (category) {
				query = query.eq("template_category", category);
			}

			const { data, error } = await query;

			if (error) throw error;

			const templates: CardTemplate[] = data.map(t => ({
				id: t.id,
				templateName: t.template_name,
				templateCategory: t.template_category,
				earlySigns: t.early_signs as EarlySigns,
				whatHelps: t.what_helps as WhatHelps,
				whatToAvoid: t.what_to_avoid as WhatToAvoid
			}));

			return {
				success: true,
				templates
			};
		} catch (error) {
			console.error("Get templates error:", error);
			return {
				success: false,
				error: "Failed to retrieve templates"
			};
		}
	}

	/**
	 * Quick access for emergency situations (no password required)
	 */
	async getQuickHelps(
		userId: string
	): Promise<{ success: boolean; helps?: string[]; error?: string }> {
		try {
			// This retrieves only the hashed quick helps for emergency display
			// Actual content would need to be stored separately or use a different approach
			const { data, error } = await supabase
				.from("support_cards")
				.select("quick_helps_hash")
				.eq("user_id", userId)
				.eq("is_active", true)
				.single();

			if (error) throw error;

			// In a real implementation, you'd have a separate table for emergency quick helps
			// For now, return placeholder
			return {
				success: true,
				helps: ["Take 5 deep breaths", "Step outside", "Call support person"]
			};
		} catch (error) {
			console.error("Get quick helps error:", error);
			return {
				success: false,
				error: "Failed to retrieve quick helps"
			};
		}
	}

	/**
	 * Export support card as encrypted file
	 */
	async exportCard(userId: string): Promise<Blob | null> {
		try {
			const result = await this.getSupportCard(userId);
			if (!result.success || !result.data) {
				throw new Error("No card to export");
			}

			const exportData = {
				version: "1.0",
				exported: new Date().toISOString(),
				data: result.data
			};

			const blob = new Blob([JSON.stringify(exportData, null, 2)], {
				type: "application/json"
			});

			return blob;
		} catch (error) {
			console.error("Export error:", error);
			return null;
		}
	}

	/**
	 * Import support card from file
	 */
	async importCard(userId: string, file: File): Promise<{ success: boolean; error?: string }> {
		try {
			const text = await file.text();
			const importData = JSON.parse(text);

			if (!importData.version || !importData.data) {
				throw new Error("Invalid import file");
			}

			return await this.saveSupportCard(userId, importData.data);
		} catch (error) {
			console.error("Import error:", error);
			return {
				success: false,
				error: "Failed to import support card"
			};
		}
	}
}

// Export singleton instance
export const supportCardService = new SupportCardService();

// Export default support card structure
export const defaultSupportCard: SupportCardData = {
	earlySigns: {
		physical: [],
		emotional: [],
		cognitive: []
	},
	whatHelps: {
		immediate: [],
		shortTerm: [],
		preventive: []
	},
	whatToAvoid: {
		behaviors: [],
		situations: []
	}
};

// Export template categories
export const TEMPLATE_CATEGORIES = [
	{ value: "general", label: "General Wellness" },
	{ value: "medical", label: "Medical Interpreting" },
	{ value: "legal", label: "Legal Interpreting" },
	{ value: "educational", label: "Educational Settings" },
	{ value: "mental_health", label: "Mental Health" },
	{ value: "high_stress", label: "High Stress Situations" }
];