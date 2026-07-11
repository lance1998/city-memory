const { performance } = require('perf_hooks');

// Setup mock data
const N = 10000;
const DB = {
  memories: []
};
const app = {
  markers: []
};

for (let i = 0; i < N; i++) {
  DB.memories.push({ id: `mem_${i}`, city: 'TestCity' });
  app.markers.push({ memoryId: `mem_${i}`, setOpacity: () => {} });
}

function runOriginal() {
  const start = performance.now();
  let totalInCity = 0;
  app.markers.forEach(function(marker) {
    if (!marker.memoryId) return;
    var mem = DB.memories ? DB.memories.find(function(m) { return m.id === marker.memoryId; }) : null;
    if (!mem) return;
    if (mem.city === 'TestCity') {
      totalInCity++;
    }
  });
  const end = performance.now();
  return end - start;
}

function runOptimized() {
  const start = performance.now();
  let totalInCity = 0;

  var memoryMap = {};
  if (DB.memories) {
    DB.memories.forEach(function(m) {
      memoryMap[m.id] = m;
    });
  }

  app.markers.forEach(function(marker) {
    if (!marker.memoryId) return;
    var mem = memoryMap[marker.memoryId] || null;
    if (!mem) return;
    if (mem.city === 'TestCity') {
      totalInCity++;
    }
  });
  const end = performance.now();
  return end - start;
}

const originalTime = runOriginal();
const optimizedTime = runOptimized();

console.log(`Original Time: ${originalTime.toFixed(2)} ms`);
console.log(`Optimized Time: ${optimizedTime.toFixed(2)} ms`);
console.log(`Speedup: ${(originalTime / optimizedTime).toFixed(2)}x`);
