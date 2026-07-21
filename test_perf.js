const fs = require('fs');

let content = fs.readFileSync('js/p1-enhance.js', 'utf8');

// The line we want to replace:
// function collect() { if (!app.markerLayer) return; app.markerLayer.eachLayer(function(l) { if (l._memId) { var mem = DB.memories.find(function(m) { return String(m.id) === String(l._memId); }); if (!mem) DB.chinaCities.forEach(function(c) { (c.landmarks || []).forEach(function(lm) { if (String(lm.id) === String(l._memId)) mem = Object.assign({}, lm, { city: c.name }); }); }); if (mem) mdm[l._memId] = mem; } }); }

const replacement = `    var memoryMap = null;
    function collect() {
      if (!app.markerLayer) return;
      if (!memoryMap) {
        memoryMap = new Map();
        DB.memories.forEach(function(m) { memoryMap.set(String(m.id), m); });
        DB.chinaCities.forEach(function(c) {
          (c.landmarks || []).forEach(function(lm) {
            if (!memoryMap.has(String(lm.id))) memoryMap.set(String(lm.id), Object.assign({}, lm, { city: c.name }));
          });
        });
      }
      app.markerLayer.eachLayer(function(l) {
        if (l._memId) {
          var mem = memoryMap.get(String(l._memId));
          if (mem) mdm[l._memId] = mem;
        }
      });
    }`;

content = content.replace(
  /function collect\(\) \{ if \(\!app\.markerLayer\) return; app\.markerLayer\.eachLayer\(function\(l\) \{ if \(l\._memId\) \{ var mem = DB\.memories\.find\(function\(m\) \{ return String\(m\.id\) === String\(l\._memId\); \}\); if \(\!mem\) DB\.chinaCities\.forEach\(function\(c\) \{ \(c\.landmarks \|\| \[\]\)\.forEach\(function\(lm\) \{ if \(String\(lm\.id\) === String\(l\._memId\)\) mem = Object\.assign\(\{\}, lm, \{ city: c\.name \}\); \}\); \}\); if \(mem\) mdm\[l\._memId\] = mem; \} \}\); \}/,
  replacement
);

fs.writeFileSync('js/p1-enhance.js', content, 'utf8');
