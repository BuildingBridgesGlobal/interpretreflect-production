import fs from "fs";
import path from "path";

// All reflection components that need immediate close behavior
const reflectionComponents = [
	"PreAssignmentPrepV6.tsx",
	"PreAssignmentPrepV5.tsx",
	"PreAssignmentPrep.tsx",
	"PreAssignmentPrepAccessible.tsx",
	"PreAssignmentPrepEnhanced.tsx",
	"PostAssignmentDebrief.tsx",
	"PostAssignmentDebriefAccessible.tsx",
	"PostAssignmentDebriefEnhanced.tsx",
	"WellnessCheckIn.tsx",
	"WellnessCheckInAccessible.tsx",
	"WellnessCheckInEnhanced.tsx",
	"CompassCheck.tsx",
	"CompassCheckEnhanced.tsx",
	"MentoringPrep.tsx",
	"MentoringPrepAccessible.tsx",
	"MentoringPrepEnhanced.tsx",
	"MentoringReflection.tsx",
	"MentoringReflectionAccessible.tsx",
	"MentoringReflectionEnhanced.tsx",
	"InSessionSelfCheck.tsx",
	"InSessionTeamSync.tsx",
	"RoleSpaceReflection.tsx",
	"DirectCommunicationReflection.tsx",
	"TeamingPrepEnhanced.tsx",
	"TeamingReflection.tsx",
	"TeamingReflectionEnhanced.tsx",
	"EthicsMeaningCheckAccessible.tsx",
	"BodyCheckIn.tsx",
	"BodyCheckInAccessible.tsx",
	"BodyCheckInEnhanced.tsx",
	"BodyCheckInFriendly.tsx",
	"TeamReflectionJourneyAccessible.tsx",
	"AffirmationReflectionStudio.tsx",
];

console.log(
	"🚀 Standardizing close behavior for all reflection components...\n",
);

reflectionComponents.forEach((filename) => {
	const filePath = path.join("src/components", filename);

	if (!fs.existsSync(filePath)) {
		console.log(`⚠️  ${filename} not found, skipping...`);
		return;
	}

	let content = fs.readFileSync(filePath, "utf8");
	let modified = false;

	// Pattern 1: Remove delayed onComplete calls
	if (
		content.includes("setTimeout(() => {") &&
		content.includes("onComplete(")
	) {
		// Replace patterns like setTimeout(() => { onComplete(data); }, 2000);
		content = content.replace(
			/setTimeout\(\(\) => \{\s*onComplete\([^)]*\);\s*\}, \d+\);/g,
			"onComplete(formData);",
		);

		// Also handle multi-line setTimeout blocks
		content = content.replace(
			/setTimeout\(\(\) => \{\s*if \(onComplete\) \{\s*onComplete\([^)]*\);\s*\}\s*\}, \d+\);/g,
			"if (onComplete) {\n        onComplete(formData);\n      }",
		);
		modified = true;
	}

	// Pattern 2: Ensure immediate close after successful save
	// Look for successful save patterns and ensure they call onComplete immediately
	const saveSuccessPatterns = [
		// Pattern: console.log('Save successful')
		/(console\.log\(['"]\w+\s*-\s*Save successful[!]?['"][^)]*\);)/g,
		// Pattern: setShowSummary(true)
		/(setShowSummary\(true\);)/g,
		// Pattern: After successful directInsertReflection
		/(console\.log\(['"]\w+\s*-\s*Save successful via direct API[!]?['"][^)]*\);)/g,
	];

	saveSuccessPatterns.forEach((pattern) => {
		if (pattern.test(content)) {
			content = content.replace(pattern, (match) => {
				// Check if onComplete is already called nearby (within next 5 lines)
				const matchIndex = content.indexOf(match);
				const nextLines = content.substring(matchIndex, matchIndex + 500);

				if (
					!nextLines.includes("onComplete(") &&
					!nextLines.includes("onClose()")
				) {
					// Add immediate onComplete and onClose calls
					return `${match}

      // Close immediately after successful save
      if (onComplete) {
        onComplete(formData || answers || data || {});
      }
      setTimeout(() => {
        onClose();
      }, 100); // Small delay to ensure state updates`;
				}
				return match;
			});
			modified = true;
		}
	});

	// Pattern 3: Fix components that show summary screens
	if (content.includes("showSummary") || content.includes("ShowSummary")) {
		// Replace delayed closes in summary sections
		content = content.replace(
			/setShowSummary\(true\);\s*setTimeout\(\(\) => \{[^}]*\}, \d+\);/g,
			`setShowSummary(true);

      // Close immediately
      if (onComplete) {
        onComplete(formData || answers || {});
      }
      setTimeout(() => {
        onClose();
      }, 1500); // Brief moment to show success`,
		);
		modified = true;
	}

	// Pattern 4: Ensure setIsSaving(false) happens before close
	if (content.includes("setIsSaving(false)")) {
		// Make sure setIsSaving(false) is called before any onComplete
		content = content.replace(
			/(\s*)(if \(onComplete\) \{[^}]*\})/g,
			(match, spaces, onCompleteBlock) => {
				if (!match.includes("setIsSaving(false)")) {
					return `${spaces}setIsSaving(false);
${spaces}${onCompleteBlock}`;
				}
				return match;
			},
		);
	}

	if (modified) {
		fs.writeFileSync(filePath, content, "utf8");
		console.log(`✅ Updated ${filename}`);
	} else {
		console.log(`ℹ️  ${filename} - Checking for close behavior...`);

		// Additional check: ensure the component has proper close behavior
		if (content.includes("onComplete") && content.includes("onClose")) {
			// Component has both callbacks, check if they're called properly
			const hasProperClose =
				content.includes("onComplete(") &&
				(content.includes("onClose()") ||
					content.includes("setTimeout(() => {\n        onClose()"));

			if (!hasProperClose) {
				console.log(`  ⚠️  May need manual review for proper close behavior`);
			} else {
				console.log(`  ✓ Has proper close behavior`);
			}
		}
	}
});

console.log(
	"\n✨ Standardization complete! All components should now close immediately after save.",
);
