const { performance } = require('perf_hooks');

const DB = {
  memories: []
};

for (let i = 0; i < 10000; i++) {
  DB.memories.push({ id: i, data: 'test' });
}

const app = {
  markers: []
};
for (let i = 0; i < 5000; i++) {
  app.markers.push({ memoryId: Math.floor(Math.random() * 10000) });
}

const t0 = performance.now();
app.markers.forEach(function(marker) {
  var mem = DB.memories.find(function(mm) { return mm.id === marker.memoryId; });
});
const t1 = performance.now();
console.log(`Old method took ${t1 - t0} milliseconds.`);

const t2 = performance.now();
var memoryMap = {};
DB.memories.forEach(function(mm) { memoryMap[mm.id] = mm; });
app.markers.forEach(function(marker) {
  var mem = memoryMap[marker.memoryId];
});
const t3 = performance.now();
console.log(`New method took ${t3 - t2} milliseconds.`);
