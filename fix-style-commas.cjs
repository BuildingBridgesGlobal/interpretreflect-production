const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Fix patterns where properties are concatenated without commas
// Pattern: '#FFFFFF'boxShadow: -> '#FFFFFF', boxShadow:
content = content.replace(/('#FFFFFF')boxShadow:/g, "'#FFFFFF',\n            boxShadow:");
content = content.replace(/('#[A-F0-9]+')boxShadow:/g, function(match, p1) {
  return p1 + ',\n            boxShadow:';
});
content = content.replace(/('transparent')boxShadow:/g, "'transparent',\n            boxShadow:");

// Fix patterns with border
content = content.replace(/\)'\s*border:/g, ")',\n            border:");
content = content.replace(/'\)border:/g, "',\n            border:");

// Fix patterns with opacity
content = content.replace(/'\)opacity:/g, "',\n            opacity:");

// Fix patterns with color
content = content.replace(/('#FFFFFF')color:/g, "'#FFFFFF',\n            color:");
content = content.replace(/%'\s*color:/g, "%',\n            color:");
content = content.replace(/'\)color:/g, "',\n            color:");

// Write back the fixed content
fs.writeFileSync(filePath, content);

console.log('Fixed missing commas in style properties in App.tsx');