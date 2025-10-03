const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf-8');
let originalContent = content;

// Fix patterns where properties are concatenated without commas
// Pattern: 'value'property: -> 'value', property:
content = content.replace(/('bg-[^']+\/\d+)'(title|description|status|icon|iconColor|iconBg):/g, "$1',\n            $2:");

// Fix missing icon value
content = content.replace(/icon:\s*\n\s*iconColor:/g, "icon: Target,\n      iconColor:");

// Fix array elements missing commas
content = content.replace(/\}(\s*)\{/g, "},\n        {");

// Write back the fixed content
fs.writeFileSync(filePath, content);

console.log('Fixed final comma issues in App.tsx');