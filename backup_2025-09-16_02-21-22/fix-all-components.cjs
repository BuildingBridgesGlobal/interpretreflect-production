const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Get all TypeScript files in components directory
const files = glob.sync('src/components/*.tsx', { cwd: __dirname });

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  // Fix missing commas between object properties
  content = content.replace(/('[\w\s\-\.#\/]+)'(title|description|icon|backgroundColor|borderColor):/g, "$1',\n      $2:");
  
  // Fix missing commas in arrays
  content = content.replace(/('[\w\s\-\.]+)'('[\w\s\-\.]+)'('[\w\s\-\.]+')/g, "$1', $2', $3");
  
  // Fix broken multi-line strings
  content = content.replace(/'([^']*),\s*\n\s*([^']*?)'/g, "'$1, $2'");
  
  // Fix missing commas in destructuring
  content = content.replace(/\[([a-zA-Z]+)\s+([a-zA-Z]+)\]/g, "[$1, $2]");
  
  // Fix broken comments
  content = content.replace(/\/\/\s*([^,\n]*),\s*\n\s*([^\n]*)/g, "// $1, $2");
  
  // Fix missing icon values
  content = content.replace(/icon:\s*\}/g, "icon: null }");
  
  // Fix keyof syntax
  content = content.replace(/keyof\s*,/g, "keyof FormData");
  
  // Fix return statements with trailing comma
  content = content.replace(/return\s*,/g, "return");
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  }
});

console.log('Component fixes complete');