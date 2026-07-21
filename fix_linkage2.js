const fs = require('fs');

let content = fs.readFileSync('js/linkage-fix.js', 'utf8');

const replacement = `  var linkageMemCache = null;
  function getLinkageMemById(id) {
    if (!linkageMemCache || linkageMemCache.size !== DB.memories.length) {
      linkageMemCache = new Map();
      DB.memories.forEach(function(m) { linkageMemCache.set(m.id, m); });
      DB.chinaCities.forEach(function(c) {
        (c.landmarks || []).forEach(function(lm) {
          if (!linkageMemCache.has(lm.id)) linkageMemCache.set(lm.id, Object.assign({}, lm, { city: c.name }));
        });
      });
    }
    return linkageMemCache.get(id) || null;
  }

  // --- openDetail: S4(添加\"在地图中查看\"按钮) ---
  var _origOpenDetail = app.openDetail.bind(app);
  app.openDetail = function(id) {
    _origOpenDetail(id);
    var mem = getLinkageMemById(id);`;

content = content.replace(
  /  \/\/ --- openDetail: S4\(添加\\"在地图中查看\\"按钮\) ---\n  var _origOpenDetail = app\.openDetail\.bind\(app\);\n  app\.openDetail = function\(id\) \{\n    _origOpenDetail\(id\);\n    var mem = DB\.memories\.find\(function\(m\) \{ return m\.id === id; \}\);\n    if \(\!mem\) \{\n      DB\.chinaCities\.forEach\(function\(c\) \{\n        \(c\.landmarks \|\| \[\]\)\.forEach\(function\(lm\) \{\n          if \(lm\.id === id\) mem = Object\.assign\(\{\}, lm, \{ city: c\.name \}\);\n        \}\);\n      \}\);\n    \}/,
  replacement
);

const replacement2 = `    this.markerLayer.on('click', function(e) {
      var memId = e.layer.memoryId;
      if (memId === undefined) return;
      if (e.latlng && typeof V21 !== 'undefined') {
        var mem = getLinkageMemById(memId);
        if (mem) V21.createRipple(mem, e.latlng);
      }`;

content = content.replace(
  /    this\.markerLayer\.on\('click', function\(e\) \{\n      var memId = e\.layer\.memoryId;\n      if \(memId === undefined\) return;\n      if \(e\.latlng && typeof V21 !== 'undefined'\) \{\n        var mem = DB\.memories\.find\(function\(m\) \{ return m\.id === memId; \}\);\n        if \(\!mem\) \{\n          DB\.chinaCities\.forEach\(function\(c\) \{\n            \(c\.landmarks \|\| \[\]\)\.forEach\(function\(lm\) \{\n              if \(lm\.id === memId\) mem = Object\.assign\(\{\}, lm, \{ city: c\.name \}\);\n            \}\);\n          \}\);\n        \}\n        if \(mem\) V21\.createRipple\(mem, e\.latlng\);\n      \}/,
  replacement2
);

fs.writeFileSync('js/linkage-fix.js', content, 'utf8');
