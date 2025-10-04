import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of all reflection components that need fixing
const componentsToFix = [
	"PostAssignmentDebriefAccessible.tsx",
	"MentoringPrepAccessible.tsx",
	"MentoringReflectionAccessible.tsx",
	"WellnessCheckInAccessible.tsx",
	"CompassCheck.tsx",
	"InSessionSelfCheck.tsx",
	"InSessionTeamSync.tsx",
	"RoleSpaceReflection.tsx",
	"DirectCommunicationReflection.tsx",
	"EthicsMeaningCheckAccessible.tsx",
];

const componentsDir = path.join(__dirname, "src", "components");

componentsToFix.forEach((filename) => {
	const filepath = path.join(componentsDir, filename);

	if (fs.existsSync(filepath)) {
		let content = fs.readFileSync(filepath, "utf8");

		// Add import for direct API if not present
		if (
			!content.includes("import { directInsertReflection, getSessionToken }")
		) {
			// Find the imports section and add our import
			if (content.includes("from '../lib/supabase'")) {
				content = content.replace(
					"from '../lib/supabase';",
					`from '../lib/supabase';
import { directInsertReflection, getSessionToken } from '../services/directSupabaseApi';`,
				);
			}
		}

		// Replace supabase insert with direct API
		// Pattern 1: await supabase.from('reflection_entries').insert
		content = content.replace(
			/const\s+{\s*data,\s*error\s*}\s*=\s*await\s+supabase[\s\S]*?\.from\(['"]reflection_entries['"]\)[\s\S]*?\.insert\(\[entry\]\)[\s\S]*?\.single\(\);?/g,
			`// Get access token
      const accessToken = await getSessionToken();

      // Add reflection_id and updated_at to the entry
      const entryWithId = {
        ...entry,
        reflection_id: entry.reflection_id || \`\${entry.entry_kind}_\${Date.now()}\`,
        updated_at: new Date().toISOString()
      };

      // Use direct API instead of Supabase client
      const { data, error } = await directInsertReflection(entryWithId, accessToken || undefined);`,
		);

		// Pattern 2: Alternative format
		content = content.replace(
			/const\s+{\s*error\s*}\s*=\s*await\s+supabase[\s\S]*?\.from\(['"]reflection_entries['"]\)[\s\S]*?\.insert\(\[entry\]\);?/g,
			`// Get access token
      const accessToken = await getSessionToken();

      // Add reflection_id and updated_at to the entry
      const entryWithId = {
        ...entry,
        reflection_id: entry.reflection_id || \`\${entry.entry_kind}_\${Date.now()}\`,
        updated_at: new Date().toISOString()
      };

      // Use direct API instead of Supabase client
      const { data, error } = await directInsertReflection(entryWithId, accessToken || undefined);`,
		);

		fs.writeFileSync(filepath, content, "utf8");
		console.log(`Fixed: ${filename}`);
	} else {
		console.log(`Not found: ${filename}`);
	}
});

console.log("Done fixing reflection components!");
