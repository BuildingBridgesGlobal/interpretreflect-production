// Direct REST API functions for confidence level tracking
export async function saveConfidenceLevelDirect(confidenceData: {
  confidence_level: number;
  reflection_type?: string;
  notes?: string;
}) {
  console.log("💾 Saving confidence level via direct REST API...");

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
    return { data: null, error: new Error("Not authenticated") };
  }

  const session = JSON.parse(sessionStr);
  const userId = session.user?.id;

  if (!userId) {
    console.error("❌ No user ID found");
    return { data: null, error: new Error("No user ID") };
  }

  try {
    const saveData = {
      user_id: userId,
      reflection_type: confidenceData.reflection_type || 'confidence_check',
      type: 'confidence_check',
      content: confidenceData.notes || '',
      data: {
        confidence_level: confidenceData.confidence_level,
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    };

    const response = await fetch(
      `${supabaseUrl}/rest/v1/reflections`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${session.access_token}`,
          "Prefer": "return=representation"
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
    console.log("✅ Successfully saved confidence level:", data);
    return { data: data[0] || data, error: null };

  } catch (error) {
    console.error("❌ Save request failed:", error);
    return { data: null, error };
  }
}

// Fetch today's confidence level
export async function fetchTodayConfidenceDirect() {
  console.log("🔍 Fetching today's confidence level via direct REST API...");

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
    return { data: null, error: new Error("Not authenticated") };
  }

  const session = JSON.parse(sessionStr);
  const userId = session.user?.id;

  if (!userId) {
    console.error("❌ No user ID found");
    return { data: null, error: new Error("No user ID") };
  }

  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Look for today's confidence check OR pre_assignment_prep
    const params = new URLSearchParams({
      user_id: `eq.${userId}`,
      created_at: `gte.${today.toISOString()}`,
      order: "created_at.desc"
    });

    // First try the reflection_entries table (where pre_assignment_prep is saved)
    let response = await fetch(
      `${supabaseUrl}/rest/v1/reflection_entries?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${session.access_token}`
        }
      }
    );

    console.log("📊 Fetch response status from reflection_entries:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Fetch failed:", errorText);

      // Return null for 404 or permission errors (not a critical error)
      if (response.status === 404 || response.status === 403) {
        return { data: null, error: null };
      }

      return {
        data: null,
        error: new Error(`Fetch failed: ${response.status} - ${errorText}`)
      };
    }

    const data = await response.json();
    console.log("✅ Fetched reflections:", data);

    // Look through today's reflections for confidence data
    if (data && data.length > 0) {
      for (const reflection of data) {
        console.log("📊 Checking reflection:", {
          entry_kind: reflection.entry_kind,
          type: reflection.type,
          reflection_type: reflection.reflection_type,
          data: reflection.data
        });

        let confidence = null;

        // Check if this is a confidence check type
        if (reflection.type === 'confidence_check') {
          confidence = reflection.data?.confidence_level ||
                      reflection.data?.confidenceLevel ||
                      reflection.data?.confidence ||
                      null;
        }
        // Check if this is a pre_assignment_prep (in reflection_entries, it's stored as entry_kind)
        else if (reflection.entry_kind === 'pre_assignment_prep' ||
                 reflection.reflection_type === 'pre_assignment_prep' ||
                 reflection.type === 'pre_assignment_prep') {
          confidence = reflection.data?.confidence_rating ||
                      reflection.data?.confidence_level ||
                      null;
        }

        if (confidence !== null && confidence !== undefined) {
          console.log("🎯 Found confidence level:", confidence);
          return {
            data: confidence,
            error: null
          };
        }
      }
    }

    console.log("ℹ️ No confidence data found for today");

    return { data: null, error: null };

  } catch (error) {
    console.error("❌ Fetch request failed:", error);
    return { data: null, error };
  }
}

// Fetch reflection streak using direct API
export async function fetchReflectionStreakDirect() {
  console.log("🔍 Fetching reflection streak via direct REST API...");

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
    return 0;
  }

  const session = JSON.parse(sessionStr);
  const userId = session.user?.id;

  if (!userId) {
    console.error("❌ No user ID found");
    return 0;
  }

  try {
    // Fetch last 365 days of reflections to calculate streak
    const params = new URLSearchParams({
      user_id: `eq.${userId}`,
      select: "created_at",
      order: "created_at.desc",
      limit: "365"
    });

    const response = await fetch(
      `${supabaseUrl}/rest/v1/reflection_entries?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${session.access_token}`
        }
      }
    );

    if (!response.ok) {
      console.error("❌ Failed to fetch reflections for streak");
      return 0;
    }

    const reflections = await response.json();

    if (!reflections || reflections.length === 0) {
      return 0;
    }

    // Calculate streak from reflections
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    // Group reflections by date
    const reflectionDates = new Set(
      reflections.map((r: any) => {
        const date = new Date(r.created_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    // Check consecutive days starting from today
    while (streak < 365) {
      if (reflectionDates.has(currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (streak === 0) {
        // Check if streak starts from yesterday
        currentDate.setDate(currentDate.getDate() - 1);
        if (reflectionDates.has(currentDate.getTime())) {
          streak = 1;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break; // Streak broken
      }
    }

    console.log("✅ Calculated streak:", streak);
    return streak;

  } catch (error) {
    console.error("❌ Failed to calculate streak:", error);
    return 0;
  }
}