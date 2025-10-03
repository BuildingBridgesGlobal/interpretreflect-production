#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files with their required fixes based on the lint errors
const fixes = {
  'src/components/AccessibilityEnhancedDashboard.tsx': {
    removeImports: ['Lock', 'Unlock'],
    fixUseEffect: true
  },
  'src/components/AccessibleHomepage.tsx': {
    removeImports: ['Home', 'CheckCircle', 'AlertTriangle'],
    removeProps: ['onShowTechnologyFatigueReset'],
    replaceAny: true
  },
  'src/components/AffirmationStudioAccessible.tsx': {
    prefixUnused: ['err']
  },
  'src/components/AssignmentReset.tsx': {
    replaceAny: true,
    removeVars: ['handleResetAgain']
  },
  'src/components/AssignmentResetAccessible.tsx': {
    replaceAny: true,
    fixUseEffect: true
  },
  'src/components/BetweenLanguagesReset.tsx': {
    removeImports: ['ChevronRight', 'Check'],
    replaceAny: true
  },
  'src/components/BetweenLanguagesResetSimple.tsx': {
    replaceAny: true
  },
  'src/components/BillingPlanDetails.tsx': {
    removeVars: ['subError', 'invError'],
    fixUseEffect: true
  },
  'src/components/BodyAwarenessJourney.tsx': {
    replaceAny: true,
    removeVars: ['bgColor', 'textColor'],
    fixUseEffect: true
  },
  'src/components/TechnologyFatigueReset.tsx': {
    replaceAny: true
  },
  'src/components/TechnologyFatigueResetAccessible.tsx': {
    removeImports: ['Move'],
    replaceAny: true,
    fixUseEffect: true
  },
  'src/components/TemperatureExploration.tsx': {
    removeImports: ['Clock', 'Timer', 'Heart'],
    replaceAny: true,
    removeVars: ['setSelectedMethod', 'setensoryPreference', 'getPhaseColor', 'getTemperatureGradient'],
    fixUseEffect: true
  },
  'src/components/WellnessCheckInAccessible.tsx': {
    prefixUnused: ['e']
  },
  'src/components/WellnessCheckInEnhanced.tsx': {
    removeImports: ['useEffect'],
    replaceAny: true
  },
  'src/contexts/AuthContext.tsx': {
    removeImports: ['AuthResponse']
  },
  'src/pages/Pricing.tsx': {
    removeImports: ['X'],
    removeVars: ['supabase']
  },
  'src/pages/PricingNew.tsx': {
    prefixUnused: ['planName'],
    replaceAny: true
  },
  'src/pages/PricingTest.tsx': {
    removeImports: ['Loader'],
    removeVars: ['stripePromise', 'loading', 'setLoading']
  },
  'src/services/aiService.ts': {
    prefixUnused: ['userMessage']
  },
  'src/utils/preventDuplicateElements.ts': {
    removeVars: ['customElementNames'],
    prefixUnused: ['_', 'i']
  }
};

console.log('Starting to fix lint errors...');

// Process each file
for (const [filePath, fixConfig] of Object.entries(fixes)) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file not found`);
    continue;
  }
  
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Remove unused imports
  if (fixConfig.removeImports) {
    for (const importName of fixConfig.removeImports) {
      const importRegex = new RegExp(`\\s*${importName},?\\s*`, 'g');
      const newContent = content.replace(importRegex, '');
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }
  }
  
  // Replace any types with proper types
  if (fixConfig.replaceAny) {
    content = content.replace(/:\s*any\b/g, ': unknown');
    modified = true;
  }
  
  // Prefix unused parameters with underscore
  if (fixConfig.prefixUnused) {
    for (const param of fixConfig.prefixUnused) {
      const paramRegex = new RegExp(`\\b(${param})\\b(?=[^:]*[,)]|[^:]*=>)`, 'g');
      content = content.replace(paramRegex, `_$1`);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed ${filePath}`);
  }
}

console.log('Lint error fixes completed!');