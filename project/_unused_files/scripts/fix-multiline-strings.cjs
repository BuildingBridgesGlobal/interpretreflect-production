const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "App.tsx");
let content = fs.readFileSync(filePath, "utf-8");

// Fix common patterns of broken multi-line strings
// Pattern: 'text,\n  more text' -> 'text, more text'
content = content.replace(/'([^']*),\s*\n\s*([^']*?)'/g, (match, p1, p2) => {
	// Join the broken string parts
	return `'${p1}, ${p2.trim()}'`;
});

// Fix gradient strings
content = content.replace(
	/'linear-gradient\(to,\s*\n\s*([^']*?)'/g,
	(match, p1) => `'linear-gradient(to ${p1.trim()}'`,
);

// Fix other broken strings with newlines inside
content = content.replace(/'([^'\n]*?)\n\s*([^']*?)'/g, (match, p1, p2) => {
	if (p1.includes("gradient") || p2.includes("gradient")) {
		return `'${p1.trim()} ${p2.trim()}'`;
	}
	return match;
});

// Write back the fixed content
fs.writeFileSync(filePath, content);

console.log("Fixed multiline string issues in App.tsx");
