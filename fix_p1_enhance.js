const fs = require('fs');

let content = fs.readFileSync('js/p1-enhance.js', 'utf8');

const replacement = `    var p1MemoryMapCache = null;
    function getP1MemById(id) {
      if (!p1MemoryMapCache || p1MemoryMapCache.size !== DB.memories.length) {
        p1MemoryMapCache = new Map();
        DB.memories.forEach(function(m) { p1MemoryMapCache.set(String(m.id), m); });
        DB.chinaCities.forEach(function(c) {
          (c.landmarks || []).forEach(function(lm) {
            if (!p1MemoryMapCache.has(String(lm.id))) p1MemoryMapCache.set(String(lm.id), Object.assign({}, lm, { city: c.name }));
          });
        });
      }
      return p1MemoryMapCache.get(String(id)) || null;
    }

    function enhanceGallery(dc, id) {
      var mem = getP1MemById(id);`;

content = content.replace(
  /    function enhanceGallery\(dc, id\) \{\n      var mem = DB\.memories\.find\(function\(m\) \{ return String\(m\.id\) === String\(id\); \}\);\n      if \(\!mem\) \{ DB\.chinaCities\.forEach\(function\(c\) \{ \(c\.landmarks \|\| \[\]\)\.forEach\(function\(lm\) \{ if \(String\(lm\.id\) === String\(id\)\) mem = Object\.assign\(\{\}, lm, \{ city: c\.name \}\); \}\); \}\); \}/,
  replacement
);

fs.writeFileSync('js/p1-enhance.js', content, 'utf8');
