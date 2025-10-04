import fs from "fs";

let content = fs.readFileSync("src/App.tsx", "utf8");

// Function to create the async refresh version
function createAsyncRefreshVersion(
	modalName,
	setterName,
	usesSaveReflection = false,
) {
	if (usesSaveReflection) {
		return `      {${modalName} && (
        <${modalName.replace("show", "")}
          onComplete={async (results) => {
            // Save reflection
            saveReflection('${modalName
							.replace("show", "")
							.replace(/([A-Z])/g, " $1")
							.trim()}', results);
            ${setterName}(false);

            // Reload reflections to show the new one
            if (user?.id) {
              setTimeout(async () => {
                const { reflectionService } = await import('./services/reflectionService');
                const reflections = await reflectionService.getUserReflections(user.id, 10);
                if (reflections) {
                  const formattedReflections = reflections.map(r => ({
                    id: r.id || Date.now().toString(),
                    type: r.entry_kind || 'reflection',
                    data: r.data || {},
                    timestamp: r.created_at || new Date().toISOString()
                  }));
                  setSavedReflections(formattedReflections);
                }
              }, 500);
            }
          }}
          onClose={() => ${setterName}(false)}
        />
      )}`;
	} else {
		return `      {${modalName} && (
        <${modalName.replace("show", "")}
          onComplete={async (data) => {
            console.log('${modalName
							.replace("show", "")
							.replace(/([A-Z])/g, " $1")
							.trim()} Results:', data);
            ${setterName}(false);

            // Reload reflections to show the new one
            if (user?.id) {
              const { reflectionService } = await import('./services/reflectionService');
              const reflections = await reflectionService.getUserReflections(user.id, 10);
              if (reflections) {
                const formattedReflections = reflections.map(r => ({
                  id: r.id || Date.now().toString(),
                  type: r.entry_kind || 'reflection',
                  data: r.data || {},
                  timestamp: r.created_at || new Date().toISOString()
                }));
                setSavedReflections(formattedReflections);
              }
            }
          }}
          onClose={() => ${setterName}(false)}
        />
      )}`;
	}
}

// List of remaining modals to update
const modalsToUpdate = [
	{
		pattern: /\{showMentoringReflection && \([^}]+\}\)/,
		replacement: createAsyncRefreshVersion(
			"showMentoringReflection",
			"setShowMentoringReflection",
		),
	},
	{
		pattern: /\{showRoleSpaceReflection && \([^}]+\}\)/,
		replacement: createAsyncRefreshVersion(
			"showRoleSpaceReflection",
			"setShowRoleSpaceReflection",
		),
	},
	{
		pattern: /\{showDirectCommunicationReflection && \([^}]+\}\)/,
		replacement: createAsyncRefreshVersion(
			"showDirectCommunicationReflection",
			"setShowDirectCommunicationReflection",
		),
	},
	{
		pattern: /\{showInSessionSelfCheck && \([^}]+\}\)/,
		replacement: createAsyncRefreshVersion(
			"showInSessionSelfCheck",
			"setShowInSessionSelfCheck",
			true,
		),
	},
	{
		pattern: /\{showInSessionTeamSync && \([^}]+\}\)/,
		replacement: createAsyncRefreshVersion(
			"showInSessionTeamSync",
			"setShowInSessionTeamSync",
			true,
		),
	},
];

// Apply all replacements
modalsToUpdate.forEach(({ pattern, replacement }) => {
	content = content.replace(pattern, replacement);
});

fs.writeFileSync("src/App.tsx", content, "utf8");
console.log("Updated remaining reflection modals with auto-refresh!");
