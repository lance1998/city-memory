const { performance } = require('perf_hooks');

const app = {
    markers: []
};
const DB = {
    memories: []
};

// Setup data
const NUM_MEMORIES = 10000;
const NUM_MARKERS = 5000;

for (let i = 0; i < NUM_MEMORIES; i++) {
    DB.memories.push({
        id: 'mem_' + i,
        oldImages: ['img.jpg'],
        title: 'Title ' + i,
        year: 2000 + (i % 20),
        likes: i
    });
}

for (let i = 0; i < NUM_MARKERS; i++) {
    app.markers.push({
        memoryId: 'mem_' + (i * 2),
        bindTooltip: function() {}
    });
}

function enhanceTooltipsOriginal() {
    if (!app.markers) return;
    app.markers.forEach(function(marker) {
        if (!marker.memoryId) return;
        var mem = DB.memories.find(function(m) { return m.id === marker.memoryId; });
        if (!mem) return;

        var tooltipHtml = '...';
        marker.bindTooltip(tooltipHtml, {});
    });
}

function enhanceTooltipsOptimized() {
    if (!app.markers || typeof DB === 'undefined' || !DB.memories) return;

    var memoryMap = {};
    for (var i = 0; i < DB.memories.length; i++) {
        var m = DB.memories[i];
        memoryMap[m.id] = m;
    }

    app.markers.forEach(function(marker) {
        if (!marker.memoryId) return;
        var mem = memoryMap[marker.memoryId];
        if (!mem) return;

        var tooltipHtml = '...';
        marker.bindTooltip(tooltipHtml, {});
    });
}

console.log("Running Original...");
let t0 = performance.now();
enhanceTooltipsOriginal();
let t1 = performance.now();
console.log("Original took " + (t1 - t0) + " milliseconds.");

console.log("Running Optimized...");
let t2 = performance.now();
enhanceTooltipsOptimized();
let t3 = performance.now();
console.log("Optimized took " + (t3 - t2) + " milliseconds.");
