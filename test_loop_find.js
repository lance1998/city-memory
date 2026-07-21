const fs = require('fs');

const files = ['app.js', 'app-part1.js', 'app-part2.js', 'app-part3.js'];

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');

  const regex = /DB\.memories\.find/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    let startIndex = Math.max(0, match.index - 200);
    let endIndex = Math.min(code.length, match.index + 200);
    let context = code.substring(startIndex, endIndex);

    if (context.includes('forEach') || context.includes('map(') || context.includes('filter(') || context.includes('for (')) {
       console.log(`Match in ${file} at index ${match.index}:\n${context}\n----------------`);
    }
  }
}
