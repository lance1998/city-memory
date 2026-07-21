const fs = require('fs');

let content = fs.readFileSync('js/p0-enhance.js', 'utf8');

const replacement = `  var p0MemoryMapCache = null;
  function getP0MemById(id) {
    if (!p0MemoryMapCache || p0MemoryMapCache.size !== DB.memories.length) {
      p0MemoryMapCache = new Map();
      DB.memories.forEach(function(m) { p0MemoryMapCache.set(m.id, m); });
      DB.chinaCities.forEach(function(c) {
        (c.landmarks || []).forEach(function(lm) {
          if (!p0MemoryMapCache.has(lm.id)) p0MemoryMapCache.set(lm.id, Object.assign({}, lm, { city: c.name }));
        });
      });
    }
    return p0MemoryMapCache.get(id) || null;
  }

  // ==================== P0-3: 详情面板增强 ====================
  function initDetailEnhance() {
    var origOpenDetail = app.openDetail.bind(app);
    app.openDetail = function(id) {
      origOpenDetail(id);

      var mem = getP0MemById(id);`;

content = content.replace(
  /  \/\/ ==================== P0-3: 详情面板增强 ====================\n  function initDetailEnhance\(\) \{\n    var origOpenDetail = app\.openDetail\.bind\(app\);\n    app\.openDetail = function\(id\) \{\n      origOpenDetail\(id\);\n\n      var mem = DB\.memories\.find\(function\(m\) \{ return m\.id === id; \}\);\n      if \(\!mem\) \{\n        DB\.chinaCities\.forEach\(function\(c\) \{\n          \(c\.landmarks \|\| \[\]\)\.forEach\(function\(lm\) \{\n            if \(lm\.id === id\) mem = Object\.assign\(\{\}, lm, \{ city: c\.name \}\);\n          \}\);\n        \}\);\n      \}/,
  replacement
);

fs.writeFileSync('js/p0-enhance.js', content, 'utf8');
