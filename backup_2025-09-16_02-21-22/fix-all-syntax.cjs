const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Fix all patterns where properties are missing commas
// Pattern: 'value'property: -> 'value', property:
content = content.replace(/('[\w\s\-\.\/]+)'(\w+):/g, "$1',\n            $2:");

// Pattern: %'property: -> %', property:
content = content.replace(/(\d+%)'(\w+):/g, "$1',\n            $2:");

// Pattern: ...text'status: -> ...text', status:
content = content.replace(/(\.{3})'(status|title|description|icon|iconColor|iconBg):/g, "$1',\n            $2:");

// Write back the fixed content
fs.writeFileSync(filePath, content);

console.log('Fixed all syntax issues in App.tsx');