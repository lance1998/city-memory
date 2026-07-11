const DB = { memories: [] };
const app = { markers: [], createPhotoIcon: () => ({}) };

// Create 10000 memories and markers
for (let i = 0; i < 10000; i++) {
  DB.memories.push({ id: i, lat: 0, lng: 0, status: '已发布' });
  app.markers.push({ memoryId: i, setIcon: () => {} });
}

const size = 32;

console.time('Baseline (O(N*M))');
app.markers.forEach(function(marker) {
  var mem = DB.memories.find(function(mm) { return mm.id === marker.memoryId; });
  if (mem) marker.setIcon(app.createPhotoIcon(mem, size));
});
console.timeEnd('Baseline (O(N*M))');

console.time('Optimized (O(N+M))');
var memMap = {};
DB.memories.forEach(function(mm) { memMap[mm.id] = mm; });
app.markers.forEach(function(marker) {
  var mem = memMap[marker.memoryId];
  if (mem) marker.setIcon(app.createPhotoIcon(mem, size));
});
console.timeEnd('Optimized (O(N+M))');
