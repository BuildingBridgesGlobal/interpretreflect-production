import fs from "fs";
import path from "path";

// All reflection-related components
const reflectionComponents = [
	// Main reflection components
	"PreAssignmentPrepV6.tsx",
	"PostAssignmentDebrief.tsx",
	"WellnessCheckIn.tsx",
	"WellnessCheckInAccessible.tsx",
	"CompassCheck.tsx",
	"MentoringPrep.tsx",
	"MentoringReflection.tsx",
	"MentoringReflectionAccessible.tsx",
	"InSessionSelfCheck.tsx",
	"InSessionTeamSync.tsx",
	"RoleSpaceReflection.tsx",
	"DirectCommunicationReflection.tsx",
	"TeamingPrepEnhanced.tsx",
	"TeamingReflectionEnhanced.tsx",
	"EthicsMeaningCheckAccessible.tsx",

	// Body check-in components
	"BodyCheckIn.tsx",
	"BodyCheckInAccessible.tsx",
	"BodyCheckInEnhanced.tsx",
	"BodyCheckInFriendly.tsx",

	// Additional prep components
	"PreAssignmentPrep.tsx",
	"PreAssignmentPrepAccessible.tsx",
	"PreAssignmentPrepEnhanced.tsx",
	"PreAssignmentPrepV5.tsx",
	"MentoringPrepAccessible.tsx",
	"MentoringPrepEnhanced.tsx",
	"TeamingPrep.tsx",

	// Additional reflection components
	"TeamingReflection.tsx",
	"TeamReflectionJourneyAccessible.tsx",
	"MentoringReflectionEnhanced.tsx",
	"PostAssignmentDebriefAccessible.tsx",
	"PostAssignmentDebriefEnhanced.tsx",
	"WellnessCheckInEnhanced.tsx",
	"CompassCheckEnhanced.tsx",
	"AffirmationReflectionStudio.tsx",
];

console.log("🔍 Verification Report for All Reflection Components\n");
console.log("=".repeat(60));

let allGood = 0;
let needsFix = 0;
let notFound = 0;

const results = {
	good: [],
	needsFix: [],
	notFound: [],
};

reflectionComponents.forEach((filename) => {
	const filePath = path.join("src/components", filename);

	if (!fs.existsSync(filePath)) {
		results.notFound.push(filename);
		notFound++;
		return;
	}

	const content = fs.readFileSync(filePath, "utf8");

	// Check for issues
	const issues = [];

	// Check if using direct API
	const usesDirectApi =
		content.includes("directInsertReflection") ||
		content.includes("directSupabaseApi");

	// Check for problematic Supabase client usage
	const usesSupabaseClient =
		content.includes("from '@supabase/supabase-js'") ||
		content.includes('from "@supabase/supabase-js"');

	// Check for hanging growth insights call (not commented out)
	const hasActiveGrowthInsights = content.match(
		/^[^/]*updateGrowthInsightsForUser\(/m,
	);

	// Check if it has a save function
	const hasSaveFunction =
		content.includes("handleSave") ||
		content.includes("handleSubmit") ||
		content.includes("onComplete");

	if (!usesDirectApi && hasSaveFunction) {
		issues.push("Not using directSupabaseApi");
	}
	if (usesSupabaseClient) {
		issues.push("Still imports Supabase client");
	}
	if (hasActiveGrowthInsights) {
		issues.push("Has active updateGrowthInsightsForUser call");
	}

	if (issues.length > 0) {
		results.needsFix.push({ name: filename, issues });
		needsFix++;
	} else {
		results.good.push(filename);
		allGood++;
	}
});

// Display results
console.log("\n✅ FIXED & WORKING (" + allGood + " components):");
console.log("-".repeat(40));
results.good.forEach((name) => {
	console.log("  ✓", name);
});

if (results.needsFix.length > 0) {
	console.log("\n⚠️  NEEDS ATTENTION (" + needsFix + " components):");
	console.log("-".repeat(40));
	results.needsFix.forEach(({ name, issues }) => {
		console.log("  ⚠", name);
		issues.forEach((issue) => {
			console.log("    →", issue);
		});
	});
}

if (results.notFound.length > 0) {
	console.log("\n❌ NOT FOUND (" + notFound + " components):");
	console.log("-".repeat(40));
	results.notFound.forEach((name) => {
		console.log("  ✗", name);
	});
}

console.log("\n" + "=".repeat(60));
console.log("📊 Summary:");
console.log(`  ✅ Fixed: ${allGood} components`);
console.log(`  ⚠️  Needs Fix: ${needsFix} components`);
console.log(`  ❌ Not Found: ${notFound} components`);
console.log("=".repeat(60));

if (allGood === reflectionComponents.length - notFound) {
	console.log("\n🎉 All existing reflection components are properly fixed!");
	console.log("They should all save on first click without hanging.");
} else {
	console.log("\n⚠️  Some components still need attention.");
	console.log("Run the fix scripts to resolve remaining issues.");
}
