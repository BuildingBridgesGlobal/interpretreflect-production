import fs from "fs";
import path from "path";

// List of components that still have updateGrowthInsightsForUser calls
const componentsWithGrowthInsights = [
	"EthicsMeaningCheckAccessible.tsx",
	"RoleSpaceReflection.tsx",
	"InSessionSelfCheck.tsx",
	"WellnessCheckInAccessible.tsx",
	"MentoringReflectionAccessible.tsx",
	"PreAssignmentPrepV5.tsx",
];

console.log("Fixing remaining updateGrowthInsightsForUser calls...\n");

componentsWithGrowthInsights.forEach((filename) => {
	const filePath = path.join("src/components", filename);

	if (!fs.existsSync(filePath)) {
		console.log(`⚠️  ${filename} not found, skipping...`);
		return;
	}

	let content = fs.readFileSync(filePath, "utf8");
	let modified = false;

	// Pattern 1: Comment out the import
	if (content.includes("import { updateGrowthInsightsForUser }")) {
		content = content.replace(
			/import { updateGrowthInsightsForUser } from ['"]\.\.\/services\/growthInsights['"];?/g,
			"// import { updateGrowthInsightsForUser } from '../services/growthInsights'; // Commented out - uses hanging Supabase client",
		);
		modified = true;
	}

	// Pattern 2: Comment out the function call with await
	if (content.includes("await updateGrowthInsightsForUser")) {
		content = content.replace(
			/await updateGrowthInsightsForUser\([^)]+\);/g,
			(match) =>
				`// ${match} // Skipped - uses hanging Supabase client\n      console.log('Skipping growth insights update (uses hanging Supabase client)');`,
		);
		modified = true;
	}

	// Pattern 3: Comment out the function call without await
	if (content.includes("updateGrowthInsightsForUser(")) {
		content = content.replace(
			/^(\s*)updateGrowthInsightsForUser\([^)]+\);/gm,
			(match, spaces) =>
				`${spaces}// ${match.trim()} // Skipped - uses hanging Supabase client\n${spaces}console.log('Skipping growth insights update (uses hanging Supabase client)');`,
		);
		modified = true;
	}

	if (modified) {
		fs.writeFileSync(filePath, content, "utf8");
		console.log(`✅ Fixed ${filename}`);
	} else {
		console.log(`ℹ️  ${filename} - No changes needed`);
	}
});

console.log(
	"\n✨ All components fixed! Growth insights calls have been disabled to prevent hanging.",
);
