const fs = require('fs');

let content = fs.readFileSync('js/v2.1-features.js', 'utf8');

const replacement1 = `    _bindMarkerHover() {
      if (!app.markerLayer) return;

      let memMapCache = null;
      const getMemMap = () => {
        if (!memMapCache || memMapCache.size !== DB.memories.length) {
          memMapCache = new Map();
          for (let i = 0; i < DB.memories.length; i++) {
             memMapCache.set(DB.memories[i].id, DB.memories[i]);
          }
        }
        return memMapCache;
      };

      app.markerLayer.on('mouseover', (e) => {
        const memId = e.layer.memoryId;
        if (memId === undefined) return;
        const mem = getMemMap().get(memId);
        if (mem) this.showPreview(mem, e);
      });
      app.markerLayer.on('mouseout', (e) => {
        this.hidePreview();
      });
    },`;

content = content.replace(
  /    _bindMarkerHover\(\) \{\n      if \(\!app\.markerLayer\) return;\n      app\.markerLayer\.on\('mouseover', \(e\) => \{\n        const memId = e\.layer\.memoryId;\n        if \(memId === undefined\) return;\n        const mem = DB\.memories\.find\(m => m\.id === memId\);\n        if \(mem\) this\.showPreview\(mem, e\);\n      \}\);\n      app\.markerLayer\.on\('mouseout', \(e\) => \{\n        this\.hidePreview\(\);\n      \}\);\n    \},/,
  replacement1
);

const replacement2 = `      app.addMapMarkers = function() {
        this._origAddMapMarkers();
        V21._bindMarkerHover();
        if (this.markerLayer) {

          let memMapCache2 = null;
          const getMemMap2 = () => {
            if (!memMapCache2 || memMapCache2.size !== DB.memories.length) {
              memMapCache2 = new Map();
              for (let i = 0; i < DB.memories.length; i++) {
                 memMapCache2.set(DB.memories[i].id, DB.memories[i]);
              }
            }
            return memMapCache2;
          };

          this.markerLayer.on('click', (e) => {
            const memId = e.layer.memoryId;
            if (memId === undefined) return;
            const mem = getMemMap2().get(memId);
            if (mem && e.latlng) { V21.createRipple(mem, e.latlng); }
          });
        }
      };`;

content = content.replace(
  /      app\.addMapMarkers = function\(\) \{\n        this\._origAddMapMarkers\(\);\n        V21\._bindMarkerHover\(\);\n        if \(this\.markerLayer\) \{\n          this\.markerLayer\.on\('click', \(e\) => \{\n            const memId = e\.layer\.memoryId;\n            if \(memId === undefined\) return;\n            const mem = DB\.memories\.find\(m => m\.id === memId\);\n            if \(mem && e\.latlng\) \{ V21\.createRipple\(mem, e\.latlng\); \}\n          \}\);\n        \}\n      \};/,
  replacement2
);

fs.writeFileSync('js/v2.1-features.js', content, 'utf8');
