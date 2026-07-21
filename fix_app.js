const fs = require('fs');

let content = fs.readFileSync('app.js', 'utf8');
let appPart2 = fs.readFileSync('app-part2.js', 'utf8');

// Fixing initFootprintMap in app.js and app-part2.js
content = content.replace(
  /DB\.footprints\.forEach\(id => \{\n\s*const m = DB\.memories\.find\(x => x\.id === id\);/g,
  `const memoryMap = new Map(DB.memories.map(m => [m.id, m]));\n      DB.footprints.forEach(id => {\n        const m = memoryMap.get(id);`
);

appPart2 = appPart2.replace(
  /DB\.footprints\.forEach\(id => \{\n\s*const m = DB\.memories\.find\(x => x\.id === id\);/g,
  `const memoryMap = new Map(DB.memories.map(m => [m.id, m]));\n      DB.footprints.forEach(id => {\n        const m = memoryMap.get(id);`
);

fs.writeFileSync('app.js', content, 'utf8');
fs.writeFileSync('app-part2.js', appPart2, 'utf8');
