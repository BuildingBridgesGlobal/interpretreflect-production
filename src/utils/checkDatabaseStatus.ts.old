import { supabase } from "../lib/supabase";

export async function checkDatabaseStatus() {
	console.log("🔍 Checking Supabase database status...\n");

	const tables = [
		// From user_profiles_schema.sql
		"user_profiles",
		"user_preferences",

		// From growth_insights_schema.sql
		"reflection_entries",
		"stress_reset_logs",
		"daily_activity",

		// From enhanced_growth_schema.sql
		"emotion_entries",
		"user_actions",
		"user_badges",
		"community_metrics",

		// From subscriptions_schema.sql
		"subscriptions",
		"invoices",

		// From data_sync_schema.sql
		"reflections",
		"body_check_ins",
		"technique_usage",
		"recovery_habits",
		"burnout_assessments",
		"affirmations",
		"affirmation_favorites",
		"body_awareness_sessions",
		"boundaries_sessions",
		"assignment_prep",
		"assignment_debriefs",
		"wellness_check_ins",
		"emotional_proximity_sessions",
		"code_switch_sessions",
	];

	const results: { table: string; exists: boolean; error?: string }[] = [];

	for (const table of tables) {
		try {
			// Try to select from the table (limit 0 for performance)
			const { error } = await supabase.from(table).select("*").limit(0);

			if (error) {
				// Check if it's a "relation does not exist" error
				if (
					error.message.includes("relation") &&
					error.message.includes("does not exist")
				) {
					results.push({ table, exists: false });
				} else {
					results.push({ table, exists: true, error: error.message });
				}
			} else {
				results.push({ table, exists: true });
			}
		} catch (err) {
			results.push({ table, exists: false, error: String(err) });
		}
	}

	// Display results
	console.log("📊 Database Table Status:\n");
	console.log(
		"✅ = Table exists | ❌ = Table missing | ⚠️ = Table exists but has errors\n",
	);

	const existing = results.filter((r) => r.exists && !r.error);
	const missing = results.filter((r) => !r.exists);
	const withErrors = results.filter((r) => r.exists && r.error);

	if (existing.length > 0) {
		console.log("✅ Existing tables:");
		existing.forEach((r) => console.log(`   - ${r.table}`));
		console.log("");
	}

	if (missing.length > 0) {
		console.log("❌ Missing tables (migrations not applied):");
		missing.forEach((r) => console.log(`   - ${r.table}`));
		console.log("");
	}

	if (withErrors.length > 0) {
		console.log("⚠️ Tables with issues:");
		withErrors.forEach((r) => console.log(`   - ${r.table}: ${r.error}`));
		console.log("");
	}

	// Summary
	console.log("📈 Summary:");
	console.log(`   Total tables expected: ${tables.length}`);
	console.log(`   Tables found: ${existing.length}`);
	console.log(`   Tables missing: ${missing.length}`);
	console.log(`   Tables with issues: ${withErrors.length}`);

	if (missing.length === 0 && withErrors.length === 0) {
		console.log("\n✅ All migrations appear to be applied successfully!");
	} else if (missing.length > 0) {
		console.log(
			"\n⚠️ Some migrations are not applied. Please run the following in Supabase SQL Editor:",
		);
		console.log(
			"   1. Go to: https://supabase.com/dashboard/project/kvguxuxanpynwdffpssm/sql",
		);
		console.log("   2. Run the file: supabase/complete_database_setup.sql");
	}

	return {
		totalExpected: tables.length,
		existing: existing.length,
		missing: missing.length,
		withErrors: withErrors.length,
		allMigrationsApplied: missing.length === 0 && withErrors.length === 0,
		results,
	};
}

// Function to run the check and display in console
export async function runDatabaseCheck() {
	try {
		const status = await checkDatabaseStatus();
		return status;
	} catch (error) {
		console.error("Error checking database status:", error);
		return null;
	}
}
