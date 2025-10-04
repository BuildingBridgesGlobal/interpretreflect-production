const fs = require("fs");
const path = require("path");

console.log("Fixing remaining syntax errors...");

// Fix DailyBurnoutGaugeAccessible.tsx
try {
	let content = fs.readFileSync(
		"src/components/DailyBurnoutGaugeAccessible.tsx",
		"utf8",
	);
	content = content.replace(/Right,/g, "Right");
	fs.writeFileSync("src/components/DailyBurnoutGaugeAccessible.tsx", content);
	console.log("✓ Fixed DailyBurnoutGaugeAccessible.tsx");
} catch (e) {
	console.log("✗ Error fixing DailyBurnoutGaugeAccessible.tsx:", e.message);
}

// Fix EmotionMappingAccessible.tsx
try {
	let content = fs.readFileSync(
		"src/components/EmotionMappingAccessible.tsx",
		"utf8",
	);
	content = content.replace(/Just,/g, "Just");
	fs.writeFileSync("src/components/EmotionMappingAccessible.tsx", content);
	console.log("✓ Fixed EmotionMappingAccessible.tsx");
} catch (e) {
	console.log("✗ Error fixing EmotionMappingAccessible.tsx:", e.message);
}

// Fix GrowthInsights.tsx
try {
	let content = fs.readFileSync("src/components/GrowthInsights.tsx", "utf8");
	content = content.replace(
		/Award,?\s*\n\s*TrendingUp/g,
		"Award,\n  TrendingUp",
	);
	fs.writeFileSync("src/components/GrowthInsights.tsx", content);
	console.log("✓ Fixed GrowthInsights.tsx");
} catch (e) {
	console.log("✗ Error fixing GrowthInsights.tsx:", e.message);
}

// Fix GrowthInsightsDashboard.tsx
try {
	let content = fs.readFileSync(
		"src/components/GrowthInsightsDashboard.tsx",
		"utf8",
	);
	content = content.replace(
		/Award,?\s*\n\s*TrendingUp/g,
		"Award,\n  TrendingUp",
	);
	fs.writeFileSync("src/components/GrowthInsightsDashboard.tsx", content);
	console.log("✓ Fixed GrowthInsightsDashboard.tsx");
} catch (e) {
	console.log("✗ Error fixing GrowthInsightsDashboard.tsx:", e.message);
}

// Fix PricingModal.tsx
try {
	let content = fs.readFileSync("src/components/PricingModal.tsx", "utf8");
	content = content.replace(/in, show auth modal/g, "");
	fs.writeFileSync("src/components/PricingModal.tsx", content);
	console.log("✓ Fixed PricingModal.tsx");
} catch (e) {
	console.log("✗ Error fixing PricingModal.tsx:", e.message);
}

// Fix ProfileSettings.tsx
try {
	let content = fs.readFileSync("src/components/ProfileSettings.tsx", "utf8");
	content = content.replace(/\/\*\s*[^*/]*\*\//g, (match) =>
		match.replace(/\n/g, " ").replace(/\s+/g, " "),
	);
	fs.writeFileSync("src/components/ProfileSettings.tsx", content);
	console.log("✓ Fixed ProfileSettings.tsx");
} catch (e) {
	console.log("✗ Error fixing ProfileSettings.tsx:", e.message);
}

// Fix TemperatureExploration.tsx
try {
	let content = fs.readFileSync(
		"src/components/TemperatureExploration.tsx",
		"utf8",
	);
	content = content.replace(
		/useState<(\w+)>\((\{[^}]+)\);/g,
		(match, type, obj) => {
			if (!obj.includes(",")) {
				return match.replace(
					obj,
					obj
						.replace(/([a-zA-Z0-9_]+):\s*([^,}]+)/g, "$1: $2,")
						.replace(/,\s*}/, " }"),
				);
			}
			return match;
		},
	);
	fs.writeFileSync("src/components/TemperatureExploration.tsx", content);
	console.log("✓ Fixed TemperatureExploration.tsx");
} catch (e) {
	console.log("✗ Error fixing TemperatureExploration.tsx:", e.message);
}

// Fix keyof syntax issues in multiple files
const filesToFixKeyof = [
	"src/components/MentoringPrepAccessible.tsx",
	"src/components/TeamReflectionJourneyAccessible.tsx",
	"src/components/TeamingPrepEnhanced.tsx",
];

filesToFixKeyof.forEach((filePath) => {
	try {
		let content = fs.readFileSync(filePath, "utf8");
		// Fix keyof syntax
		content = content.replace(
			/keyof\s+typeof\s+(\w+)\s*\)/g,
			"keyof typeof $1)",
		);
		content = content.replace(/keyof\s+(\w+)\s*\)/g, "keyof $1)");
		fs.writeFileSync(filePath, content);
		console.log(`✓ Fixed keyof syntax in ${path.basename(filePath)}`);
	} catch (e) {
		console.log(`✗ Error fixing ${path.basename(filePath)}:`, e.message);
	}
});

// Fix MentoringReflectionAccessible.tsx
try {
	let content = fs.readFileSync(
		"src/components/MentoringReflectionAccessible.tsx",
		"utf8",
	);
	content = content.replace(/icon:\s*,/g, "icon: CheckCircle,");
	fs.writeFileSync("src/components/MentoringReflectionAccessible.tsx", content);
	console.log("✓ Fixed MentoringReflectionAccessible.tsx");
} catch (e) {
	console.log("✗ Error fixing MentoringReflectionAccessible.tsx:", e.message);
}

console.log("Syntax fixing complete!");
