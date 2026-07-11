const DB = {
  footprints: Array.from({length: 5000}, (_, i) => i),
  memories: Array.from({length: 10000}, (_, i) => ({ id: i, year: '2000', lat: 0, lng: 0, title: 'Test' }))
};

console.time('Baseline (Find)');
for (let i = 0; i < 10; i++) {
  DB.footprints.forEach(id => {
    const m = DB.memories.find(x => x.id === id);
  });
}
console.timeEnd('Baseline (Find)');

console.time('Optimized (Map)');
for (let i = 0; i < 10; i++) {
  const memoryMap = new Map();
  for (let j = 0; j < DB.memories.length; j++) {
    memoryMap.set(DB.memories[j].id, DB.memories[j]);
  }
  DB.footprints.forEach(id => {
    const m = memoryMap.get(id);
  });
}
console.timeEnd('Optimized (Map)');
