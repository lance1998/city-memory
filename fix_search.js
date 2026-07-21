const fs = require('fs');

let content = fs.readFileSync('js/search-index.js', 'utf8');

const replacement = `  app.search = function(query) {
    var resultIds = search(query);
    if (resultIds === null) return _origSearch ? _origSearch.call(this, query) : [];

    // Optimize DB.memories array lookup
    var memoryMapCache = new Map();
    DB.memories.forEach(function(m) { memoryMapCache.set(m.id, m); });

    // Convert IDs to memory objects
    return resultIds.map(function(id) {
      return memoryMapCache.get(id);
    }).filter(Boolean);
  };`;

content = content.replace(
  /  app\.search = function\(query\) \{\n    var resultIds = search\(query\);\n    if \(resultIds === null\) return _origSearch \? _origSearch\.call\(this, query\) : \[\];\n\n    \/\/ Convert IDs to memory objects\n    return resultIds\.map\(function\(id\) \{\n      return DB\.memories\.find\(function\(m\) \{ return m\.id === id; \}\);\n    \}\)\.filter\(Boolean\);\n  \};/,
  replacement
);

fs.writeFileSync('js/search-index.js', content, 'utf8');
