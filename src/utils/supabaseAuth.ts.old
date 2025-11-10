import { supabase } from "../lib/supabase";

/**
 * Ensures the Supabase client has a valid authenticated session
 * before making queries that require RLS authentication
 */
export async function getAuthenticatedSupabase() {
  // Get current session
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error getting session:", error);
    throw new Error("Authentication error");
  }

  if (!session) {
    console.error("No active session");
    throw new Error("Not authenticated");
  }

  console.log("✅ Authenticated session found:", session.user.id);

  // Return the supabase client (it automatically uses the session from auth)
  return supabase;
}

/**
 * Helper to refresh session if needed before queries
 */
export async function ensureFreshSession() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (!session) {
    console.error("No session to refresh");
    return null;
  }

  // Check if token expires soon (within 5 minutes)
  const expiresAt = session.expires_at;
  if (expiresAt) {
    const expiresIn = expiresAt * 1000 - Date.now();
    if (expiresIn < 5 * 60 * 1000) {
      console.log("Session expiring soon, refreshing...");
      const { data: { session: newSession }, error: refreshError } =
        await supabase.auth.refreshSession();

      if (refreshError) {
        console.error("Failed to refresh session:", refreshError);
        return null;
      }

      console.log("✅ Session refreshed");
      return newSession;
    }
  }

  return session;
}