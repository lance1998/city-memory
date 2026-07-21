const fs = require('fs');

let content = fs.readFileSync('js/p3-album.js', 'utf8');

const replacement = `  var memoryMapCache = null;
  function getMemById(id) {
    if (!memoryMapCache) {
      memoryMapCache = new Map();
      DB.memories.forEach(function(m) { memoryMapCache.set(String(m.id), m); });
      DB.chinaCities.forEach(function(c) {
        (c.landmarks || []).forEach(function(lm) {
          if (!memoryMapCache.has(String(lm.id))) memoryMapCache.set(String(lm.id), Object.assign({}, lm, { city: c.name }));
        });
      });
    }
    return memoryMapCache.get(String(id)) || null;
  }`;

content = content.replace(
  /  function getMemById\(id\) \{\n    var mem = DB\.memories\.find\(function\(m\) \{ return String\(m\.id\) === String\(id\); \}\);\n    if \(mem\) return mem;\n    var found = null;\n    DB\.chinaCities\.forEach\(function\(c\) \{\n      \(c\.landmarks \|\| \[\]\)\.forEach\(function\(lm\) \{\n        if \(String\(lm\.id\) === String\(id\)\) found = Object\.assign\(\{\}, lm, \{ city: c\.name \}\);\n      \}\);\n    \}\);\n    return found;\n  \}/,
  replacement
);

fs.writeFileSync('js/p3-album.js', content, 'utf8');
