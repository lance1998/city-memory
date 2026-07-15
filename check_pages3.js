const fs = require('fs');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const pagesHtml = indexHtml.match(/id="page-[^"]+"/g);
console.log(pagesHtml);
