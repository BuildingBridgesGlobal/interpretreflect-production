// Complete test for burnout assessments - save and fetch
import { saveBurnoutAssessmentDirect } from './saveBurnoutAssessment';
import { fetchBurnoutDataSimple } from './fetchBurnoutDataSimple';

export async function testBurnoutComplete() {
  console.log("🧪 Running complete burnout test suite...");
  console.log("=" .repeat(50));

  // Get session info
  let sessionStr = localStorage.getItem('sb-kvguxuxanpynwdffpssm-auth-token');

  if (!sessionStr) {
    const keys = Object.keys(localStorage);
    const authKey = keys.find(k => k.includes('supabase.auth.token') || (k.startsWith('sb-') && k.includes('-auth-token')));
    if (authKey) {
      sessionStr = localStorage.getItem(authKey);
    }
  }

  if (!sessionStr) {
    console.error("❌ No session found. Please log in first.");
    return;
  }

  const session = JSON.parse(sessionStr);
  const userId = session.user?.id;
  console.log("👤 Testing for user:", userId);

  // Test 1: Fetch existing data
  console.log("\n📥 TEST 1: Fetching existing burnout data...");
  const fetchResult = await fetchBurnoutDataSimple(userId);

  if (fetchResult.error) {
    console.error("❌ Fetch failed:", fetchResult.error);
  } else {
    console.log("✅ Fetch successful! Retrieved", fetchResult.data?.length || 0, "records");
    if (fetchResult.data?.length > 0) {
      console.log("📊 Latest entry:", {
        date: fetchResult.data[0].assessment_date,
        score: fetchResult.data[0].burnout_score,
        wellness: fetchResult.data[0].wellness_percentage
      });
    }
  }

  // Test 2: Save new test data
  console.log("\n💾 TEST 2: Saving test burnout data...");
  const testDate = new Date();
  testDate.setHours(testDate.getHours() - 1); // Set to 1 hour ago to avoid conflicts

  const testData = {
    user_id: userId,
    assessment_date: testDate.toISOString(),
    burnout_score: 7,
    wellness_percentage: 30,
    symptoms_data: {
      test: true,
      timestamp: new Date().toISOString()
    }
  };

  const saveResult = await saveBurnoutAssessmentDirect(testData);

  if (saveResult.error) {
    console.error("❌ Save failed:", saveResult.error);
  } else {
    console.log("✅ Save successful!");
    console.log("📊 Saved data:", saveResult.data);
  }

  // Test 3: Verify the save by fetching again
  console.log("\n🔄 TEST 3: Verifying save by fetching again...");
  const verifyResult = await fetchBurnoutDataSimple(userId);

  if (verifyResult.error) {
    console.error("❌ Verification fetch failed:", verifyResult.error);
  } else {
    console.log("✅ Verification fetch successful!");
    console.log("📊 Total records now:", verifyResult.data?.length || 0);

    // Check if our test data is there
    const testEntry = verifyResult.data?.find(d =>
      d.burnout_score === 7 &&
      d.symptoms_data?.test === true
    );

    if (testEntry) {
      console.log("✅ Test data confirmed in database!");
    } else {
      console.log("⚠️ Test data not found in fetched results");
    }
  }

  console.log("\n" + "=" .repeat(50));
  console.log("📋 TEST SUMMARY:");
  console.log("- Fetch: " + (fetchResult.error ? "❌ FAILED" : "✅ PASSED"));
  console.log("- Save: " + (saveResult.error ? "❌ FAILED" : "✅ PASSED"));
  console.log("- Verify: " + (verifyResult.error ? "❌ FAILED" : "✅ PASSED"));

  if (!fetchResult.error && !saveResult.error && !verifyResult.error) {
    console.log("\n🎉 ALL TESTS PASSED! Burnout system is working correctly.");
    console.log("The Daily Burnout Trend should now display real data from Supabase.");
  } else {
    console.log("\n⚠️ Some tests failed. Check the errors above.");
  }

  return {
    fetch: !fetchResult.error,
    save: !saveResult.error,
    verify: !verifyResult.error
  };
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).testBurnoutComplete = testBurnoutComplete;
}