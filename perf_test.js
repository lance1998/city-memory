const DB = {
  memories: []
};
const markers = [];

for(let i = 0; i < 5000; i++) {
  DB.memories.push({ id: i, title: 'Memory ' + i });
  markers.push({ memoryId: i, setIcon: function(){} });
}

console.log("Starting test for N+1 Query:");
const start = performance.now();

markers.forEach(marker => {
  const mem = DB.memories.find(mm => mm.id === marker.memoryId);
  if (mem) marker.setIcon({});
});

const end = performance.now();
console.log(`Baseline time: ${(end - start).toFixed(2)} ms`);

console.log("Starting test for O(1) Query:");
const start2 = performance.now();

// O(1) map creation (only once per zoom, or cached)
const memMap = new Map();
for (let i = 0; i < DB.memories.length; i++) {
  memMap.set(DB.memories[i].id, DB.memories[i]);
}

markers.forEach(marker => {
  const mem = memMap.get(marker.memoryId);
  if (mem) marker.setIcon({});
});

const end2 = performance.now();
console.log(`Optimized time: ${(end2 - start2).toFixed(2)} ms`);
