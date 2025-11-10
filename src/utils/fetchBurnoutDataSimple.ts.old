export async function fetchBurnoutDataSimple(userId: string) {
  console.log("🔍 Fetching burnout data using simple approach...");

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Get the user's session token (same approach as saveBurnoutAssessment)
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

    let accessToken = supabaseKey; // Default to anon key
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.access_token) {
          accessToken = session.access_token;
          console.log("✅ Using user's access token for query");
        }
      } catch (e) {
        console.warn("Could not parse session, using anon key");
      }
    } else {
      console.warn("⚠️ No session found, using anon key (may fail due to RLS)");
    }

    // Build the direct URL
    const apiUrl = `${supabaseUrl}/rest/v1/burnout_assessments`;
    const params = new URLSearchParams({
      user_id: `eq.${userId}`,
      order: "assessment_date.desc",
      limit: "30"
    });

    console.log("📡 Making direct REST call to:", `${apiUrl}?${params}`);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Make the request with the user's access token
    let response;
    try {
      response = await fetch(`${apiUrl}?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${accessToken}` // Use user's access token
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.error("⏱️ Fetch timed out after 5 seconds");
        return { data: [], error: new Error("Request timed out") };
      }
      throw err;
    }

    console.log("📊 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error response:", errorText);

      // Check if it's an RLS issue
      if (response.status === 403 || errorText.includes("row-level security")) {
        console.log("🔒 RLS is blocking access. This means:");
        console.log("   - The table exists ✅");
        console.log("   - But RLS policies need the user's auth token");
        console.log("   - We'll return empty data for now");
        return { data: [], error: null };
      }

      if (response.status === 404 || errorText.includes("relation") || errorText.includes("does not exist")) {
        console.error("🚨 Table 'burnout_assessments' does not exist!");
        console.error("Please create the table in your Supabase project");
      }

      return { data: null, error: new Error(`${response.status}: ${errorText}`) };
    }

    const data = await response.json();
    console.log("✅ Success! Retrieved", data.length, "records");
    return { data, error: null };

  } catch (error) {
    console.error("❌ Fetch failed:", error);
    return { data: null, error };
  }
}