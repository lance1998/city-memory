## 2026-07-12 - [O(N*M) Lookup Loop Optimization]
**Learning:** Found an anti-pattern where `DB.memories.find()` was used inside array iteration loops over `this.markers` and `fragments`, leading to O(N*M) time complexity. Given the array sizes, this was a massive performance bottleneck.
**Action:** Always check loop bodies for `.find()` or `.filter()` calls on large arrays. Pre-calculate a lookup Map (`new Map(DB.memories.map(m => [m.id, m]))`) before the loop to reduce complexity to O(N+M).
