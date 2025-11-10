import { supabase } from "../lib/supabase";

export async function fetchBurnoutDataDirectly(userId: string) {
  console.log("🔍 Fetching burnout data using direct REST API...");

  try {
    // Get the current session for auth token
    console.log("📌 Step 1: Getting session...");
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("📌 Step 1 complete. Session:", !!session, "Error:", sessionError);

    if (sessionError || !session) {
      console.error("❌ No session available:", sessionError);
      return { data: null, error: sessionError || new Error("No session") };
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const apiUrl = `${supabaseUrl}/rest/v1/burnout_assessments`;

    // Build query parameters
    const params = new URLSearchParams({
      user_id: `eq.${userId}`,
      order: "assessment_date.desc",
      limit: "30"
    });

    console.log("📡 Making REST API call to:", `${apiUrl}?${params}`);

    // Make direct REST API call
    const response = await fetch(`${apiUrl}?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${session.access_token}`,
        "Prefer": "return=representation"
      }
    });

    console.log("📊 REST API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ REST API Error:", errorText);

      if (response.status === 404) {
        console.error("🚨 Table 'burnout_assessments' might not exist!");
        console.error("Please ensure the table is created in your Supabase project");
      }

      return {
        data: null,
        error: new Error(`REST API Error: ${response.status} - ${errorText}`)
      };
    }

    const data = await response.json();
    console.log("✅ REST API Success! Retrieved", data.length, "records");

    return { data, error: null };

  } catch (error) {
    console.error("❌ Direct REST API fetch failed:", error);
    return { data: null, error };
  }
}