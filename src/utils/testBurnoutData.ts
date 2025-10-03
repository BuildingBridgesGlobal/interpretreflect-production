import { supabase } from "../lib/supabase";

export async function testBurnoutDataAccess() {
  console.log("🔍 Testing burnout data access...");

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log("👤 Current user:", user?.id, userError);

  if (!user) {
    console.log("❌ No authenticated user");
    return;
  }

  // Test 1: Try to get all data without filters
  const { data: allData, error: allError, count: allCount } = await supabase
    .from("burnout_assessments")
    .select("*", { count: "exact" });

  console.log("📊 Test 1 - All data (no filters):");
  console.log("  - Count:", allCount);
  console.log("  - Error:", allError);
  console.log("  - Data sample:", allData?.slice(0, 2));

  // Test 2: Try to get user-specific data
  const { data: userData, error: userDataError, count: userCount } = await supabase
    .from("burnout_assessments")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  console.log("📊 Test 2 - User-specific data:");
  console.log("  - User ID:", user.id);
  console.log("  - Count:", userCount);
  console.log("  - Error:", userDataError);
  console.log("  - Data:", userData);

  // Test 3: Check RLS policies
  const { data: policies, error: policyError } = await supabase
    .rpc("check_rls_policies", { table_name: "burnout_assessments" })
    .single()
    .catch(() => ({ data: null, error: "RPC function not available" }));

  console.log("📊 Test 3 - RLS Policies:");
  console.log("  - Error:", policyError);
  console.log("  - Policies:", policies);

  // Test 4: Try to insert test data
  const testData = {
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

  console.log("📊 Test 4 - Insert test data:");
  const { data: insertData, error: insertError } = await supabase
    .from("burnout_assessments")
    .insert(testData)
    .select()
    .single();

  console.log("  - Insert successful:", !!insertData);
  console.log("  - Insert error:", insertError);
  console.log("  - Inserted data:", insertData);

  return {
    user,
    allCount,
    userCount,
    userData,
    hasAccess: !!userData && userData.length > 0
  };
}

// Add this function to window for easy testing in console
if (typeof window !== 'undefined') {
  (window as any).testBurnoutData = testBurnoutDataAccess;
}