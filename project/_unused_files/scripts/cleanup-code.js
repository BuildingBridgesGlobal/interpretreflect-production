#!/usr/bin/env node

import { exec } from "child_process";
import { promises as fs } from "fs";
import { glob } from "glob";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

async function cleanupFile(filePath) {
	try {
		let content = await fs.readFile(filePath, "utf8");
		const changes = [];

		// Remove unused imports from recharts
		if (filePath.includes("App.tsx")) {
			const rechartsUnused = [
				"LineChart",
				"Line",
				"XAxis",
				"YAxis",
				"CartesianGrid",
				"Tooltip",
				"Legend",
				"ResponsiveContainer",
			];
			const rechartsRegex = /import.*{([^}]*)}.*from 'recharts'/g;

			content = content.replace(rechartsRegex, (match, imports) => {
				const importList = imports.split(",").map((i) => i.trim());
				const usedImports = importList.filter(
					(imp) => !rechartsUnused.includes(imp.trim()),
				);

				if (usedImports.length === 0) {
					changes.push("Removed unused recharts import");
					return "";
				}
				return `import { ${usedImports.join(", ")} } from 'recharts'`;
			});
		}

		// Remove trailing whitespace
		const originalLines = content.split("\n");
		const cleanedLines = originalLines.map((line) => line.trimEnd());
		if (originalLines.some((line, i) => line !== cleanedLines[i])) {
			content = cleanedLines.join("\n");
			changes.push("Removed trailing whitespace");
		}

		// Remove multiple consecutive empty lines
		const beforeEmptyLines = content;
		content = content.replace(/\n{3,}/g, "\n\n");
		if (beforeEmptyLines !== content) {
			changes.push("Removed excessive empty lines");
		}

		// Fix any TypeScript type issues - replace 'any' with 'unknown' or proper types
		if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
			// Common patterns to fix
			content = content.replace(/:\s*any\[\]/g, ": unknown[]");
			content = content.replace(/:\s*any\s*\)/g, ": unknown)");

			// Track if we made any type changes
			if (content.includes(": unknown")) {
				changes.push("Replaced any with unknown types");
			}
		}

		// Remove console.log statements in production code
		const consoleLogRegex =
			/^\s*console\.(log|error|warn|info|debug)\([^)]*\);?\s*$/gm;
		const beforeConsole = content;
		content = content.replace(consoleLogRegex, "");
		if (beforeConsole !== content) {
			changes.push("Removed console statements");
		}

		if (changes.length > 0) {
			await fs.writeFile(filePath, content, "utf8");
			console.log(`✅ ${path.basename(filePath)}: ${changes.join(", ")}`);
			return true;
		}

		return false;
	} catch (error) {
		console.error(`❌ Error processing ${filePath}:`, error.message);
		return false;
	}
}

async function removeUnusedImports(filePath) {
	try {
		const content = await fs.readFile(filePath, "utf8");
		const originalContent = content;

		// Extract all imports
		const importRegex =
			/^import\s+(?:(?:\*\s+as\s+\w+)|(?:\{[^}]*\})|(?:\w+))(?:\s*,\s*(?:\{[^}]*\}|\w+))?\s+from\s+['"][^'"]+['"];?$/gm;
		const imports = content.match(importRegex) || [];

		// Get the code without imports
		const codeWithoutImports = content.replace(importRegex, "").trim();

		// Check each import
		const usedImports = [];
		for (const imp of imports) {
			// Extract imported names
			const nameMatch = imp.match(
				/import\s+(?:(?:\*\s+as\s+(\w+))|(?:\{([^}]*)\})|(?:(\w+)))(?:\s*,\s*(?:\{([^}]*)\}|(\w+)))?\s+from/,
			);

			if (nameMatch) {
				const defaultImport = nameMatch[3] || nameMatch[5];
				const namedImports = (nameMatch[2] || "") + (nameMatch[4] || "");
				const namespaceImport = nameMatch[1];

				let isUsed = false;

				// Check if any imported name is used in the code
				if (defaultImport) {
					const regex = new RegExp(`\\b${defaultImport}\\b`, "g");
					if (regex.test(codeWithoutImports)) {
						isUsed = true;
					}
				}

				if (namespaceImport) {
					const regex = new RegExp(`\\b${namespaceImport}\\b`, "g");
					if (regex.test(codeWithoutImports)) {
						isUsed = true;
					}
				}

				if (namedImports) {
					const names = namedImports
						.split(",")
						.map((n) => n.trim().split(" as ")[0]);
					for (const name of names) {
						if (name) {
							const regex = new RegExp(`\\b${name}\\b`, "g");
							if (regex.test(codeWithoutImports)) {
								isUsed = true;
								break;
							}
						}
					}
				}

				// Keep React import always
				if (imp.includes("from 'react'") || imp.includes('from "react"')) {
					isUsed = true;
				}

				if (isUsed) {
					usedImports.push(imp);
				} else {
					console.log(
						`  🗑️  Removing unused import: ${imp.substring(0, 60)}...`,
					);
				}
			}
		}

		// Reconstruct the file with only used imports
		if (imports.length !== usedImports.length) {
			const newContent = usedImports.join("\n") + "\n\n" + codeWithoutImports;
			await fs.writeFile(filePath, newContent, "utf8");
			return true;
		}

		return false;
	} catch (error) {
		console.error(
			`❌ Error removing unused imports from ${filePath}:`,
			error.message,
		);
		return false;
	}
}

async function main() {
	console.log("🧹 Starting code cleanup...\n");

	// Get all TypeScript/JavaScript files
	const files = glob.sync("src/**/*.{ts,tsx,js,jsx}", {
		cwd: process.cwd(),
		ignore: ["**/node_modules/**", "**/dist/**", "**/*.d.ts"],
	});

	console.log(`Found ${files.length} files to process\n`);

	let filesModified = 0;

	// Process each file
	for (const file of files) {
		const fullPath = path.join(process.cwd(), file);

		// First pass: general cleanup
		const cleaned = await cleanupFile(fullPath);

		// Second pass: remove unused imports (for tsx/ts files)
		if (file.endsWith(".tsx") || file.endsWith(".ts")) {
			const importsRemoved = await removeUnusedImports(fullPath);
			if (cleaned || importsRemoved) {
				filesModified++;
			}
		} else if (cleaned) {
			filesModified++;
		}
	}

	console.log(`\n✨ Cleanup complete! Modified ${filesModified} files.`);

	// Run lint to see remaining issues
	console.log("\n📋 Running lint check...\n");
	try {
		const { stdout, stderr } = await execAsync("npm run lint");
		if (stdout) console.log(stdout);
		if (stderr) console.error(stderr);
	} catch (error) {
		// Lint errors are expected, just show the output
		if (error.stdout) console.log(error.stdout);
		if (error.stderr) console.error(error.stderr);
	}
}

main().catch(console.error);
