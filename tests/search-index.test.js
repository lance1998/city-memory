const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

test('search-index.js tests', async (t) => {
  const code = fs.readFileSync('./js/search-index.js', 'utf8');

  // Helper to create a fresh environment for each test
  function createEnvironment(memories = []) {
    const sandbox = {
      app: {},
      window: {},
      DB: {
        chinaCities: [
          { name: '北京', pinyin: 'beijing' },
          { name: '上海', pinyin: 'shanghai' }
        ],
        memories: memories
      },
      document: {
        getElementById: () => null,
        querySelector: () => null
      },
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      console: { log: () => {} } // silence logs
    };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    // trigger tryBuildIndex
    sandbox.DB.memories = memories;
    return sandbox;
  }

  await t.test('builds index and handles basic search', () => {
    const memories = [];
    for (let i = 1; i <= 15; i++) {
      memories.push({ id: i, title: `Test ${i}`, city: '北京', status: '已发布', tags: [], year: '2023', authorName: 'Alice', story: '...', likes: 0 });
    }
    const env = createEnvironment(memories);
    assert.ok(env.app.search);

    const results = env.app.search('Test 1');
    assert.ok(results.length > 0);
    // Since env.app.search returns memory objects, results[0] should be a memory object
    assert.strictEqual(results[0].id, 1);
  });

  await t.test('filters by status 已发布', () => {
    const memories = [
      { id: 1, title: 'Draft memory', city: '北京', status: '草稿' },
      { id: 2, title: 'Published memory', city: '北京', status: '已发布' }
    ];
    for (let i = 3; i <= 15; i++) {
      memories.push({ id: i, title: `Dummy ${i}`, status: '已发布' });
    }
    const env = createEnvironment(memories);

    let results = env.app.search('Draft');
    assert.strictEqual(results.length, 0);

    results = env.app.search('Published');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, 2);
  });

  await t.test('matches multiple fields (title, city, pinyin, tags, year, author, story)', () => {
    const memories = [
      { id: 1, title: 'UniqueTitle', status: '已发布' },
      { id: 2, title: 'A', city: 'UniqueCity', status: '已发布' },
      { id: 3, title: 'B', city: '北京', status: '已发布' }, // pinyin: beijing
      { id: 4, title: 'C', tags: ['UniqueTag'], status: '已发布' },
      { id: 5, title: 'D', year: 'UniqueYear', status: '已发布' },
      { id: 6, title: 'E', authorName: 'UniqueAuthor', status: '已发布' },
      { id: 7, title: 'F', story: 'UniqueStory text', status: '已发布' }
    ];
    for (let i = 8; i <= 15; i++) memories.push({ id: i, title: `Dummy ${i}`, status: '已发布' });
    const env = createEnvironment(memories);

    assert.strictEqual(env.app.search('UniqueTitle')[0].id, 1);
    assert.strictEqual(env.app.search('UniqueCity')[0].id, 2);
    assert.strictEqual(env.app.search('beijing')[0].id, 3);
    assert.strictEqual(env.app.search('UniqueTag')[0].id, 4);
    assert.strictEqual(env.app.search('UniqueYear')[0].id, 5);
    assert.strictEqual(env.app.search('UniqueAuthor')[0].id, 6);
    assert.strictEqual(env.app.search('UniqueStory')[0].id, 7);
  });

  await t.test('handles missing fields gracefully', () => {
    const memories = [
      { id: 1, title: undefined, city: undefined, status: '已发布' },
      { id: 2, status: '已发布' } // completely missing fields
    ];
    for (let i = 3; i <= 15; i++) memories.push({ id: i, title: `Dummy ${i}`, status: '已发布' });
    const env = createEnvironment(memories);

    const results = env.app.search('Missing');
    assert.strictEqual(results.length, 0); // shouldn't crash
  });

  await t.test('edge cases: empty, null, whitespace-only queries', () => {
    const memories = [];
    for (let i = 1; i <= 15; i++) memories.push({ id: i, title: `Dummy ${i}`, status: '已发布' });
    const env = createEnvironment(memories);

    // Because we mocked _origSearch as undefined, app.search returns []
    // But let's check its length to avoid reference equality issues
    assert.strictEqual(env.app.search('').length, 0);
    assert.strictEqual(env.app.search(null).length, 0);
    assert.strictEqual(env.app.search('   ').length, 0);
  });

  await t.test('sorts results by score correctly', () => {
    // Exact title match: 100
    // City match: 80
    // Pinyin match: 70
    // Tag match: 60
    // Year match: 50
    // Author match: 40
    // Story partial match: 20
    const memories = [
      { id: 1, title: 'Something Else', story: 'FindMe text', status: '已发布' }, // Story match: 20
      { id: 2, title: 'FindMe', story: 'Something', status: '已发布' },          // Title match: 100
      { id: 3, title: 'Other', authorName: 'FindMe', status: '已发布' }          // Author match: 40
    ];
    for (let i = 4; i <= 15; i++) memories.push({ id: i, title: `Dummy ${i}`, status: '已发布' });
    const env = createEnvironment(memories);

    const results = env.app.search('FindMe');
    assert.strictEqual(results.length, 3);
    assert.strictEqual(results[0].id, 2); // Title match first (100)
    assert.strictEqual(results[1].id, 3); // Author match second (40)
    assert.strictEqual(results[2].id, 1); // Story match third (20)
  });
});
