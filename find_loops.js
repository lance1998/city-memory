const fs = require('fs');
const content = fs.readFileSync('app.js', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('DB.memories.find')) {
    let start = Math.max(0, i - 10);
    let end = Math.min(lines.length - 1, i + 5);
    console.log(`\n--- Line ${i + 1} ---`);
    for (let j = start; j <= end; j++) {
      console.log(`${j + 1}: ${lines[j]}`);
    }
  }
}
