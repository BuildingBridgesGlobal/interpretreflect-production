const fs = require('fs');
const path = require('path');

function fixParsingErrors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix import statements with missing commas
  content = content.replace(/RefreshCw\s+Users/g, 'RefreshCw,\n  Users');
  content = content.replace(/Zap\s+Heart/g, 'Zap,\n  Heart');
  content = content.replace(/Shield\s+Home/g, 'Shield,\n  Home');
  content = content.replace(/Brain\s+Lock/g, 'Brain,\n  Lock');
  content = content.replace(/Clock\s+Timer/g, 'Clock,\n  Timer');
  content = content.replace(/Star\s+}/g, 'Star\n}');
  content = content.replace(/Activity\s+}/g, 'Activity\n}');
  content = content.replace(/ChevronRight\s+}/g, 'ChevronRight\n}');
  content = content.replace(/Brain\s+}/g, 'Brain\n}');
  
  // Fix missing commas in import lists
  content = content.replace(/(\w+)\s+(\w+)(?=\s*[,}])/g, (match, p1, p2) => {
    if (p1 !== 'from' && p1 !== 'as' && p1 !== 'import' && p1 !== 'export' && 
        p2 !== 'from' && p2 !== 'as' && !p1.includes('{') && !p2.includes('}')) {
      return `${p1},\n  ${p2}`;
    }
    return match;
  });
  
  // Fix className issues
  content = content.replace(/<className=/g, '<CheckCircle className=');
  content = content.replace(/className="([^"]+)"\s*\/>/g, 'CheckCircle className="$1" />');
  
  // Fix Wellness and Compass type names
  content = content.replace(/Wellnessconfidence/g, 'Wellness\n  confidence');
  content = content.replace(/Wellnessenergy/g, 'Wellness\n  energy');
  content = content.replace(/Stateneeds/g, 'State\n  needs');
  content = content.replace(/Stateclarity/g, 'State\n  clarity');
  content = content.replace(/WellnessInData/g, 'WellnessCheckInData');
  content = content.replace(/CompassData/g, 'CompassCheckData');
  content = content.replace(/Compassdata/g, 'CompassCheckData');
  
  // Fix broken component names
  content = content.replace(/Accessiblepage/g, 'AccessibleHomepage');
  content = content.replace(/onShowWellnessIn/g, 'onShowWellnessCheckIn');
  content = content.replace(/onShowEthicsMeaning/g, 'onShowEthicsMeaningCheck');
  content = content.replace(/onShowBodyIn/g, 'onShowBodyCheckIn');
  
  fs.writeFileSync(filePath, content);
  return true;
}

// Process all TypeScript files
const srcDir = path.join(__dirname, 'src');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixedCount += processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (fixParsingErrors(fullPath)) {
        console.log(`✅ Fixed: ${fullPath.replace(__dirname, '.')}`);
        fixedCount++;
      }
    }
  });
  
  return fixedCount;
}

console.log('Fixing parsing errors...');
const totalFixed = processDirectory(srcDir);
console.log(`\n🎉 Fixed ${totalFixed} files!`);