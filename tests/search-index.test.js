const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');

global.app = {};
global.DB = {
  chinaCities: [
    { name: '北京', pinyin: 'beijing' },
    { name: '上海', pinyin: 'shanghai' },
    { name: '广州', pinyin: 'guangzhou' },
    { name: '无拼音城市' }
  ],
  memories: []
};

global.document = {
  getElementById: () => null,
  querySelector: () => null
};

global.setTimeout = () => {};
global.clearTimeout = () => {};

const code = fs.readFileSync('./js/search-index.js', 'utf-8');
const modifiedCode = code.replace(
  'app._searchIndex = {',
  'app.getPinyin = getPinyin;\n  app._searchIndex = {'
);
eval(modifiedCode);

test('getPinyin tests', async (t) => {
  await t.test('returns pinyin for known city', () => {
    assert.strictEqual(app.getPinyin('北京'), 'beijing');
  });

  await t.test('returns original string if city not found', () => {
    assert.strictEqual(app.getPinyin('未知'), '未知');
  });

  await t.test('returns original string if city found but no pinyin', () => {
    assert.strictEqual(app.getPinyin('无拼音城市'), '无拼音城市');
  });

  await t.test('handles empty string', () => {
    assert.strictEqual(app.getPinyin(''), '');
  });

  await t.test('handles whitespace string', () => {
    assert.strictEqual(app.getPinyin('   '), '');
  });

  await t.test('handles null', () => {
    assert.strictEqual(app.getPinyin(null), '');
  });

  await t.test('handles undefined', () => {
    assert.strictEqual(app.getPinyin(undefined), '');
  });

  await t.test('handles non-string types gracefully', () => {
    assert.strictEqual(app.getPinyin(123), '');
    assert.strictEqual(app.getPinyin({}), '');
    assert.strictEqual(app.getPinyin([]), '');
  });
});
