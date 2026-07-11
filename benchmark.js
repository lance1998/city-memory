const fs = require('fs');
// Load the DB
eval(fs.readFileSync('data.js', 'utf8').replace(/const DB =/, 'var DB ='));

// Increase DB size to make the performance issue more visible
for (let i = 0; i < 10000; i++) {
    DB.memories.push({
        id: 'fake_' + i,
        title: 'Fake ' + i,
        year: '2023',
        lat: 35.42,
        lng: 119.531
    });
    if (i % 2 === 0) {
        DB.footprints.push('fake_' + i);
    }
}

console.log(`DB.memories size: ${DB.memories.length}`);
console.log(`DB.footprints size: ${DB.footprints.length}`);

function runBaseline() {
    let matchCount = 0;
    const start = performance.now();
    DB.footprints.forEach(id => {
        const m = DB.memories.find(x => x.id === id);
        if (!m) return;
        matchCount++;
    });
    const end = performance.now();
    console.log(`Baseline (N+1 Query): ${(end - start).toFixed(2)} ms (Matched: ${matchCount})`);
    return end - start;
}

function runOptimized() {
    let matchCount = 0;
    const start = performance.now();

    // Optimization
    const memoryMap = new Map();
    DB.memories.forEach(m => memoryMap.set(m.id, m));

    DB.footprints.forEach(id => {
        const m = memoryMap.get(id);
        if (!m) return;
        matchCount++;
    });
    const end = performance.now();
    console.log(`Optimized (Map lookup): ${(end - start).toFixed(2)} ms (Matched: ${matchCount})`);
    return end - start;
}

const baselineTime = runBaseline();
const optimizedTime = runOptimized();
console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}% faster`);
