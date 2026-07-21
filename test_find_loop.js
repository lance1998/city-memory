const fs = require('fs');

const code = fs.readFileSync('app.js', 'utf8');

const regex = /DB\.memories\.find/g;
let match;
while ((match = regex.exec(code)) !== null) {
  let startIndex = Math.max(0, match.index - 200);
  let endIndex = Math.min(code.length, match.index + 200);
  let context = code.substring(startIndex, endIndex);

  if (context.includes('forEach') || context.includes('map(') || context.includes('filter(') || context.includes('for (')) {
     console.log(`Match at index ${match.index}:\n${context}\n----------------`);
  }
}
