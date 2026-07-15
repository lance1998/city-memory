const fs = require('fs');
const appJs = fs.readFileSync('app.js', 'utf8');

const regex = /document\.getElementById\(['"]page-[^'"]+['"]\)/g;
let match;
const pages = new Set();
while ((match = regex.exec(appJs)) !== null) {
  pages.add(match[0]);
}

console.log(pages);
