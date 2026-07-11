const fs = require('fs');
let code = fs.readFileSync('js/search-index.js', 'utf8');
code = code.replace("if (!_searchIndex || !query) return null;", "if (!_searchIndex || !query) return null;");
// Make sure toLowerCase is safe
code = code.replace("var q = query.toLowerCase().trim();", "var q = (query || '').toString().toLowerCase().trim();");
fs.writeFileSync('js/search-index.js', code);
