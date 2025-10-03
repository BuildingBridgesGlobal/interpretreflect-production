const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf-8');
let originalContent = content;

// Fix all patterns where properties are missing commas
// Pattern 1: '#FFFFFF'border: -> '#FFFFFF', border:
content = content.replace(/('#FFFFFF')border:/g, "'#FFFFFF',\n            border:");

// Pattern 2: property: 'value'nextProperty:
content = content.replace(/: '([^']+)'([a-zA-Z]+):/g, ": '$1',\n            $2:");

// Pattern 3: property: "value"nextProperty:
content = content.replace(/: "([^"]+)"([a-zA-Z]+):/g, ': "$1",\n            $2:');

// Pattern 4: %'border: or similar
content = content.replace(/(\d+%)'([a-zA-Z]+):/g, "$1',\n            $2:");

// Pattern 5: )'border: or similar
content = content.replace(/\)'([a-zA-Z]+):/g, ")',\n            $1:");

// Pattern 6: Fix date format properties
content = content.replace(/: '(short|long|numeric)'([a-zA-Z]+):/g, ": '$1',\n            $2:");

// Pattern 7: Fix hex colors followed by properties
content = content.replace(/(#[A-F0-9]+)'([a-zA-Z]+):/g, "$1',\n            $2:");

// Write back the fixed content if there were changes
if (content !== originalContent) {
  fs.writeFileSync(filePath, content);
  console.log('Fixed missing commas in style properties in App.tsx');
} else {
  console.log('No changes needed');
}