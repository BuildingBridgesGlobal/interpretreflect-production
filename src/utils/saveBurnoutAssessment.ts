// Direct REST API save for burnout assessments to bypass hanging Supabase client
export async function saveBurnoutAssessmentDirect(saveData: any) {
  console.log("💾 Saving burnout assessment via direct REST API...");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Try different possible session keys
  let sessionStr = localStorage.getItem('sb-kvguxuxanpynwdffpssm-auth-token');

  // If not found, try to find any Supabase auth token
  if (!sessionStr) {
    const keys = Object.keys(localStorage);
    const authKey = keys.find(k => k.includes('supabase.auth.token') || (k.startsWith('sb-') && k.includes('-auth-token')));
    if (authKey) {
      console.log("📌 Found auth key:", authKey);
      sessionStr = localStorage.getItem(authKey);
    }
  }

  if (!sessionStr) {
    console.error("❌ No session found in localStorage");
    console.log("Available localStorage keys:", Object.keys(localStorage));
    return { data: null, error: new Error("Not authenticated") };
  }

  const session = JSON.parse(sessionStr);
  console.log("✅ Using session for user:", session.user?.id);

  try {
    // Use UPSERT (INSERT ... ON CONFLICT ... UPDATE) via Prefer: resolution=merge-duplicates
    // This handles both insert and update in a single operation
    const response = await fetch(
      `${supabaseUrl}/rest/v1/burnout_assessments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${session.access_token}`,
          "Prefer": "return=representation,resolution=merge-duplicates"
        },
        body: JSON.stringify(saveData)
      }
    );

    console.log("📊 Save response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Save failed:", errorText);
      return {
        data: null,
        error: new Error(`Save failed: ${response.status} - ${errorText}`)
      };
    }

    const data = await response.json();
    console.log("✅ Successfully saved/updated assessment:", data);
    return { data: data[0] || data, error: null };

  } catch (error) {
    console.error("❌ Save request failed:", error);
    return { data: null, error };
  }
}

// Update existing assessment for today
export async function updateBurnoutAssessmentDirect(userId: string, date: string, updateData: any) {
  console.log("🔄 Updating burnout assessment via direct REST API...");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Try different possible session keys
  let sessionStr = localStorage.getItem('sb-kvguxuxanpynwdffpssm-auth-token');

  // If not found, try to find any Supabase auth token
  if (!sessionStr) {
    const keys = Object.keys(localStorage);
    const authKey = keys.find(k => k.includes('supabase.auth.token') || (k.startsWith('sb-') && k.includes('-auth-token')));
    if (authKey) {
      console.log("📌 Found auth key:", authKey);
      sessionStr = localStorage.getItem(authKey);
    }
  }

  if (!sessionStr) {
    console.error("❌ No session found in localStorage");
    console.log("Available localStorage keys:", Object.keys(localStorage));
    return { data: null, error: new Error("Not authenticated") };
  }

  const session = JSON.parse(sessionStr);

  try {
    const startOfDay = new Date(date + "T00:00:00").toISOString();
    const endOfDay = new Date(date + "T23:59:59").toISOString();

    // Build the update URL with filters

    const response = await fetch(
      `${supabaseUrl}/rest/v1/burnout_assessments?user_id=eq.${userId}&assessment_date=gte.${startOfDay}&assessment_date=lte.${endOfDay}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${session.access_token}`,
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