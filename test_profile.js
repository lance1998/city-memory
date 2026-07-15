const fs = require('fs');
const appJs = fs.readFileSync('app.js', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

const regex = /navigateTo\(['"]([^'"]+)['"]\)/g;
let match;
const pages = new Set();
while ((match = regex.exec(appJs)) !== null) {
  pages.add(match[1]);
}

for (const page of pages) {
  if (!indexHtml.includes(`id="page-${page}"`)) {
    console.log(`Missing page in index.html: page-${page}`);
  }
}
