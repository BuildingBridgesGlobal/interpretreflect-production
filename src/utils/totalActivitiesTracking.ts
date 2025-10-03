// Direct REST API function for fetching total activities
export async function fetchTotalActivitiesDirect() {
  console.log("🔍 Fetching total activities via direct REST API...");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Get session token
  let sessionStr = localStorage.getItem('sb-kvguxuxanpynwdffpssm-auth-token');

  if (!sessionStr) {
    const keys = Object.keys(localStorage);
    const authKey = keys.find(k => k.includes('supabase.auth.token') || (k.startsWith('sb-') && k.includes('-auth-token')));
    if (authKey) {
      sessionStr = localStorage.getItem(authKey);
    }
  }

  if (!sessionStr) {
    console.error("❌ No session found");
    return { reflections: 0, assessments: 0, techniques: 0, total: 0 };
  }

  const session = JSON.parse(sessionStr);
  const userId = session.user?.id;

  if (!userId) {
    console.error("❌ No user ID found");
    return { reflections: 0, assessments: 0, techniques: 0, total: 0 };
  }

  try {
    // Use the database function to get total activities
    const { data, error } = await fetch(
      `${supabaseUrl}/rest/v1/rpc/get_activities_simple`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ p_user_id: userId })
      }
    ).then(res => res.json());

    if (error) {
      console.error("Error fetching total activities via function:", error);

      // Fallback: Count manually
      return await fetchActivitiesManually(supabaseUrl, supabaseKey, session, userId);
    }

    console.log("✅ Total activities from function:", data);
    return { reflections: 0, assessments: 0, techniques: 0, total: data || 0 };

  } catch (error) {
    console.error("Failed to fetch total activities:", error);
    // Fallback to manual counting
    return await fetchActivitiesManually(supabaseUrl, supabaseKey, session, userId);
  }
}

// Manual fallback function
async function fetchActivitiesManually(
  supabaseUrl: string,
  supabaseKey: string,
  session: any,
  userId: string
) {
  let reflectionCount = 0;
  let assessmentCount = 0;
  let techniqueCount = 0;

  try {
    // Count from reflection_entries (where Pre-Assignment Prep and other reflections are)
    const reflectionEntriesResponse = await fetch(
      `${supabaseUrl}/rest/v1/reflection_entries?user_id=eq.${userId}&select=id`,
      {
        method: "GET",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${session.access_token}`
        }
      }
    );

    if (reflectionEntriesResponse.ok) {
      const reflectionEntries = await reflectionEntriesResponse.json();
      reflectionCount = reflectionEntries.length;
      console.log("✅ Reflection entries count:", reflectionCount);
    }

    // Also try counting from reflections table (if it exists)
    try {
      const reflectionsResponse = await fetch(
        `${supabaseUrl}/rest/v1/reflections?user_id=eq.${userId}&select=id`,
        {
          method: "GET",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${session.access_token}`
          }
        }
      );

      if (reflectionsResponse.ok) {
        const reflections = await reflectionsResponse.json();
        reflectionCount += reflections.length;
        console.log("✅ Additional reflections count:", reflections.length);
      }
    } catch (e) {
      // Reflections table might not exist or be accessible
      console.log("ℹ️ Reflections table not accessible");
    }

    // Count burnout assessments
    const assessmentsResponse = await fetch(
      `${supabaseUrl}/rest/v1/burnout_assessments?user_id=eq.${userId}&select=id`,
      {
        method: "GET",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${session.access_token}`
        }
      }
    );

    if (assessmentsResponse.ok) {
      const assessments = await assessmentsResponse.json();
      assessmentCount = assessments.length;
      console.log("✅ Assessments count:", assessmentCount);
    }

    // Try to count techniques (may not exist)
    try {
      const techniquesResponse = await fetch(
        `${supabaseUrl}/rest/v1/techniques_usage?user_id=eq.${userId}&completed=eq.true&select=id`,
        {
          method: "GET",
          headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${session.access_token}`
          }
        }
      );

      if (techniquesResponse.ok) {
        const techniques = await techniquesResponse.json();
        techniqueCount = techniques.length;
        console.log("✅ Techniques count:", techniqueCount);
      }
    } catch (e) {
      // Techniques table might not exist
      console.log("ℹ️ Techniques table not available");
    }

  } catch (error) {
    console.error("Error in manual activity count:", error);
  }

  const total = reflectionCount + assessmentCount + techniqueCount;
  console.log(`✅ Total activities: ${total} (R:${reflectionCount} A:${assessmentCount} T:${techniqueCount})`);

  return {
    reflections: reflectionCount,
    assessments: assessmentCount,
    techniques: techniqueCount,
    total: total
  };
}