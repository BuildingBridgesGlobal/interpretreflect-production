/**
 * Direct Supabase API service
 * Bypasses the Supabase client to make direct API calls
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function directInsertReflection(data: any, accessToken?: string) {
	console.log("directInsertReflection - Data being sent:", data);
	console.log("directInsertReflection - entry_kind field:", data.entry_kind);

	try {
		const response = await fetch(`${SUPABASE_URL}/rest/v1/reflection_entries`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				apikey: SUPABASE_ANON_KEY,
				Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
				Prefer: "return=representation",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Insert failed: ${response.status} - ${error}`);
		}

		const result = await response.json();
		return { data: result[0], error: null };
	} catch (error) {
		console.error("Direct API insert failed:", error);
		return { data: null, error };
	}
}

export async function directSelectReflections(
	userId: string,
	accessToken?: string,
) {
	try {
		const response = await fetch(
			`${SUPABASE_URL}/rest/v1/reflection_entries?user_id=eq.${userId}&select=*&limit=1`,
			{
				headers: {
					apikey: SUPABASE_ANON_KEY,
					Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
				},
			},
		);

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Select failed: ${response.status} - ${error}`);
		}

		const result = await response.json();
		return { data: result, error: null };
	} catch (error) {
		console.error("Direct API select failed:", error);
		return { data: null, error };
	}
}

export async function getSessionToken(): Promise<string | null> {
	try {
		// First, try the standard Supabase auth storage key (used by Supabase v2+)
		const keys = Object.keys(localStorage).filter((k) =>
			k.includes("supabase")
		);

		for (const key of keys) {
			try {
				const data = localStorage.getItem(key);
				if (data && data.includes("access_token")) {
					const parsed = JSON.parse(data);
					if (parsed?.currentSession?.access_token) {
						return parsed.currentSession.access_token;
					} else if (parsed?.access_token) {
						return parsed.access_token;
					}
				}
			} catch (e) {
				// Skip this key
				continue;
			}
		}

		// If no token found, try to get from Supabase client as fallback
		if (typeof window !== 'undefined' && window.supabase) {
			const { supabase } = await import("../lib/supabase");
			const { data: { session } } = await supabase.auth.getSession();
			if (session?.access_token) {
				return session.access_token;
			}
		}
	} catch (error) {
		console.error("Failed to get session token:", error);
	}

	return null;
}
