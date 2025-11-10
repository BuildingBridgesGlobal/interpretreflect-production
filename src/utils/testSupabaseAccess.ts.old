import { supabase } from "../lib/supabase";

// Test function to run in browser console
export async function testSupabaseAccess() {
  console.log("=== SUPABASE DIAGNOSTIC TEST ===");

  // 1. Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  console.log("1. Auth Check:");
  console.log("   User ID:", user?.id || "NOT AUTHENTICATED");
  console.log("   Email:", user?.email || "N/A");
  console.log("   Auth Error:", authError?.message || "None");

  if (!user) {
    console.log("❌ Not authenticated. Please log in first.");
    return;
  }

  // 2. Test burnout_assessments table access
  console.log("\n2. Burnout Assessments Table Test:");

  // Try to get all records for the user
  const { data: userRecords, error: userError, count } = await supabase
    .from("burnout_assessments")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("assessment_date", { ascending: false });

  console.log("   User Records Found:", count || 0);
  console.log("   Query Error:", userError?.message || "None");
  console.log("   Sample Data:", userRecords?.[0] || "No records");

  // 3. Try to get records without user filter (will fail if RLS is enabled)
  const { data: allRecords, error: allError, count: allCount } = await supabase
    .from("burnout_assessments")
    .select("*", { count: "exact", head: true });

  console.log("\n3. RLS Test (query all records):");
  console.log("   Total Records (if accessible):", allCount || "N/A");
  console.log("   RLS Error:", allError?.message || "None");

  // 4. Test insert capability
  console.log("\n4. Insert Capability Test:");
  const testRecord = {
    user_id: user.id,
    assessment_date: new Date().toISOString(),
    burnout_score: 5,
    risk_level: "moderate",
    symptoms: {
      energy_tank: 3,
      recovery_speed: 3,
      emotional_leakage: 3,
      performance_signal: 3,
      tomorrow_readiness: 3
    },
    energy_tank: 3,
    recovery_speed: 3,
    emotional_leakage: 3,
    performance_signal: 3,
    tomorrow_readiness: 3,
    total_score: "15"
  };

  // Dry run - don't actually insert
  const { error: insertError } = await supabase
    .from("burnout_assessments")
    .insert(testRecord)
    .select()
    .single()
    .then(result => {
      // If successful, delete the test record
      if (result.data) {
        return supabase
          .from("burnout_assessments")
          .delete()
          .eq("id", result.data.id);
      }
      return result;
    });

  console.log("   Can Insert:", !insertError);
  console.log("   Insert Error:", insertError?.message || "None");

  // 5. Check table metadata
  console.log("\n5. Table Metadata:");
  const { data: tables, error: tableError } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")
    .eq("table_name", "burnout_assessments")
    .single()
    .catch(e => ({ data: null, error: "Cannot access metadata" }));

  console.log("   Table Exists:", !!tables || "Cannot verify");
  console.log("   Metadata Error:", tableError || "None");

  // Summary
  console.log("\n=== SUMMARY ===");
  console.log("✓ Authenticated:", !!user);
  console.log("✓ Can Read Own Records:", !userError);
  console.log("✓ Records Found:", (count || 0) > 0);
  console.log("✓ Can Insert Records:", !insertError);
  console.log("✓ RLS Enabled:", !!allError || allCount === 0);

  return {
    authenticated: !!user,
    canRead: !userError,
    recordCount: count || 0,
    canInsert: !insertError,
    rlsEnabled: !!allError,
    userData: userRecords
  };
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testSupabaseAccess = testSupabaseAccess;
}