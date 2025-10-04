const fs = require("fs");
const path = require("path");

// Function to fix a TypeScript/TSX file
function fixFile(filePath) {
	let content = fs.readFileSync(filePath, "utf8");
	let modified = false;
	const fileName = path.basename(filePath);

	// Fix specific files based on lint errors

	// AccessibleHomepage.tsx
	if (fileName === "AccessibleHomepage.tsx") {
		// Remove unused parameter
		content = content.replace(
			"onShowTechnologyFatigueReset",
			"_onShowTechnologyFatigueReset",
		);
		modified = true;
	}

	// AffirmationStudioAccessible.tsx
	if (fileName === "AffirmationStudioAccessible.tsx") {
		content = content.replace(/catch\s*\(\s*err\s*\)/, "catch (_err)");
		modified = true;
	}

	// AssignmentReset.tsx & AssignmentResetAccessible.tsx
	if (fileName.includes("AssignmentReset")) {
		content = content.replace(/:\s*any\b/g, ": unknown");
		content = content.replace(
			/const handleResetAgain/,
			"// const handleResetAgain",
		);
		modified = true;
	}

	// BetweenLanguagesReset files
	if (fileName.includes("BetweenLanguagesReset")) {
		content = content.replace(", ChevronRight", "");
		content = content.replace(", Check", "");
		content = content.replace(/:\s*any\b/g, ": unknown");
		modified = true;
	}

	// BillingPlanDetails.tsx
	if (fileName === "BillingPlanDetails.tsx") {
		content = content.replace(
			"const [subscription, setSubscription, subError]",
			"const [subscription, setSubscription]",
		);
		content = content.replace(
			"const [invoices, setInvoices, invError]",
			"const [invoices, setInvoices]",
		);
		modified = true;
	}

	// BodyAwarenessJourney files
	if (fileName.includes("BodyAwarenessJourney")) {
		content = content.replace(/:\s*any\b/g, ": unknown");
		// Comment out unused color variables
		content = content.replace(/const bgColor = /, "// const bgColor = ");
		content = content.replace(/const textColor = /, "// const textColor = ");
		content = content.replace(
			/const accentColor = /,
			"// const accentColor = ",
		);
		// Remove unused imports
		content = content.replace(", RotateCcw", "");
		content = content.replace(", ChevronRight", "");
		content = content.replace(", Check", "");
		content = content.replace(", Circle", "");
		// Fix unused state setters
		content = content.replace(
			"const [practiceWay, setPracticeWay]",
			"const [practiceWay]",
		);
		modified = true;
	}

	// TechnologyFatigueReset files
	if (fileName.includes("TechnologyFatigueReset")) {
		content = content.replace(", Move", "");
		content = content.replace(/:\s*any\b/g, ": unknown");
		modified = true;
	}

	// TemperatureExploration.tsx
	if (fileName === "TemperatureExploration.tsx") {
		content = content.replace(", Clock", "");
		content = content.replace(", Timer", "");
		content = content.replace(", Heart", "");
		content = content.replace(/:\s*any\b/g, ": unknown");
		content = content.replace(
			"const [selectedMethod, setSelectedMethod]",
			"const [selectedMethod]",
		);
		content = content.replace(
			"const [sensoryPreference, setensoryPreference]",
			"const [sensoryPreference]",
		);
		content = content.replace(
			/const getPhaseColor = /,
			"// const getPhaseColor = ",
		);
		content = content.replace(
			/const getTemperatureGradient = /,
			"// const getTemperatureGradient = ",
		);
		modified = true;
	}

	// WellnessCheckInAccessible.tsx
	if (fileName === "WellnessCheckInAccessible.tsx") {
		content = content.replace(/catch\s*\(\s*e\s*\)/, "catch (_e)");
		modified = true;
	}

	// WellnessCheckInEnhanced.tsx
	if (fileName === "WellnessCheckInEnhanced.tsx") {
		content = content.replace(
			"import React, { useState, useEffect }",
			"import React, { useState }",
		);
		content = content.replace(/:\s*any\b/g, ": unknown");
		modified = true;
	}

	// AuthContext.tsx
	if (fileName === "AuthContext.tsx") {
		content = content.replace(", AuthResponse", "");
		modified = true;
	}

	// Pricing.tsx
	if (fileName === "Pricing.tsx" && filePath.includes("pages")) {
		content = content.replace(", X", "");
		content = content.replace(
			"import { supabase } from '../lib/supabase';",
			"",
		);
		modified = true;
	}

	// PricingNew.tsx
	if (fileName === "PricingNew.tsx") {
		content = content.replace("planName: string", "_planName: string");
		content = content.replace(/:\s*any\b/g, ": unknown");
		modified = true;
	}

	// PricingTest.tsx
	if (fileName === "PricingTest.tsx") {
		content = content.replace(", Loader", "");
		content = content.replace(
			"import { stripePromise } from '../lib/stripe';",
			"",
		);
		content = content.replace(
			"const [loading, setLoading]",
			"// const [loading, setLoading]",
		);
		modified = true;
	}

	// aiService.ts
	if (fileName === "aiService.ts") {
		content = content.replace("userMessage: string", "_userMessage: string");
		modified = true;
	}

	// preventDuplicateElements.ts
	if (fileName === "preventDuplicateElements.ts") {
		content = content.replace(
			"const customElementNames = Object.entries(elements).map((_, i)",
			"Object.entries(elements).map(() =>",
		);
		modified = true;
	}

	// General fixes for all files
	// Replace all 'any' types with 'unknown'
	content = content.replace(/:\s*any\b/g, ": unknown");

	// Fix common unused imports patterns
	const unusedImports = [
		"Lock",
		"Unlock",
		"Home",
		"AlertTriangle",
		"ChevronRight",
		"Check",
		"Circle",
		"RotateCcw",
		"Move",
		"Clock",
		"Timer",
		"Heart",
		"X",
		"Loader",
		"AuthResponse",
	];

	unusedImports.forEach((imp) => {
		const regex = new RegExp(`,?\\s*${imp}\\s*,?`, "g");
		content = content.replace(regex, "");
	});

	// Clean up import lines with extra commas
	content = content.replace(/,\s*,/g, ",");
	content = content.replace(/{\s*,/g, "{");
	content = content.replace(/,\s*}/g, "}");
	content = content.replace(/,\s*\n\s*}/g, "\n}");

	if (modified || content.includes(": unknown")) {
		fs.writeFileSync(filePath, content);
		return true;
	}

	return false;
}

// Process all TypeScript files
const srcDir = path.join(__dirname, "src");

function processDirectory(dir) {
	const files = fs.readdirSync(dir);
	let fixedCount = 0;

	files.forEach((file) => {
		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			fixedCount += processDirectory(fullPath);
		} else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
			if (fixFile(fullPath)) {
				console.log(`✅ Fixed: ${fullPath.replace(__dirname, ".")}`);
				fixedCount++;
			}
		}
	});

	return fixedCount;
}

console.log("Starting comprehensive lint fix...");
const totalFixed = processDirectory(srcDir);
console.log(`\n🎉 Fixed ${totalFixed} files!`);
console.log("Now running lint check...");
