import { supabase } from '../lib/supabase';

// Helper function to add timeout to any promise
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), timeoutMs)
    )
  ]);
}

// Direct REST API save for burnout assessments with token refresh handling
export async function saveBurnoutAssessmentDirect(saveData: any) {
  console.log("💾 Saving burnout assessment via direct REST API...");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Get auth token - try from localStorage first to avoid hanging getSession() call
  console.log("🔐 Getting auth token...");
  let accessToken: string | null = null;
  let userId: string | null = null;

  // Try to get token from localStorage (faster, doesn't hang)
  try {
    const authKey = Object.keys(localStorage).find(key => key.includes('supabase.auth.token'));
    if (authKey) {
      const authData = JSON.parse(localStorage.getItem(authKey) || '{}');
      accessToken = authData.access_token || authData.currentSession?.access_token;
      userId = authData.user?.id || authData.currentSession?.user?.id;

      if (accessToken && userId) {
        console.log("✅ Using token from localStorage for user:", userId);
      }
    }
  } catch (err) {
    console.warn("⚠️ Failed to get token from localStorage:", err);
  }

  // Fallback: try getSession() with timeout if localStorage didn't work
  if (!accessToken || !userId) {
    console.log("🔐 Attempting to get session from Supabase (with timeout)...");
    try {
      const result = await withTimeout(
        supabase.auth.getSession(),
        5000,
        "Auth session timeout after 5 seconds"
      );
      const session = result.data.session;
      const sessionError = result.error;

      if (sessionError || !session) {
        console.error("❌ No valid session found:", sessionError);
        return { data: null, error: new Error("Not authenticated. Please log in again.") };
      }

      accessToken = session.access_token;
      userId = session.user.id;
      console.log("✅ Using token from getSession for user:", userId);
    } catch (err: any) {
      console.error("❌ Session fetch timed out or failed:", err.message);
      return { data: null, error: new Error("Authentication timeout. Please try again.") };
    }
  }

  if (!accessToken || !userId) {
    console.error("❌ Could not retrieve authentication token");
    return { data: null, error: new Error("Authentication failed. Please log in again.") };
  }

  try {
    console.log("🌐 Making fetch request to:", `${supabaseUrl}/rest/v1/burnout_assessments`);
    // Removed token logging for production security
    if (import.meta.env.DEV) {
      console.log("🔑 Has auth token:", !!accessToken);
    }
    console.log("📤 Request body:", saveData);

    // Make direct REST API call to insert with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error("⏱️ Fetch request timed out after 10 seconds");
      controller.abort();
    }, 10000);

    const response = await fetch(
      `${supabaseUrl}/rest/v1/burnout_assessments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${accessToken}`,
          "Prefer": "return=representation"
        },
        body: JSON.stringify(saveData),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);
    console.log("📊 Save response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Save failed:", errorText);

      // Check for duplicate entry
      if (response.status === 409 || errorText.includes("duplicate")) {
        console.log("📝 Record exists for today, will try update instead...");
        return {
          data: null,
          error: {
            code: "23505",
            message: "duplicate",
            needsUpdate: true
          }
        };
      }

      return {
        data: null,
        error: new Error(`Save failed: ${response.status} - ${errorText}`)
      };
    }

    const data = await response.json();
    console.log("✅ Successfully saved assessment:", data);
    return { data: data[0] || data, error: null };

  } catch (error) {
    console.error("❌ Save request failed:", error);
    return { data: null, error };
  }
}

// Update existing assessment for today with token refresh handling
export async function updateBurnoutAssessmentDirect(userId: string, date: string, updateData: any) {
  console.log("🔄 Updating burnout assessment via direct REST API...");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Get auth token - try from localStorage first to avoid hanging getSession() call
  console.log("🔐 Getting auth token for update...");
  let accessToken: string | null = null;

  // Try to get token from localStorage (faster, doesn't hang)
  try {
    const authKey = Object.keys(localStorage).find(key => key.includes('supabase.auth.token'));
    if (authKey) {
      const authData = JSON.parse(localStorage.getItem(authKey) || '{}');
      accessToken = authData.access_token || authData.currentSession?.access_token;

      if (accessToken) {
        console.log("✅ Using token from localStorage for update");
      }
    }
  } catch (err) {
    console.warn("⚠️ Failed to get token from localStorage:", err);
  }

  // Fallback: try getSession() with timeout if localStorage didn't work
  if (!accessToken) {
    console.log("🔐 Attempting to get session from Supabase (with timeout)...");
    try {
      const result = await withTimeout(
        supabase.auth.getSession(),
        5000,
        "Auth session timeout after 5 seconds"
      );
      const session = result.data.session;
      const sessionError = result.error;

      if (sessionError || !session) {
        console.error("❌ No valid session found:", sessionError);
        return { data: null, error: new Error("Not authenticated. Please log in again.") };
      }

      accessToken = session.access_token;
      console.log("✅ Using token from getSession for update");
    } catch (err: any) {
      console.error("❌ Session fetch timed out or failed:", err.message);
      return { data: null, error: new Error("Authentication timeout. Please try again.") };
    }
  }

  if (!accessToken) {
    console.error("❌ Could not retrieve authentication token");
    return { data: null, error: new Error("Authentication failed. Please log in again.") };
  }

  try {
    // Use direct date equality since assessment_date is a DATE column (not timestamp)
    // Format: YYYY-MM-DD
    const response = await fetch(
      `${supabaseUrl}/rest/v1/burnout_assessments?user_id=eq.${userId}&assessment_date=eq.${date}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${accessToken}`,
          "Prefer": "return=representation"
        },
        body: JSON.stringify(updateData)
      }
    );

    console.log("📊 Update response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Update failed:", errorText);
      return {
        data: null,
        error: new Error(`Update failed: ${response.status} - ${errorText}`)
      };
    }

    const data = await response.json();
    console.log("✅ Successfully updated assessment:", data);
    return { data: data[0] || data, error: null };

  } catch (error) {
    console.error("❌ Update request failed:", error);
    return { data: null, error };
  }
}