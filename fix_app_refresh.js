import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');

// Function to create the refresh code
const refreshCode = `async (data) => {
            console.log('Reflection saved:', data);
            // Data is automatically saved to Supabase in the component
            setShow{{MODAL_NAME}}(false);

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
          }`;

// List of modals to update
const modalsToUpdate = [
  { modal: 'PostAssignmentDebrief', setter: 'setShowPostAssignmentDebrief' },
  { modal: 'WellnessCheckIn', setter: 'setShowWellnessCheckIn' },
  { modal: 'CompassCheck', setter: 'setShowCompassCheck' },
  { modal: 'MentoringPrep', setter: 'setShowMentoringPrep' },
  { modal: 'MentoringReflection', setter: 'setShowMentoringReflection' },
  { modal: 'InSessionSelfCheck', setter: 'setShowInSessionSelfCheck' },
  { modal: 'InSessionTeamSync', setter: 'setShowInSessionTeamSync' },
  { modal: 'RoleSpaceReflection', setter: 'setShowRoleSpaceReflection' },
  { modal: 'DirectCommunicationReflection', setter: 'setShowDirectCommunicationReflection' }
];

let updatedContent = content;

modalsToUpdate.forEach(({ modal, setter }) => {
  // Pattern to match simple onComplete callbacks
  const simplePattern = new RegExp(
    `onComplete={(\\(data\\) => {[\\s\\S]*?${setter}\\(false\\);[\\s\\S]*?})}`,
    'g'
  );

  // Replace with async version including refresh
  const replacement = refreshCode.replace('{{MODAL_NAME}}', modal.replace('Show', ''));

  updatedContent = updatedContent.replace(simplePattern, `onComplete={${replacement}}`);
});

fs.writeFileSync('src/App.tsx', updatedContent, 'utf8');
console.log('Updated App.tsx with auto-refresh for all reflection modals!');