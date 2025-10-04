import fs from "fs";
import path from "path";

// Components that need fixing
const componentsToFix = [
	"PreAssignmentPrepV6.tsx",
	"PostAssignmentDebrief.tsx",
	"WellnessCheckIn.tsx",
	"CompassCheck.tsx",
	"MentoringPrep.tsx",
	"MentoringReflection.tsx",
	"BodyCheckIn.tsx",
	"BodyCheckInAccessible.tsx",
	"BodyCheckInEnhanced.tsx",
	"BodyCheckInFriendly.tsx",
	"PreAssignmentPrep.tsx",
	"PreAssignmentPrepAccessible.tsx",
	"PreAssignmentPrepEnhanced.tsx",
	"PreAssignmentPrepV5.tsx",
	"MentoringPrepAccessible.tsx",
	"MentoringPrepEnhanced.tsx",
	"TeamingPrep.tsx",
	"TeamingReflection.tsx",
	"TeamReflectionJourneyAccessible.tsx",
	"MentoringReflectionEnhanced.tsx",
	"PostAssignmentDebriefAccessible.tsx",
	"PostAssignmentDebriefEnhanced.tsx",
	"WellnessCheckInEnhanced.tsx",
	"CompassCheckEnhanced.tsx",
];

console.log("🔧 Fixing all remaining reflection components...\n");

componentsToFix.forEach((filename) => {
	const filePath = path.join("src/components", filename);

	if (!fs.existsSync(filePath)) {
		console.log(`⚠️  ${filename} not found, skipping...`);
		return;
	}

	let content = fs.readFileSync(filePath, "utf8");
	let modified = false;

	// 1. Add directSupabaseApi import if not present
	if (
		!content.includes("directSupabaseApi") &&
		!content.includes("directInsertReflection")
	) {
		// Find the imports section
		const importMatch = content.match(/^import [\s\S]*?(?=\n(?!import))/m);
		if (importMatch) {
			const insertPosition = importMatch.index + importMatch[0].length;
			content =
				content.slice(0, insertPosition) +
				"\nimport { directInsertReflection } from '../services/directSupabaseApi';" +
				content.slice(insertPosition);
			modified = true;
		}
	}

	// 2. Fix updateGrowthInsightsForUser calls
	if (content.includes("updateGrowthInsightsForUser")) {
		// Comment out the import
		content = content.replace(
			/import { updateGrowthInsightsForUser } from ['"]\.\.\/services\/growthInsights['"];?/g,
			"// import { updateGrowthInsightsForUser } from '../services/growthInsights'; // Commented out - uses hanging Supabase client",
		);

		// Comment out the function calls
		content = content.replace(
			/await updateGrowthInsightsForUser\([^)]+\);/g,
			(match) =>
				`// ${match} // Skipped - uses hanging Supabase client\n      console.log('Skipping growth insights update (uses hanging Supabase client)');`,
		);

		content = content.replace(
			/^(\s*)updateGrowthInsightsForUser\([^)]+\);/gm,
			(match, spaces) =>
				`${spaces}// ${match.trim()} // Skipped - uses hanging Supabase client\n${spaces}console.log('Skipping growth insights update (uses hanging Supabase client)');`,
		);

		modified = true;
	}

	// 3. Replace reflectionService.saveReflection with directInsertReflection
	if (content.includes("reflectionService.saveReflection")) {
		// Find and replace the save calls
		content = content.replace(
			/await reflectionService\.saveReflection\(([^)]+)\)/g,
			(match, args) => {
				// Extract the arguments
				const argsClean = args.trim();

				// Build the new call
				return `await (async () => {
        const user = JSON.parse(localStorage.getItem('session') || '{}').user;
        const accessToken = JSON.parse(localStorage.getItem('session') || '{}').access_token;

        const reflectionData = {
          user_id: user?.id,
          entry_kind: ${argsClean.includes("entry_kind") ? argsClean : `'reflection'`},
          data: ${argsClean.includes("data:") ? argsClean.match(/data:\s*({[^}]+}|\w+)/)?.[1] || "{}" : argsClean},
          reflection_id: crypto.randomUUID()
        };

        const { data, error } = await directInsertReflection(reflectionData, accessToken);
        if (error) throw error;
        return data;
      })()`;
			},
		);
		modified = true;
	}

	// 4. Replace any direct supabase client usage
	if (content.includes("supabase.from(")) {
		// Add direct API import if not present
		if (!content.includes("directInsertReflection")) {
			const importMatch = content.match(/^import [\s\S]*?(?=\n(?!import))/m);
			if (importMatch) {
				const insertPosition = importMatch.index + importMatch[0].length;
				content =
					content.slice(0, insertPosition) +
					"\nimport { directInsertReflection } from '../services/directSupabaseApi';" +
					content.slice(insertPosition);
			}
		}

		// Replace supabase.from('reflection_entries').insert() calls
		content = content.replace(
			/await supabase\s*\.from\(['"]reflection_entries['"]\)\s*\.insert\(([^)]+)\)/g,
			(match, args) => {
				return `await directInsertReflection(${args}, accessToken || undefined)`;
			},
		);

		// Remove supabase client import
		content = content.replace(
			/import { supabase } from ['"]\.\.\/lib\/supabase['"];?/g,
			"// import { supabase } from '../lib/supabase'; // Replaced with directSupabaseApi",
		);

		modified = true;
	}

	// 5. Ensure handleSubmit/handleSave functions use directInsertReflection
	if (content.includes("handleSubmit") || content.includes("handleSave")) {
		// Check if it's already using directInsertReflection
		const functionMatch = content.match(
			/(handle(?:Submit|Save))[^{]*{[\s\S]*?^ {2}}/gm,
		);
		if (functionMatch && !functionMatch[0].includes("directInsertReflection")) {
			// This component needs manual review
			console.log(`⚠️  ${filename} - Needs manual review of save function`);
		}
	}

	if (modified) {
		fs.writeFileSync(filePath, content, "utf8");
		console.log(`✅ Fixed ${filename}`);
	} else {
		console.log(`ℹ️  ${filename} - May need manual review`);
	}
});

console.log(
	"\n✨ Fix attempt complete! Run verify_all_reflections.js to check status.",
);
