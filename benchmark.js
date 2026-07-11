const fs = require('fs');
const { performance } = require('perf_hooks');

var DB = {
    memories: []
};

for (let i = 0; i < 10000; i++) {
    DB.memories.push({ id: 'mem_' + i, city: (i % 2 === 0) ? 'CityA' : 'CityB' });
}

var app = {
    markers: [],
    map: {
        flyTo: function() {}
    },
    showToast: function() {},
    filterDiscover: function() {}
};

for (let i = 0; i < 10000; i++) {
    app.markers.push({
        memoryId: 'mem_' + i,
        setOpacity: function() {},
        _icon: { style: {} }
    });
}

function runOriginal() {
    var cityName = 'CityA';
    if (app.markers && app.map) {
      var visibleCount = 0;
      var totalInCity = 0;
      app.markers.forEach(function(marker) {
        if (!marker.memoryId) return;
        var mem = DB.memories ? DB.memories.find(function(m) { return m.id === marker.memoryId; }) : null;
        if (!mem) return;

        if (cityName === '__ALL__') {
          marker.setOpacity(1);
          if (marker._icon) marker._icon.style.display = '';
          visibleCount++;
        } else if (mem.city === cityName) {
          marker.setOpacity(1);
          if (marker._icon) marker._icon.style.display = '';
          visibleCount++;
          totalInCity++;
        } else {
          marker.setOpacity(0);
          if (marker._icon) marker._icon.style.display = 'none';
        }
      });
    }
}

function runOptimized() {
    var cityName = 'CityA';
    if (app.markers && app.map) {
      var visibleCount = 0;
      var totalInCity = 0;

      var memoryMap = {};
      if (DB.memories) {
        for (var i = 0; i < DB.memories.length; i++) {
          memoryMap[DB.memories[i].id] = DB.memories[i];
        }
      }

      app.markers.forEach(function(marker) {
        if (!marker.memoryId) return;
        var mem = memoryMap[marker.memoryId] || null;
        if (!mem) return;

        if (cityName === '__ALL__') {
          marker.setOpacity(1);
          if (marker._icon) marker._icon.style.display = '';
          visibleCount++;
        } else if (mem.city === cityName) {
          marker.setOpacity(1);
          if (marker._icon) marker._icon.style.display = '';
          visibleCount++;
          totalInCity++;
        } else {
          marker.setOpacity(0);
          if (marker._icon) marker._icon.style.display = 'none';
        }
      });
    }
}

const t0 = performance.now();
for (let i = 0; i < 10; i++) runOriginal();
const t1 = performance.now();

const t2 = performance.now();
for (let i = 0; i < 10; i++) runOptimized();
const t3 = performance.now();

console.log(`Original: ${(t1 - t0).toFixed(2)} ms`);
console.log(`Optimized: ${(t3 - t2).toFixed(2)} ms`);
