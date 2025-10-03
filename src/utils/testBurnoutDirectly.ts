// Test burnout_assessments table access directly
export async function testBurnoutDirectly() {
  console.log("🔍 Testing burnout_assessments access...");

  const supabaseUrl = 'https://kvguxuxanpynwdffpssm.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z3V4dXhhbnB5bndkZmZwc3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ3NzI1NTUsImV4cCI6MjA0MDM0ODU1NX0.phmeqFXSR6kOUfT7-SvPM3Eos-uu6a2J7MmegCBIVSw';

  // First, get the session token
  const sessionStr = localStorage.getItem('sb-kvguxuxanpynwdffpssm-auth-token');
  if (!sessionStr) {
    console.error("❌ No session found in localStorage");
    return;
  }

  const session = JSON.parse(sessionStr);
  console.log("✅ Found session for user:", session.user?.id);

  // Test 1: Try with just anon key
  console.log("\n📌 Test 1: Query with anon key only...");
  try {
    const response1 = await fetch(
      `${supabaseUrl}/rest/v1/burnout_assessments?user_id=eq.${session.user.id}&limit=1`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );
    console.log("Response status (anon key):", response1.status);
    if (!response1.ok) {
      const error = await response1.text();
      console.log("Error with anon key:", error);
    } else {
      const data = await response1.json();
      console.log("Success with anon key! Data:", data);
    }
  } catch (e) {
    console.error("Failed with anon key:", e);
  }

  // Test 2: Try with user's access token
  console.log("\n📌 Test 2: Query with user access token...");
  try {
    const response2 = await fetch(
      `${supabaseUrl}/rest/v1/burnout_assessments?user_id=eq.${session.user.id}&limit=1`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${session.access_token}`
        }
      }
    );
    console.log("Response status (user token):", response2.status);
    if (!response2.ok) {
      const error = await response2.text();
      console.log("Error with user token:", error);
    } else {
      const data = await response2.json();
      console.log("✅ Success with user token! Data:", data);
    }
  } catch (e) {
    console.error("Failed with user token:", e);
  }

  // Test 3: Try without user_id filter (to test if RLS works)
  console.log("\n📌 Test 3: Query without user_id filter (RLS test)...");
  try {
    const response3 = await fetch(
      `${supabaseUrl}/rest/v1/burnout_assessments?limit=1`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${session.access_token}`
        }
      }
    );
    console.log("Response status (no filter):", response3.status);
    if (!response3.ok) {
      const error = await response3.text();
      console.log("Error without filter:", error);
    } else {
      const data = await response3.json();
      console.log("✅ RLS working! Got data:", data);
    }
  } catch (e) {
    console.error("Failed without filter:", e);
  }

  console.log("\n📋 Summary:");
  console.log("- If Test 1 works: RLS is not enabled properly");
  console.log("- If Test 2 works: Need to use user token in the app");
  console.log("- If Test 3 works: RLS is working correctly");
  console.log("- If all fail: Table permissions need fixing in Supabase");
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).testBurnoutDirectly = testBurnoutDirectly;
}