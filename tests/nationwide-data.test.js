const test = require('node:test');
const assert = require('node:assert');
const { makeMemory } = require('../js/nationwide-data.js');

test('makeMemory utility function', async (t) => {
  await t.test('should map basic properties correctly', () => {
    const memory = makeMemory(
      1, 'Test Title', 'Test City', 'Test District',
      120.5, 30.5, 'Test Address',
      'old.jpg', 'new.jpg', '90s', 'Test Story',
      ['tag1'], 100, 'Test Author'
    );

    assert.strictEqual(memory.id, 1);
    assert.strictEqual(memory.title, 'Test Title');
    assert.deepStrictEqual(memory.location, {
      city: 'Test City',
      district: 'Test District',
      lng: 120.5,
      lat: 30.5,
      address: 'Test Address'
    });
    assert.strictEqual(memory.city, 'Test City');
    assert.strictEqual(memory.district, 'Test District');
    assert.strictEqual(memory.lng, 120.5);
    assert.strictEqual(memory.lat, 30.5);
    assert.strictEqual(memory.address, 'Test Address');
    assert.strictEqual(memory.year, '90s');
    assert.strictEqual(memory.story, 'Test Story');
    assert.strictEqual(memory.userId, 'u101');
    assert.strictEqual(memory.authorName, 'Test Author');
    assert.deepStrictEqual(memory.tags, ['tag1']);
    assert.strictEqual(memory.likes, 100);
    assert.strictEqual(memory.isFeatured, false);
    assert.strictEqual(memory.status, '已发布');
    assert.strictEqual(memory.createdAt, '2026-07-07T10:00:00Z');
  });

  await t.test('should handle oldImg as string and array correctly', () => {
    // string oldImg
    const mem1 = makeMemory(2, 'T', 'C', 'D', 0, 0, 'A', 'old1.jpg', 'new.jpg', '90s', 'S', [], 0, 'A');
    assert.deepStrictEqual(mem1.oldImages, ['old1.jpg']);

    // array oldImg
    const mem2 = makeMemory(3, 'T', 'C', 'D', 0, 0, 'A', ['old1.jpg', 'old2.jpg'], 'new.jpg', '90s', 'S', [], 0, 'A');
    assert.deepStrictEqual(mem2.oldImages, ['old1.jpg', 'old2.jpg']);
  });

  await t.test('should use fallback defaults for oldImg, newImg, tags and author', () => {
    const mem = makeMemory(4, 'T', 'C', 'D', 0, 0, 'A', null, null, '90s', 'S', null, null, null);

    assert.deepStrictEqual(mem.oldImages, ['./images/nationwide/placeholder_old.jpg']);
    assert.strictEqual(mem.newImage, './images/nationwide/placeholder_new.jpg');
    assert.deepStrictEqual(mem.tags, []);
    assert.strictEqual(mem.authorName, '城市记忆者');
  });

  await t.test('should correctly compute isFeatured logic based on id % 7 === 0', () => {
    const memFeatured = makeMemory(7, 'T', 'C', 'D', 0, 0, 'A', 'old', 'new', '90s', 'S', [], 0, 'A');
    assert.strictEqual(memFeatured.isFeatured, true);

    const memNotFeatured = makeMemory(8, 'T', 'C', 'D', 0, 0, 'A', 'old', 'new', '90s', 'S', [], 0, 'A');
    assert.strictEqual(memNotFeatured.isFeatured, false);

    const memFeatured2 = makeMemory(14, 'T', 'C', 'D', 0, 0, 'A', 'old', 'new', '90s', 'S', [], 0, 'A');
    assert.strictEqual(memFeatured2.isFeatured, true);
  });

  await t.test('should generate random likes, comments, and views within expected ranges when not provided', () => {
    // We run it a few times to ensure boundaries are somewhat respected without flakiness
    for (let i = 0; i < 10; i++) {
      const mem = makeMemory(5 + i, 'T', 'C', 'D', 0, 0, 'A', 'old', 'new', '90s', 'S', [], null, 'A');

      // likes: Math.floor(Math.random() * 200) + 20 => [20, 219]
      assert.ok(mem.likes >= 20 && mem.likes <= 219, `likes ${mem.likes} not in range`);

      // comments: Math.floor(Math.random() * 50) + 5 => [5, 54]
      assert.ok(mem.comments >= 5 && mem.comments <= 54, `comments ${mem.comments} not in range`);

      // views: Math.floor(Math.random() * 2000) + 200 => [200, 2199]
      assert.ok(mem.views >= 200 && mem.views <= 2199, `views ${mem.views} not in range`);
    }
  });
});
